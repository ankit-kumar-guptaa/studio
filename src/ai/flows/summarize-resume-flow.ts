'use server';
/**
 * @fileOverview An AI agent that summarizes a job seeker's resume.
 *
 * - summarizeResume - A function that handles the resume summarization process.
 * - SummarizeResumeInput - The input type for the summarizeResume function.
 * - SummarizeResumeOutput - The return type for the summarizeResume function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeResumeInputSchema = z.object({
  workExperience: z
    .string()
    .describe(
      'A JSON string representing the job seeker\'s work experience array.'
    ),
  education: z
    .string()
    .describe('A JSON string representing the job seeker\'s education array.'),
});
export type SummarizeResumeInput = z.infer<typeof SummarizeResumeInputSchema>;

const SummarizeResumeOutputSchema = z.object({
  summary: z
    .string()
    .describe('A professionally written, concise summary for the resume.'),
});
export type SummarizeResumeOutput = z.infer<typeof SummarizeResumeOutputSchema>;

export async function summarizeResume(
  input: SummarizeResumeInput
): Promise<SummarizeResumeOutput> {
  return summarizeResumeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeResumePrompt',
  input: {schema: SummarizeResumeInputSchema},
  output: {schema: SummarizeResumeOutputSchema},
  prompt: `You are an expert resume writer. Based on the provided work experience and education, write a compelling and professional summary for a job seeker's resume. The summary should be a short paragraph, highlighting their key strengths and career goals.

Work Experience:
{{{workExperience}}}

Education:
{{{education}}}

Generate the summary now.
`,
});

const summarizeResumeFlow = ai.defineFlow(
  {
    name: 'summarizeResumeFlow',
    inputSchema: SummarizeResumeInputSchema,
    outputSchema: SummarizeResumeOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);