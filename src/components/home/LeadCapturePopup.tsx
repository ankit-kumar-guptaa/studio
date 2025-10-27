'use client';

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Upload, File as FileIcon, X, Briefcase, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendLeadEmail } from '@/ai/flows/send-lead-email-flow';
import { Badge } from '../ui/badge';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

// Define separate schemas for each role
const jobSeekerSchema = z.object({
  role: z.literal('job-seeker'),
  jobSeekerName: z.string().min(1, 'Name is required.'),
  jobSeekerEmail: z.string().email('Invalid email address.'),
  jobSeekerSkills: z.string().optional(),
  resume: z.string().optional(),
  resumeFilename: z.string().optional(),
});

const employerSchema = z.object({
  role: z.literal('employer'),
  companyName: z.string().min(1, 'Company name is required.'),
  employerEmail: z.string().email('Invalid email address.'),
  hiringNeeds: z.string().optional(),
});

// Create a discriminated union
const leadSchema = z.discriminatedUnion('role', [
  jobSeekerSchema,
  employerSchema,
]);

type LeadFormData = z.infer<typeof leadSchema>;

export function LeadCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const timer = setTimeout(() => {
        setIsOpen(true);
    }, 3000); // Show popup after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      role: 'job-seeker',
      jobSeekerName: '',
      jobSeekerEmail: '',
      jobSeekerSkills: '',
      resume: '',
      resumeFilename: '',
      companyName: '',
      employerEmail: '',
      hiringNeeds: '',
    },
  });

  const selectedRole = form.watch('role');
  const resumeFilename = form.watch('resumeFilename');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        toast({ variant: 'destructive', title: 'File too large', description: 'Please upload a file smaller than 5MB.' });
        return;
      }
      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        toast({ variant: 'destructive', title: 'Invalid file type', description: 'Please upload a PDF or Word document.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        form.setValue('resume', e.target?.result as string, { shouldValidate: true });
        form.setValue('resumeFilename', file.name, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    form.setValue('resume', '', { shouldValidate: true });
    form.setValue('resumeFilename', '', { shouldValidate: true });
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

  const handleClose = () => {
    setIsOpen(false);
    // sessionStorage.setItem('hasSeenLeadPopup', 'true');
  };

  const onSubmit = async (data: LeadFormData) => {
    setIsLoading(true);
    try {
      await sendLeadEmail(data);
      toast({
        title: 'Thank You!',
        description: 'Your information has been submitted successfully. We will get in touch with you shortly.',
      });
      handleClose();
    } catch (error) {
      console.error('Failed to send lead email:', error);
      toast({
        variant: 'destructive',
        title: 'Submission Failed',
        description: 'Something went wrong. Please check your details and try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-md p-0">
        <DialogHeader className="p-6 pb-2 text-center">
            <DialogTitle className="text-2xl">Let's Get You Started!</DialogTitle>
            <DialogDescription>
                Tell us who you are to get personalized service.
            </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <Tabs 
                    value={selectedRole}
                    onValueChange={(value) => form.setValue('role', value as 'job-seeker' | 'employer')}
                    className="w-full"
                >
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="job-seeker"><User className="mr-2 h-4 w-4"/>Job Seeker</TabsTrigger>
                        <TabsTrigger value="employer"><Briefcase className="mr-2 h-4 w-4"/>Employer</TabsTrigger>
                    </TabsList>

                    <TabsContent value="job-seeker" className="p-6 pt-4">
                        <div className="space-y-4">
                            <FormField control={form.control} name="jobSeekerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="jobSeekerEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="priya@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="jobSeekerSkills" render={({ field }) => (<FormItem><FormLabel>Skills / Interested Field</FormLabel><FormControl><Input placeholder="e.g., React, Node.js, Marketing" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormItem>
                                <FormLabel>Resume (Optional)</FormLabel>
                                <FormControl>
                                    <Input type="file" id="resume-upload" className="hidden" ref={fileInputRef} onChange={handleFileChange} accept=".pdf,.doc,.docx" />
                                </FormControl>
                                {resumeFilename ? (
                                    <Badge variant="secondary" className="flex items-center justify-between">
                                        <span className="truncate max-w-48"><FileIcon className="inline mr-2 h-4 w-4" />{resumeFilename}</span>
                                        <button type="button" onClick={removeFile}><X className="ml-2 h-4 w-4" /></button>
                                    </Badge>
                                ) : (
                                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload Resume</Button>
                                )}
                                <FormMessage />
                            </FormItem>
                        </div>
                    </TabsContent>

                    <TabsContent value="employer" className="p-6 pt-4">
                        <div className="space-y-4">
                            <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Bharat Solutions Ltd." {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="employerEmail" render={({ field }) => (<FormItem><FormLabel>Work Email</FormLabel><FormControl><Input type="email" placeholder="rohan@bharatsolutions.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                            <FormField control={form.control} name="hiringNeeds" render={({ field }) => (<FormItem><FormLabel>Hiring For (Role)</FormLabel><FormControl><Input placeholder="e.g., Senior Frontend Developer" {...field} /></FormControl><FormMessage /></FormItem>)} />
                        </div>
                    </TabsContent>
                </Tabs>
                
                <DialogFooter className="px-6 pb-6 pt-2">
                    <Button type="submit" className="w-full gradient-saffron" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
