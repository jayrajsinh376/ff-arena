"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, createTournament, getAllTournaments } from '../firebase';
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
        <span style={{
          background: '#ff6b00',
          color: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          👑 ADMIN
        </span>
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
                fontFamily: 'monospace'
              }}>
                <div>🔑 Room ID: {t.roomId}</div>
                <div>🔒 Password: {t.password}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '30px 20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>👑 Admin Panel - FF Arena</p>
      </div>
    </div>
  );
}
