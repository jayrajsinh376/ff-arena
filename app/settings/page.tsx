'use client';
import { auth, db } from '../firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function Settings() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [upi, setUpi] = useState('');

  const handleUpdate = async () => {
    const user = auth.currentUser;
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { name, upi });
    alert('Profile update ho gaya!');
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleDelete = async () => {
    if (confirm('Pakka account delete karna hai?')) {
      const user = auth.currentUser;
      if (user) {
        await deleteUser(user);
        router.push('/login');
      }
    }
  };

  return (
    <div className="p-6 space-y-4 max-w-md">
      <h1 className="text-2xl font-bold">Settings</h1>
      
      <input 
        placeholder="Naam" 
        value={name} 
        onChange={(e) => setName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <input 
        placeholder="UPI ID" 
        value={upi} 
        onChange={(e) => setUpi(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button onClick={handleUpdate} className="bg-green-500 text-white px-4 py-2 rounded w-full">
        Update Profile
      </button>
      
      <hr className="my-4" />
      
      <button onClick={handleLogout} className="bg-yellow-500 text-white px-4 py-2 rounded w-full">
        Logout
      </button>
      <button onClick={handleDelete} className="bg-red-500 text-white px-4 py-2 rounded w-full">
        Delete Account
      </button>
    </div>
  );
}
