'use server';
/**
 * @fileOverview A secure, server-side flow for creating users and assigning roles.
 * This flow uses the Firebase Admin SDK, bypassing client-side security rules.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { adminDb } from '@/lib/firebase-admin';

const CreateUserInputSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(['admin', 'seo-manager']),
});
export type CreateUserInput = z.infer<typeof CreateUserInputSchema>;

const CreateUserOutputSchema = z.object({
  success: z.boolean(),
  uid: z.string().optional(),
  error: z.string().optional(),
});
export type CreateUserOutput = z.infer<typeof CreateUserOutputSchema>;

export async function createUser(input: CreateUserInput): Promise<CreateUserOutput> {
  return createUserFlow(input);
}

const createUserFlow = ai.defineFlow(
  {
    name: 'createUserFlow',
    inputSchema: CreateUserInputSchema,
    outputSchema: CreateUserOutputSchema,
  },
  async (input) => {
    try {
      const adminAuth = getAuth();
      const db = adminDb;
      if (!db) {
        throw new Error('Firestore Admin DB not initialized');
      }

      // 1. Create the Firebase Auth user
      const userRecord = await adminAuth.createUser({
        email: input.email,
        password: input.password,
        displayName: `${input.firstName} ${input.lastName}`,
      });

      const uid = userRecord.uid;

      // 2. Set custom claims based on the role
      const claims: Record<string, boolean> = {};
      if (input.role === 'admin') {
        claims.isSuperAdmin = true;
      }
      if (input.role === 'seo-manager') {
        claims.isSeoManager = true;
      }
      await adminAuth.setCustomUserClaims(uid, claims);

      // 3. If it's an SEO manager, create a corresponding document in Firestore
      if (input.role === 'seo-manager') {
        const seoManagerRef = db.collection('seoManagers').doc(uid);
        await seoManagerRef.set({
          id: uid,
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
        });
      }

      return { success: true, uid };
    } catch (error: any) {
      console.error('Error in createUserFlow:', error);
      // Firebase Admin SDK often provides an error code
      if (error.code === 'auth/email-already-exists') {
        return { success: false, error: 'A user with this email already exists. (EMAIL_EXISTS)' };
      }
      return { success: false, error: error.message || 'An unknown server error occurred.' };
    }
  }
);
