'use client';

import Image from 'next/image';
import type { Job, JobPost } from '@/lib/types';
import { findImage } from '@/lib/placeholder-images';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { useState, useEffect } from 'react';

interface JobCardProps {
  job: Job | JobPost;
  employerId?: string; // Needed for creating the correct application path
}

export function JobCard({ job, employerId }: JobCardProps) {
  const companyLogo = findImage((job as Job).companyLogo || 'company-logo-1');
  const { user, firestore, isUserLoading } = useFirebase();
  const { toast } = useToast();
  const [isApplying, setIsApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (!user || !firestore || !employerId) return;

      const applicationsRef = collection(firestore, `employers/${employerId}/jobPosts/${job.id}/applications`);
      const q = query(applicationsRef, where("jobSeekerId", "==", user.uid));
      const querySnapshot = await getDocs(q);
      setHasApplied(!querySnapshot.empty);
    };

    checkApplicationStatus();
  }, [user, firestore, job.id, employerId]);

  const handleApply = async () => {
    if (isUserLoading) return;
    
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Not Logged In',
        description: 'Please log in as a job seeker to apply.',
      });
      return;
    }

    if (!firestore || !employerId) {
       toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not process application. Employer information is missing.',
      });
      return;
    }

    setIsApplying(true);
    try {
      const applicationsRef = collection(firestore, `employers/${employerId}/jobPosts/${job.id}/applications`);
      
      // Check if user is an employer
      const employerDocRef = (await import('firebase/firestore')).doc(firestore, 'employers', user.uid);
      const employerDoc = await (await import('firebase/firestore')).getDoc(employerDocRef);
      if (employerDoc.exists()) {
        toast({
            variant: "destructive",
            title: "Action Not Allowed",
            description: "Employers cannot apply for jobs.",
        });
        setIsApplying(false);
        return;
      }
      
      await addDoc(applicationsRef, {
        jobSeekerId: user.uid,
        applicationDate: serverTimestamp(),
        status: 'Applied',
        jobTitle: job.title,
        jobSeekerName: user.displayName,
      });

      toast({
        title: 'Applied Successfully!',
        description: `Your application for ${job.title} has been submitted.`,
      });
      setHasApplied(true);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Application Failed',
        description: error.message || 'Could not submit your application.',
      });
    } finally {
      setIsApplying(false);
    }
  };


  return (
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
      <CardHeader className="flex flex-row items-start gap-4">
        {companyLogo && (
          <div className="relative h-14 w-14 flex-shrink-0">
            <Image
              src={companyLogo.imageUrl}
              alt={`${(job as Job).company} logo`}
              width={56}
              height={56}
              className="rounded-lg object-contain"
              data-ai-hint={companyLogo.imageHint}
            />
          </div>
        )}
        <div className="flex-grow">
          <CardTitle className="text-lg font-bold">{job.title}</CardTitle>
          <CardDescription className="font-medium text-primary">{(job as Job).company || 'N/A'}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{job.location}</span>
        </div>
         <div className="flex items-center gap-2">
          <IndianRupee className="h-4 w-4 text-primary" />
          <span>{(job as any).salary}</span>
        </div>
        {(job as Job).type && (
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            <span>{(job as Job).type}</span>
          </div>
        )}
        <div className="flex flex-wrap gap-2 pt-2">
          {(job as Job).tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{(job as Job).postedDate || 'N/A'}</span>
        </div>
        <Button 
          size="sm" 
          className="gradient-saffron shadow-md hover:shadow-primary/40 disabled:opacity-70"
          onClick={handleApply}
          disabled={isApplying || hasApplied}
        >
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
