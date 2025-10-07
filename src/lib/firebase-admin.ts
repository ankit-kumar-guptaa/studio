// src/lib/firebase-admin.ts
import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined;
let db: Firestore | undefined;

try {
  if (getApps().length === 0) {
    // When deployed to App Hosting, initializeApp() will automatically
    // detect the service account credentials.
    app = initializeApp();
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
