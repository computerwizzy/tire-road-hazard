// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "tiresafe",
  appId: "1:709228917008:web:2e583a3e30904fc942b595",
  storageBucket: "tiresafe.firebasestorage.app",
  apiKey: "AIzaSyCzuGa-CwhbN2E8RktVaBs1wom9D6FnDkY",
  authDomain: "tiresafe.firebaseapp.com",
  messagingSenderId: "709228917008",
};

let app: FirebaseApp;
let db: Firestore;

if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);

export { app, db };
