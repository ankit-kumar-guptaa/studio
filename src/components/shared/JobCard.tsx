'use client';

import Image from 'next/image';
import type { JobPost } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle, Bookmark, Star, Loader2 } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, getDocs, query, where, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Timestamp } from 'firebase/firestore';
import Link from 'next/link';

// The job prop now expects postDate to be a string
interface SerializableJobPost extends Omit<JobPost, 'postDate'> {
  postDate: string;
}

interface JobCardProps {
  job: SerializableJobPost;
  employerId?: string;
}

export function JobCard({ job, employerId: propEmployerId }: JobCardProps) {
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

      const effectiveEmployerId = propEmployerId || job.employerId;
      if (!effectiveEmployerId) return;

      // Check application status in jobSeeker's subcollection for efficiency
      const appRef = doc(firestore, `jobSeekers/${user.uid}/applications/${job.id}`);
      const appSnap = await getDoc(appRef);
      setHasApplied(appSnap.exists());


      // Check saved status
      const savedJobRef = doc(firestore, `jobSeekers/${user.uid}/savedJobs/${job.id}`);
      const savedJobSnap = await getDoc(savedJobRef);
      setIsSaved(savedJobSnap.exists());
    };

    if(user && !isUserLoading) {
      checkStatus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, firestore, job.id, isUserLoading]);
  
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
    const effectiveEmployerId = propEmployerId || job.employerId;
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
      jobPostId: job.id,
    };
    const applicationsRef = collection(firestore, `employers/${effectiveEmployerId}/jobPosts/${job.id}/applications`);

    addDoc(applicationsRef, applicationData)
      .then((docRef) => {
        // Also add a record to the jobseeker's own application collection for easy querying
        const seekerApplicationData = { ...applicationData, id: job.id };
        const seekerApplicationRef = doc(firestore, `jobSeekers/${user.uid}/applications/${job.id}`);
        setDoc(seekerApplicationRef, seekerApplicationData)
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
        .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: savedJobRef.path,
            operation: 'delete',
          });
          errorEmitter.emit('permission-error', permissionError);
        })
        .finally(() => setIsSaving(false));
    } else {
      // Save the job
      const effectiveEmployerId = propEmployerId || job.employerId;
      const jobDataToSave = { ...job, postDate: Timestamp.fromDate(new Date(job.postDate)), employerId: effectiveEmployerId, savedDate: serverTimestamp() };
      
      setDoc(savedJobRef, jobDataToSave)
        .then(() => {
          toast({ title: 'Job Saved!', description: `${job.title} has been added to your saved jobs.` });
          setIsSaved(true);
        })
        .catch((serverError) => {
          const permissionError = new FirestorePermissionError({
            path: savedJobRef.path,
            operation: 'create',
            requestResourceData: jobDataToSave,
          });
          errorEmitter.emit('permission-error', permissionError);
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
          <CardTitle className="text-lg font-bold">
            <Link href={`/job/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </CardTitle>
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
          <Star className="h-4 w-4 text-primary" />
          <span>{job.experience}</span>
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
          className="gradient-professional shadow-md hover:shadow-primary/40 disabled:opacity-70"
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
