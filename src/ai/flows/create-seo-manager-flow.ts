'use server';
/**
 * @fileOverview A Genkit flow to securely create an SEO Manager from the admin panel.
 *
 * - createSeoManager - A function that takes manager data and creates a document in Firestore.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase-admin';

// Define the schema for the input data, matching the form
const SeoManagerInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('A valid email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type SeoManagerInput = z.infer<typeof SeoManagerInputSchema>;

// Define the output schema
const SeoManagerOutputSchema = z.object({
  success: z.boolean(),
  id: z.string(),
  message: z.string(),
});

// Export a wrapper function to be called from the client
export async function createSeoManager(data: SeoManagerInput): Promise<z.infer<typeof SeoManagerOutputSchema>> {
  return createSeoManagerFlow(data);
}

// Define the Genkit flow
const createSeoManagerFlow = ai.defineFlow(
  {
    name: 'createSeoManagerFlow',
    inputSchema: SeoManagerInputSchema,
    outputSchema: SeoManagerOutputSchema,
  },
  async (data) => {
    if (!adminDb) {
      throw new Error('Firestore Admin DB not initialized. Cannot create SEO Manager.');
    }
    
    const newId = uuidv4();
    const managerData = {
      id: newId,
      ...data,
    };

    try {
      // Use the admin SDK to write directly to the database, bypassing security rules
      const managerRef = adminDb.collection('seoManagers').doc(newId);
      await managerRef.set(managerData);

      return {
        success: true,
        id: newId,
        message: 'SEO Manager created successfully.',
      };
    } catch (error: any) {
      console.error('Error creating SEO Manager in flow:', error);
      // We are not re-throwing, but returning a failure state.
      // In a real app, you might want more detailed error handling.
      return {
        success: false,
        id: '',
        message: error.message || 'An unknown error occurred while creating the manager.',
      };
    }
  }
);
