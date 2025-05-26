import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // if using Firestore
import { getAuth } from "firebase/auth"; // if using Authentication
import { getStorage } from "firebase/storage"; // if using Storage


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// gsutil cors set cors.json gs://olx-clone-23.appspot.com



// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Export services to use in other parts of the app
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };








