import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          background: 'var(--bg-main)'
        }}>
          <div className="card" style={{ maxWidth: '500px', textAlign: 'center' }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1rem'
            }}>⚠️</div>
            <h2 style={{
              color: 'var(--accent)',
              marginBottom: '1rem',
              fontSize: '1.8rem'
            }}>
              Oops! Something went wrong
            </h2>
            <p style={{
              color: 'var(--text-muted)',
              marginBottom: '2rem',
              lineHeight: 1.6
            }}>
              We encountered an unexpected error. Please refresh the page or contact support if the problem persists.
            </p>
            <button
              className="vibrant-button"
              onClick={() => window.location.reload()}
              style={{ width: 'auto', padding: '0.75rem 2rem' }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
