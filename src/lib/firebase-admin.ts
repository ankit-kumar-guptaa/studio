// src/lib/firebase-admin.ts
import { initializeApp, getApps, App, ServiceAccount, cert } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';


// IMPORTANT: This service account key is for demonstration purposes in a secure environment.
// In a real production app, you MUST use environment variables or a secret manager
// to handle these credentials securely. Do not commit keys to your repository.
const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : undefined;

let app: App | undefined;
let db: Firestore | undefined;

try {
  if (getApps().length === 0) {
    if (serviceAccount) {
      app = initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      // Fallback for environments where service account is auto-detected (like some Google Cloud environments)
      app = initializeApp();
    }
  } else {
    app = getApps()[0];
  }

  if (app) {
    db = getFirestore(app);
  } else {
    throw new Error('Firebase Admin App could not be initialized.');
  }

} catch (error: any) {
  console.error(`Firebase Admin SDK initialization failed: ${error.message}`);
  // db remains undefined, components using it should handle this gracefully.
}

export { db as adminDb };
