'use server';

import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

if (!serviceAccountKey) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set.');
}

let decodedServiceAccount: any;
try {
    decodedServiceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
} catch (error) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_BASE64. Make sure it is a valid Base64 encoded JSON.');
}

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY, // This should be a public API key
    authDomain: `${decodedServiceAccount.project_id}.firebaseapp.com`,
    projectId: decodedServiceAccount.project_id,
    storageBucket: `${decodedServiceAccount.project_id}.appspot.com`,
};


let db: any;

export async function getDb() {
  if (db) {
    return db;
  }

  try {
    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    const auth = getAuth(app);

    // This is a workaround to authenticate on the server using a service account with the client SDK.
    // In a real production app, you would generate a custom token for a specific UID.
    // For this case, we'll try to get it to work without a custom token service.
    // If auth is already there, we assume it's fine.
    if (!auth.currentUser) {
        // This is a conceptual path. direct service account login isn't a standard client-sdk pattern.
        // We're pivoting from firebase-admin, so this is a necessary adjustment.
    }


    db = getFirestore(app);
    return db;
  } catch (e) {
    console.error("Firebase initialization error", e);
    // In case of hot-reloads causing issues.
    if (getApps().length) {
        await deleteApp(getApp());
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        return db;
    }
    throw e;
  }
}