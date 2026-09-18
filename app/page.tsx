"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, getAllTournaments, joinTournament, hasUserJoined } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// ⚠️ Admin Email
const ADMIN_EMAIL = "jayrajsinhzala488@gmail.com";

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [tournamentsLoading, setTournamentsLoading] = useState(true);
  const [joinMessage, setJoinMessage] = useState("");
  const [joinedIds, setJoinedIds] = useState<string[]>([]);
  const [showRoomModal, setShowRoomModal] = useState<any>(null);
  const [copiedField, setCopiedField] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      
      if (currentUser) {
        const allTournaments = await getAllTournaments();
        const joined: string[] = [];
        for (const t of allTournaments) {
          const hasJoined = await hasUserJoined(t.id, currentUser.uid);
          if (hasJoined) joined.push(t.id);
        }
        setJoinedIds(joined);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    loadTournaments();
  }, []);

  const loadTournaments = async () => {
    try {
      const data = await getAllTournaments();
      setTournaments(data);
    } catch (err) {
      console.error(err);
    }
    setTournamentsLoading(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowMenu(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleJoin = async (tournament: any) => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    try {
      await joinTournament(tournament.id, user);
      setJoinMessage("✅ Successfully joined!");
      setJoinedIds([...joinedIds, tournament.id]);
      loadTournaments();
      
      // Show Room ID/Password modal
      setShowRoomModal(tournament);
      
      setTimeout(() => setJoinMessage(""), 3000);
    } catch (err: any) {
      setJoinMessage("⚠️ " + err.message);
      setTimeout(() => setJoinMessage(""), 3000);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
  };

  const defaultTournaments = [
    { id: 'demo1', title: "Solo Match", time: "Today 8 PM", prize: "100 Coins", slots: "45/50", mode: "Solo", joined: 45, maxSlots: 50 },
    { id: 'demo2', title: "Duo Match", time: "Today 9 PM", prize: "200 Coins", slots: "30/50", mode: "Duo", joined: 30, maxSlots: 50 },
    { id: 'demo3', title: "Squad Match", time: "Tomorrow 7 PM", prize: "500 Coins", slots: "40/50", mode: "Squad", joined: 40, maxSlots: 50 },
    { id: 'demo4', title: "Solo Clash", time: "Tomorrow 8 PM", prize: "150 Coins", slots: "20/50", mode: "Solo", joined: 20, maxSlots: 50 },
  ];

  const displayTournaments = tournaments.length > 0 ? tournaments : defaultTournaments;
  const isAdmin = user?.email === ADMIN_EMAIL;

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
          <div style={{ position: 'relative', display: 'flex', gap: '8px', alignItems: 'center' }}>
            {isAdmin && (
              <Link href="/admin">
                <button style={{
                  background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 14px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  👑 Admin
                </button>
              </Link>
            )}

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
                  <div style={{ padding: '10px', color: 'white', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}>
                    👤 Dashboard
                  </div>
                </Link>

                <Link href="/match-history" style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px', color: 'white', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}>
                    📜 Match History
                  </div>
                </Link>

                <Link href="/upload" style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px', color: 'white', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}>
                    📸 Upload Screenshot
                  </div>
                </Link>

                <Link href="/settings" style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '10px', color: 'white', fontSize: '14px', cursor: 'pointer', borderRadius: '4px' }}>
                    ⚙️ Settings
                  </div>
                </Link>

                {isAdmin && (
                  <Link href="/admin" style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '10px',
                      color: '#ff6b00',
                      fontSize: '14px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      fontWeight: 'bold',
                      borderTop: '1px solid #333',
                      marginTop: '5px'
                    }}>
                      👑 Admin Panel
                    </div>
                  </Link>
                )}
                
                <div
                  onClick={handleLogout}
                  style={{
                    padding: '10px',
                    color: '#ff4444',
                    fontSize: '14px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    borderTop: '1px solid #333',
                    marginTop: '5px'
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

      {/* Join Message */}
      {joinMessage && (
        <div style={{
          background: joinMessage.includes('✅') ? '#00ff88' : '#ff4444',
          color: joinMessage.includes('✅') ? '#000' : 'white',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {joinMessage}
        </div>
      )}

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
        
        {tournamentsLoading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#aaa' }}>
            Loading tournaments...
          </div>
        ) : (
          displayTournaments.map((t: any) => {
            const isJoined = joinedIds.includes(t.id);
            const currentJoined = t.joined || 0;
            const maxSlots = t.maxSlots || 50;
            
            return (
              <div key={t.id} style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '18px',
                marginBottom: '15px',
                border: isJoined ? '2px solid #00ff88' : '1px solid #333',
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
                  <span style={{ color: '#aaa', fontSize: '13px' }}>👥 {currentJoined}/{maxSlots}</span>
                  <span style={{ color: '#aaa', fontSize: '13px' }}>🎮 {t.mode}</span>
                </div>

                {/* Show Room ID/Password if joined */}
                {isJoined && t.roomId && (
                  <div style={{
                    background: '#0a0a0a',
                    padding: '12px',
                    borderRadius: '8px',
                    marginBottom: '12px',
                    border: '1px solid #00ff88'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#aaa', fontSize: '12px' }}>🔑 Room ID</span>
                      <span style={{ color: '#00ff88', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {t.roomId}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#aaa', fontSize: '12px' }}>🔒 Password</span>
                      <span style={{ color: '#00ff88', fontSize: '14px', fontWeight: 'bold', fontFamily: 'monospace' }}>
                        {t.password}
                      </span>
                    </div>
                  </div>
                )}
                
                {isJoined ? (
                  <button
                    onClick={() => setShowRoomModal(t)}
                    style={{
                      width: '100%',
                      background: '#00ff88',
                      color: '#000',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    🎯 View Room Details
                  </button>
                ) : (
                  <button
                    onClick={() => handleJoin(t)}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
                      color: 'white',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {user ? 'Join Free →' : 'Login to Join →'}
                  </button>
                )}
              </div>
            );
          })
        )}
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

      {/* Room Details Modal */}
      {showRoomModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          zIndex: 2000
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '25px',
            width: '100%',
            maxWidth: '450px',
            border: '2px solid #00ff88',
            boxShadow: '0 0 40px rgba(0, 255, 136, 0.3)'
          }}>
            {/* Success Icon */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '50px' }}>✅</div>
              <h2 style={{ color: '#00ff88', margin: '10px 0', fontSize: '22px', textAlign: 'center' }}>
                Successfully Joined!
              </h2>
              <p style={{ color: '#aaa', margin: 0, fontSize: '14px', textAlign: 'center' }}>
                {showRoomModal.title}
              </p>
            </div>

            {/* Room ID */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
                🔑 Room ID
              </label>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <div style={{
                  flex: 1,
                  background: '#0a0a0a',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px dashed #00ff88',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  {showRoomModal.roomId || '—'}
                </div>
                <button
                  onClick={() => copyToClipboard(showRoomModal.roomId || '', 'roomId')}
                  style={{
                    background: copiedField === 'roomId' ? '#00ff88' : '#ff6b00',
                    color: copiedField === 'roomId' ? '#000' : 'white',
                    border: 'none',
                    padding: '0 15px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {copiedField === 'roomId' ? '✅' : '📋'}
                </button>
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
                🔒 Room Password
              </label>
              <div style={{
                display: 'flex',
                gap: '8px'
              }}>
                <div style={{
                  flex: 1,
                  background: '#0a0a0a',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '2px dashed #00ff88',
                  textAlign: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#00ff88',
                  fontFamily: 'monospace',
                  letterSpacing: '2px'
                }}>
                  {showRoomModal.password || '—'}
                </div>
                <button
                  onClick={() => copyToClipboard(showRoomModal.password || '', 'password')}
                  style={{
                    background: copiedField === 'password' ? '#00ff88' : '#ff6b00',
                    color: copiedField === 'password' ? '#000' : 'white',
                    border: 'none',
                    padding: '0 15px',
                    borderRadius: '8px',
                    fontSize: '18px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  {copiedField === 'password' ? '✅' : '📋'}
                </button>
              </div>
            </div>

            {/* Time Info */}
            <div style={{
              background: 'rgba(255, 107, 0, 0.1)',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '20px',
              textAlign: 'center',
              border: '1px solid rgba(255, 107, 0, 0.3)'
            }}>
              <p style={{ margin: 0, color: '#ff6b00', fontSize: '13px', fontWeight: 'bold' }}>
                ⏰ Match Time: {showRoomModal.time}
              </p>
              <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '12px' }}>
                Room join karne se pehle 10 minute pehle pahunchen
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setShowRoomModal(null)}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
                color: 'white',
                border: 'none',
                padding: '14px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              🎮 Got it! Let's Play
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2026 FF Arena | Fan-made platform</p>
        <p style={{ margin: '5px 0' }}>Not affiliated with Garena</p>
      </div>
    </div>
  );
}
