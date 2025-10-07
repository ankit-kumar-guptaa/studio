
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { JobPost } from '@/lib/types';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Loader2, MapPin, IndianRupee, Star, Briefcase, Building, Clock, CheckCircle, Bookmark } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { JobCard } from '@/components/shared/JobCard';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';

function JobDetailPage() {
    const { user, isUserLoading, firestore } = useFirebase();
    const router = useRouter();
    const params = useParams();
    const jobId = params.jobId as string;

    const jobRef = useMemoFirebase(() => {
        if (!firestore || !jobId) return null;
        return doc(firestore, 'jobPosts', jobId);
    }, [firestore, jobId]);

    const { data: job, isLoading: isJobLoading } = useDoc<JobPost>(jobRef);

    if (isJobLoading || isUserLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!job) {
        return (
             <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center bg-secondary">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold">Job Not Found</h1>
                        <p className="text-muted-foreground">The requested job posting does not exist or has been removed.</p>
                        <Button onClick={() => router.push('/find-jobs')} className="mt-4">Find Other Jobs</Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    const serializableJob = {
      ...job,
      postDate: job.postDate instanceof Date ? job.postDate.toISOString() : (job.postDate as any).toDate().toISOString(),
    };
    
    const postDate = new Date(serializableJob.postDate);

    return (
        <div className="flex min-h-screen flex-col bg-secondary">
            <Header />
            <main className="flex-1 py-12 sm:py-16">
                <div className="container mx-auto max-w-4xl px-4">
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        <div className="md:col-span-3">
                             <JobCard job={serializableJob} employerId={job.employerId} />
                        </div>
                        <Card className="md:col-span-3">
                            <CardHeader>
                                <CardTitle>Job Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-primary mb-2">Job Description</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{job.description}</p>
                                </div>
                                <Separator />
                                <div>
                                    <h3 className="text-lg font-semibold text-primary mb-2">Requirements</h3>
                                    <p className="text-muted-foreground whitespace-pre-wrap">{job.requirements}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default JobDetailPage;
