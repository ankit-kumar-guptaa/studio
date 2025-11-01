'use client';

import { useState, useEffect } from 'react';
import { useFirebase } from '@/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { collection, getDocs, query, collectionGroup } from 'firebase/firestore';
import type { JobApplication, JobPost, Employer } from '@/lib/types';
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
  const { firestore } = useFirebase();
  const [applicationData, setApplicationData] = useState<ApplicationAnalyticsData[]>([]);
  const [topJobs, setTopJobs] = useState<TopJobData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      if (!firestore) return;

      setIsLoading(true);
      try {
        // 1. Fetch all job applications from all subcollections using a collectionGroup query
        const applicationsQuery = query(collectionGroup(firestore, 'applications'));
        const applicationsSnapshot = await getDocs(applicationsQuery);
        const allApplications = applicationsSnapshot.docs.map(doc => doc.data() as JobApplication);
        
        // 2. Fetch all job posts to get titles
        const jobPostsQuery = query(collection(firestore, 'jobPosts'));
        const jobPostsSnapshot = await getDocs(jobPostsQuery);
        const allJobPosts = jobPostsSnapshot.docs.map(doc => doc.data() as JobPost);

        // 3. Process data for the line chart (applications in last 7 days)
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
        const dailyCounts = last7Days.map(day => ({
          date: format(day, 'MMM d'),
          count: 0,
        }));

        allApplications.forEach(app => {
          if (app.applicationDate) {
              const appDate = startOfDay(app.applicationDate.toDate());
              const dayIndex = last7Days.findIndex(day => startOfDay(day).getTime() === appDate.getTime());
              if (dayIndex !== -1) {
                  dailyCounts[dayIndex].count++;
              }
          }
        });
        setApplicationData(dailyCounts);

        // 4. Process data for top jobs by applicant count
        const applicationsByJob: Record<string, number> = {};
        allApplications.forEach(app => {
            if (app.jobPostId) {
                applicationsByJob[app.jobPostId] = (applicationsByJob[app.jobPostId] || 0) + 1;
            }
        });
        
        const topJobsData: TopJobData[] = Object.entries(applicationsByJob)
          .map(([jobId, count]) => {
              const job = allJobPosts.find(j => j.id === jobId);
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
  }, [firestore]);

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
    <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card>
            <CardHeader>
            <CardTitle>Applications in Last 7 Days</CardTitle>
            <CardDescription>Track daily application volume across the platform.</CardDescription>
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
            <CardTitle>Top 5 Most Popular Jobs</CardTitle>
            <CardDescription>The most sought-after job openings by applicant count.</CardDescription>
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
                                        <Link href={`/job/${job.id}`} className="hover:underline text-primary">
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
