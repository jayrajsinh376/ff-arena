"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { auth, saveUserToFirestore } from '../firebase';
import { 
  signInWithPopup, 
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'firebase/auth';

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL se referral code read karo (?ref=FF12345)
  useEffect(() => {
    const refFromUrl = searchParams.get('ref');
    if (refFromUrl) {
      setReferralCode(refFromUrl.toUpperCase());
      setIsSignup(true); // Agar referral link se aaya hai toh signup tab kholo
    }
  }, [searchParams]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      await saveUserToFirestore(result.user, referralCode);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (isSignup) {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(result.user, referralCode);
      } else {
        const result = await signInWithEmailAndPassword(auth, email, password);
        await saveUserToFirestore(result.user);
      }
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

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
      <div style={{
        background: '#1a1a1a',
        padding: '40px 30px',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '400px',
        border: '1px solid #333'
      }}>
        <h1 style={{ 
          color: '#ff6b00', 
          fontSize: '28px', 
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          🎮 FF Arena
        </h1>
        <p style={{ 
          color: '#aaa', 
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: '14px'
        }}>
          {isSignup ? "Account banao" : "Login karo"}
        </p>

        {/* Referral Code Input - Only for Signup */}
        {isSignup && (
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              color: '#ff6b00',
              fontSize: '13px',
              marginBottom: '6px',
              fontWeight: 'bold'
            }}>
              🎁 Referral Code (Optional)
            </label>
            <input
              type="text"
              placeholder="FF12345"
              value={referralCode}
              onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                border: '2px solid #ff6b00',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box',
                textTransform: 'uppercase'
              }}
            />
            <p style={{
              color: '#00ff88',
              fontSize: '12px',
              marginTop: '6px',
              marginBottom: 0
            }}>
              💰 Referral code daalenge toh 50 coins turant milenge!
            </p>
          </div>
        )}

        <button 
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{ 
            width: '100%',
            padding: '15px', 
            background: '#fff', 
            color: '#333', 
            border: 'none', 
            borderRadius: '8px', 
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {loading ? 'Wait...' : 'Continue with Google'}
        </button>

        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          color: '#666'
        }}>
          <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
          <span style={{ padding: '0 10px', fontSize: '12px' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: '#333' }}></div>
        </div>

        <form onSubmit={handleEmailAuth}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: 'white',
              fontSize: '15px',
              marginBottom: '12px',
              boxSizing: 'border-box'
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              padding: '14px',
              background: '#0a0a0a',
              border: '1px solid #333',
              borderRadius: '8px',
              color: 'white',
              fontSize: '15px',
              marginBottom: '20px',
              boxSizing: 'border-box'
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: '#ff6b00',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Wait...' : (isSignup ? 'Sign Up' : 'Login')}
          </button>
        </form>

        <p style={{ 
          textAlign: 'center', 
          marginTop: '20px',
          fontSize: '14px',
          color: '#aaa'
        }}>
          {isSignup ? "Already have account? " : "New user? "}
          <button
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff6b00',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold'
            }}
          >
            {isSignup ? "Login" : "Sign Up"}
          </button>
        </p>

        {error && (
          <p style={{ 
            color: '#ff4444', 
            textAlign: 'center',
            marginTop: '15px',
            fontSize: '13px',
            padding: '10px',
            background: 'rgba(255,68,68,0.1)',
            borderRadius: '8px'
          }}>
            {error}
          </p>
        )}
      </div>

      <a 
        href="/" 
        style={{ 
          color: '#ff6b00', 
          marginTop: '20px',
          fontSize: '14px',
          textDecoration: 'none'
        }}
      >
        ← Back to Home
      </a>
    </div>
  );
}
