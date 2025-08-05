
import * as admin from 'firebase-admin';

// This is a robust way to initialize Firebase Admin SDK in a serverless environment.
// It checks if an app is already initialized to prevent errors.

let db: admin.firestore.Firestore;

function getDb() {
    if (db) {
        return db;
    }

    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!serviceAccountBase64) {
        throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 environment variable is not set.');
    }
    if (!storageBucket) {
        throw new Error('FIREBASE_STORAGE_BUCKET environment variable is not set.');
    }

    const decodedServiceAccount = JSON.parse(Buffer.from(serviceAccountBase64, 'base64').toString('utf8'));

    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(decodedServiceAccount),
            storageBucket: storageBucket,
        });
    }

    db = admin.firestore();
    return db;
}

// Initialize and export the db instance.
// The getDb function ensures that it's initialized only once.
db = getDb();

export { getDb, db };
