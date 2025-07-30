// Firebase configuration for real-time syncing
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase config for Dorman Family Journal
const firebaseConfig = {
  apiKey: "AIzaSyBCUARP7YTQCtBXuuxdlZNLXcpMeRdKJos",
  authDomain: "dorman-family-journal.firebaseapp.com",
  projectId: "dorman-family-journal",
  storageBucket: "dorman-family-journal.firebasestorage.app",
  messagingSenderId: "611950868427",
  appId: "1:611950868427:web:69aee3c1f8daf93d942e6e",
  measurementId: "G-C15MOKAYP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// Use production Firebase - emulator disabled for browser compatibility

export default app;
