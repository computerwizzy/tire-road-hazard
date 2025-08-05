
import * as admin from 'firebase-admin';

const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;

if (!serviceAccountKey) {
  throw new Error('The FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set. Please follow the setup instructions.');
}

const decodedServiceAccount = JSON.parse(Buffer.from(serviceAccountKey, 'base64').toString('utf-8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(decodedServiceAccount),
    projectId: decodedServiceAccount.project_id,
  });
}

const db = admin.firestore();
export { db, admin };
