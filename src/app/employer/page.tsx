'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFirebase, useCollection, useMemoFirebase } from '@/firebase';
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/shared/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { JobPost } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

const jobPostSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  salary: z.string().min(1, 'Salary is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

export default function EmployerPage() {
  const { user, isUserLoading, firestore } = useFirebase();
  const router = useRouter();
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);

  const form = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: '',
      location: '',
      category: 'Technology',
      salary: '',
      description: '',
      requirements: '',
    },
  });
  
  const jobPostsCollection = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return collection(firestore, `employers/${user.uid}/jobPosts`);
  }, [firestore, user]);

  const { data: jobPosts, isLoading: isLoadingJobs } = useCollection<JobPost>(jobPostsCollection);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  async function onSubmit(values: JobPostFormData) {
    if (!jobPostsCollection) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'Cannot post job. Please try again.',
        });
        return;
    };
    setIsPosting(true);
    try {
      await addDoc(jobPostsCollection, {
        ...values,
        postDate: serverTimestamp(),
      });
      toast({
        title: 'Job Posted!',
        description: 'Your job opening is now live.',
      });
      form.reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Posting Failed',
        description: error.message || 'Could not post job.',
      });
    } finally {
      setIsPosting(false);
    }
  }

  if (isUserLoading || !user) {
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
        <PageHeader 
          title="Employer Dashboard"
          description="Manage your job postings and find the best talent."
        />
        <div className="container mx-auto max-w-7xl px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Post a New Job</CardTitle>
                <CardDescription>Fill in the details below to create a job opening.</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField control={form.control} name="title" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Senior Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField control={form.control} name="location" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Bangalore, India" {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="salary" render={({ field }) => (
                          <FormItem>
                            <FormLabel>Salary Range</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., ₹15-20 LPA" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                    </div>
                     <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Category</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g., Technology" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="description" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe the role and responsibilities..." rows={5}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="requirements" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements</FormLabel>
                        <FormControl>
                          <Textarea placeholder="List the required skills and experience..." rows={5}/>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full gradient-saffron" disabled={isPosting}>
                      {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Post Job
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
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
                                <TableHead>Location</TableHead>
                                <TableHead>Posted On</TableHead>
                                <TableHead>Applicants</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingJobs ? (
                                <TableRow><TableCell colSpan={4} className="text-center p-8"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                            ) : jobPosts && jobPosts.length > 0 ? (
                                jobPosts.map(job => (
                                    <TableRow key={job.id}>
                                        <TableCell className="font-medium">{job.title}</TableCell>
                                        <TableCell>{job.location}</TableCell>
                                        <TableCell>{job.postDate ? format(job.postDate.toDate(), 'PPP') : 'N/A'}</TableCell>
                                        <TableCell>0</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                               <TableRow><TableCell colSpan={4} className="text-center p-8 text-muted-foreground">You haven't posted any jobs yet.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
