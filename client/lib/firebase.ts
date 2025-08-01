// Firebase configuration for real-time syncing
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

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

// Track Firebase initialization state
let firebaseInitialized = false;
let app: any = null;
let db: any = null;
let auth: any = null;
let storage: any = null;

// Safe Firebase initialization
async function initializeFirebaseSafely() {
  if (firebaseInitialized) {
    return { app, db, auth, storage };
  }

  try {
    console.log("🔄 Initializing Firebase...");

    // Test basic network connectivity first
    await fetch("https://www.google.com/favicon.ico", {
      mode: "no-cors",
      cache: "no-cache",
    });

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
    storage = getStorage(app);

    firebaseInitialized = true;
    console.log("✅ Firebase initialized successfully");

    return { app, db, auth, storage };
  } catch (error) {
    console.warn("⚠️ Firebase initialization failed - working offline:", error);
    firebaseInitialized = false;

    // Return mock objects to prevent crashes
    return {
      app: null,
      db: null,
      auth: null,
      storage: null,
    };
  }
}

// Initialize on import - but don't crash if it fails
initializeFirebaseSafely().then(
  ({ app: _app, db: _db, auth: _auth, storage: _storage }) => {
    app = _app;
    db = _db;
    auth = _auth;
    storage = _storage;
  },
);

// Export safe getters
export const getDb = () => db;
export const getAuth = () => auth;
export const getStorage = () => storage;

// Export initialized instances (may be null if offline)
export { db, auth, storage };

export default app;
