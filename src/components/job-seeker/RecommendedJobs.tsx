"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  recommendRelevantJobs,
  type RecommendRelevantJobsOutput,
} from '@/ai/flows/recommend-relevant-jobs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const recommendationSchema = z.object({
  userProfile: z.string().min(10, 'Please provide more details about your profile.'),
  searchHistory: z.string().min(3, 'Please provide some search history.'),
});

type FormData = z.infer<typeof recommendationSchema>;

export function RecommendedJobs() {
  const [recommendations, setRecommendations] = useState<RecommendRelevantJobsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(recommendationSchema),
    defaultValues: {
      userProfile:
        'I am a software engineer with 3 years of experience in frontend development, specializing in React, Next.js, and TypeScript. I have worked in e-commerce and SaaS startups. I prefer remote work or roles in Bangalore.',
      searchHistory: '["frontend developer remote", "react jobs bangalore", "nextjs engineer india"]',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await recommendRelevantJobs(data);
      setRecommendations(result);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch job recommendations. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Information</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="userProfile"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Profile Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Experienced product manager with a background in fintech..."
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Describe your skills, experience, and preferences.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="searchHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recent Job Searches</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g., "Software Engineer in Mumbai"' {...field} />
                  </FormControl>
                  <FormDescription>
                    Provide a few of your recent search queries.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full gradient-indigo">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Recommendations
            </Button>
          </form>
        </Form>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Your Custom Job Feed</h3>
        {isLoading && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center text-muted-foreground">
              <Loader2 className="mx-auto h-8 w-8 animate-spin" />
              <p className="mt-2">Our AI is finding the best jobs for you...</p>
            </div>
          </div>
        )}

        {recommendations && (
           <Card className="bg-secondary">
             <CardHeader>
               <CardTitle className="text-primary">Recommended for You</CardTitle>
             </CardHeader>
             <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert" dangerouslySetInnerHTML={{ __html: recommendations.jobRecommendations.replace(/\n/g, '<br />') }} />
             </CardContent>
           </Card>
        )}

        {!isLoading && !recommendations && (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
            <div className="text-center text-muted-foreground">
              <Sparkles className="mx-auto h-8 w-8" />
              <p className="mt-2">Your personalized job recommendations will appear here.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
