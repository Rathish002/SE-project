// Firebase configuration and initialization
// This file sets up Firebase Authentication and Firestore using the modular SDK
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Values are loaded from environment variables for security
// Note: Firebase API keys are safe to expose in client-side code, but using
// environment variables makes it easier to manage different environments
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyDCdnY6dl65ajLQjY9XiVy2V9z0jHDsZtA",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "se-01-18cc8.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "se-01-18cc8",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "se-01-18cc8.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "698206432143",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:698206432143:web:762b399aaf23fa584bb9fa",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-C23HP9D8GH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider();

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Export the app instance in case it's needed elsewhere
export default app;
