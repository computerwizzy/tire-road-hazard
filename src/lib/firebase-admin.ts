
import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

if (!serviceAccountKey) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set. Please follow the setup instructions.');
}

let decodedServiceAccount: admin.ServiceAccount;
try {
    decodedServiceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));
} catch (error) {
    throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY_BASE64. Make sure it is a valid Base64 encoded JSON.');
}

let db: admin.firestore.Firestore;

function initializeDb() {
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(decodedServiceAccount),
    });
  }
  db = admin.firestore();
}

export function getDb(): admin.firestore.Firestore {
    if (!db) {
        initializeDb();
    }
    return db;
}
