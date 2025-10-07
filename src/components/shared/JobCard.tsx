'use client';

import Image from 'next/image';
import type { JobPost } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle, Bookmark } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, getDocs, query, where, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';

// The job prop now expects postDate to be a string
interface SerializableJobPost extends Omit<JobPost, 'postDate'> {
  postDate: string;
}

interface JobCardProps {
  job: SerializableJobPost;
  employerId?: string; // Needed for creating the correct application path
}

export function JobCard({ job, employerId }: JobCardProps) {
  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Convert the string back to a Date object for formatting
  const postDate = job.postDate ? new Date(job.postDate) : null;

  useEffect(() => {
    const checkStatus = async () => {
      if (!user || !firestore || !job.id) return;

      // Determine the employerId if it's not directly passed
      const effectiveEmployerId = employerId || (job as any).employerId;
      if (!effectiveEmployerId) return;

      // Check application status
      const applicationsRef = collection(firestore, `employers/${effectiveEmployerId}/jobPosts/${job.id}/applications`);
      const appQuery = query(applicationsRef, where("jobSeekerId", "==", user.uid));
      const appSnapshot = await getDocs(appQuery);
      setHasApplied(!appSnapshot.empty);

      // Check saved status
      const savedJobRef = doc(firestore, `jobSeekers/${user.uid}/savedJobs/${job.id}`);
      const savedJobSnap = await getDoc(savedJobRef);
      setIsSaved(savedJobSnap.exists());
    };

    if(user && !isUserLoading) {
      checkStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore, job.id, employerId, isUserLoading]);
  
  const checkIsEmployer = async () => {
    if (!user || !firestore) return false;
    const employerDocRef = doc(firestore, 'employers', user.uid);
    const employerDoc = await getDoc(employerDocRef);
    if (employerDoc.exists()) {
      toast({
          variant: "destructive",
          title: "Action Not Allowed",
          description: "Employers cannot apply for or save jobs.",
      });
      return true;
    }
    return false;
  }

  const handleApply = async () => {
    if (isUserLoading || !user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in as a job seeker to apply.' });
      return;
    }
    if (await checkIsEmployer()) return;
    const effectiveEmployerId = employerId || (job as any).employerId;
    if (!firestore || !effectiveEmployerId) {
       toast({ variant: 'destructive', title: 'Error', description: 'Could not process application. Employer information is missing.' });
      return;
    }

    setIsApplying(true);
    const applicationData = {
      jobSeekerId: user.uid,
      applicationDate: serverTimestamp(),
      status: 'Applied' as const,
      jobTitle: job.title,
      jobSeekerName: user.displayName,
      companyName: job.companyName,
    };
    const applicationsRef = collection(firestore, `employers/${effectiveEmployerId}/jobPosts/${job.id}/applications`);

    addDoc(applicationsRef, applicationData)
      .then((docRef) => {
        const seekerApplicationRef = doc(firestore, `jobSeekers/${user.uid}/applications/${docRef.id}`);
        setDoc(seekerApplicationRef, applicationData)
          .then(() => {
            toast({ title: 'Applied Successfully!', description: `Your application for ${job.title} has been submitted.` });
            setHasApplied(true);
          })
          .catch((seekerError) => {
             // Even if this fails, the main application went through.
             console.error("Error creating seeker application record:", seekerError);
             toast({ title: 'Applied Successfully!', description: `Your application for ${job.title} has been submitted.` });
             setHasApplied(true);
          });
      })
      .catch((serverError) => {
        const permissionError = new FirestorePermissionError({ 
            path: applicationsRef.path, 
            operation: 'create', 
            requestResourceData: applicationData 
        });
        errorEmitter.emit('permission-error', permissionError);
      })
      .finally(() => { 
          setIsApplying(false); 
      });
  };

  const handleSave = async () => {
    if (isUserLoading || !user) {
      toast({ variant: 'destructive', title: 'Not Logged In', description: 'Please log in to save jobs.' });
      return;
    }
    if (await checkIsEmployer()) return;
    if (!firestore) return;

    setIsSaving(true);
    const savedJobRef = doc(firestore, `jobSeekers/${user.uid}/savedJobs/${job.id}`);
    
    if (isSaved) {
      // Unsave the job
      deleteDoc(savedJobRef)
        .then(() => {
          toast({ title: 'Job Unsaved', description: `${job.title} has been removed from your saved jobs.` });
          setIsSaved(false);
        })
        .catch((err) => {
          console.error(err);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not unsave job.' });
        })
        .finally(() => setIsSaving(false));
    } else {
      // Save the job
      const effectiveEmployerId = employerId || (job as any).employerId;
      // We store the full job object for easy retrieval, along with employerId
      const jobDataToSave = { ...job, postDate: Timestamp.fromDate(new Date(job.postDate)), employerId: effectiveEmployerId, savedDate: serverTimestamp() };
      setDoc(savedJobRef, jobDataToSave)
        .then(() => {
          toast({ title: 'Job Saved!', description: `${job.title} has been added to your saved jobs.` });
          setIsSaved(true);
        })
        .catch((err) => {
          console.error(err);
          toast({ variant: 'destructive', title: 'Error', description: 'Could not save job.' });
        })
        .finally(() => setIsSaving(false));
    }
  }


  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4">
        {job.companyLogoUrl && (
          <div className="relative h-14 w-14 flex-shrink-0">
            <Image
              src={job.companyLogoUrl}
              alt={`${job.companyName} logo`}
              width={56}
              height={56}
              className="rounded-lg object-contain border"
            />
          </div>
        )}
        <div className="flex-grow">
          <CardTitle className="text-lg font-bold">{job.title}</CardTitle>
          <CardDescription className="font-medium text-primary">{job.companyName || 'Reputable Company'}</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={handleSave} disabled={isSaving || isUserLoading}>
            <Bookmark className={cn("h-6 w-6", isSaved ? "fill-primary text-primary" : "text-muted-foreground")} />
        </Button>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{job.location}</span>
        </div>
         <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-primary" />
          <span>{job.salary}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-primary" />
          <span>{job.category}</span>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{postDate ? `${formatDistanceToNow(postDate)} ago` : 'N/A'}</span>
        </div>
        <Button 
          size="sm" 
          className="gradient-saffron shadow-md hover:shadow-primary/40 disabled:opacity-70"
          onClick={handleApply}
          disabled={isApplying || hasApplied || isUserLoading}
        >
          {isApplying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {hasApplied ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Applied
            </>
          ) : (
            'Apply Now'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
