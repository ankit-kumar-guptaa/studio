'use client';

import { useState } from 'react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
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
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import type { Employer } from '@/lib/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const jobPostSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  salary: z.string().min(1, 'Salary is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

interface PostJobFormProps {
    onJobPosted: () => void;
}

export function PostJobForm({ onJobPosted }: PostJobFormProps) {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);
  
  const employerRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'employers', user.uid);
  }, [firestore, user]);

  const { data: employerData } = useDoc<Employer>(employerRef);

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
  
  async function onSubmit(values: JobPostFormData) {
    if (!user || !firestore) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in to post a job.',
        });
        return;
    };

    const jobData = {
        ...values,
        employerId: user.uid,
        postDate: serverTimestamp(),
        companyName: employerData?.companyName || user.displayName,
        companyLogoUrl: employerData?.companyLogoUrl || '',
      };
    
    setIsPosting(true);
    try {
      // 1. Add to the employer's subcollection
      const jobPostsCollectionRef = collection(firestore, `employers/${user.uid}/jobPosts`);
      const docRef = await addDoc(jobPostsCollectionRef, jobData);
      
      // 2. Add a copy to the top-level jobPosts collection for global querying
      const globalJobPostRef = doc(firestore, 'jobPosts', docRef.id);
      await setDoc(globalJobPostRef, jobData);
      
      toast({
        title: 'Job Posted!',
        description: 'Your job opening is now live.',
      });
      form.reset();
      onJobPosted(); // Callback to refresh the job list
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

  return (
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a job category" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Technology">Technology</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Design">Design</SelectItem>
                        <SelectItem value="Sales">Sales</SelectItem>
                        <SelectItem value="Human Resources">Human Resources</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                    </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Job Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Describe the role and responsibilities..." rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="requirements" render={({ field }) => (
          <FormItem>
            <FormLabel>Requirements</FormLabel>
            <FormControl>
              <Textarea placeholder="List the required skills and experience..." rows={5} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="flex justify-end">
            <Button type="submit" className="w-full md:w-auto gradient-saffron" disabled={isPosting}>
            {isPosting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Post Job
            </Button>
        </div>
      </form>
    </Form>
  );
}
