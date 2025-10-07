'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { collection } from 'firebase/firestore';
import type { JobPost } from '@/lib/types';
import { JobCard } from '../shared/JobCard';

interface SavedJob extends JobPost {
    employerId: string;
}

export function SavedJobs() {
    const { user, firestore } = useFirebase();

    const savedJobsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `jobSeekers/${user.uid}/savedJobs`);
    }, [firestore, user]);

    const { data: savedJobs, isLoading } = useCollection<SavedJob>(savedJobsCollectionRef);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div>
            {savedJobs && savedJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {savedJobs.map((job) => (
                        <JobCard key={job.id} job={job} employerId={job.employerId} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>You haven't saved any jobs yet.</p>
                    <p className="text-sm">Click the bookmark icon on a job listing to save it.</p>
                </div>
            )}
        </div>
    );
}
