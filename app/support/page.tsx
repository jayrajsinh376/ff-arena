'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// ⚠️ YAHAN APNI DETAILS DAALEIN
const SUPPORT_EMAIL = "jayrajsinhzala488@gmail.com";
const SUPPORT_WHATSAPP = "918156007556"; // Country code ke saath (91 = India)
const SUPPORT_TELEGRAM = "@RootZoneX";

export default function Support() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Bug report form
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setSubmitting(true);
    setSubmitMessage("");

    try {
      await addDoc(collection(db, 'support_tickets'), {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        userName: user?.displayName || 'Anonymous',
        subject,
        description,
        status: 'open',
        createdAt: serverTimestamp()
      });

      setSubmitMessage("✅ Message bhej diya! Hum 24 hours mein reply karenge.");
      setSubject("");
      setDescription("");
      setTimeout(() => setSubmitMessage(""), 5000);
    } catch (error: any) {
      setSubmitMessage("❌ Error: " + error.message);
    }
    setSubmitting(false);
  };

  const faqs = [
    {
      q: "Tournament join karne ke baad Room ID kahan milega?",
      a: "Tournament join karne ke baad, aapko turant ek popup milega jisme Room ID aur Password dikhega. Aap apne Dashboard → My Tournaments mein bhi dekh sakte hain."
    },
    {
      q: "Coins kaise kamaye?",
      a: "3 tarike hain: (1) Tournament jeet kar, (2) Doston ko refer karke (100 coins per referral), (3) Signup par 50 welcome coins."
    },
    {
      q: "Referral se coins nahi mile, kya karun?",
      a: "Referral tabhi count hota hai jab aapka dost signup kare AUR kam se kam 1 tournament join kare. Uske baad aapko 100 coins automatically mil jayenge."
    },
    {
      q: "Coins ko paise mein kaise convert karein?",
      a: "Abhi ye feature development mein hai. Jaldi hi UPI withdrawal ka option aayega. Tab tak aap coins se tournaments join kar sakte hain."
    },
    {
      q: "Screenshot upload nahi ho raha, kya karun?",
      a: "Check karein: (1) Image 5MB se chhoti ho, (2) Format JPG/PNG ho, (3) Internet connection stable ho. Agar phir bhi problem hai toh yahan bug report karein."
    },
    {
      q: "Account delete karne par kya hoga?",
      a: "Account delete karne par aapka saara data (coins, tournaments, referrals) hamesha ke liye delete ho jayega. Ye action undo nahi ho sakta."
    }
  ];

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

      {/* Hero */}
      <div style={{
        padding: '30px 20px',
        textAlign: 'center',
        background: 'linear-gradient(135deg, #ff6b00, #ff0040)',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '10px' }}>💬</div>
        <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
          Help & Support
        </h2>
        <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
          Koi bhi problem? Hum yahan hain aapki madad ke liye!
        </p>
      </div>

      {/* Quick Contact */}
      <div style={{ padding: '20px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '18px', marginBottom: '15px' }}>
          🚀 Quick Contact
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          marginBottom: '20px'
        }}>
          {/* WhatsApp */}
          <a
            href={`https://wa.me/${SUPPORT_WHATSAPP}?text=Hello%20FF%20Arena%20Support`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #25D366',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>💬</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#25D366' }}>
                WhatsApp
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                Fastest reply
              </div>
            </div>
          </a>

          {/* Email */}
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=FF Arena Support Request`}
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #ff6b00',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>📧</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff6b00' }}>
                Email
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                Within 24h
              </div>
            </div>
          </a>

          {/* Telegram */}
          <a
            href={`https://t.me/${SUPPORT_TELEGRAM}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #0088cc',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>✈️</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#0088cc' }}>
                Telegram
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                Community
              </div>
            </div>
          </a>

          {/* FAQ */}
          <a
            href="#faq"
            style={{ textDecoration: 'none' }}
          >
            <div style={{
              background: '#1a1a1a',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              border: '1px solid #00ff88',
              cursor: 'pointer'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>❓</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00ff88' }}>
                FAQ
              </div>
              <div style={{ fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
                Self help
              </div>
            </div>
          </a>
        </div>

        {/* Response Time Info */}
        <div style={{
          background: 'rgba(255, 107, 0, 0.1)',
          borderRadius: '10px',
          padding: '15px',
          border: '1px solid rgba(255, 107, 0, 0.3)',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, color: '#ff6b00', fontSize: '13px', fontWeight: 'bold' }}>
            ⏰ Response Time
          </p>
          <p style={{ margin: '5px 0 0 0', color: '#aaa', fontSize: '12px' }}>
            WhatsApp: 1-2 hours • Email: 24 hours • Telegram: 2-4 hours
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" style={{ padding: '0 20px 20px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '18px', marginBottom: '15px' }}>
          ❓ Frequently Asked Questions
        </h3>

        {faqs.map((faq, index) => (
          <div
            key={index}
            style={{
              background: '#1a1a1a',
              borderRadius: '10px',
              marginBottom: '10px',
              border: '1px solid #333',
              overflow: 'hidden'
            }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                padding: '15px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                cursor: 'pointer',
                color: 'white',
                fontSize: '14px',
                fontWeight: 'bold',
                textAlign: 'left',
                gap: '10px'
              }}
            >
              <span style={{ flex: 1 }}>{faq.q}</span>
              <span style={{
                color: '#ff6b00',
                fontSize: '18px',
                transition: 'transform 0.3s',
                transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0deg)'
              }}>
                ▼
              </span>
            </button>

            {openFaq === index && (
              <div style={{
                padding: '0 15px 15px 15px',
                color: '#aaa',
                fontSize: '13px',
                lineHeight: '1.6',
                borderTop: '1px solid #333',
                paddingTop: '12px'
              }}>
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bug Report Form */}
      <div style={{ padding: '0 20px 30px' }}>
        <h3 style={{ color: '#ff6b00', fontSize: '18px', marginBottom: '15px' }}>
          🐛 Report a Problem
        </h3>

        <form onSubmit={handleBugReport} style={{
          background: '#1a1a1a',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid #333'
        }}>
          <p style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '13px' }}>
            Koi bug, error, ya problem? Humein batayein — hum jaldi fix karenge!
          </p>

          {submitMessage && (
            <div style={{
              background: submitMessage.includes('✅') ? 'rgba(0, 255, 136, 0.15)' : 'rgba(255, 68, 68, 0.15)',
              color: submitMessage.includes('✅') ? '#00ff88' : '#ff4444',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '15px',
              fontSize: '13px',
              textAlign: 'center',
              border: `1px solid ${submitMessage.includes('✅') ? '#00ff88' : '#ff4444'}`
            }}>
              {submitMessage}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <label style={{
              display: 'block',
              color: '#aaa',
              fontSize: '13px',
              marginBottom: '6px'
            }}>
              Subject
            </label>
            <input
              type="text"
              placeholder="jaise: Screenshot upload nahi ho raha"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
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
              Description
            </label>
            <textarea
              placeholder="Problem ko detail mein likhein..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={5}
              style={{
                width: '100%',
                padding: '14px',
                background: '#0a0a0a',
                border: '1px solid #333',
                borderRadius: '8px',
                color: 'white',
                fontSize: '15px',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              width: '100%',
              background: submitting ? '#666' : 'linear-gradient(135deg, #ff6b00, #ff0040)',
              color: 'white',
              border: 'none',
              padding: '15px',
              borderRadius: '8px',
              fontSize: '15px',
              fontWeight: 'bold',
              cursor: submitting ? 'not-allowed' : 'pointer'
            }}
          >
            {submitting ? '📤 Sending...' : '📤 Send Report'}
          </button>

          {!user && (
            <p style={{
              color: '#ffc800',
              fontSize: '12px',
              margin: '12px 0 0 0',
              textAlign: 'center'
            }}>
              💡 Tip: Login karke report bhejenge toh hum jaldi reply kar payenge
            </p>
          )}
        </form>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '12px' }}>
        <p style={{ margin: '5px 0' }}>© 2026 FF Arena</p>
        <p style={{ margin: '5px 0' }}>Made with ❤️ for Free Fire players</p>
      </div>
    </div>
  );
}
