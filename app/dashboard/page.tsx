"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, getUserData, getUserTournaments } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [myTournaments, setMyTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const data = await getUserData(currentUser.uid);
        setUserData(data);
        
        // User ke joined tournaments laao
        const tournaments = await getUserTournaments(currentUser.uid);
        setMyTournaments(tournaments);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error(err);
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

  if (!user) return null;

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
        <button
          onClick={handleLogout}
          style={{
            background: '#ff4444',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>

      {/* Welcome Card */}
      <div style={{ padding: '30px 20px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
          borderRadius: '16px',
          padding: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '15px'
        }}>
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ 
                width: '70px', 
                height: '70px', 
                borderRadius: '50%',
                border: '3px solid white'
              }}
            />
          ) : (
            <div style={{
              width: '70px',
              height: '70px',
              borderRadius: '50%',
              background: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '30px'
            }}>
              👤
            </div>
          )}
          <div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>Welcome back,</p>
            <h2 style={{ margin: '5px 0 0 0', fontSize: '20px' }}>
              {userData?.name || user.displayName || 'User'}
            </h2>
            <p style={{ margin: '3px 0 0 0', fontSize: '12px', opacity: 0.8 }}>
              {user.email}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ 
        padding: '0 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '15px'
      }}>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>🪙</div>
          <div style={{ fontSize: '22px', color: '#ff6b00', fontWeight: 'bold' }}>
            {userData?.coins || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>Coins</div>
        </div>

        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>🏆</div>
          <div style={{ fontSize: '22px', color: '#ff6b00', fontWeight: 'bold' }}>
            {myTournaments.length}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>Tournaments</div>
        </div>

        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>💀</div>
          <div style={{ fontSize: '22px', color: '#ff6b00', fontWeight: 'bold' }}>
            {userData?.totalKills || 0}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>Total Kills</div>
        </div>

        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '5px' }}>📊</div>
          <div style={{ fontSize: '22px', color: '#ff6b00', fontWeight: 'bold' }}>
            #{userData?.rank || '-'}
          </div>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '5px' }}>Rank</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '20px', marginBottom: '15px' }}>
          ⚡ Quick Actions
        </h3>
        
        <div style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '15px',
          border: '1px solid #333'
        }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <div style={{
              padding: '15px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid #333',
              cursor: 'pointer'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '22px' }}>🎮</span>
                <span style={{ color: 'white', fontSize: '15px' }}>Join Tournament</span>
              </div>
              <span style={{ color: '#ff6b00' }}>→</span>
            </div>
          </Link>

          <div style={{
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #333',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>📊</span>
              <span style={{ color: 'white', fontSize: '15px' }}>Leaderboard</span>
            </div>
            <span style={{ color: '#666', fontSize: '12px' }}>Coming soon</span>
          </div>

          <div style={{
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            cursor: 'pointer'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '22px' }}>👥</span>
              <span style={{ color: 'white', fontSize: '15px' }}>Refer & Earn</span>
            </div>
            <span style={{ color: '#666', fontSize: '12px' }}>Coming soon</span>
          </div>
        </div>
      </div>

      {/* My Tournaments */}
      <div style={{ padding: '0 20px 20px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '20px', marginBottom: '15px' }}>
          🏆 My Tournaments ({myTournaments.length})
        </h3>
        
        {myTournaments.length === 0 ? (
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🎯</div>
            <p style={{ color: '#aaa', margin: '0 0 15px 0', fontSize: '14px' }}>
              Aapne abhi koi tournament join nahi kiya
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '8px',
                fontSize: '15px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                Browse Tournaments →
              </button>
            </Link>
          </div>
        ) : (
          myTournaments.map((t: any) => (
            <div key={t.id} style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '15px',
              border: '1px solid #333',
              borderLeft: '4px solid #00ff88'
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
                  JOINED ✅
                </span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ color: '#aaa', fontSize: '13px' }}>⏰ {t.time}</span>
                <span style={{ color: '#aaa', fontSize: '13px' }}>🏆 {t.prize}</span>
                <span style={{ color: '#aaa', fontSize: '13px' }}>🎮 {t.mode}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2026 FF Arena | Fan-made platform</p>
        <p style={{ margin: '5px 0' }}>Not affiliated with Garena</p>
      </div>
    </div>
  );
}
