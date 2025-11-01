'use client';

import { useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Loader2, Users, UserPlus, PlusCircle, LineChart, LayoutDashboard } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useRouter } from 'next/navigation';
import { UserManagementDashboard } from '@/components/admin/UserManagementDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { PostJobForm } from '@/components/admin/PostJobForm';
import { ResumeBuilder } from '@/components/admin/ResumeBuilder';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { BlogManagement } from '@/components/admin/BlogManagement';

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
            
            <Tabs defaultValue="management">
                <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 h-auto">
                    <TabsTrigger value="management"><Users className="mr-2 h-4 w-4" /> User & Job Management</TabsTrigger>
                     <TabsTrigger value="analytics"><LineChart className="mr-2 h-4 w-4" /> Platform Analytics</TabsTrigger>
                     <TabsTrigger value="blog-management"><LayoutDashboard className="mr-2 h-4 w-4" /> Blog Management</TabsTrigger>
                    <TabsTrigger value="create-candidate"><UserPlus className="mr-2 h-4 w-4" /> Create Candidate Profile</TabsTrigger>
                    <TabsTrigger value="post-job"><PlusCircle className="mr-2 h-4 w-4" /> Post a Job</TabsTrigger>
                </TabsList>
                
                <TabsContent value="management">
                    <UserManagementDashboard />
                </TabsContent>

                 <TabsContent value="analytics">
                    <AnalyticsDashboard />
                </TabsContent>
                
                 <TabsContent value="blog-management">
                    <BlogManagement />
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
