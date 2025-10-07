'use client';

import { Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { User, Search, Bookmark, Sparkles, FileText, Loader2, List } from 'lucide-react';
import { RecommendedJobs } from "./RecommendedJobs";
import { ProfileForm } from "./ProfileForm";
import { JobSearch } from "./JobSearch";
import { ResumeBuilder } from "./ResumeBuilder";
import { SavedJobs } from "./SavedJobs";
import { useSearchParams } from "next/navigation";
import { MyApplications } from './MyApplications';


function JobSeekerDashboardContent() {
  const searchParams = useSearchParams();
  const hasSearchQuery = searchParams.has('q') || searchParams.has('loc');
  const defaultTab = hasSearchQuery ? 'search' : 'recommendations';

  return (
     <div className="container mx-auto max-w-7xl px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Job Seeker Dashboard</h1>
        <p className="text-muted-foreground">Manage your profile, job applications, and career path.</p>
      </div>
      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 h-auto">
          <TabsTrigger value="profile" className="py-2"><User className="mr-2 h-4 w-4"/>Profile</TabsTrigger>
          <TabsTrigger value="search" className="py-2"><Search className="mr-2 h-4 w-4"/>Search Jobs</TabsTrigger>
          <TabsTrigger value="applications" className="py-2"><List className="mr-2 h-4 w-4" />My Applications</TabsTrigger>
          <TabsTrigger value="resume" className="py-2"><FileText className="mr-2 h-4 w-4"/>Resume Builder</TabsTrigger>
          <TabsTrigger value="saved" className="py-2"><Bookmark className="mr-2 h-4 w-4"/>Saved Jobs</TabsTrigger>
          <TabsTrigger value="recommendations" className="py-2"><Sparkles className="mr-2 h-4 w-4"/>AI Recommendations</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>My Profile</CardTitle>
              <CardDescription>Keep your profile updated to attract the best opportunities.</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search for Jobs</CardTitle>
              <CardDescription>Find your next role with our powerful search filters.</CardDescription>
            </CardHeader>
            <CardContent>
              <JobSearch />
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="applications">
          <Card>
            <CardHeader>
              <CardTitle>My Applications</CardTitle>
              <CardDescription>Track the status of your job applications.</CardDescription>
            </CardHeader>
            <CardContent>
              <MyApplications />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="resume">
           <Card>
            <CardHeader>
              <CardTitle>Resume Builder</CardTitle>
              <CardDescription>Build and maintain a professional resume to stand out.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResumeBuilder />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="saved">
          <Card>
            <CardHeader>
              <CardTitle>Saved Jobs</CardTitle>
              <CardDescription>Review the jobs you've saved for later.</CardDescription>
            </CardHeader>
            <CardContent>
              <SavedJobs />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>AI-Powered Job Recommendations</CardTitle>
              <CardDescription>Discover jobs tailored just for you based on your profile and activity.</CardDescription>
            </CardHeader>
            <CardContent>
              <RecommendedJobs />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export function JobSeekerDashboard() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center h-full"><Loader2 className="h-16 w-16 animate-spin text-primary" /></div>}>
      <JobSeekerDashboardContent />
    </Suspense>
  );
}
