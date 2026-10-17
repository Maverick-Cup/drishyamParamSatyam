import { getApps, getApp, initializeApp, cert, applicationDefault } from 'firebase-admin/app';
import type { App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import type { Firestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import type { Storage } from 'firebase-admin/storage';


let isInitialized = false;

export function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0]!;
  }

  // Check if we have credentials or are running in GCP environment
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  try {
    if (clientEmail && privateKey && projectId) {
      // Explicit service account credentials (local testing with env vars)
      const app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.GCS_BUCKET_NAME || `${projectId}.appspot.com`,
      });
      isInitialized = true;
      return app;
    } else if (projectId || process.env.K_SERVICE || process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // In Google Cloud Run or Firebase App Hosting, Application Default Credentials (ADC) is used automatically
      const app = initializeApp({
        credential: applicationDefault(),
        projectId: projectId || undefined,
        storageBucket: process.env.GCS_BUCKET_NAME,
      });
      isInitialized = true;
      return app;
    }
  } catch (err) {
    console.warn('[FirebaseAdmin] Failed to initialize Firebase Admin SDK, falling back to local storage:', err);
    return null;
  }

  return null;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseAdminApp() !== null;
}

export function getFirestoreDb(): Firestore | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  return getFirestore(app);
}

export function getStorageBucket(): ReturnType<Storage['bucket']> | null {
  const app = getFirebaseAdminApp();
  if (!app) return null;
  const storage = getStorage(app);
  const bucketName = process.env.GCS_BUCKET_NAME;
  return bucketName ? storage.bucket(bucketName) : storage.bucket();
}
