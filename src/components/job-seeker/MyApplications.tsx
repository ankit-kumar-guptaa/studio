'use client';

import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Loader2 } from 'lucide-react';
import { collectionGroup, query, where } from 'firebase/firestore';
import type { JobApplication } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface ApplicationWithDetails extends JobApplication {
    companyName: string;
}

export function MyApplications() {
    const { user, firestore, isUserLoading } = useFirebase();

    const applicationsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collectionGroup(firestore, 'applications'), where('jobSeekerId', '==', user.uid));
    }, [firestore, user]);

    const { data: applications, isLoading } = useCollection<ApplicationWithDetails>(applicationsQuery);

    if (isLoading || isUserLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    // Sort applications by date, most recent first
    const sortedApplications = applications?.sort((a, b) => b.applicationDate.toMillis() - a.applicationDate.toMillis());

    return (
        <div>
            {sortedApplications && sortedApplications.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Date Applied</TableHead>
                            <TableHead className="text-right">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedApplications.map((app) => (
                            <TableRow key={app.id}>
                                <TableCell className="font-medium">{app.jobTitle}</TableCell>
                                <TableCell>{app.companyName || 'N/A'}</TableCell>
                                <TableCell>{app.applicationDate ? format(app.applicationDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <Badge variant="secondary">{app.status}</Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            ) : (
                <div className="text-center py-16 text-muted-foreground">
                    <p>You haven't applied for any jobs yet.</p>
                    <p className="text-sm">Your applications will appear here once you apply.</p>
                </div>
            )}
        </div>
    );
}
