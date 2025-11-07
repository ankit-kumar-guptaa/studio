'use client';

import { useMemo, useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Briefcase, UserCheck, Building, Trash2, Edit, UserPlus } from 'lucide-react';
import { collection, query, doc, deleteDoc, getDocs, where, getDoc } from 'firebase/firestore';
import type { JobSeeker, Employer, JobPost } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

type CombinedUser = (JobSeeker | Employer) & { role: 'Job Seeker' | 'Employer' };

export function UserManagementDashboard() {
    const { firestore } = useFirebase();
    const { isAdmin, isAuthLoading } = useAuth();
    const { toast } = useToast();

    const shouldFetchData = isAdmin && !isAuthLoading;

    // Queries
    const jobSeekersQuery = useMemoFirebase(() => shouldFetchData ? query(collection(firestore, 'jobSeekers')) : null, [firestore, shouldFetchData]);
    const employersQuery = useMemoFirebase(() => shouldFetchData ? query(collection(firestore, 'employers')) : null, [firestore, shouldFetchData]);
    const jobPostsQuery = useMemoFirebase(() => shouldFetchData ? query(collection(firestore, 'jobPosts')) : null, [firestore, shouldFetchData]);

    // Data Hooks
    const { data: jobSeekers, isLoading: loadingSeekers, error: seekersError, setData: setJobSeekers } = useCollection<JobSeeker>(jobSeekersQuery);
    const { data: employers, isLoading: loadingEmployers, error: employersError, setData: setEmployers } = useCollection<Employer>(employersQuery);
    const { data: jobPosts, isLoading: loadingJobs, error: jobsError, setData: setJobPosts } = useCollection<JobPost>(jobPostsQuery);

    const isLoading = loadingSeekers || loadingEmployers || loadingJobs;
    const anyError = seekersError || employersError || jobsError;

    const allUsers: CombinedUser[] = useMemo(() => {
        if (!jobSeekers && !employers) return [];
        const seekers: CombinedUser[] = jobSeekers ? jobSeekers.map(u => ({ ...u, role: 'Job Seeker' })) : [];
        const employerUsers: CombinedUser[] = employers ? employers.map(u => ({ ...u, role: 'Employer' })) : [];
        return [...seekers, ...employerUsers];
    }, [jobSeekers, employers]);

    const stats = useMemo(() => ({
        totalUsers: allUsers.length,
        totalJobs: jobPosts?.length || 0,
        totalSeekers: jobSeekers?.length || 0,
        totalEmployers: employers?.length || 0
    }), [allUsers, jobPosts, jobSeekers, employers]);

    // Delete Handlers
    const handleDeleteUser = async (userToDelete: CombinedUser) => {
        if (!firestore) return;
        const collectionName = userToDelete.role === 'Job Seeker' ? 'jobSeekers' : 'employers';
        const userDocRef = doc(firestore, collectionName, userToDelete.id);
        
        try {
            await deleteDoc(userDocRef);
            toast({ title: "User Deleted", description: `Successfully removed ${getDisplayName(userToDelete)}.` });
            if (userToDelete.role === 'Job Seeker') {
                setJobSeekers(prev => prev?.filter(u => u.id !== userToDelete.id) || null);
            } else {
                setEmployers(prev => prev?.filter(u => u.id !== userToDelete.id) || null);
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: "Deletion Failed", description: error.message });
        }
    };
    
    const handleDeleteJob = async (jobId: string) => {
        if (!firestore) return;
        
        const globalJobDocRef = doc(firestore, 'jobPosts', jobId);
        const jobSnapshot = await getDoc(globalJobDocRef);
        const jobData = jobSnapshot.data();

        if (!jobData) {
            toast({ variant: "destructive", title: "Job not found" });
            return;
        }

        const employerId = jobData.employerId;

        try {
            // Delete from the global collection
            await deleteDoc(globalJobDocRef);

            // If it's not a SUPER_ADMIN post, delete from the employer's subcollection too
            if (employerId !== 'SUPER_ADMIN') {
                const employerJobDocRef = doc(firestore, `employers/${employerId}/jobPosts`, jobId);
                await deleteDoc(employerJobDocRef);
            }

            toast({ title: "Job Deleted", description: "The job posting has been removed." });
            setJobPosts(prev => prev?.filter(j => j.id !== jobId) || null);
        } catch (error: any) {
            toast({ variant: "destructive", title: "Deletion Failed", description: error.message });
        }
    };


    const getDisplayName = (user: CombinedUser) => {
        return user.role === 'Employer' ? (user as Employer).companyName || 'N/A' : `${user.firstName} ${user.lastName}`;
    };

    if (isAuthLoading) {
        return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>;
    }

    if (anyError) {
        return (
            <Card className="border-destructive my-8"><CardHeader><CardTitle>Error Fetching Data</CardTitle><CardDescription>There was a problem accessing Firestore. Please check your security rules or network connection.</CardDescription></CardHeader><CardContent><pre className="text-xs bg-muted p-2 rounded-md overflow-auto"><code>{anyError.message}</code></pre></CardContent></Card>
        );
    }

  return (
    <>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 my-8">
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Users</CardTitle><Users className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : stats.totalUsers}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Total Job Posts</CardTitle><Briefcase className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : stats.totalJobs}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Job Seekers</CardTitle><UserCheck className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : stats.totalSeekers}</div></CardContent></Card>
            <Card><CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2"><CardTitle className="text-sm font-medium">Employers</CardTitle><Building className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : stats.totalEmployers}</div></CardContent></Card>
        </div>
    
        <Card>
            <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>View and manage all users on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                        : allUsers.length > 0 ? allUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/employer/applicant/${user.id}`} className="hover:underline text-primary">
                                        {getDisplayName(user)}
                                    </Link>
                                </TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell><Badge variant={user.role === 'Employer' ? 'secondary' : 'outline'}>{user.role}</Badge></TableCell>
                                <TableCell className="text-right space-x-2">
                                    <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the user and all their associated data. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteUser(user)}>Delete User</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </TableCell>
                            </TableRow>
                        )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No users found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card className="mt-8">
            <CardHeader>
                <CardTitle>Job Post Management</CardTitle>
                <CardDescription>View and manage all jobs on the platform.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Company</TableHead><TableHead>Posted</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>
                         {isLoading ? <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin" /></TableCell></TableRow>
                         : jobPosts && jobPosts.length > 0 ? jobPosts.map(job => (
                             <TableRow key={job.id}>
                                 <TableCell className="font-medium">{job.title}</TableCell>
                                 <TableCell>{job.companyName}</TableCell>
                                 <TableCell>
                                     {job.postDate && (job.postDate as any).toDate
                                        ? formatDistanceToNow((job.postDate as any).toDate(), { addSuffix: true })
                                        : "Just now"}
                                 </TableCell>
                                 <TableCell className="text-right space-x-2">
                                     {job.employerId === 'SUPER_ADMIN' && (
                                        <Button asChild variant="outline" size="sm"><Link href={`/admin/job/${job.id}`}>View Applicants</Link></Button>
                                     )}
                                     {job.employerId === 'SUPER_ADMIN' && <Button asChild variant="outline" size="sm"><Link href={`/admin/job/${job.id}/edit`}><Edit className="mr-2 h-4 w-4"/>Edit</Link></Button>}
                                     <AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="sm"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This will permanently delete the job post. This action cannot be undone.</AlertDialogDescription></AlertDialogHeader>
                                            <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDeleteJob(job.id)}>Delete Job</AlertDialogAction></AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                 </TableCell>
                             </TableRow>
                         )) : <TableRow><TableCell colSpan={4} className="h-24 text-center">No jobs found.</TableCell></TableRow>}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </>
  );
}
