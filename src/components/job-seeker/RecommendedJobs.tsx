'use client';

import { useState, useEffect } from 'react';
import { recommendRelevantJobs, type RecommendRelevantJobsOutput } from '@/ai/flows/recommend-relevant-jobs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useFirebase, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

// Define a type for the job seeker's profile data
interface JobSeekerProfile {
  firstName?: string;
  lastName?: string;
  location?: string;
  categoryPreferences?: string[];
  resumeUrl?: string;
  // Add other relevant fields from the JobSeeker entity
}

export function RecommendedJobs() {
  const [recommendations, setRecommendations] = useState<RecommendRelevantJobsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, firestore } = useFirebase();

  // Fetch job seeker profile from Firestore
  const jobSeekerRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'jobSeekers', user.uid);
  }, [firestore, user]);

  const { data: jobSeekerData, isLoading: isProfileLoading } = useDoc<JobSeekerProfile>(jobSeekerRef);

  const generateRecommendations = async () => {
    if (!jobSeekerData) {
      toast({
        variant: 'destructive',
        title: 'Profile Not Found',
        description: 'Please complete your profile to get AI recommendations.',
      });
      return;
    }

    setIsLoading(true);
    setRecommendations(null);

    // Construct a user profile string from the fetched data
    const userProfileString = `
      Name: ${jobSeekerData.firstName || ''} ${jobSeekerData.lastName || ''}.
      Location: ${jobSeekerData.location || 'Not specified'}.
      Preferred Categories: ${jobSeekerData.categoryPreferences?.join(', ') || 'Not specified'}.
      Resume: ${jobSeekerData.resumeUrl ? 'Available' : 'Not available'}.
      Skills and Experience: Software engineer with 3 years of experience in frontend development, specializing in React, Next.js, and TypeScript. Prefers remote work or roles in Bangalore.
    `.trim();
    
    // For now, we'll keep search history as a static example.
    // In a future version, this could be dynamically tracked.
    const searchHistoryString = '["frontend developer remote", "react jobs bangalore", "nextjs engineer india"]';

    try {
      const result = await recommendRelevantJobs({
        userProfile: userProfileString,
        searchHistory: searchHistoryString,
      });
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
  
  useEffect(() => {
    // Automatically fetch recommendations when profile data is loaded
    if (jobSeekerData) {
      generateRecommendations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobSeekerData]);


  if (isProfileLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        <div className="text-center text-muted-foreground">
          <Loader2 className="mx-auto h-8 w-8 animate-spin" />
          <p className="mt-2">Loading your profile...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-4">
       <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Your Custom Job Feed</h3>
        <Button onClick={generateRecommendations} disabled={isLoading || isProfileLoading} variant="outline" size="sm">
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>
      
      {isLoading && (
        <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
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

      {!isLoading && !recommendations && !isProfileLoading && (
        <div className="flex h-96 items-center justify-center rounded-lg border border-dashed">
          <div className="text-center text-muted-foreground">
            <Sparkles className="mx-auto h-8 w-8" />
            <p className="mt-2">Your personalized job recommendations will appear here.</p>
            {!jobSeekerData && <p className="text-sm mt-1">Complete your profile to get started!</p>}
          </div>
        </div>
      )}
    </div>
  );
}
