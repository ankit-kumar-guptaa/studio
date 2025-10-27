'use client';

import { useEffect, useState } from 'react';
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
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendLeadEmail } from '@/ai/flows/send-lead-email-flow';

const leadSchema = z.object({
  role: z.enum(['job-seeker', 'employer'], {
    required_error: 'Please select your role.',
  }),
  // Job Seeker fields
  jobSeekerName: z.string().optional(),
  jobSeekerEmail: z.string().email('Invalid email address').optional(),
  jobSeekerPhone: z.string().optional(),
  jobSeekerSkills: z.string().optional(),
  // Employer fields
  companyName: z.string().optional(),
  contactPerson: z.string().optional(),
  employerEmail: z.string().email('Invalid email address').optional(),
  employerPhone: z.string().optional(),
  hiringNeeds: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.role === 'job-seeker') {
        if (!data.jobSeekerName) ctx.addIssue({ code: 'custom', message: 'Name is required.', path: ['jobSeekerName'] });
        if (!data.jobSeekerEmail) ctx.addIssue({ code: 'custom', message: 'Email is required.', path: ['jobSeekerEmail'] });
    } else if (data.role === 'employer') {
        if (!data.companyName) ctx.addIssue({ code: 'custom', message: 'Company name is required.', path: ['companyName'] });
        if (!data.employerEmail) ctx.addIssue({ code: 'custom', message: 'Email is required.', path: ['employerEmail'] });
    }
});


type LeadFormData = z.infer<typeof leadSchema>;

export function LeadCapturePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const hasSeenPopup = localStorage.getItem('hasSeenLeadPopup');
    if (!hasSeenPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3000); // Show popup after 3 seconds
      return () => clearTimeout(timer);
    }
  }, []);

  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      role: undefined,
    },
  });

  const selectedRole = form.watch('role');

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('hasSeenLeadPopup', 'true');
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
        description: 'Something went wrong. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Welcome to Hiring Dekho!</DialogTitle>
          <DialogDescription>
            Let's get you started. Tell us who you are to personalize your experience.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>You are a...</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex gap-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="job-seeker" /></FormControl>
                        <FormLabel className="font-normal">Job Seeker</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl><RadioGroupItem value="employer" /></FormControl>
                        <FormLabel className="font-normal">Employer</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedRole === 'job-seeker' && (
              <>
                <FormField control={form.control} name="jobSeekerName" render={({ field }) => (<FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Priya Sharma" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="jobSeekerEmail" render={({ field }) => (<FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="priya@example.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="jobSeekerPhone" render={({ field }) => (<FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input placeholder="+91 98765 43210" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="jobSeekerSkills" render={({ field }) => (<FormItem><FormLabel>Skills / Interested Field</FormLabel><FormControl><Input placeholder="e.g., React, Node.js, Marketing" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </>
            )}

            {selectedRole === 'employer' && (
              <>
                <FormField control={form.control} name="companyName" render={({ field }) => (<FormItem><FormLabel>Company Name</FormLabel><FormControl><Input placeholder="Bharat Solutions Ltd." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="contactPerson" render={({ field }) => (<FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="Rohan Gupta" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="employerEmail" render={({ field }) => (<FormItem><FormLabel>Work Email</FormLabel><FormControl><Input type="email" placeholder="rohan@bharatsolutions.com" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="employerPhone" render={({ field }) => (<FormItem><FormLabel>Work Phone (Optional)</FormLabel><FormControl><Input placeholder="+91 98765 12345" {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="hiringNeeds" render={({ field }) => (<FormItem><FormLabel>Hiring For (Role)</FormLabel><FormControl><Input placeholder="e.g., Senior Frontend Developer" {...field} /></FormControl><FormMessage /></FormItem>)} />
              </>
            )}
            
            <DialogFooter>
              <Button type="submit" className="w-full gradient-saffron" disabled={isLoading || !selectedRole}>
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
