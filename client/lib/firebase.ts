// Firebase configuration for real-time syncing
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase config - Replace with your actual Firebase project config
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "dorman-family-journal.firebaseapp.com",
  projectId: "dorman-family-journal",
  storageBucket: "dorman-family-journal.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id-here"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

// For development, you can use the emulator
if (process.env.NODE_ENV === 'development' && !process.env.VITE_USE_FIREBASE_PROD) {
  try {
    connectFirestoreEmulator(db, 'localhost', 8080);
  } catch (error) {
    // Emulator already connected
  }
}

export default app;
