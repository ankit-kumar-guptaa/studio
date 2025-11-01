'use client';

import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Users, UserPlus, PlusCircle } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PostJobForm } from '@/components/admin/PostJobForm';
import { ResumeBuilder } from '@/components/admin/ResumeBuilder';

export default function AdminPage() {
    const { isUserLoading } = useFirebase();
    const { userRole, isRoleLoading } = useUserRole();
    const router = useRouter();

    useEffect(() => {
        if (!isUserLoading && !isRoleLoading) {
            if (userRole !== 'admin') {
                router.push('/super-admin/login');
            }
        }
    }, [isUserLoading, isRoleLoading, userRole, router]);

    if (isUserLoading || isRoleLoading || userRole !== 'admin') {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
            </div>
        );
    }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary py-8 sm:py-12">
        <div className="container mx-auto max-w-7xl px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Super Admin Dashboard</h1>
                <p className="text-muted-foreground">Oversee site activity and manage all platform content.</p>
            </div>
            
            <Tabs defaultValue="dashboard">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
                    <TabsTrigger value="dashboard"><Users className="mr-2 h-4 w-4" /> User Management</TabsTrigger>
                    <TabsTrigger value="create-candidate"><UserPlus className="mr-2 h-4 w-4" /> Create Candidate Profile</TabsTrigger>
                    <TabsTrigger value="post-job"><PlusCircle className="mr-2 h-4 w-4" /> Post a Job</TabsTrigger>
                </TabsList>
                
                <TabsContent value="dashboard">
                    <AdminDashboard />
                </TabsContent>

                <TabsContent value="create-candidate">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Candidate Profile</CardTitle>
                            <CardDescription>
                                Create a complete job seeker profile. This will be visible to employers searching for candidates.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                           <ResumeBuilder />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="post-job">
                    <Card>
                        <CardHeader>
                            <CardTitle>Post a Job for a Company</CardTitle>
                            <CardDescription>
                                Create a job listing on behalf of an employer. This will be visible to all job seekers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PostJobForm />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
