import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

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

// User data save/update function
export const saveUserToFirestore = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    // Naya user - create karo
    await setDoc(userRef, {
      name: user.displayName || 'User',
      email: user.email,
      photo: user.photoURL || '',
      coins: 0,
      tournamentsPlayed: 0,
      totalKills: 0,
      joinedAt: serverTimestamp()
    });
  }
  // Agar already exists, kuch nahi karo
};

// Get user data
export const getUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data();
  }
  return null;
};
