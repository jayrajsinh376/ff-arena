'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function MatchHistory() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | win | loss

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const q = query(
          collection(db, 'matches'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMatches(data);
      } catch (error) {
        console.error('Error fetching matches:', error);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter matches
  const filteredMatches = matches.filter(m => {
    if (filter === 'all') return true;
    if (filter === 'win') return m.result === 'win';
    if (filter === 'loss') return m.result === 'loss';
    return true;
  });

  // Stats
  const totalMatches = matches.length;
  const totalWins = matches.filter(m => m.result === 'win').length;
  const totalLosses = matches.filter(m => m.result === 'loss').length;
  const totalCoins = matches.reduce((sum, m) => sum + (m.prize || 0), 0);

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
          📜 Match History
        </h2>
        <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '13px' }}>
          Aapke saare match results
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        padding: '0 20px 20px',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gap: '10px'
      }}>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '12px 8px',
          textAlign: 'center',
          border: '1px solid #333'
        }}>
          <div style={{ fontSize: '18px', color: '#ff6b00', fontWeight: 'bold' }}>
            {totalMatches}
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '3px' }}>Total</div>
        </div>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '12px 8px',
          textAlign: 'center',
          border: '1px solid #00ff88'
        }}>
          <div style={{ fontSize: '18px', color: '#00ff88', fontWeight: 'bold' }}>
            {totalWins}
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '3px' }}>Wins</div>
        </div>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '12px 8px',
          textAlign: 'center',
          border: '1px solid #ff4444'
        }}>
          <div style={{ fontSize: '18px', color: '#ff4444', fontWeight: 'bold' }}>
            {totalLosses}
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '3px' }}>Losses</div>
        </div>
        <div style={{
          background: '#1a1a1a',
          borderRadius: '10px',
          padding: '12px 8px',
          textAlign: 'center',
          border: '1px solid #ffc800'
        }}>
          <div style={{ fontSize: '18px', color: '#ffc800', fontWeight: 'bold' }}>
            {totalCoins}
          </div>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '3px' }}>Coins</div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div style={{ padding: '0 20px 15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => setFilter('all')}
          style={{
            flex: 1,
            padding: '10px',
            background: filter === 'all' ? '#ff6b00' : '#1a1a1a',
            color: 'white',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          All ({totalMatches})
        </button>
        <button
          onClick={() => setFilter('win')}
          style={{
            flex: 1,
            padding: '10px',
            background: filter === 'win' ? '#00ff88' : '#1a1a1a',
            color: filter === 'win' ? '#000' : 'white',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ✅ Wins ({totalWins})
        </button>
        <button
          onClick={() => setFilter('loss')}
          style={{
            flex: 1,
            padding: '10px',
            background: filter === 'loss' ? '#ff4444' : '#1a1a1a',
            color: 'white',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          ❌ Losses ({totalLosses})
        </button>
      </div>

      {/* Match List */}
      <div style={{ padding: '0 20px 30px' }}>
        {filteredMatches.length === 0 ? (
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '50px 20px',
            textAlign: 'center',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '50px', marginBottom: '15px' }}>🎮</div>
            <p style={{ color: '#aaa', fontSize: '15px', margin: '0 0 15px 0' }}>
              {filter === 'all' 
                ? 'Abhi tak koi match nahi khela'
                : filter === 'win'
                ? 'Abhi tak koi match nahi jeeta'
                : 'Abhi tak koi match nahi haara'}
            </p>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <button style={{
                background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
                color: 'white',
                border: 'none',
                padding: '12px 25px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                🎯 Join Tournament
              </button>
            </Link>
          </div>
        ) : (
          filteredMatches.map((match) => {
            const isWin = match.result === 'win';
            const date = match.createdAt?.toDate 
              ? match.createdAt.toDate().toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              : 'Unknown date';

            return (
              <div
                key={match.id}
                style={{
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '15px',
                  marginBottom: '12px',
                  border: '1px solid #333',
                  borderLeft: `4px solid ${isWin ? '#00ff88' : '#ff4444'}`
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '10px'
                }}>
                  {/* Result Badge */}
                  <span style={{
                    background: isWin ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 68, 0.15)',
                    color: isWin ? '#00ff88' : '#ff4444',
                    padding: '5px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: `1px solid ${isWin ? '#00ff88' : '#ff4444'}`
                  }}>
                    {isWin ? '🏆 WIN' : '💔 LOSS'}
                  </span>

                  {/* Coins */}
                  <span style={{
                    color: isWin ? '#ffc800' : '#666',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {isWin ? `+${match.prize || 0} 🪙` : `${match.prize || 0} 🪙`}
                  </span>
                </div>

                {/* Match Title (agar hai) */}
                {match.matchId && (
                  <p style={{
                    margin: '0 0 8px 0',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    {match.title || `Match #${match.matchId.slice(-6)}`}
                  </p>
                )}

                {/* Date */}
                <p style={{
                  margin: '0',
                  color: '#666',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  🕐 {date}
                </p>

                {/* Screenshot Preview */}
                {match.screenshotURL && (
                  <div style={{
                    marginTop: '12px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid #333'
                  }}>
                    <img
                      src={match.screenshotURL}
                      alt="Match Screenshot"
                      style={{
                        width: '100%',
                        height: '150px',
                        objectFit: 'cover',
                        display: 'block'
                      }}
                    />
                  </div>
                )}

                {/* View Screenshot Link */}
                {match.screenshotURL && (
                  <a
                    href={match.screenshotURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      color: '#ff6b00',
                      fontSize: '12px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    🔍 View Full Screenshot →
                  </a>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2026 FF Arena</p>
      </div>
    </div>
  );
}
