import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
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
  arrayUnion,
  increment
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
export const storage = getStorage(app);

// ==================== HELPER: Generate Referral Code ====================
const generateReferralCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = 'FF';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// ==================== USER: Save/Update with Referral ====================
export const saveUserToFirestore = async (user, referralCode = null) => {
  if (!user) return;
  
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  
  // Agar user already exist karta hai, toh sirf referralCode check karo
  if (userSnap.exists()) {
    const existingData = userSnap.data();
    
    // Agar referralCode missing hai (purana user), toh generate karo
    if (!existingData.referralCode) {
      const newCode = generateReferralCode();
      await updateDoc(userRef, {
        referralCode: newCode,
        referredBy: existingData.referredBy || null,
        referralRewarded: existingData.referralRewarded || false
      });
      console.log('✅ Referral code generated for existing user:', newCode);
    }
    return;
  }

  // Naya user hai — referral code generate karo
  const newReferralCode = generateReferralCode();
  let welcomeCoins = 0;
  let referredBy = null;
  let referrerId = null;

  // Agar referral code diya gaya hai, toh verify karo
  if (referralCode && referralCode.trim()) {
    try {
      const cleanCode = referralCode.trim().toUpperCase();
      
      // Referrer ko dhundho jiska referralCode match kare
      const referrerQuery = query(
        collection(db, 'users'),
        where('referralCode', '==', cleanCode)
      );
      const referrerSnapshot = await getDocs(referrerQuery);

      if (!referrerSnapshot.empty) {
        const referrerDoc = referrerSnapshot.docs[0];
        referrerId = referrerDoc.id;
        referredBy = cleanCode;
        welcomeCoins = 50; // Naye user ko 50 coins

        // Referral record banao (pending status)
        await addDoc(collection(db, 'referrals'), {
          referrerId: referrerId,
          referrerCode: cleanCode,
          referredUserId: user.uid,
          referredUserEmail: user.email,
          status: 'pending',
          referrerReward: 100,
          referredReward: 50,
          createdAt: serverTimestamp(),
          completedAt: null
        });

        console.log('✅ Referral record created (pending)');
      } else {
        console.log('⚠️ Invalid referral code:', cleanCode);
      }
    } catch (err) {
      console.error('Referral error:', err);
    }
  }

  // User document banao
  await setDoc(userRef, {
    name: user.displayName || 'User',
    email: user.email,
    photo: user.photoURL || '',
    coins: welcomeCoins,
    tournamentsPlayed: 0,
    totalKills: 0,
    referralCode: newReferralCode,
    referredBy: referredBy,
    referralRewarded: false,
    joinedAt: serverTimestamp()
  });
};

// ==================== USER: Get Data (with auto referral code for old users) ====================
export const getUserData = async (userId) => {
  const userRef = doc(db, 'users', userId);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) {
    return null;
  }

  const userData = userSnap.data();

  // Agar user ke paas referralCode nahi hai (purana user), toh generate karo
  if (!userData.referralCode) {
    const newCode = generateReferralCode();
    
    try {
      await updateDoc(userRef, {
        referralCode: newCode,
        referredBy: userData.referredBy || null,
        referralRewarded: userData.referralRewarded || false
      });
      console.log('✅ Referral code auto-generated for existing user:', newCode);
    } catch (err) {
      console.error('Error generating referral code:', err);
    }

    return {
      ...userData,
      referralCode: newCode,
      referredBy: userData.referredBy || null,
      referralRewarded: userData.referralRewarded || false
    };
  }

  return userData;
};

// ==================== REFERRAL: Get User's Referrals ====================
export const getUserReferrals = async (userId) => {
  try {
    const q = query(
      collection(db, 'referrals'),
      where('referrerId', '==', userId)
    );
    const snapshot = await getDocs(q);
    const referrals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return referrals;
  } catch (error) {
    console.error('Error getting referrals:', error);
    return [];
  }
};

// ==================== REFERRAL: Complete Referral (called on tournament join) ====================
const completeReferral = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    
    const userData = userSnap.data();
    
    if (userData.referralRewarded === true) return;
    if (!userData.referredBy) return;

    const q = query(
      collection(db, 'referrals'),
      where('referredUserId', '==', userId),
      where('status', '==', 'pending')
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return;

    for (const referralDoc of snapshot.docs) {
      const referralData = referralDoc.data();
      
      const referrerRef = doc(db, 'users', referralData.referrerId);
      await updateDoc(referrerRef, {
        coins: increment(100)
      });

      await updateDoc(doc(db, 'referrals', referralDoc.id), {
        status: 'completed',
        completedAt: serverTimestamp()
      });
    }

    await updateDoc(userRef, {
      referralRewarded: true
    });

    console.log('✅ Referral completed! Referrer got 100 coins.');
  } catch (error) {
    console.error('Error completing referral:', error);
  }
};

// ==================== TOURNAMENT: Create ====================
export const createTournament = async (data) => {
  const docRef = await addDoc(collection(db, 'tournaments'), {
    ...data,
    joined: 0,
    status: 'active',
    createdAt: serverTimestamp()
  });
  return docRef.id;
};

// ==================== TOURNAMENT: Get All ====================
export const getAllTournaments = async () => {
  const querySnapshot = await getDocs(collection(db, 'tournaments'));
  const tournaments = [];
  querySnapshot.forEach((doc) => {
    tournaments.push({ id: doc.id, ...doc.data() });
  });
  return tournaments;
};

// ==================== TOURNAMENT: Join (with Referral Completion) ====================
export const joinTournament = async (tournamentId, user) => {
  if (!user) throw new Error('Login required');
  
  const participantRef = doc(db, 'tournaments', tournamentId, 'participants', user.uid);
  const participantSnap = await getDoc(participantRef);
  
  if (participantSnap.exists()) {
    throw new Error('Aap pehle se join kar chuke ho!');
  }
  
  await setDoc(participantRef, {
    name: user.displayName || 'User',
    email: user.email,
    photo: user.photoURL || '',
    joinedAt: serverTimestamp(),
    status: 'joined'
  });
  
  const tournamentRef = doc(db, 'tournaments', tournamentId);
  const tournamentSnap = await getDoc(tournamentRef);
  if (tournamentSnap.exists()) {
    await updateDoc(tournamentRef, {
      joined: increment(1)
    });
  }
  
  const userRef = doc(db, 'users', user.uid);
  await updateDoc(userRef, {
    tournamentsPlayed: increment(1)
  });

  await completeReferral(user.uid);
};

// ==================== TOURNAMENT: Check User Joined ====================
export const hasUserJoined = async (tournamentId, userId) => {
  const participantRef = doc(db, 'tournaments', tournamentId, 'participants', userId);
  const participantSnap = await getDoc(participantRef);
  return participantSnap.exists();
};

// ==================== TOURNAMENT: Get User's Joined ====================
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

// ==================== ADMIN: Declare Winner ====================
export const declareWinner = async (tournamentId, winnerId, prizeCoins) => {
  try {
    const userRef = doc(db, 'users', winnerId);
    await updateDoc(userRef, {
      coins: increment(prizeCoins),
      wins: increment(1)
    });

    const tournamentRef = doc(db, 'tournaments', tournamentId);
    await updateDoc(tournamentRef, {
      winnerId: winnerId,
      status: 'completed',
      completedAt: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error declaring winner:', error);
    return { success: false, error: error.message };
  }
};
