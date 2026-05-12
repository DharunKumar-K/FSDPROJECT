import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem',
      background: 'var(--bg-main)'
    }}>
      <div className="card animate-slide-up" style={{
        maxWidth: '600px',
        textAlign: 'center',
        padding: '3rem 2rem'
      }}>
        <div style={{
          fontSize: '8rem',
          fontWeight: 800,
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          marginBottom: '1rem',
          lineHeight: 1
        }}>
          404
        </div>
        
        <h2 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: 'var(--text-main)',
          marginBottom: '1rem'
        }}>
          Page Not Found
        </h2>
        
        <p style={{
          color: 'var(--text-muted)',
          fontSize: '1.1rem',
          marginBottom: '2.5rem',
          lineHeight: 1.6
        }}>
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track!
        </p>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <button
            className="vibrant-button"
            onClick={() => navigate(-1)}
            style={{
              width: 'auto',
              padding: '0.75rem 2rem',
              background: 'rgba(124, 58, 237, 0.1)',
              color: 'var(--primary)',
              boxShadow: 'none'
            }}
          >
            ← Go Back
          </button>
          
          <button
            className="vibrant-button"
            onClick={() => navigate('/dashboard')}
            style={{
              width: 'auto',
              padding: '0.75rem 2rem'
            }}
          >
            Dashboard 🏠
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
