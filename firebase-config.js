// Firebase Configuration
// Required APIs to enable in Google Cloud Console (APIs & Services > Library):
// 1. Firebase Management API (firebase.googleapis.com)
// 2. Identity Toolkit API (identitytoolkit.googleapis.com) - for Authentication
// 3. Token Service API (securetoken.googleapis.com) - for Authentication
// 4. Cloud Firestore API (firestore.googleapis.com)
// 5. Firebase Realtime Database API (firebasedatabase.googleapis.com)
// 6. Cloud Storage for Firebase API (firebasestorage.googleapis.com)

// If you still don't see the API key:
// 1. Go to Firebase Console > Project Settings
// 2. Under "General" tab, scroll to "Your apps" section
// 3. If you don't see a Web app (</>), click the web icon to register one
// 4. After registration, you'll get the full config object
// 5. The API key will be included in that config

// To get your Firebase configuration:
// 1. Go to Firebase Console (https://console.firebase.google.com)
// 2. Select project "greenfarm-filtration"
// 3. Click the web icon </> (Add Web App) if not already done
// 4. Register app with name "GreenFarm Web App"
// 5. Copy the firebaseConfig object provided

// SECURITY NOTES:
// 1. This API key is safe to use in client-side code when used ONLY with Firebase services
// 2. Access to your database and storage is protected by Firebase Security Rules
// 3. Additional security is provided by Firebase App Check

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBgDqXmHJ6nGG_wP3wqay3dH_Da7QnqRAg",
    authDomain: "greenfarm-filtration.firebaseapp.com",
    databaseURL: "https://greenfarm-filtration-default-rtdb.firebaseio.com",
    projectId: "greenfarm-filtration",
    storageBucket: "greenfarm-filtration.firebasestorage.app",
    messagingSenderId: "576448170070",
    appId: "1:576448170070:web:badfa5ea6a0fa9522b53f7",
    measurementId: "G-7XQ2CSPMDS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const firestore = getFirestore(app);
const realTimeDb = getDatabase(app);
const analytics = getAnalytics(app);
const storage = getStorage(app);

// Enable offline persistence for Firestore (optional)
enableIndexedDbPersistence(firestore)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support persistence.');
    }
  });

// Enable offline persistence for Realtime Database
realTimeDb.goOnline();
realTimeDb.setPersistenceEnabled(true);

// Export initialized services
export { app, auth, firestore, realTimeDb, analytics, storage }; 