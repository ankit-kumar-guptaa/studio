
'use client';

import { useMemo } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { JobSeeker } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Skeleton } from '../ui/skeleton';

export function ProfileCompleteness() {
    const { user, firestore, isUserLoading } = useFirebase();

    const jobSeekerRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'jobSeekers', user.uid);
    }, [firestore, user]);

    const { data: jobSeekerData, isLoading } = useDoc<JobSeeker>(jobSeekerRef);

    const completionPercentage = useMemo(() => {
        if (!jobSeekerData) return 0;

        let score = 0;
        const totalChecks = 7;

        if (jobSeekerData.firstName && jobSeekerData.lastName) score++;
        if (jobSeekerData.phone) score++;
        if (jobSeekerData.location) score++;
        if (jobSeekerData.resumeUrl) score++;
        if (jobSeekerData.summary) score++;
        if (jobSeekerData.skills && jobSeekerData.skills.length > 0) score++;
        if (jobSeekerData.workExperience && jobSeekerData.workExperience.length > 0) score++;

        return Math.round((score / totalChecks) * 100);
    }, [jobSeekerData]);

    if (isLoading || isUserLoading) {
        return <Skeleton className="h-32 w-full" />
    }

    if (!jobSeekerData) return null;

    const getGreeting = () => {
        if (completionPercentage < 50) return "Let's build your profile!";
        if (completionPercentage < 100) return "Almost there, keep it up!";
        return "Your profile looks great!";
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Strength</CardTitle>
                <CardDescription>{getGreeting()}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4">
                    <Progress value={completionPercentage} className="w-full" />
                    <span className="text-lg font-bold text-primary">{completionPercentage}%</span>
                </div>
            </CardContent>
        </Card>
    );
}
