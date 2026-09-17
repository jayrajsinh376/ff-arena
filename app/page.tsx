"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const tournaments = [
    { id: 1, title: "Solo Match", time: "Today 8 PM", prize: "100 Coins", slots: "45/50", mode: "Solo" },
    { id: 2, title: "Duo Match", time: "Today 9 PM", prize: "200 Coins", slots: "30/50", mode: "Duo" },
    { id: 3, title: "Squad Match", time: "Tomorrow 7 PM", prize: "500 Coins", slots: "40/50", mode: "Squad" },
    { id: 4, title: "Solo Clash", time: "Tomorrow 8 PM", prize: "150 Coins", slots: "20/50", mode: "Solo" },
  ];

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
        position: 'relative'
      }}>
        <h1 style={{ color: '#ff6b00', fontSize: '22px', margin: 0 }}>
          🎮 FF Arena
        </h1>

        {loading ? (
          <div style={{ color: '#aaa', fontSize: '14px' }}>...</div>
        ) : user ? (
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                background: '#ff6b00',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt="Profile" 
                  style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                />
              ) : (
                <span>👤</span>
              )}
              {user.displayName?.split(' ')[0] || user.email?.split('@')[0] || 'User'}
            </button>

            {showMenu && (
              <div style={{
                position: 'absolute',
                top: '45px',
                right: 0,
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '8px',
                padding: '8px',
                minWidth: '200px',
                zIndex: 1000,
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)'
              }}>
                <div style={{
                  padding: '10px',
                  borderBottom: '1px solid #333',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>
                    {user.displayName || 'User'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                    {user.email}
                  </div>
                </div>
                
                <Link href="/dashboard" style={{ textDecoration: 'none' }}>
                  <div style={{
                    padding: '10px',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}>
                    👤 Dashboard
                  </div>
                </Link>
                
                <div
                  onClick={handleLogout}
                  style={{
                    padding: '10px',
                    color: '#ff4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '4px'
                  }}
                >
                  🚪 Logout
                </div>
              </div>
            )}
          </div>
        ) : (
          <Link href="/login">
            <button style={{ 
              background: '#ff6b00', 
              color: 'white', 
              border: 'none', 
              padding: '8px 18px', 
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Login
            </button>
          </Link>
        )}
      </header>

      {/* Hero */}
      <div style={{ 
        padding: '50px 20px', 
        textAlign: 'center', 
        background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
      }}>
        <h2 style={{ fontSize: '28px', margin: '0 0 15px 0' }}>
          Free Fire Tournaments
        </h2>
        <p style={{ fontSize: '16px', margin: '0 0 20px 0' }}>
          Khelo FREE, Jeeto Rewards 🏆
        </p>
        <div style={{ 
          display: 'inline-block', 
          background: 'rgba(0,0,0,0.3)', 
          padding: '10px 20px', 
          borderRadius: '25px',
          fontSize: '14px'
        }}>
          🎁 100% Free Entry
        </div>
      </div>

      {/* Stats */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-around', 
        padding: '20px',
        background: '#1a1a1a',
        margin: '20px',
        borderRadius: '12px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#ff6b00', fontWeight: 'bold' }}>5K+</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Players</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#ff6b00', fontWeight: 'bold' }}>500+</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Matches</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', color: '#ff6b00', fontWeight: 'bold' }}>₹50K</div>
          <div style={{ fontSize: '12px', color: '#aaa' }}>Rewards</div>
        </div>
      </div>

      {/* Tournaments */}
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '22px', marginBottom: '15px' }}>
          🔥 Live Tournaments
        </h3>
        
        {tournaments.map((t) => (
          <div key={t.id} style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '18px',
            marginBottom: '15px',
            border: '1px solid #333',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, color: 'white', fontSize: '18px' }}>{t.title}</h4>
              <span style={{ 
                color: '#00ff88', 
                fontSize: '12px', 
                background: 'rgba(0, 255, 136, 0.1)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                FREE
              </span>
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '15px' }}>
              <span style={{ color: '#aaa', fontSize: '13px' }}>⏰ {t.time}</span>
              <span style={{ color: '#aaa', fontSize: '13px' }}>🏆 {t.prize}</span>
              <span style={{ color: '#aaa', fontSize: '13px' }}>👥 {t.slots}</span>
              <span style={{ color: '#aaa', fontSize: '13px' }}>🎮 {t.mode}</span>
            </div>
            
            <Link href={user ? "/dashboard" : "/login"}>
              <button style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                {user ? 'Join Free →' : 'Login to Join →'}
              </button>
            </Link>
          </div>
        ))}
      </div>

      {/* How It Works */}
      <div style={{ padding: '20px', background: '#1a1a1a', margin: '20px', borderRadius: '12px' }}>
        <h3 style={{ color: '#ff6b00', marginTop: 0 }}>📖 How It Works</h3>
        <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.8' }}>
          <p>1️⃣ Register karo FREE me</p>
          <p>2️⃣ Tournament join karo</p>
          <p>3️⃣ Room ID/Password milega</p>
          <p>4️⃣ Match khelo aur jeeto</p>
          <p>5️⃣ Coins earn karo</p>
          <p>6️⃣ Rewards redeem karo</p>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2026 FF Arena | Fan-made platform</p>
        <p style={{ margin: '5px 0' }}>Not affiliated with Garena</p>
      </div>
    </div>
  );
}
