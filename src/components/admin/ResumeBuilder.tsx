'use client';

import { useFieldArray, useForm } from 'react-hook-form';
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
import { Loader2, PlusCircle, Sparkles, Trash2, X } from 'lucide-react';
import { useFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { summarizeResume } from '@/ai/flows/summarize-resume-flow';
import type { JobSeeker } from '@/lib/types';
import { Badge } from '../ui/badge';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { v4 as uuidv4 } from 'uuid'; 
import { Label } from '../ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';


const baseProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().optional(),
  location: z.string().optional(),
  profilePictureUrl: z.string().optional(),
});

const workExperienceSchema = z.object({
  title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

const educationSchema = z.object({
  degree: z.string().min(1, 'Degree is required'),
  institution: z.string().min(1, 'Institution is required'),
  graduationYear: z.string().min(4, 'Invalid year').max(4, 'Invalid year'),
});

const resumeSchema = z.object({
  profile: baseProfileSchema,
  summary: z.string().optional(),
  skills: z.array(z.object({ value: z.string() })).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  education: z.array(educationSchema).optional(),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export function ResumeBuilder() {
  const { firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);


  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      profile: { firstName: '', lastName: '', email: '', phone: '', location: '', profilePictureUrl: '' },
      summary: '',
      skills: [],
      workExperience: [],
      education: [],
    },
  });
  
  const { fields: workFields, append: appendWork, remove: removeWork } = useFieldArray({
    control: form.control,
    name: "workExperience",
  });

  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({
    control: form.control,
    name: "education",
  });

  const { fields: skillFields, append: appendSkill, remove: removeSkill } = useFieldArray({
    control: form.control,
    name: "skills",
  });

  const profilePictureUrl = form.watch('profile.profilePictureUrl');

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
        form.setValue('profile.profilePictureUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleGenerateSummary() {
    const { workExperience, education } = form.getValues();
    if (!workExperience?.length && !education?.length) {
      toast({
        variant: 'destructive',
        title: 'Cannot generate summary',
        description: 'Please add at least one work experience or education entry.',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await summarizeResume({
        workExperience: JSON.stringify(workExperience),
        education: JSON.stringify(education),
      });
      form.setValue('summary', result.summary);
      toast({
        title: 'Summary Generated!',
        description: 'AI has created a professional summary for you.',
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to generate summary. Please try again.',
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleAddSkill = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && skillInput.trim() !== '') {
      e.preventDefault();
      appendSkill({ value: skillInput.trim() });
      setSkillInput('');
    }
  };

  async function onSubmit(values: ResumeFormData) {
    if (!firestore) return;
    setIsSaving(true);
    
    const candidateId = uuidv4();
    
    const jobSeekerData: JobSeeker = {
      id: candidateId,
      ...values.profile,
      summary: values.summary,
      skills: values.skills,
      workExperience: values.workExperience,
      education: values.education,
    };
    
    const jobSeekerRef = doc(firestore, 'jobSeekers', candidateId);

    try {
      await setDoc(jobSeekerRef, jobSeekerData);
      toast({
        title: 'Candidate Profile Created',
        description: 'The new job seeker profile has been saved successfully.',
      });
      form.reset(); 
    } catch (error: any) {
        console.error("Error creating candidate profile:", error);
        const permissionError = new FirestorePermissionError({
            path: jobSeekerRef.path,
            operation: 'create',
            requestResourceData: jobSeekerData,
        });
        errorEmitter.emit('permission-error', permissionError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Candidate Information</h3>
          <div className="p-4 border rounded-lg space-y-6">

             <div className='flex items-center gap-6'>
                <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePictureUrl || undefined} alt="Profile Picture" />
                    <AvatarFallback className='text-3xl'>
                        {form.getValues('profile.firstName')?.[0]}
                        {form.getValues('profile.lastName')?.[0]}
                    </AvatarFallback>
                </Avatar>
                <div className='flex-grow'>
                    <Label>Profile Picture (Optional)</Label>
                    <Input 
                        type="file" 
                        className="hidden"
                        ref={fileInputRef}
                        accept="image/png, image/jpeg"
                        onChange={handlePictureChange}
                    />
                    <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                        Upload Photo
                    </Button>
                    <p className="text-sm text-muted-foreground mt-2">PNG or JPG, up to 2MB.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="profile.firstName" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} placeholder="Candidate's first name" /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="profile.lastName" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} placeholder="Candidate's last name" /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="profile.email" render={({ field }) => ( <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} type="email" placeholder="candidate@example.com" /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="profile.phone" render={({ field }) => ( <FormItem><FormLabel>Phone (Optional)</FormLabel><FormControl><Input {...field} placeholder="+91..." /></FormControl><FormMessage /></FormItem> )} />
              <FormField control={form.control} name="profile.location" render={({ field }) => ( <FormItem><FormLabel>Location (Optional)</FormLabel><FormControl><Input {...field} placeholder="e.g., Bangalore, KA" /></FormControl><FormMessage /></FormItem> )} />
            </div>
          </div>
        </div>

        <Separator />

        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center mb-2">
                <FormLabel className="text-lg font-semibold">Professional Summary</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={handleGenerateSummary} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate with AI
                </Button>
              </div>
              <FormControl>
                <Textarea placeholder="Write a brief summary about the candidate or generate one with AI." {...field} rows={4}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <div className="flex flex-wrap gap-2 mb-2">
            {skillFields.map((field, index) => (
              <Badge key={field.id} variant="secondary" className="flex items-center gap-1">
                {field.value}
                <button type="button" onClick={() => removeSkill(index)}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
          <Input 
            placeholder="Add a skill and press Enter"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={handleAddSkill}
          />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Work Experience</h3>
          <div className="space-y-6">
            {workFields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-lg relative">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField control={form.control} name={`workExperience.${index}.title`} render={({ field }) => ( <FormItem><FormLabel>Job Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`workExperience.${index}.company`} render={({ field }) => ( <FormItem><FormLabel>Company</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`workExperience.${index}.startDate`} render={({ field }) => ( <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <FormField control={form.control} name={`workExperience.${index}.endDate`} render={({ field }) => ( <FormItem><FormLabel>End Date (optional)</FormLabel><FormControl><Input type="month" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="md:col-span-2">
                    <FormField control={form.control} name={`workExperience.${index}.description`} render={({ field }) => ( <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                </div>
                <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeWork(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={() => appendWork({ title: '', company: '', startDate: '', endDate: '', description: '' })}><PlusCircle className="mr-2 h-4 w-4" /> Add Experience</Button>
          </div>
        </div>

        <Separator />
        
        <div>
           <h3 className="text-lg font-semibold mb-4">Education</h3>
            <div className="space-y-6">
                {eduFields.map((field, index) => (
                     <div key={field.id} className="p-4 border rounded-lg relative">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <FormField control={form.control} name={`education.${index}.degree`} render={({ field }) => ( <FormItem><FormLabel>Degree / Certificate</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                           <FormField control={form.control} name={`education.${index}.institution`} render={({ field }) => ( <FormItem><FormLabel>Institution</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                           <FormField control={form.control} name={`education.${index}.graduationYear`} render={({ field }) => ( <FormItem><FormLabel>Year of Graduation</FormLabel><FormControl><Input placeholder="YYYY" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </div>
                        <Button type="button" variant="ghost" size="icon" className="absolute top-2 right-2" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                ))}
                 <Button type="button" variant="outline" onClick={() => appendEdu({ degree: '', institution: '', graduationYear: ''})}><PlusCircle className="mr-2 h-4 w-4" /> Add Education</Button>
            </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="gradient-professional" disabled={isSaving || isGenerating}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Candidate Profile
          </Button>
        </div>
      </form>
    </Form>
  );
}
