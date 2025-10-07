'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { JobSeeker } from '@/lib/types';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { indianStatesAndCities } from '@/lib/locations';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const locationOptions: ComboboxOption[] = indianStatesAndCities.map(location => ({
    value: location,
    label: location,
}));

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
  profilePictureUrl: z.string().optional(), // Can be a data URI or URL
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      profilePictureUrl: '',
    },
  });

  const experienceLevel = form.watch('experienceLevel');
  const profilePictureUrl = form.watch('profilePictureUrl');

  useEffect(() => {
    if (jobSeekerData) {
      form.reset(jobSeekerData);
    }
  }, [jobSeekerData, form]);

  const handlePictureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          variant: "destructive",
          title: "File too large",
          description: "Please select an image smaller than 2MB.",
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('profilePictureUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div className='flex items-center gap-6'>
            <Avatar className="h-24 w-24">
                <AvatarImage src={profilePictureUrl || undefined} alt="Profile Picture" />
                <AvatarFallback className='text-3xl'>{jobSeekerData?.firstName?.[0]}{jobSeekerData?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className='flex-grow'>
                <Label>Profile Picture</Label>
                 <Input 
                    type="file" 
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/png, image/jpeg"
                    onChange={handlePictureChange}
                />
                 <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    Change Picture
                </Button>
                <p className="text-sm text-muted-foreground mt-2">Click button to select a new photo (PNG, JPG up to 2MB).</p>
            </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <FormField control={form.control} name="firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} readOnly className="bg-muted" /></FormControl><FormMessage /></FormItem> )} />
          <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
          
           <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                 <Combobox
                    options={locationOptions}
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select location..."
                    searchPlaceholder="Search location..."
                    emptyPlaceholder="Location not found."
                />
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
                <FormControl>
                  <select
                    {...field}
                    className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="" disabled>Select your experience level</option>
                    <option value="fresher">Fresher</option>
                    <option value="experienced">Experienced</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {experienceLevel === 'experienced' && (
          <>
            <FormField control={form.control} name="currentCompany" render={({ field }) => ( <FormItem><FormLabel>Current Company</FormLabel><FormControl><Input placeholder="Your current company" {...field} /></FormControl><FormMessage /></FormItem> )} />
            <FormField control={form.control} name="currentSalary" render={({ field }) => ( <FormItem><FormLabel>Current Salary (LPA)</FormLabel><FormControl><Input placeholder="e.g., 10 LPA" {...field} /></FormControl><FormMessage /></FormItem> )} />
          </>
          )}

          <div className="md:col-span-2">
            <FormField control={form.control} name="resumeUrl" render={({ field }) => ( <FormItem><FormLabel>Resume URL</FormLabel><FormControl><Input placeholder="https://example.com/my-resume.pdf" {...field} /></FormControl><FormMessage /></FormItem> )} />
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
