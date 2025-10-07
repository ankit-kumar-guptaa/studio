'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { collection } from 'firebase/firestore';
import type { JobApplication } from '@/lib/types';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function JobApplicantsPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;

  const applicationsCollectionRef = useMemoFirebase(() => {
    if (!firestore || !user || !jobId) return null;
    return collection(firestore, `employers/${user.uid}/jobPosts/${jobId}/applications`);
  }, [firestore, user, jobId]);

  const { data: applications, isLoading: isLoadingApplications } = useCollection<JobApplication>(applicationsCollectionRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);


  if (isUserLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  // Get the job title from the first application, or use the jobId as a fallback
  const jobTitle = applications?.[0]?.jobTitle || `Job ID: ${jobId}`;

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-secondary py-8 sm:py-12">
        <PageHeader 
          title="Job Applicants"
          description={`Viewing applicants for ${jobTitle}`}
        />
        <div className="container mx-auto max-w-7xl px-4 py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Applicants for '{jobTitle}'</CardTitle>
                    <CardDescription>Review and manage candidates who have applied.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Applicant Name</TableHead>
                                <TableHead>Application Date</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingApplications ? (
                                <TableRow><TableCell colSpan={4} className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                            ) : applications && applications.length > 0 ? (
                                applications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">
                                          <Link href={`/employer/applicant/${app.jobSeekerId}`} className="hover:underline text-primary">
                                            {app.jobSeekerName || 'N/A'}
                                          </Link>
                                        </TableCell>
                                        <TableCell>{app.applicationDate ? format(app.applicationDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                                        <TableCell><Badge variant="secondary">{app.status}</Badge></TableCell>
                                        <TableCell>
                                          {/* Action buttons can go here */}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                               <TableRow><TableCell colSpan={4} className="text-center p-8 text-muted-foreground">No applicants for this job yet.</TableCell></TableRow>
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
