import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB4_mlVXfdveAXy4uChGlzQEk3NJ5zmCFA",
  authDomain: "ff-arena-81d41.firebaseapp.com",
  projectId: "ff-arena-81d41",
  storageBucket: "ff-arena-81d41.firebasestorage.app",
  messagingSenderId: "179315061350",
  appId: "1:179315061350:web:417a8f86e9f20c37f4b3a7"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
