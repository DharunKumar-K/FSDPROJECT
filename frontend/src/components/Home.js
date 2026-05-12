
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Confetti from './Confetti';

const features = [
  { icon: '📱', label: 'Mobile & Desktop Friendly' },
  { icon: '📊', label: 'Live Analytics' },
  { icon: '🔒', label: 'Secure & Private' },
  { icon: '🤖', label: 'AI-Powered Insights' },
  { icon: '⚡', label: 'Lightning Fast' },
];

const Home = () => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 2200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      padding: '2rem',
    }}>
      {showConfetti && <Confetti trigger={showConfetti} />}
      {/* Animated background shapes */}
      <div style={{
        position: 'absolute',
        top: '-120px',
        left: '-120px',
        width: 320,
        height: 320,
        background: 'radial-gradient(circle at 60% 40%, #a78bfa88 0%, transparent 80%)',
        filter: 'blur(12px)',
        zIndex: 0,
        animation: 'float 8s ease-in-out infinite',
      }} />
      <div style={{
        position: 'absolute',
        bottom: '-100px',
        right: '-100px',
        width: 260,
        height: 260,
        background: 'radial-gradient(circle at 40% 60%, #0ea5e988 0%, transparent 80%)',
        filter: 'blur(16px)',
        zIndex: 0,
        animation: 'float 10s ease-in-out infinite',
        animationDelay: '2s',
      }} />
      <div
        className="card animate-slide-up"
        style={{
          maxWidth: 540,
          width: '100%',
          borderRadius: 32,
          padding: '3.5rem 2.5rem 2.5rem 2.5rem',
          zIndex: 2,
          boxShadow: '0 8px 40px 0 var(--primary-glow)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="float-anim" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center' }}>
          <span style={{ fontSize: '3.2rem', color: 'var(--primary)', lineHeight: 1 }}>🎓</span>
        </div>
        <h1 className="text-gradient animate-fade-in" style={{ fontSize: '2.8rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
          Smart Attendance System
        </h1>
        <p className="animate-fade-in delay-1" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '1.18rem', marginBottom: '2.2rem', marginTop: 8 }}>
          Effortless attendance, analytics, and engagement for modern education.<br />
          <span style={{ color: 'var(--primary)', fontWeight: 700 }}>Experience the future of classroom management.</span>
        </p>
        <div className="animate-fade-in delay-2" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.1rem', marginBottom: '2.2rem' }}>
          {features.map((f, i) => (
            <div key={f.label} style={{
              background: 'rgba(124,58,237,0.08)',
              borderRadius: 16,
              padding: '0.7rem 1.2rem',
              fontWeight: 600,
              color: 'var(--primary)',
              fontSize: '1.08rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 2px 8px 0 var(--primary-glow)',
              animation: 'float 6s ease-in-out infinite',
              animationDelay: `${0.2 + i * 0.15}s`,
            }}>
              <span style={{ fontSize: '1.4rem' }}>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
        <button
          className="vibrant-button animate-slide-up delay-3"
          style={{ fontSize: '1.25rem', padding: '1.1rem 2.8rem', borderRadius: 18, fontWeight: 800, marginTop: 8, boxShadow: '0 6px 24px 0 var(--accent-glow)' }}
          onClick={() => navigate('/login')}
        >
          Get Started
        </button>
      </div>
      {/* Keyframes for local animation */}
      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-18px); }
          100% { transform: translateY(0px); }
        }
      `}</style>
    </div>
  );
};

export default Home;
