'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { JobSeeker } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  phone: z.string().min(10, 'Phone number is invalid').optional().or(z.literal('')),
  location: z.string().optional(),
  experienceLevel: z.enum(['fresher', 'experienced']).optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  currentCompany: z.string().optional(),
  currentSalary: z.string().optional(),
  resumeUrl: z.string().url('Please enter a valid URL.').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const jobSeekerRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'jobSeekers', user.uid);
  }, [firestore, user]);

  const { data: jobSeekerData, isLoading } = useDoc<JobSeeker>(jobSeekerRef);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      experienceLevel: 'fresher',
      experienceYears: 0,
      currentCompany: '',
      currentSalary: '',
      resumeUrl: '',
    },
  });
  
  const experienceLevel = form.watch("experienceLevel");

  useEffect(() => {
    if (jobSeekerData) {
      form.reset({
        ...jobSeekerData,
        experienceLevel: jobSeekerData.experienceLevel || 'fresher'
      });
    }
  }, [jobSeekerData, form]);

  async function onSubmit(values: ProfileFormData) {
    if (!jobSeekerRef) return;
    setIsSaving(true);
    try {
      const dataToUpdate: Partial<JobSeeker> = { 
        ...values,
      };

      if (values.experienceLevel === 'fresher') {
        dataToUpdate.experienceYears = 0;
        dataToUpdate.currentCompany = '';
        dataToUpdate.currentSalary = '';
      }

      await updateDoc(jobSeekerRef, dataToUpdate);
      toast({
        title: 'Profile Updated',
        description: 'Your information has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  }
  
  if (isLoading) {
    return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem> <FormLabel>First Name</FormLabel> <FormControl> <Input placeholder="Your first name" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
          <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem> <FormLabel>Last Name</FormLabel> <FormControl> <Input placeholder="Your last name" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>Email</FormLabel> <FormControl> <Input type="email" placeholder="your.email@example.com" {...field} readOnly className="bg-muted" /> </FormControl> <FormMessage /> </FormItem> )} />
          <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Phone Number</FormLabel> <FormControl> <Input type="tel" placeholder="+91 98765 43210" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
          <FormField control={form.control} name="location" render={({ field }) => ( <FormItem> <FormLabel>Location</FormLabel> <FormControl> <Input placeholder="e.g., Bangalore, India" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />

           <FormField
              control={form.control}
              name="experienceLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your experience level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fresher">Fresher</SelectItem>
                        <SelectItem value="experienced">Experienced</SelectItem>
                      </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        {experienceLevel === 'experienced' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <FormField control={form.control} name="experienceYears" render={({ field }) => ( <FormItem> <FormLabel>Years of Experience</FormLabel> <FormControl> <Input type="number" placeholder="e.g., 5" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
             <FormField control={form.control} name="currentCompany" render={({ field }) => ( <FormItem> <FormLabel>Current Company</FormLabel> <FormControl> <Input placeholder="Your current company" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
             <FormField control={form.control} name="currentSalary" render={({ field }) => ( <FormItem> <FormLabel>Current Salary (e.g., 10 LPA)</FormLabel> <FormControl> <Input placeholder="e.g., 10 LPA" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
          </div>
        )}

        <FormField
          control={form.control}
          name="resumeUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume URL</FormLabel>
              <FormControl>
                <Input type="text" placeholder="https://example.com/my-resume.pdf" {...field} />
              </FormControl>
              <FormDescription>
                Upload your resume to a service like Google Drive and paste the public link here.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Alert>
          <AlertTitle>Don't have a resume URL?</AlertTitle>
          <AlertDescription>
            No problem! Use our AI Resume Builder to create a professional resume in minutes. 
            <Button variant="link" asChild className="p-0 pl-1 h-auto">
              <Link href="/job-seeker?tab=resume">
                Go to Resume Builder
              </Link>
            </Button>
          </AlertDescription>
        </Alert>

        <div className="flex justify-end">
            <Button type="submit" className="gradient-saffron" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
            </Button>
        </div>
      </form>
    </Form>
  );
}
