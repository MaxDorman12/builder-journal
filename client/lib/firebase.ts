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

// For development, you can use the emulator
if (
  process.env.NODE_ENV === "development" &&
  !process.env.VITE_USE_FIREBASE_PROD
) {
  try {
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (error) {
    // Emulator already connected
  }
}

export default app;
