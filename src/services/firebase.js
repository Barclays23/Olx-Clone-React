import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore"; // if using Firestore
import { getAuth } from "firebase/auth"; // if using Authentication
import { getStorage } from "firebase/storage"; // if using Storage



const firebaseConfig = {
  apiKey: "AIzaSyCasEtIDodGXeluwnhFoIR8FSchMc_PfBs",
  authDomain: "olx-clone-23.firebaseapp.com",
  projectId: "olx-clone-23",
  storageBucket: "olx-clone-23.firebasestorage.app",
  // storageBucket: "olx-clone-23.appspot.com", // fixed typo here!
  messagingSenderId: "157970605739",
  appId: "1:157970605739:web:5d8089c33a49113decf9ee"
};

// gsutil cors set cors.json gs://olx-clone-23.appspot.com



// Initialize Firebase
const app = initializeApp(firebaseConfig);


// Export services to use in other parts of the app
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };








