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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Loader2, User, Briefcase, Upload, File as FileIcon, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendLeadEmail } from '@/ai/flows/send-lead-email-flow';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const jobSeekerSchema = z.object({
    role: z.literal('job-seeker'),
    jobSeekerName: z.string().min(1, 'Name is required.'),
    jobSeekerEmail: z.string().email('Invalid email address.'),
    jobSeekerPhone: z.string().optional(),
    jobSeekerSkills: z.string().optional(),
    resume: z.string().optional(),
    resumeFilename: z.string().optional(),
});

const employerSchema = z.object({
    role: z.literal('employer'),
    companyName: z.string().min(1, 'Company name is required.'),
    contactPerson: z.string().optional(),
    employerEmail: z.string().email('Invalid email address.'),
    employerPhone: z.string().optional(),
    hiringNeeds: z.string().optional(),
});

const leadSchema = z.discriminatedUnion('role', [
    jobSeekerSchema,
    employerSchema
]);


type LeadFormData = z.infer<typeof leadSchema>;

export function LeadCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // For development, always show the popup after a delay.
    const timer = setTimeout(() => {
        // Only show if it hasn't been seen before in this session/storage.
        if (sessionStorage.getItem('hasSeenLeadPopup') !== 'true') {
            setIsOpen(true);
        }
    }, 3000); // Show popup after 3 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      role: 'job-seeker', // Default to one role to avoid undefined state
      jobSeekerName: '',
      jobSeekerEmail: '',
      jobSeekerPhone: '',
      jobSeekerSkills: '',
      resume: '',
      resumeFilename: '',
    },
  });

  const selectedRole = form.watch('role');
  const resumeFilename = form.watch('resumeFilename');

  // When role changes, reset the form with appropriate defaults
  useEffect(() => {
    if (selectedRole === 'job-seeker') {
      form.reset({
        role: 'job-seeker',
        jobSeekerName: '',
        jobSeekerEmail: '',
        jobSeekerPhone: '',
        jobSeekerSkills: '',
        resume: '',
        resumeFilename: '',
      });
    } else if (selectedRole === 'employer') {
      form.reset({
        role: 'employer',
        companyName: '',
        contactPerson: '',
        employerEmail: '',
        employerPhone: '',
        hiringNeeds: '',
      });
    }
  }, [selectedRole, form]);


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
        form.setValue('resume', e.target?.result as string);
        form.setValue('resumeFilename', file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    form.setValue('resume', '');
    form.setValue('resumeFilename', '');
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }


  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenLeadPopup', 'true');
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
      form.reset();
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2"><Briefcase className="h-6 w-6 text-primary" /> Let's Get You Started!</DialogTitle>
          <DialogDescription>
            Tell us who you are to personalize your experience on Hiring Dekho.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-2 gap-4"
                    >
                      <FormItem>
                         <RadioGroupItem value="job-seeker" id="r1" className="sr-only peer" />
                         <Label htmlFor="r1" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <User className="mb-3 h-6 w-6" />
                            Job Seeker
                         </Label>
                      </FormItem>
                      <FormItem>
                         <RadioGroupItem value="employer" id="r2" className="sr-only peer" />
                         <Label htmlFor="r2" className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer">
                            <Briefcase className="mb-3 h-6 w-6" />
                            Employer
                         </Label>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === 'job-seeker' && (
              <div className="space-y-3 animate-in fade-in-50">
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
                      <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}><Upload className="mr-2 h-4 w-4" /> Upload Resume</Button>
                    )}
                  <FormMessage />
                </FormItem>
              </div>
            )}

            {selectedRole === 'employer' && (
              <div className="space-y-3 animate-in fade-in-50">
                <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Bharat Solutions Ltd." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="employerEmail" render={({ field }) => (<FormItem><FormLabel>Work Email</FormLabel><FormControl><Input type="email" placeholder="rohan@bharatsolutions.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="hiringNeeds" render={({ field }) => (<FormItem><FormLabel>Hiring For (Role)</FormLabel><FormControl><Input placeholder="e.g., Senior Frontend Developer" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </div>
            )}
            
            <DialogFooter>
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
