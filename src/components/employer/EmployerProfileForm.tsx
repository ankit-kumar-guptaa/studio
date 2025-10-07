'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Employer } from '@/lib/types';

const profileSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  email: z.string().email(),
  phone: z.string().optional(),
  companyDescription: z.string().optional(),
  companyLogoUrl: z.string().url().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function EmployerProfileForm() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const employerRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'employers', user.uid);
  }, [firestore, user]);

  const { data: employerData, isLoading } = useDoc<Employer>(employerRef);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      companyName: '',
      email: '',
      phone: '',
      companyDescription: '',
      companyLogoUrl: '',
    },
  });

  useEffect(() => {
    if (employerData) {
      form.reset(employerData);
    }
  }, [employerData, form]);

  async function onSubmit(values: ProfileFormData) {
    if (!employerRef) return;
    setIsSaving(true);
    try {
      await updateDoc(employerRef, values);
      toast({
        title: 'Profile Updated',
        description: 'Your company information has been saved successfully.',
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
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Company Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your company's name" {...field} />
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
                <FormLabel>Company Phone</FormLabel>
                <FormControl>
                  <Input type="tel" placeholder="+91 98765 43210" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@yourcompany.com"
                      {...field}
                      readOnly
                      className="bg-muted"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="md:col-span-2">
            <FormField
              control={form.control}
              name="companyLogoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Logo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/logo.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
           <div className="md:col-span-2">
            <FormField
                control={form.control}
                name="companyDescription"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Company Description</FormLabel>
                    <FormControl>
                    <Textarea placeholder="Describe your company..." rows={5} {...field} />
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
