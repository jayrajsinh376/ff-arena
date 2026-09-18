'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db, getUserData } from '../firebase';
import { signOut, deleteUser } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';

export default function Settings() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [name, setName] = useState('');
  const [upi, setUpi] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const data = await getUserData(currentUser.uid);
        setUserData(data);
        setName(data?.name || currentUser.displayName || '');
        setUpi(data?.upi || '');
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleUpdate = async () => {
    if (!user) return;
    setSaving(true);
    setMessage('');
    try {
      await updateDoc(doc(db, 'users', user.uid), { name, upi });
      setMessage('✅ Profile update ho gaya!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      setMessage('❌ Error: ' + error.message);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleDelete = async () => {
    if (confirm('Pakka account delete karna hai? Ye undo nahi hoga!')) {
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          await deleteUser(currentUser);
          router.push('/login');
        } catch (error: any) {
          alert('Error: ' + error.message + '\n\nAapko dobara login karna padega.');
        }
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <p style={{ color: '#ff6b00', fontSize: '18px' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        background: '#1a1a1a',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '2px solid #ff6b00',
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#ff6b00', fontSize: '22px', margin: 0 }}>
            🎮 FF Arena
          </h1>
        </Link>
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#333',
            color: 'white',
            border: '1px solid #555',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            ← Dashboard
          </button>
        </Link>
      </header>

      {/* Title */}
      <div style={{ padding: '25px 20px 15px' }}>
        <h2 style={{ color: '#ff6b00', margin: 0, fontSize: '24px' }}>
          ⚙️ Settings
        </h2>
        <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '13px' }}>
          Apni profile manage karein
        </p>
      </div>

      {/* Message */}
      {message && (
        <div style={{
          margin: '0 20px 15px',
          background: message.includes('✅') ? '#00ff88' : '#ff4444',
          color: message.includes('✅') ? '#000' : 'white',
          padding: '12px 20px',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}

      {/* Profile Info Card */}
      <div style={{ padding: '0 20px 15px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '3px solid white'
              }}
            />
          ) : (
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '28px'
            }}>
              👤
            </div>
          )}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
              {userData?.name || user?.displayName || 'User'}
            </h3>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '12px',
              opacity: 0.9,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {user?.email}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px', opacity: 0.9 }}>
              🪙 {userData?.coins || 0} coins
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div style={{ padding: '0 20px 15px' }}>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#ff6b00', margin: '0 0 15px 0', fontSize: '16px' }}>
            📝 Edit Profile
          </h3>

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#aaa',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Naam
            </label>
            <input
              type="text"
              placeholder="Apna naam likhein"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#aaa',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              UPI ID (Rewards ke liye)
            </label>
            <input
              type="text"
              placeholder="yourname@upi"
              value={upi}
              onChange={(e) => setUpi(e.target.value)}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            onClick={handleUpdate}
            disabled={saving}
            style={{
              width: '100%',
              background: saving ? '#666' : 'linear-gradient(135deg, #00ff88, #00cc66)',
              color: '#000',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: saving ? 'not-allowed' : 'pointer'
            }}
          >
            {saving ? '💾 Saving...' : '💾 Update Profile'}
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div style={{ padding: '0 20px 30px' }}>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <h3 style={{ color: '#ff6b00', margin: '0 0 15px 0', fontSize: '16px' }}>
            🔐 Account Actions
          </h3>

          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              background: '#ffc800',
              color: '#000',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            🚪 Logout
          </button>

          <button
            onClick={handleDelete}
            style={{
              width: '100%',
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🗑️ Delete Account
          </button>

          <p style={{
            color: '#666',
            fontSize: '11px',
            margin: '12px 0 0 0',
            textAlign: 'center'
          }}>
            ⚠️ Delete karne par aapka saara data hamesha ke liye hat jayega
          </p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2026 FF Arena</p>
      </div>
    </div>
  );
}
