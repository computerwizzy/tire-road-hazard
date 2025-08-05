
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs/promises';
import path from 'path';

// IMPORTANT: REPLACE WITH YOUR ACTUAL FIREBASE CONFIG
const firebaseConfig = {
  projectId: "tiresafe",
  appId: "1:709228917008:web:2e583a3e30904fc942b595",
  storageBucket: "tiresafe.firebasestorage.app",
  apiKey: "AIzaSyCzuGa-CwhbN2E8RktVaBs1wom9D6FnDkY",
  authDomain: "tiresafe.firebaseapp.com",
  messagingSenderId: "709228917008",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const dbPath = path.resolve(process.cwd(), 'src/data/db.json');

async function migrate() {
  console.log('Starting data migration to Firestore...');

  try {
    // Read the local JSON DB file
    const data = await fs.readFile(dbPath, 'utf-8');
    const localDb = JSON.parse(data);

    // Prepare data for Firestore
    const vehicleData = {
      makes: localDb.vehicleMakes || [],
      models: localDb.vehicleModels || {},
    };

    const tireData = {
      brands: localDb.tireBrands || [],
      sizes: localDb.commonTireSizes || [],
    };
    
    const policies = localDb.policies || [];

    // Write to Firestore
    console.log('Writing vehicle data...');
    await setDoc(doc(db, 'appData', 'vehicles'), vehicleData);

    console.log('Writing tire data...');
    await setDoc(doc(db, 'appData', 'tires'), tireData);

    console.log('Writing policies...');
    for (const policy of policies) {
        if (policy.policyNumber) {
            await setDoc(doc(db, "policies", policy.policyNumber), policy);
        }
    }

    console.log('---');
    console.log('Migration completed successfully!');
    console.log('Please ensure you have created the required Firestore security rules.');

  } catch (error) {
    console.error('Error during migration:', error);
  }
}

migrate().then(() => {
    process.exit(0);
}).catch(() => {
    process.exit(1);
});
