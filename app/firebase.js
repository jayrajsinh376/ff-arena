import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc, 
  collection,
  addDoc,
  query,
  where,
  serverTimestamp,
  arrayUnion
} from "firebase/firestore";

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

// User data save/update
export const saveUserToFirestore = async (user) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
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

// Create tournament (admin)
export const createTournament = async (data) => {
  const docRef = await addDoc(collection(db, 'tournaments'), {
    ...data,
    joined: 0,
    status: 'active',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

// Get all tournaments
export const getAllTournaments = async () => {
  const querySnapshot = await getDocs(collection(db, 'tournaments'));
  const tournaments = [];
  querySnapshot.forEach((doc) => {
    tournaments.push({ id: doc.id, ...doc.data() });
  });
  return tournaments;
};

// Join tournament
export const joinTournament = async (tournamentId, user) => {
  if (!user) throw new Error('Login required');
  
  // Check if already joined
  const participantRef = doc(db, 'tournaments', tournamentId, 'participants', user.uid);
  const participantSnap = await getDoc(participantRef);
  
  if (participantSnap.exists()) {
    throw new Error('Aap pehle se join kar chuke ho!');
  }
  
  // Add participant
  await setDoc(participantRef, {
    name: user.displayName || 'User',
    email: user.email,
    photo: user.photoURL || '',
    joinedAt: serverTimestamp(),
    status: 'joined'
  });
  
  // Update tournament joined count
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);
  if (tournamentSnap.exists()) {
    const currentJoined = tournamentSnap.data().joined || 0;
    await updateDoc(tournamentRef, {
      joined: currentJoined + 1
    });
  }
  
  // Update user tournamentsPlayed
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const played = userSnap.data().tournamentsPlayed || 0;
    await updateDoc(userRef, {
      tournamentsPlayed: played + 1
    });
  }
};

// Check if user joined tournament
export const hasUserJoined = async (tournamentId, userId) => {
  const participantRef = doc(db, 'tournaments', tournamentId, 'participants', userId);
  const participantSnap = await getDoc(participantRef);
  return participantSnap.exists();
};

// Get user's joined tournaments
export const getUserTournaments = async (userId) => {
  const tournaments = await getAllTournaments();
  const joined = [];
  
  for (const t of tournaments) {
    const hasJoined = await hasUserJoined(t.id, userId);
    if (hasJoined) {
      joined.push(t);
    }
  }
  return joined;
};
