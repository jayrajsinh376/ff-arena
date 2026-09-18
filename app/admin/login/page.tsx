"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simple check: username = admin, password = ADMIN_PASSWORD
    // (Client side check — temporary solution)
    const ADMIN_USERNAME = 'admin';
    const ADMIN_PASSWORD = 'FfArena@2026Admin'; // Jo Vercel mein daala hai

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // Save admin session
      localStorage.setItem('ffAdminLoggedIn', 'true');
      localStorage.setItem('ffAdminLoginTime', Date.now().toString());
      
      // Redirect to admin panel
      router.push('/admin');
    } else {
      setError('❌ Galat username ya password!');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#1a1a1a',
        borderRadius: '16px',
        padding: '30px',
        width: '100%',
        maxWidth: '400px',
        border: '2px solid #ff6b00',
        boxShadow: '0 0 40px rgba(255, 107, 0, 0.3)'
      }}>
        {/* Crown Icon */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px' }}>👑</div>
          <h1 style={{
            color: '#ff6b00',
            fontSize: '24px',
            margin: '10px 0',
            textAlign: 'center'
          }}>
            ADMIN PANEL
          </h1>
          <p style={{ color: '#aaa', fontSize: '14px', textAlign: 'center', margin: 0 }}>
            Manage • Organize • Grow
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#ff4444',
            color: 'white',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '15px',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#aaa',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
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
            <label style={{
              display: 'block',
              color: '#aaa',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#666' : 'linear-gradient(135deg, #ff6b00, #ff0040)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Logging in...' : '🔐 Login'}
          </button>
        </form>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{
            color: '#ff6b00',
            fontSize: '13px',
            textDecoration: 'none'
          }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
