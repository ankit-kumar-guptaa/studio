'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase, useDoc } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, PlusCircle, Briefcase, Users, Building, Trash2, LineChart, Search } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { collection, getDocs, doc, deleteDoc, query, orderBy } from 'firebase/firestore';
import type { JobPost } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { PostJobForm } from './PostJobForm';
import { EmployerProfileForm } from './EmployerProfileForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { CandidateSearch } from './CandidateSearch';


interface JobPostWithApplicantCount extends JobPost {
  applicantCount: number;
}

export function EmployerDashboard() {
  const { user, firestore } = useFirebase();
  const [jobPostsWithCounts, setJobPostsWithCounts] = useState<JobPostWithApplicantCount[]>([]);
  const [totalApplicants, setTotalApplicants] = useState(0);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);
  const { toast } = useToast();

  const jobPostsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, `employers/${user.uid}/jobPosts`), orderBy('postDate', 'desc'));
  }, [firestore, user]);
  
  const { data: employerData } = useDoc(useMemoFirebase(() => user && firestore ? doc(firestore, 'employers', user.uid) : null, [user, firestore]));

  const fetchJobsAndCounts = async () => {
    if (!jobPostsCollectionRef) return;
    setIsLoadingJobs(true);
    try {
      const jobPostsSnapshot = await getDocs(jobPostsCollectionRef);
      const jobsData = jobPostsSnapshot.docs.map(doc => ({ ...doc.data() as JobPost, id: doc.id }));
      
      let applicantsCount = 0;
      const jobsWithCounts = await Promise.all(jobsData.map(async (job) => {
        if (!user?.uid) return { ...job, applicantCount: 0 };
        const applicationsRef = collection(jobPostsCollectionRef.firestore, `employers/${user.uid}/jobPosts/${job.id}/applications`);
        const applicationsSnapshot = await getDocs(applicationsRef);
        applicantsCount += applicationsSnapshot.size;
        return { ...job, applicantCount: applicationsSnapshot.size };
      }));

      setJobPostsWithCounts(jobsWithCounts);
      setTotalApplicants(applicantsCount);
    } catch (error) {
      console.error("Error fetching jobs and counts: ", error);
    } finally {
      setIsLoadingJobs(false);
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!firestore || !user) return;
    
    // Also delete from the global collection
    const globalJobDocRef = doc(firestore, 'jobPosts', jobId);
    const employerJobDocRef = doc(firestore, `employers/${user.uid}/jobPosts`, jobId);

    try {
      await deleteDoc(globalJobDocRef);
      await deleteDoc(employerJobDocRef);
      toast({
        title: "Job Deleted",
        description: "The job posting has been successfully removed.",
      });
      fetchJobsAndCounts(); // Refresh the list
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Could not delete the job post.",
      });
    }
  }


  useEffect(() => {
    if (jobPostsCollectionRef) {
      fetchJobsAndCounts();
    }
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
        <TabsList className="grid w-full grid-cols-1 md:grid-cols-5 h-auto">
          <TabsTrigger value="manage-jobs"><Briefcase className="mr-2 h-4 w-4" /> Manage Jobs</TabsTrigger>
          <TabsTrigger value="post-job"><PlusCircle className="mr-2 h-4 w-4" /> Post a New Job</TabsTrigger>
          <TabsTrigger value="search-candidates"><Search className="mr-2 h-4 w-4" /> Search Candidates</TabsTrigger>
          <TabsTrigger value="profile"><Building className="mr-2 h-4 w-4" /> Company Profile</TabsTrigger>
          <TabsTrigger value="analytics"><LineChart className="mr-2 h-4 w-4" /> Analytics</TabsTrigger>
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
                                  <TableCell className="hidden lg:table-cell">
                                    {job.postDate
                                      ? (() => {
                                          let dateObj: Date;
                                          if (typeof job.postDate === 'string') {
                                            dateObj = new Date(job.postDate);
                                          } else if (job.postDate instanceof Date) {
                                            dateObj = job.postDate;
                                          } else if (job.postDate && typeof job.postDate.toDate === 'function') {
                                            dateObj = job.postDate.toDate();
                                          } else {
                                            return 'N/A';
                                          }
                                          return `${formatDistanceToNow(dateObj)} ago`;
                                        })()
                                      : 'N/A'}
                                  </TableCell>
                                  <TableCell className="text-center">{job.applicantCount}</TableCell>
                                  <TableCell className="text-right">
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <Trash2 className="h-4 w-4 text-destructive" />
                                        </Button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete this job posting and all associated applications.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                                          <AlertDialogAction onClick={() => handleDeleteJob(job.id)}>Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
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
        <TabsContent value="search-candidates">
           <Card>
              <CardHeader>
                <CardTitle>Search for Candidates</CardTitle>
                <CardDescription>Find the perfect talent for your company by searching our database.</CardDescription>
              </CardHeader>
              <CardContent>
                <CandidateSearch />
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
        <TabsContent value="analytics">
          <AnalyticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
