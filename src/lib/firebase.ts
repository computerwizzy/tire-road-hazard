
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

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
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
