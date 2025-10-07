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
import { useEffect, useState }from 'react';
import { useToast } from '@/hooks/use-toast';
import type { JobSeeker } from '@/lib/types';
import { Combobox, type ComboboxOption } from '@/components/ui/combobox';
import { indianStatesAndCities } from '@/lib/locations';

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

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ProfileFormData>({
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
  
  const experienceLevel = watch('experienceLevel');
  const locationValue = watch('location');

  useEffect(() => {
    if (jobSeekerData) {
      reset(jobSeekerData);
    }
  }, [jobSeekerData, reset]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input id="firstName" {...register('firstName')} />
            {errors.firstName && <p className="text-sm font-medium text-destructive">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input id="lastName" {...register('lastName')} />
            {errors.lastName && <p className="text-sm font-medium text-destructive">{errors.lastName.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" {...register('email')} readOnly className="bg-muted" />
            {errors.email && <p className="text-sm font-medium text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" {...register('phone')} />
            {errors.phone && <p className="text-sm font-medium text-destructive">{errors.phone.message}</p>}
        </div>
        <div className="space-y-2">
           <Label htmlFor="location">Location</Label>
            <Combobox
                options={locationOptions}
                value={locationValue}
                onChange={(value) => setValue('location', value, { shouldValidate: true })}
                placeholder="Select location..."
                searchPlaceholder="Search location..."
                emptyPlaceholder="Location not found."
            />
            {errors.location && <p className="text-sm font-medium text-destructive">{errors.location.message}</p>}
        </div>
        <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <select
                id="experienceLevel"
                {...register('experienceLevel')}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
                <option value="" disabled>Select your experience level</option>
                <option value="fresher">Fresher</option>
                <option value="experienced">Experienced</option>
            </select>
            {errors.experienceLevel && <p className="text-sm font-medium text-destructive">{errors.experienceLevel.message}</p>}
        </div>

        {experienceLevel === 'experienced' && (
        <>
            <div className="space-y-2">
                <Label htmlFor="currentCompany">Current Company</Label>
                <Input id="currentCompany" {...register('currentCompany')} placeholder="Your current company" />
                {errors.currentCompany && <p className="text-sm font-medium text-destructive">{errors.currentCompany.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="currentSalary">Current Salary (LPA)</Label>
                <Input id="currentSalary" {...register('currentSalary')} placeholder="e.g., 10 LPA" />
                {errors.currentSalary && <p className="text-sm font-medium text-destructive">{errors.currentSalary.message}</p>}
            </div>
        </>
        )}

        <div className="md:col-span-2 space-y-2">
            <Label htmlFor="resumeUrl">Resume URL</Label>
            <Input id="resumeUrl" {...register('resumeUrl')} placeholder="https://example.com/my-resume.pdf" />
            {errors.resumeUrl && <p className="text-sm font-medium text-destructive">{errors.resumeUrl.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" className="gradient-saffron" disabled={isSaving}>
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}
