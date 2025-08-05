
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "tiresafe",
  appId: "1:709228917008:web:2e583a3e30904fc942b595",
  storageBucket: "tiresafe.firebasestorage.app",
  apiKey: "AIzaSyCzuGa-CwhbN2E8RktVaBs1wom9D6FnDkY",
  authDomain: "tiresafe.firebaseapp.com",
  messagingSenderId: "709228917008",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

// For local development, you might want to connect to the Firestore emulator
// if (process.env.NODE_ENV === 'development') {
//   try {
//       connectFirestoreEmulator(db, 'localhost', 8080);
//       console.log("Connected to Firestore emulator");
//   } catch(e) {
//       // The emulator may already be connected
//   }
// }

export { app, db };
