'use server';
/**
 * @fileOverview An AI agent that generates a full blog post from a title and keywords.
 *
 * - generateBlogPost - A function that handles the blog post generation.
 * - GenerateBlogPostInput - The input type for the function.
 * - GenerateBlogPostOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateBlogPostInputSchema = z.object({
  title: z.string().describe('The title of the blog post.'),
  keywords: z.string().describe('A comma-separated list of keywords or topics to cover in the blog post.'),
});
export type GenerateBlogPostInput = z.infer<typeof GenerateBlogPostInputSchema>;

const GenerateBlogPostOutputSchema = z.object({
  content: z.string().describe('The full content of the blog post, professionally written and formatted in HTML. Use tags like <h3> for subheadings and <p> for paragraphs.'),
});
export type GenerateBlogPostOutput = z.infer<typeof GenerateBlogPostOutputSchema>;

export async function generateBlogPost(input: GenerateBlogPostInput): Promise<GenerateBlogPostOutput> {
  return generateBlogPostFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBlogPostPrompt',
  input: { schema: GenerateBlogPostInputSchema },
  output: { schema: GenerateBlogPostOutputSchema },
  prompt: `You are an expert content writer for "Hiring Dekho", an Indian job portal. Your task is to write a complete, engaging, and SEO-friendly blog post based on the provided title and keywords.

The tone should be professional, encouraging, and helpful for Indian job seekers and professionals.
The output must be a single string of HTML content. Use <h3> for subheadings and <p> for paragraphs.

Blog Post Title: {{{title}}}
Keywords to cover: {{{keywords}}}

Write a comprehensive blog post now. Ensure the HTML is well-structured and ready to be published.
`,
});

const generateBlogPostFlow = ai.defineFlow(
  {
    name: 'generateBlogPostFlow',
    inputSchema: GenerateBlogPostInputSchema,
    outputSchema: GenerateBlogPostOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
