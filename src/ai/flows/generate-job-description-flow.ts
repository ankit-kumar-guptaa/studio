'use server';
/**
 * @fileOverview An AI agent that generates a job description and skills list.
 *
 * - generateJobDescription - A function that handles the generation process.
 * - GenerateJobDescriptionInput - The input type for the function.
 * - GenerateJobDescriptionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateJobDescriptionInputSchema = z.object({
  jobTitle: z.string().describe('The title of the job.'),
  experience: z
    .string()
    .describe('The required experience level for the job (e.g., "2-4 years").'),
});
export type GenerateJobDescriptionInput = z.infer<
  typeof GenerateJobDescriptionInputSchema
>;

const GenerateJobDescriptionOutputSchema = z.object({
  description: z
    .string()
    .describe(
      'A detailed, professionally written job description, formatted as a single string with newline characters for paragraphs.'
    ),
  requirements: z
    .string()
    .describe(
      'A list of required skills and qualifications, formatted as a single string with newline characters for each point.'
    ),
});
export type GenerateJobDescriptionOutput = z.infer<
  typeof GenerateJobDescriptionOutputSchema
>;

export async function generateJobDescription(
  input: GenerateJobDescriptionInput
): Promise<GenerateJobDescriptionOutput> {
  return generateJobDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateJobDescriptionPrompt',
  input: {schema: GenerateJobDescriptionInputSchema},
  output: {schema: GenerateJobDescriptionOutputSchema},
  prompt: `You are an expert recruitment consultant for the Indian job market. Your task is to generate a compelling job description and a list of requirements for a given job title and experience level.

Job Title: {{{jobTitle}}}
Experience Required: {{{experience}}}

Based on this, generate:
1.  A detailed job description covering responsibilities and what the candidate will do.
2.  A list of key skills, qualifications, and requirements for the role.

The output should be clean, professional, and formatted for a job posting.
`,
});

const generateJobDescriptionFlow = ai.defineFlow(
  {
    name: 'generateJobDescriptionFlow',
    inputSchema: GenerateJobDescriptionInputSchema,
    outputSchema: GenerateJobDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

    