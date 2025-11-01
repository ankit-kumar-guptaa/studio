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
    .describe('A list of job recommendations based on the user profile and search history in markdown format.'),
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
  prompt: `You are an expert AI job recommendation agent for the Indian job market. Your task is to analyze the provided job seeker's profile and their search history to generate a list of highly relevant job recommendations.

The output should be a friendly, engaging, and well-formatted list in markdown. Start with a positive opening, then list 3-5 job recommendations. For each recommendation, include the Job Title, a potential company (be creative and relevant to India), and a short, compelling reason why it's a good fit for the user.

Job Seeker Profile:
{{{userProfile}}}

Search History (Keywords they have recently searched for):
{{{searchHistory}}}

Generate the markdown-formatted job recommendations now.
`,
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
