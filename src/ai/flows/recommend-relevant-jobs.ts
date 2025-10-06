'use server';

/**
 * @fileOverview An AI agent that recommends relevant jobs to job seekers.
 *
 * - recommendRelevantJobs - A function that handles the job recommendation process.
 * - RecommendRelevantJobsInput - The input type for the recommendRelevantJobs function.
 * - RecommendRelevantJobsOutput - The return type for the recommendRelevantJobs function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendRelevantJobsInputSchema = z.object({
  userProfile: z
    .string()
    .describe('The job seeker profile, including skills, experience, and preferences.'),
  searchHistory: z
    .string()
    .describe('The job seeker search history, including keywords and locations.'),
});
export type RecommendRelevantJobsInput = z.infer<
  typeof RecommendRelevantJobsInputSchema
>;

const RecommendRelevantJobsOutputSchema = z.object({
  jobRecommendations: z
    .string()
    .describe('A list of job recommendations based on the user profile and search history.'),
});
export type RecommendRelevantJobsOutput = z.infer<
  typeof RecommendRelevantJobsOutputSchema
>;

export async function recommendRelevantJobs(
  input: RecommendRelevantJobsInput
): Promise<RecommendRelevantJobsOutput> {
  return recommendRelevantJobsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendRelevantJobsPrompt',
  input: {schema: RecommendRelevantJobsInputSchema},
  output: {schema: RecommendRelevantJobsOutputSchema},
  prompt: `You are an AI job recommendation agent. Based on the job seeker's profile and search history, you will recommend relevant jobs.

Job Seeker Profile: {{{userProfile}}}
Search History: {{{searchHistory}}}

Recommendations:`,
});

const recommendRelevantJobsFlow = ai.defineFlow(
  {
    name: 'recommendRelevantJobsFlow',
    inputSchema: RecommendRelevantJobsInputSchema,
    outputSchema: RecommendRelevantJobsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
