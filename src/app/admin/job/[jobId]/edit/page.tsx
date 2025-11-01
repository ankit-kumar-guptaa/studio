'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { JobPost } from '@/lib/types';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PostJobForm } from "@/components/admin/PostJobForm";
import { Loader2, ArrowLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';

function EditJobPageContent() {
    const { userRole, isRoleLoading } = useUserRole();
    const router = useRouter();
    const params = useParams();
    const jobId = params.jobId as string;
    
    useEffect(() => {
        if (!isRoleLoading && userRole !== 'admin') {
            router.push('/super-admin/login');
        }
    }, [isRoleLoading, userRole, router]);

    const { firestore, isUserLoading } = useFirebase();

    const jobRef = useMemoFirebase(() => {
        if (!firestore || !jobId) return null;
        return doc(firestore, 'jobPosts', jobId);
    }, [firestore, jobId]);

    const { data: job, isLoading: isJobLoading } = useDoc<JobPost>(jobRef);

    if (isUserLoading || isRoleLoading || isJobLoading || userRole !== 'admin') {
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
                        <p className="text-muted-foreground">The job you are trying to edit does not exist.</p>
                        <Button onClick={() => router.push('/admin')} className="mt-4">Back to Dashboard</Button>
                    </div>
                </main>
                <Footer />
            </div>
        )
    }

    return (
        <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 bg-secondary py-8 sm:py-12">
                <div className="container mx-auto max-w-4xl px-4">
                    <Button variant="ghost" onClick={() => router.back()} className="mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4"/>
                        Back
                    </Button>
                     <Card>
                        <CardHeader>
                            <CardTitle>Edit Job Post</CardTitle>
                            <CardDescription>
                                Update the details for the job posting: "{job.title}". Changes will be live immediately.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PostJobForm existingJob={job} />
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function EditJobPage() {
    return (
        <Suspense>
            <EditJobPageContent />
        </Suspense>
    );
}
