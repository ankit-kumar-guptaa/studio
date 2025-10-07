'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { JobSeeker } from '@/lib/types';
import { Label } from '../ui/label';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.enum(['fresher', 'experienced']).optional(),
  currentSalary: z.string().optional(),
  currentCompany: z.string().optional(),
  resumeUrl: z.string().url().or(z.literal('')).optional(),
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
      experienceLevel: undefined,
      currentSalary: '',
      currentCompany: '',
      resumeUrl: '',
    },
  });
  
  const experienceLevel = form.watch('experienceLevel');

  useEffect(() => {
    if (jobSeekerData) {
      form.reset(jobSeekerData);
    }
  }, [jobSeekerData, form]);

  async function onSubmit(values: ProfileFormData) {
    if (!jobSeekerRef) return;
    setIsSaving(true);
    try {
      await updateDoc(jobSeekerRef, values);
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
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input {...field} readOnly className="bg-muted" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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

          {experienceLevel === 'experienced' && (
            <>
              <FormField
                control={form.control}
                name="currentCompany"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Your current company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Salary (LPA)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., 10 LPA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </>
          )}

           <div className="md:col-span-2">
            <FormField
                control={form.control}
                name="resumeUrl"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Resume URL</FormLabel>
                    <FormControl>
                    <Input placeholder="https://example.com/my-resume.pdf" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )} />
            </div>
        </div>

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
