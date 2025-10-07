
// src/lib/firebase-admin.ts
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { config } from 'dotenv';

config(); // Load environment variables from .env file

// IMPORTANT: Do not expose this to the client-side.
// This is a server-side only file.
const serviceAccount = {
  project_id: process.env.FIREBASE_PROJECT_ID,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

let app: App;

// Check if all required service account properties are available
if (serviceAccount.project_id && serviceAccount.client_email && serviceAccount.private_key) {
    if (getApps().length === 0) {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      app = getApps()[0];
    }
} else {
    console.error('Firebase Admin SDK initialization failed: Service account environment variables are not set.');
    // You might want to throw an error here or handle it gracefully
    // For now, we'll let it fail when getFirestore is called on an undefined app
}


const db = getFirestore(app!);

export { db as adminDb };
