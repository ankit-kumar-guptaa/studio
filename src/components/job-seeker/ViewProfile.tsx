'use client';

import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { JobSeeker } from '@/lib/types';
import { Loader2, Mail, Phone, MapPin, Briefcase, GraduationCap, Star, FileText, IndianRupee, Building, User } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';

function InfoField({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string | null }) {
    if (!value) return null;
    return (
        <div>
            <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                {icon}
                {label}
            </h3>
            <p className="text-foreground mt-1">{value}</p>
        </div>
    );
}

export function ViewProfile() {
    const { user, firestore, isUserLoading } = useFirebase();

    const jobSeekerRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return doc(firestore, 'jobSeekers', user.uid);
    }, [firestore, user]);

    const { data: jobSeekerData, isLoading } = useDoc<JobSeeker>(jobSeekerRef);

    if (isLoading || isUserLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }
    
    if (!jobSeekerData) {
        return (
             <div className="flex h-64 items-center justify-center text-muted-foreground">
                <p>Could not load profile data. Please try editing your profile.</p>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                    <AvatarImage src={jobSeekerData.profilePictureUrl} alt={`${jobSeekerData.firstName} ${jobSeekerData.lastName}`} />
                    <AvatarFallback className="text-3xl">{jobSeekerData.firstName?.[0]}{jobSeekerData.lastName?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                    <h2 className="text-2xl font-bold">{jobSeekerData.firstName} {jobSeekerData.lastName}</h2>
                    <p className="text-muted-foreground">{jobSeekerData.email}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                 <InfoField icon={<Phone className="h-4 w-4"/>} label="Phone" value={jobSeekerData.phone} />
                 <InfoField icon={<MapPin className="h-4 w-4"/>} label="Location" value={jobSeekerData.location} />
                 <InfoField icon={<Briefcase className="h-4 w-4"/>} label="Experience Level" value={jobSeekerData.experienceLevel} />
                 {jobSeekerData.resumeUrl && <div className="md:col-span-1">
                     <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4"/>
                        Resume
                    </h3>
                     <a href={jobSeekerData.resumeUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline mt-1 block truncate">
                        View Resume
                    </a>
                 </div>
                }
            </div>

             {jobSeekerData.experienceLevel === 'experienced' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
                    <InfoField icon={<Building className="h-4 w-4"/>} label="Current Company" value={jobSeekerData.currentCompany} />
                    <InfoField icon={<IndianRupee className="h-4 w-4"/>} label="Current Salary" value={jobSeekerData.currentSalary} />
                </div>
            )}
        </div>
    );
}