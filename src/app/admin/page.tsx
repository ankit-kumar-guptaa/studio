'use client';

import { useMemo } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Briefcase, UserCheck, Building } from 'lucide-react';
import { collection } from 'firebase/firestore';
import type { JobSeeker, Employer, JobPost } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

type CombinedUser = (JobSeeker | Employer) & { role: 'Job Seeker' | 'Employer' };

export default function AdminPage() {
    const { firestore } = useFirebase();

    // Fetch all collections
    const jobSeekersRef = useMemoFirebase(() => firestore ? collection(firestore, 'jobSeekers') : null, [firestore]);
    const employersRef = useMemoFirebase(() => firestore ? collection(firestore, 'employers') : null, [firestore]);
    const jobPostsRef = useMemoFirebase(() => firestore ? collection(firestore, 'jobPosts') : null, [firestore]);

    const { data: jobSeekers, isLoading: loadingSeekers } = useCollection<JobSeeker>(jobSeekersRef);
    const { data: employers, isLoading: loadingEmployers } = useCollection<Employer>(employersRef);
    const { data: jobPosts, isLoading: loadingJobs } = useCollection<JobPost>(jobPostsRef);

    const isLoading = loadingSeekers || loadingEmployers || loadingJobs;

    const allUsers: CombinedUser[] = useMemo(() => {
        const seekers: CombinedUser[] = jobSeekers ? jobSeekers.map(u => ({ ...u, role: 'Job Seeker' })) : [];
        const employerUsers: CombinedUser[] = employers ? employers.map(u => ({ ...u, role: 'Employer' })) : [];
        return [...seekers, ...employerUsers];
    }, [jobSeekers, employers]);

    const getDisplayName = (user: CombinedUser) => {
        if (user.role === 'Employer') {
            return (user as Employer).companyName || 'N/A';
        }
        return `${user.firstName} ${user.lastName}`;
    };
    
    const getProfileLink = (user: CombinedUser) => {
        if (user.role === 'Employer') {
            // Assuming we will create an admin view for employer profiles
            return `/admin/user/${user.id}`; 
        }
        // Link to the public applicant view page
        return `/employer/applicant/${user.id}`;
    };


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Super Admin Dashboard"
          description="Oversee site activity and manage users and content."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                                <Users className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{allUsers.length}</div>
                            </CardContent>
                        </Card>
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Job Posts</CardTitle>
                                <Briefcase className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobPosts?.length || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Job Seekers</CardTitle>
                                <UserCheck className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{jobSeekers?.length || 0}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Employers</CardTitle>
                                <Building className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{employers?.length || 0}</div>
                            </CardContent>
                        </Card>
                    </div>
                
                    <Card>
                        <CardHeader>
                            <CardTitle>User Management</CardTitle>
                            <CardDescription>View and manage all users on the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allUsers.map(user => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{getDisplayName(user)}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Badge variant={user.role === 'Employer' ? 'secondary' : 'outline'}>
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button asChild variant="outline" size="sm">
                                                    <Link href={getProfileLink(user)}>View Profile</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
