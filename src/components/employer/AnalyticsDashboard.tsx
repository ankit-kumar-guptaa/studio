'use client';

import { useState, useEffect } from 'react';
import { useFirebase, useMemoFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import type { JobApplication, JobPost } from '@/lib/types';
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
} from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import Link from 'next/link';

interface ApplicationAnalyticsData {
  date: string;
  count: number;
}

interface TopJobData {
  id: string;
  title: string;
  applicantCount: number;
}

export function AnalyticsDashboard() {
  const { user, firestore } = useFirebase();
  const [applicationData, setApplicationData] = useState<ApplicationAnalyticsData[]>([]);
  const [topJobs, setTopJobs] = useState<TopJobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Securely query only the job posts belonging to the current employer
  const employerJobPostsQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(collection(firestore, 'jobPosts'), where("employerId", "==", user.uid));
  }, [firestore, user]);


  useEffect(() => {
    async function fetchAnalytics() {
      if (!employerJobPostsQuery || !user || !firestore) return;

      setIsLoading(true);
      try {
        // 1. Get all job posts for the current employer
        const jobPostsSnapshot = await getDocs(employerJobPostsQuery);
        const employerJobPosts = jobPostsSnapshot.docs.map(doc => {
          const { id: _id, ...data } = doc.data() as JobPost;
          return { id: doc.id, ...data };
        });
        
        const applications: JobApplication[] = [];
        const applicationsByJob: Record<string, number> = {};

        // 2. For each job, fetch its applications
        for (const job of employerJobPosts) {
          const appsRef = collection(firestore, `employers/${user.uid}/jobPosts/${job.id}/applications`);
          const appsSnapshot = await getDocs(appsRef);
          
          applicationsByJob[job.id] = appsSnapshot.size;

          appsSnapshot.forEach(doc => {
            applications.push(doc.data() as JobApplication);
          });
        }

        // 3. Process data for the line chart (last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
        const dailyCounts = last7Days.map(day => ({
          date: format(day, 'MMM d'),
          count: 0,
        }));

        applications.forEach(app => {
          const appDate = startOfDay(app.applicationDate.toDate());
          const dayIndex = last7Days.findIndex(day => startOfDay(day).getTime() === appDate.getTime());
          if (dayIndex !== -1) {
            dailyCounts[dayIndex].count++;
          }
        });
        setApplicationData(dailyCounts);

        // 4. Process data for top jobs
        const topJobsData: TopJobData[] = Object.entries(applicationsByJob)
          .map(([jobId, count]) => {
              const job = employerJobPosts.find(j => j.id === jobId);
              return {
                  id: jobId,
                  title: job?.title || 'Unknown Job',
                  applicantCount: count,
              };
          })
          .sort((a, b) => b.applicantCount - a.applicantCount)
          .slice(0, 5);

        setTopJobs(topJobsData);

      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employerJobPostsQuery, user, firestore]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex h-96 items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Applications in Last 7 Days</CardTitle>
            <CardDescription>Track daily application volume.</CardDescription>
            </CardHeader>
            <CardContent>
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" name="Applications" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
            </ResponsiveContainer>
            </CardContent>
        </Card>
         <Card>
            <CardHeader>
            <CardTitle>Top 5 Job Posts</CardTitle>
            <CardDescription>Your most popular job openings by applicant count.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Job Title</TableHead>
                            <TableHead className="text-right">Applicants</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {topJobs.length > 0 ? (
                            topJobs.map(job => (
                                <TableRow key={job.id}>
                                    <TableCell className="font-medium">
                                        <Link href={`/employer/job/${job.id}`} className="hover:underline text-primary">
                                            {job.title}
                                        </Link>
                                    </TableCell>
                                    <TableCell className="text-right">{job.applicantCount}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center h-24">
                                    No application data available yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    </div>
  );
}
