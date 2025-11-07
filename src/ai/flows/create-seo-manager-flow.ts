'use server';
/**
 * @fileOverview A Genkit flow to securely create a new SEO Manager.
 * This flow runs on the server and is not subject to client-side Firestore security rules.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { adminDb } from '@/lib/firebase-admin';
import { v4 as uuidv4 } from 'uuid';

const CreateSeoManagerInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

const CreateSeoManagerOutputSchema = z.object({
  id: z.string(),
  email: z.string(),
  success: z.boolean(),
});

export type CreateSeoManagerInput = z.infer<typeof CreateSeoManagerInputSchema>;
export type CreateSeoManagerOutput = z.infer<typeof CreateSeoManagerOutputSchema>;


export async function createSeoManager(input: CreateSeoManagerInput): Promise<CreateSeoManagerOutput> {
  return createSeoManagerFlow(input);
}


const createSeoManagerFlow = ai.defineFlow(
  {
    name: 'createSeoManagerFlow',
    inputSchema: CreateSeoManagerInputSchema,
    outputSchema: CreateSeoManagerOutputSchema,
  },
  async (input) => {
    if (!adminDb) {
      throw new Error('Firestore Admin DB not initialized.');
    }

    try {
      const collectionRef = adminDb.collection('seoManagers');
      const docRef = collectionRef.doc();

      const newManager = {
        id: docRef.id,
        email: input.email,
        password: input.password,
        firstName: input.firstName,
        lastName: input.lastName,
      };

      await docRef.set(newManager);

      return {
        id: newManager.id,
        email: newManager.email,
        success: true,
      };
    } catch (error: any) {
      console.error('Error creating SEO Manager in flow:', error);
      throw new Error(`Failed to create SEO Manager: ${error.message}`);
    }
  }
);
