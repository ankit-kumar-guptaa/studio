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
import { Loader2, PlusCircle, Sparkles, Trash2 } from 'lucide-react';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '../ui/separator';
import { summarizeResume } from '@/ai/flows/summarize-resume-flow';
import type { JobSeeker } from '@/lib/types';
import { Badge } from '../ui/badge';
import { X } from 'lucide-react';

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
  summary: z.string().optional(),
  skills: z.array(z.object({ value: z.string() })).optional(),
  workExperience: z.array(workExperienceSchema).optional(),
  education: z.array(educationSchema).optional(),
});

type ResumeFormData = z.infer<typeof resumeSchema>;

export function ResumeBuilder() {
  const { user, firestore } = useFirebase();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const jobSeekerRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'jobSeekers', user.uid);
  }, [firestore, user]);

  const { data: jobSeekerData, isLoading } = useDoc<JobSeeker>(jobSeekerRef);

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
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

  useEffect(() => {
    if (jobSeekerData) {
      form.reset({
        summary: jobSeekerData.summary || '',
        skills: jobSeekerData.skills || [],
        workExperience: jobSeekerData.workExperience || [],
        education: jobSeekerData.education || [],
      });
    }
  }, [jobSeekerData, form]);

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
    if (!jobSeekerRef) return;
    setIsSaving(true);
    try {
      await updateDoc(jobSeekerRef, values);
      toast({
        title: 'Resume Updated',
        description: 'Your resume information has been saved successfully.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Update Failed',
        description: error.message || 'Could not update your resume.',
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
        {/* Professional Summary */}
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
                <Textarea placeholder="Write a brief summary about your professional background or generate one with AI." {...field} rows={4}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

         {/* Skills */}
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

        {/* Work Experience */}
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
        
        {/* Education */}
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
            Save Resume
          </Button>
        </div>
      </form>
    </Form>
  );
}
