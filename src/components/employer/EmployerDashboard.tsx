'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useCollection, useMemoFirebase, useDoc } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Briefcase, Users, FileText, Building, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs } from 'firebase/firestore';
import type { JobPost, JobApplication } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PostJobForm } from './PostJobForm';
import { EmployerProfileForm } from './EmployerProfileForm';

interface JobPostWithApplicantCount extends JobPost {
  applicantCount: number;
}

export function EmployerDashboard() {
  const { user, firestore } = useFirebase();
  const [jobPostsWithCounts, setJobPostsWithCounts] = useState<JobPostWithApplicantCount[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  const jobPostsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `employers/${user.uid}/jobPosts`);
  }, [firestore, user]);

  const { data: employerData } = useDoc(useMemoFirebase(() => user && firestore ? collection(firestore, 'employers').doc(user.uid) : null, [user, firestore]));

  const fetchJobsAndCounts = async () => {
    if (!jobPostsCollectionRef) return;
    setIsLoadingJobs(true);
    try {
      const jobPostsSnapshot = await getDocs(jobPostsCollectionRef);
      const jobsData = jobPostsSnapshot.docs.map(doc => ({ ...doc.data() as JobPost, id: doc.id }));
      
      let applicantsCount = 0;
      const jobsWithCounts = await Promise.all(jobsData.map(async (job) => {
        const applicationsRef = collection(jobPostsCollectionRef, job.id, 'applications');
        const applicationsSnapshot = await getDocs(applicationsRef);
        applicantsCount += applicationsSnapshot.size;
        return { ...job, applicantCount: applicationsSnapshot.size };
      }));

      setJobPostsWithCounts(jobsWithCounts.sort((a, b) => b.postDate.toMillis() - a.postDate.toMillis()));
      setTotalApplicants(applicantsCount);
    } catch (error) {
      console.error("Error fetching jobs and counts: ", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobsAndCounts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobPostsCollectionRef]);

  return (
    <div className="container mx-auto max-w-7xl px-4">
       <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Employer Dashboard</h1>
        <p className="text-muted-foreground">Manage your company profile, job postings, and find the best talent.</p>
      </div>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Job Posts</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{jobPostsWithCounts.length}</div>
            <p className="text-xs text-muted-foreground">
              You have {jobPostsWithCounts.length} active job listings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applicants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalApplicants}</div>
            <p className="text-xs text-muted-foreground">
              Across all your job posts.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Company Profile</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{employerData?.companyName || user?.displayName}</div>
             <p className="text-xs text-muted-foreground">
              Update your company info in the profile tab.
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="manage-jobs">
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto">
          <TabsTrigger value="manage-jobs"><Briefcase className="mr-2 h-4 w-4" /> Manage Jobs</TabsTrigger>
          <TabsTrigger value="post-job"><PlusCircle className="mr-2 h-4 w-4" /> Post a New Job</TabsTrigger>
          <TabsTrigger value="profile"><Building className="mr-2 h-4 w-4" /> Company Profile</TabsTrigger>
        </TabsList>
        <TabsContent value="manage-jobs">
          <Card>
            <CardHeader>
              <CardTitle>My Job Postings</CardTitle>
              <CardDescription>View and manage your active job listings.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                  <TableHeader>
                      <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead className="hidden md:table-cell">Location</TableHead>
                          <TableHead className="hidden lg:table-cell">Posted</TableHead>
                          <TableHead className="text-center">Applicants</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                  </TableHeader>
                  <TableBody>
                      {isLoadingJobs ? (
                          <TableRow><TableCell colSpan={5} className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                      ) : jobPostsWithCounts && jobPostsWithCounts.length > 0 ? (
                          jobPostsWithCounts.map(job => (
                              <TableRow key={job.id}>
                                  <TableCell className="font-medium">
                                    <Link href={`/employer/job/${job.id}`} className="hover:underline text-primary">
                                      {job.title}
                                    </Link>
                                    <div className="text-xs text-muted-foreground md:hidden">{job.location}</div>
                                  </TableCell>
                                  <TableCell className="hidden md:table-cell">{job.location}</TableCell>
                                  <TableCell className="hidden lg:table-cell">{job.postDate ? `${formatDistanceToNow(job.postDate.toDate())} ago` : 'N/A'}</TableCell>
                                  <TableCell className="text-center">{job.applicantCount}</TableCell>
                                  <TableCell className="text-right">
                                    <Button variant="ghost" size="icon">
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                              </TableRow>
                          ))
                      ) : (
                          <TableRow><TableCell colSpan={5} className="text-center p-8 text-muted-foreground">You haven't posted any jobs yet. Start by posting a new job!</TableCell></TableRow>
                      )}
                  </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="post-job">
           <Card>
              <CardHeader>
                <CardTitle>Post a New Job</CardTitle>
                <CardDescription>Fill in the details below to create a job opening.</CardDescription>
              </CardHeader>
              <CardContent>
                <PostJobForm onJobPosted={fetchJobsAndCounts} />
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Company Profile</CardTitle>
              <CardDescription>Keep your company profile updated to attract the best talent.</CardDescription>
            </CardHeader>
            <CardContent>
              <EmployerProfileForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
