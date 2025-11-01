
'use client';

import { useMemo, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Users, Briefcase, UserCheck, Building } from 'lucide-react';
import { collection, query, where } from 'firebase/firestore';
import type { JobSeeker, Employer, JobPost } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';

type CombinedUser = (JobSeeker | Employer) & { role: 'Job Seeker' | 'Employer' };

export default function AdminPage() {
    const { firestore } = useFirebase();
    const { userRole, isRoleLoading } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        // This effect ensures that only a real, authenticated admin can access this page.
        // It waits until the role loading is complete before making a decision.
        if (!isRoleLoading && userRole !== 'admin') {
            router.push('/super-admin/login');
        }
    }, [userRole, isRoleLoading, router]);

    // Fetch all collections only if the user is a verified admin
    const jobSeekersQuery = useMemoFirebase(() => {
        if (!firestore || userRole !== 'admin') return null;
        return query(collection(firestore, 'jobSeekers'));
    }, [firestore, userRole]);

    const employersQuery = useMemoFirebase(() => {
        if (!firestore || userRole !== 'admin') return null;
        return query(collection(firestore, 'employers'));
    }, [firestore, userRole]);
    
    const jobPostsQuery = useMemoFirebase(() => {
        if (!firestore || userRole !== 'admin') return null;
        return query(collection(firestore, 'jobPosts'));
    }, [firestore, userRole]);


    const { data: jobSeekers, isLoading: loadingSeekers, error: seekersError } = useCollection<JobSeeker>(jobSeekersQuery);
    const { data: employers, isLoading: loadingEmployers, error: employersError } = useCollection<Employer>(employersQuery);
    const { data: jobPosts, isLoading: loadingJobs, error: jobsError } = useCollection<JobPost>(jobPostsQuery);

    const isLoading = loadingSeekers || loadingEmployers || loadingJobs || isRoleLoading;
    const anyError = seekersError || employersError || jobsError;

    const allUsers: CombinedUser[] = useMemo(() => {
        if (userRole !== 'admin') return [];
        const seekers: CombinedUser[] = jobSeekers ? jobSeekers.map(u => ({ ...u, role: 'Job Seeker' })) : [];
        const employerUsers: CombinedUser[] = employers ? employers.map(u => ({ ...u, role: 'Employer' })) : [];
        return [...seekers, ...employerUsers];
    }, [jobSeekers, employers, userRole]);

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

    // Show a loader while verifying the role or if the user is not an admin yet.
    if (isRoleLoading || userRole !== 'admin') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }
    
    if (anyError) {
        // This is a fallback error display in case something still goes wrong
        return (
             <div className="flex min-h-screen flex-col">
                <Header />
                <main className='container mx-auto max-w-lg my-16'>
                    <Card className="border-destructive">
                        <CardHeader>
                            <CardTitle>Error Fetching Data</CardTitle>
                            <CardDescription>There was a problem accessing Firestore. Please check your security rules.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <pre className="text-xs bg-muted p-2 rounded-md overflow-auto">
                                <code>{anyError.message}</code>
                            </pre>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        )
    }


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        <PageHeader 
          title="Super Admin Dashboard"
          description="Oversee site activity and manage users and content."
        />
        <div className="container mx-auto max-w-7xl px-4 py-16">
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : allUsers.length}</div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Job Posts</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : (jobPosts?.length || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Job Seekers</CardTitle>
                        <UserCheck className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : (jobSeekers?.length || 0)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Employers</CardTitle>
                        <Building className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? <Loader2 className='h-6 w-6 animate-spin' /> : (employers?.length || 0)}</div>
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
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                                    </TableCell>
                                </TableRow>
                            ) : allUsers.length > 0 ? (
                                allUsers.map(user => (
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
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                    No users found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
