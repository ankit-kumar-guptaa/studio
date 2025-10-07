'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { collection } from 'firebase/firestore';
import { JobCard } from '../shared/JobCard';
import type { SavedJob } from '@/lib/types';

export function SavedJobs() {
    const { user, firestore, isUserLoading } = useFirebase();

    const savedJobsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `jobSeekers/${user.uid}/savedJobs`);
    }, [firestore, user]);

    const { data: savedJobs, isLoading } = useCollection<SavedJob>(savedJobsCollectionRef);

    if (isLoading || isUserLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    // Sort by saved date, most recent first
    const sortedJobs = savedJobs?.sort((a, b) => b.savedDate.toMillis() - a.savedDate.toMillis());

    return (
        <div>
            {sortedJobs && sortedJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {sortedJobs.map((job) => {
                         const plainJob = {
                            ...job,
                            postDate: job.postDate instanceof Date ? job.postDate.toISOString() : job.postDate.toDate().toISOString(),
                         };
                        return (
                            <JobCard key={job.id} job={plainJob} employerId={job.employerId} />
                        )
                    })}
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
