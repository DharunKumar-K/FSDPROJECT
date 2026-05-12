import React from 'react';

const LoadingSpinner = ({ size = 'medium', message = 'Loading...' }) => {
  const sizes = {
    small: { spinner: 24, border: 3 },
    medium: { spinner: 48, border: 4 },
    large: { spinner: 64, border: 5 }
  };

  const { spinner, border } = sizes[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '1rem',
      padding: '2rem'
    }}>
      <div style={{
        width: `${spinner}px`,
        height: `${spinner}px`,
        border: `${border}px solid rgba(124, 58, 237, 0.2)`,
        borderTop: `${border}px solid var(--primary)`,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      {message && (
        <p style={{
          color: 'var(--text-muted)',
          fontWeight: 600,
          fontSize: '1rem'
        }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default LoadingSpinner;
