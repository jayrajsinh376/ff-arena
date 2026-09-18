'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '../firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRank, setUserRank] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('coins'); // coins | wins | referrals

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      await loadLeaderboard('coins');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loadLeaderboard = async (filterType: string) => {
    try {
      const field = filterType === 'coins' ? 'coins' : filterType === 'wins' ? 'wins' : 'referralsCount';
      
      const q = query(
        collection(db, 'users'),
        orderBy(field, 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc, index) => ({
        id: doc.id,
        rank: index + 1,
        ...doc.data()
      }));

      setLeaders(data);

      // Current user ka rank dhundho
      if (currentUser) {
        const userIndex = data.findIndex(u => u.id === currentUser.uid);
        if (userIndex !== -1) {
          setUserRank(data[userIndex]);
        } else {
          setUserRank(null);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaders([]);
    }
  };

  const handleFilterChange = (newFilter: string) => {
    setFilter(newFilter);
    loadLeaderboard(newFilter);
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700';
    if (rank === 2) return '#C0C0C0';
    if (rank === 3) return '#CD7F32';
    return '#ff6b00';
  };

  const getValue = (user: any) => {
    if (filter === 'coins') return `${user.coins || 0} 🪙`;
    if (filter === 'wins') return `${user.wins || 0} 🏆`;
    return `${user.referralsCount || 0} 👥`;
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
      <div style={{ padding: '25px 20px 15px', textAlign: 'center' }}>
        <h2 style={{ color: '#ff6b00', margin: 0, fontSize: '28px' }}>
          🏆 Leaderboard
        </h2>
        <p style={{ color: '#aaa', margin: '5px 0 0 0', fontSize: '13px' }}>
          Top players of FF Arena
        </p>
      </div>

      {/* Your Rank Card */}
      {currentUser && userRank && (
        <div style={{ padding: '0 20px 15px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
            borderRadius: '12px',
            padding: '15px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>Your Rank</p>
              <h3 style={{ margin: '5px 0 0 0', fontSize: '24px' }}>
                {getRankIcon(userRank.rank)}
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ margin: 0, fontSize: '12px', opacity: 0.9 }}>
                {currentUser.displayName || 'You'}
              </p>
              <h3 style={{ margin: '5px 0 0 0', fontSize: '20px', fontWeight: 'bold' }}>
                {getValue(userRank)}
              </h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter Buttons */}
      <div style={{ padding: '0 20px 15px', display: 'flex', gap: '10px' }}>
        <button
          onClick={() => handleFilterChange('coins')}
          style={{
            flex: 1,
            padding: '12px',
            background: filter === 'coins' ? '#ff6b00' : '#1a1a1a',
            color: 'white',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🪙 Coins
        </button>
        <button
          onClick={() => handleFilterChange('wins')}
          style={{
            flex: 1,
            padding: '12px',
            background: filter === 'wins' ? '#ff6b00' : '#1a1a1a',
            color: 'white',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          🏆 Wins
        </button>
        <button
          onClick={() => handleFilterChange('referrals')}
          style={{
            flex: 1,
            padding: '12px',
            background: filter === 'referrals' ? '#ff6b00' : '#1a1a1a',
            color: 'white',
            border: '1px solid #333',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 'bold',
            cursor: 'pointer'
          }}
        >
          👥 Referrals
        </button>
      </div>

      {/* Top 3 Podium */}
      {leaders.length >= 3 && (
        <div style={{ padding: '10px 20px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: '10px' }}>
            {/* 2nd Place */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                background: '#1a1a1a',
                borderRadius: '12px 12px 0 0',
                padding: '15px 5px',
                border: '2px solid #C0C0C0',
                borderBottom: 'none',
                minHeight: '120px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <div style={{ fontSize: '30px' }}>🥈</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {leaders[1]?.name?.split(' ')[0] || 'User'}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#C0C0C0', fontWeight: 'bold' }}>
                  {getValue(leaders[1])}
                </p>
              </div>
              <div style={{ background: '#C0C0C0', height: '8px', borderRadius: '0 0 8px 8px' }}></div>
            </div>

            {/* 1st Place */}
            <div style={{ textAlign: 'center', flex: 1.1 }}>
              <div style={{
                background: '#1a1a1a',
                borderRadius: '12px 12px 0 0',
                padding: '15px 5px',
                border: '2px solid #FFD700',
                borderBottom: 'none',
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.3)'
              }}>
                <div style={{ fontSize: '40px' }}>🥇</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '12px', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {leaders[0]?.name?.split(' ')[0] || 'User'}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '14px', color: '#FFD700', fontWeight: 'bold' }}>
                  {getValue(leaders[0])}
                </p>
              </div>
              <div style={{ background: '#FFD700', height: '10px', borderRadius: '0 0 8px 8px' }}></div>
            </div>

            {/* 3rd Place */}
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{
                background: '#1a1a1a',
                borderRadius: '12px 12px 0 0',
                padding: '15px 5px',
                border: '2px solid #CD7F32',
                borderBottom: 'none',
                minHeight: '100px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end'
              }}>
                <div style={{ fontSize: '28px' }}>🥉</div>
                <p style={{ margin: '5px 0 0 0', fontSize: '11px', fontWeight: 'bold', color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {leaders[2]?.name?.split(' ')[0] || 'User'}
                </p>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#CD7F32', fontWeight: 'bold' }}>
                  {getValue(leaders[2])}
                </p>
              </div>
              <div style={{ background: '#CD7F32', height: '6px', borderRadius: '0 0 8px 8px' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* Full List (4-50) */}
      <div style={{ padding: '0 20px 30px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '18px', marginBottom: '12px' }}>
          📋 All Players ({leaders.length})
        </h3>

        {leaders.length === 0 ? (
          <div style={{
            background: '#1a1a1a',
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            border: '1px solid #333'
          }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>🏆</div>
            <p style={{ color: '#aaa', margin: 0, fontSize: '14px' }}>
              Abhi koi player nahi hai
            </p>
          </div>
        ) : (
          leaders.map((u, idx) => {
            const isCurrentUser = currentUser?.uid === u.id;
            return (
              <div
                key={u.id}
                style={{
                  background: isCurrentUser ? 'linear-gradient(135deg, #ff6b00, #ff0040)' : '#1a1a1a',
                  borderRadius: '10px',
                  padding: '12px 15px',
                  marginBottom: '8px',
                  border: isCurrentUser ? 'none' : '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                {/* Rank */}
                <div style={{
                  minWidth: '40px',
                  textAlign: 'center',
                  fontSize: u.rank <= 3 ? '22px' : '16px',
                  fontWeight: 'bold',
                  color: isCurrentUser ? 'white' : getRankColor(u.rank)
                }}>
                  {getRankIcon(u.rank)}
                </div>

                {/* Avatar */}
                {u.photo ? (
                  <img
                    src={u.photo}
                    alt="User"
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: isCurrentUser ? '2px solid white' : '2px solid #333'
                    }}
                  />
                ) : (
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: isCurrentUser ? 'white' : '#333',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                  }}>
                    👤
                  </div>
                )}

                {/* Name + Email */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: 'white',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {u.name || 'User'}
                    {isCurrentUser && (
                      <span style={{ fontSize: '11px', marginLeft: '6px', opacity: 0.9 }}>
                        (You)
                      </span>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: isCurrentUser ? 'rgba(255,255,255,0.8)' : '#666',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {u.email}
                  </div>
                </div>

                {/* Value */}
                <div style={{
                  fontSize: '15px',
                  fontWeight: 'bold',
                  color: isCurrentUser ? 'white' : '#ff6b00',
                  minWidth: '60px',
                  textAlign: 'right'
                }}>
                  {getValue(u)}
                </div>
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
