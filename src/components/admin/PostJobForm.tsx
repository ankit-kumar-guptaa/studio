'use client';

import { useState } from 'react';
import { useFirebase } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from 'lucide-react';
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
import { collection, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { generateJobDescription } from '@/ai/flows/generate-job-description-flow';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { indianStatesAndCities } from '@/lib/locations';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { v4 as uuidv4 } from 'uuid'; 

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location,
    label: location,
}));

const jobPostSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  companyName: z.string().min(1, 'Company Name is required'),
  companyLogoUrl: z.string().url().optional().or(z.literal('')),
  location: z.string().min(1, 'Location is required'),
  category: z.string().min(1, 'Category is required'),
  salary: z.string().min(1, 'Salary is required'),
  experience: z.string().min(1, 'Experience is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.string().min(1, 'Requirements are required'),
});

type JobPostFormData = z.infer<typeof jobPostSchema>;

export function PostJobForm() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const form = useForm<JobPostFormData>({
    resolver: zodResolver(jobPostSchema),
    defaultValues: {
      title: '',
      companyName: '',
      companyLogoUrl: '',
      location: '',
      category: 'Technology',
      salary: '',
      experience: '0-1 years',
      description: '',
      requirements: '',
    },
  });

  const handleGenerateDescription = async () => {
    const { title, experience } = form.getValues();
    if (!title || !experience) {
      toast({
        variant: 'destructive',
        title: 'Input Missing',
        description: 'Please provide a Job Title and Experience level to generate a description.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateJobDescription({ jobTitle: title, experience });
      form.setValue('description', result.description);
      form.setValue('requirements', result.requirements);
      toast({
        title: 'Content Generated!',
        description: 'AI has created a job description and requirements for you.',
      });
    } catch (error) {
      console.error('Error generating description:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate content. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  async function onSubmit(values: JobPostFormData) {
    if (!firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firestore is not available.',
      });
      return;
    }

    setIsPosting(true);
    const newJobId = uuidv4();
    const jobData = {
      ...values,
      id: newJobId,
      employerId: 'SUPER_ADMIN', 
      postDate: serverTimestamp(),
    };
    
    const globalJobPostRef = doc(firestore, 'jobPosts', newJobId);
    
    try {
      // For Super Admin, we only need to write to the global `jobPosts` collection
      await setDoc(globalJobPostRef, jobData);

      toast({
        title: 'Job Posted!',
        description: 'The job opening is now live for all users.',
      });
      form.reset();

    } catch (error: any) {
        console.error("Error adding document to global jobPosts collection:", error);
        const permissionError = new FirestorePermissionError({
            path: globalJobPostRef.path,
            operation: 'create',
            requestResourceData: jobData,
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
        setIsPosting(false);
    }
  }


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <FormField control={form.control} name="companyName" render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., InnovateTech" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
           <FormField control={form.control} name="companyLogoUrl" render={({ field }) => (
            <FormItem>
              <FormLabel>Company Logo URL (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="https://example.com/logo.png" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="title" render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Senior Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
           <FormField control={form.control} name="location" render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                 <Combobox
                    options={locationOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select location..."
                    searchPlaceholder="Search location..."
                    emptyPlaceholder="Location not found."
                />
              </FormControl>
                <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <FormField control={form.control} name="salary" render={({ field }) => (
                <FormItem>
                  <FormLabel>Salary Range</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., ₹15-20 LPA" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="experience" render={({ field }) => (
                <FormItem>
                  <FormLabel>Experience Required</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select experience level" />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="0-1 years">0-1 years</SelectItem>
                            <SelectItem value="1-3 years">1-3 years</SelectItem>
                            <SelectItem value="3-5 years">3-5 years</SelectItem>
                            <SelectItem value="5-10 years">5-10 years</SelectItem>
                            <SelectItem value="10+ years">10+ years</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
            )} />
        </div>
        
        <div className="space-y-2">
            <div className="flex justify-between items-center">
              <FormLabel>Job Description & Requirements</FormLabel>
              <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGenerating || isPosting}>
                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Generate with AI
              </Button>
            </div>
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="Describe the role and responsibilities..." rows={8} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="requirements" render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea placeholder="List the required skills and experience..." rows={8} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />
        </div>

        <div className="flex justify-end">
            <Button type="submit" className="w-full md:w-auto gradient-professional" disabled={isPosting || isGenerating}>
            {isPosting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Post Job
            </Button>
        </div>
      </form>
    </Form>
  );
}
