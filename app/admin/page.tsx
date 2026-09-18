"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, createTournament, getAllTournaments, declareWinner } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// ⚠️ YAHAN APNA ADMIN EMAIL DAALO
const ADMIN_EMAIL = "jayrajsinhzala488@gmail.com";

export default function AdminPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  
  // Form fields
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [mode, setMode] = useState("Solo");
  const [prize, setPrize] = useState("");
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [maxSlots, setMaxSlots] = useState("50");
  
  // Winner declaration
  const [selectedTournament, setSelectedTournament] = useState<any>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [winnerId, setWinnerId] = useState("");
  const [prizeCoins, setPrizeCoins] = useState("");
  
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user && user.email === ADMIN_EMAIL) {
      loadTournaments();
    }
  }, [user]);

  const loadTournaments = async () => {
    const data = await getAllTournaments();
    setTournaments(data);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    
    if (user?.email !== ADMIN_EMAIL) {
      setMessage("❌ Aap admin nahi ho!");
      return;
    }
    
    try {
      await createTournament({
        title,
        time,
        mode,
        prize,
        roomId,
        password,
        maxSlots: parseInt(maxSlots),
        joined: 0
      });
      
      setMessage("✅ Tournament created!");
      setTitle("");
      setTime("");
      setMode("Solo");
      setPrize("");
      setRoomId("");
      setPassword("");
      setMaxSlots("50");
      loadTournaments();
      
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage("❌ Error: " + err.message);
    }
  };

  // Open winner selection modal
  const openWinnerModal = async (tournament: any) => {
    setSelectedTournament(tournament);
    
    try {
      const { getDocs, collection } = await import('firebase/firestore');
      const { db } = await import('../firebase');
      const participantsRef = collection(db, 'tournaments', tournament.id, 'participants');
      const snapshot = await getDocs(participantsRef);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setParticipants(data);
    } catch (error) {
      console.error('Error loading participants:', error);
      setParticipants([]);
    }
  };

  // Declare winner
  const handleDeclareWinner = async () => {
    if (!selectedTournament || !winnerId || !prizeCoins) {
      alert('Winner aur coins select karein!');
      return;
    }

    const result = await declareWinner(
      selectedTournament.id,
      winnerId,
      parseInt(prizeCoins)
    );

    if (result.success) {
      setMessage(`✅ Winner declared! ${prizeCoins} coins added.`);
      setSelectedTournament(null);
      setWinnerId("");
      setPrizeCoins("");
      setParticipants([]);
      loadTournaments();
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage("❌ Error: " + result.error);
    }
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('ffAdminLoggedIn');
    localStorage.removeItem('ffAdminLoginTime');
    router.push('/admin/login');
  };

  // Loading
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
        <p style={{ color: '#ff6b00' }}>Loading...</p>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0a', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <h1 style={{ color: '#ff6b00' }}>🔒 Admin Access</h1>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>Please login first</p>
        <Link href="/login" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#ff6b00',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            Login
          </button>
        </Link>
      </div>
    );
  }

  // Not admin
  if (user.email !== ADMIN_EMAIL) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: '#0a0a0a', 
        color: 'white',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px'
      }}>
        <h1 style={{ color: '#ff4444' }}>🚫 Access Denied</h1>
        <p style={{ color: '#aaa', marginBottom: '20px' }}>
          Aap admin nahi ho. Ye page sirf admin ke liye hai.
        </p>
        <p style={{ color: '#666', fontSize: '12px', marginBottom: '20px' }}>
          Aapka email: {user.email}
        </p>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <button style={{
            background: '#ff6b00',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}>
            ← Home
          </button>
        </Link>
      </div>
    );
  }

  // Admin panel
  return (
    <div style={{ background: '#0a0a0a', color: 'white', minHeight: '100vh' }}>
      {/* Header */}
      <header style={{ 
        background: '#1a1a1a', 
        padding: '12px 15px', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '2px solid #ff6b00',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <h1 style={{ color: '#ff6b00', fontSize: '18px', margin: 0 }}>
            🎮 FF Arena
          </h1>
        </Link>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
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
              🏠 Home
            </button>
          </Link>

          <button
            onClick={handleLogout}
            style={{
              background: '#ff4444',
              color: 'white',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚪 Logout
          </button>

          <span style={{
            background: '#ff6b00',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            👑 ADMIN
          </span>
        </div>
      </header>

      {/* Message */}
      {message && (
        <div style={{
          background: message.includes('✅') ? '#00ff88' : '#ff4444',
          color: message.includes('✅') ? '#000' : 'white',
          padding: '12px 20px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          {message}
        </div>
      )}

      {/* Create Tournament Form */}
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#ff6b00', marginTop: 0 }}>🎯 Create Tournament</h2>
        
        <form onSubmit={handleCreate} style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Tournament Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Solo Match"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Time
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="Today 8 PM"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            >
              <option value="Solo">Solo</option>
              <option value="Duo">Duo</option>
              <option value="Squad">Squad</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Prize
            </label>
            <input
              type="text"
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="100 Coins"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Room ID
            </label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="123456"
              required
              style={{
                width: '100%',
                padding: '12px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Room Password
            </label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ff123"
              required
              style={{
                width: '100%',
                padding: '12px',
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
            <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
              Max Slots
            </label>
            <input
              type="number"
              value={maxSlots}
              onChange={(e) => setMaxSlots(e.target.value)}
              placeholder="50"
              required
              style={{
                width: '100%',
                padding: '12px',
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
            type="submit"
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            🚀 Create Tournament
          </button>
        </form>
      </div>

      {/* All Tournaments */}
      <div style={{ padding: '0 20px 20px' }}>
        <h2 style={{ color: '#ff6b00' }}>📋 All Tournaments ({tournaments.length})</h2>
        
        {tournaments.length === 0 ? (
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center',
            color: '#aaa',
            border: '1px solid #333'
          }}>
            Abhi koi tournament nahi hai. Upar se create karo!
          </div>
        ) : (
          tournaments.map((t: any) => (
            <div key={t.id} style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '18px',
              marginBottom: '15px',
              border: '1px solid #333'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <h4 style={{ margin: 0, color: 'white' }}>{t.title}</h4>
                <span style={{ 
                  color: '#00ff88', 
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {t.joined || 0}/{t.maxSlots || 50}
                </span>
              </div>
              
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <span style={{ color: '#aaa', fontSize: '13px' }}>⏰ {t.time}</span>
                <span style={{ color: '#aaa', fontSize: '13px' }}>🏆 {t.prize}</span>
                <span style={{ color: '#aaa', fontSize: '13px' }}>🎮 {t.mode}</span>
              </div>
              
              <div style={{
                background: '#0a0a0a',
                padding: '10px',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#ff6b00',
                fontFamily: 'monospace',
                marginBottom: '10px'
              }}>
                <div>🔑 Room ID: {t.roomId}</div>
                <div>🔒 Password: {t.password}</div>
              </div>

              {t.status !== 'completed' && (
                <button
                  onClick={() => openWinnerModal(t)}
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #00ff88, #00cc66)',
                    color: '#000',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginTop: '10px'
                  }}
                >
                  🏆 Declare Winner
                </button>
              )}

              {t.status === 'completed' && (
                <div style={{
                  background: '#00ff88',
                  color: '#000',
                  padding: '10px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  marginTop: '10px'
                }}>
                  ✅ Winner Declared
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Winner Modal */}
      {selectedTournament && (
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
          zIndex: 1000
        }}>
          <div style={{
            background: '#1a1a1a',
            borderRadius: '16px',
            padding: '25px',
            width: '100%',
            maxWidth: '500px',
            border: '2px solid #00ff88',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ color: '#00ff88', marginTop: 0, textAlign: 'center' }}>
              🏆 Declare Winner
            </h2>
            <p style={{ color: '#aaa', textAlign: 'center', fontSize: '14px' }}>
              {selectedTournament.title}
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '8px' }}>
                Select Winner ({participants.length} participants)
              </label>
              
              {participants.length === 0 ? (
                <div style={{
                  background: '#0a0a0a',
                  padding: '15px',
                  borderRadius: '8px',
                  color: '#666',
                  textAlign: 'center',
                  fontSize: '13px'
                }}>
                  Koi participant nahi hai
                </div>
              ) : (
                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                  {participants.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setWinnerId(p.id)}
                      style={{
                        background: winnerId === p.id ? '#00ff88' : '#0a0a0a',
                        color: winnerId === p.id ? '#000' : 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        border: '1px solid #333',
                        fontSize: '14px'
                      }}
                    >
                      <div style={{ fontWeight: 'bold' }}>{p.name || 'User'}</div>
                      <div style={{ fontSize: '12px', opacity: 0.8 }}>{p.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#aaa', fontSize: '13px', marginBottom: '6px' }}>
                Prize Coins
              </label>
              <input
                type="number"
                value={prizeCoins}
                onChange={(e) => setPrizeCoins(e.target.value)}
                placeholder="100"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: '#0a0a0a',
                  border: '1px solid #333',
                  borderRadius: '8px',
                  color: 'white',
                  fontSize: '15px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => {
                  setSelectedTournament(null);
                  setWinnerId("");
                  setPrizeCoins("");
                  setParticipants([]);
                }}
                style={{
                  flex: 1,
                  background: '#333',
                  color: 'white',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeclareWinner}
                disabled={!winnerId || !prizeCoins}
                style={{
                  flex: 1,
                  background: (!winnerId || !prizeCoins) ? '#666' : 'linear-gradient(135deg, #00ff88, #00cc66)',
                  color: (!winnerId || !prizeCoins) ? '#aaa' : '#000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  cursor: (!winnerId || !prizeCoins) ? 'not-allowed' : 'pointer'
                }}
              >
                🏆 Declare Winner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>👑 Admin Panel - FF Arena</p>
      </div>
    </div>
  );
}
