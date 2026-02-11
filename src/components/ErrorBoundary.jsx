import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--bg-linen)',
          color: 'var(--text-slate)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <span style={{
            fontSize: '0.65rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5em',
            color: 'var(--accent-clay)',
            marginBottom: '30px'
          }}>Error Técnico</span>
          <h1 className="serif" style={{ fontSize: '3rem', marginBottom: '20px' }}>
            Algo salió mal.
          </h1>
          <p style={{ 
            color: 'rgba(43,43,43,0.5)', 
            marginBottom: '50px',
            maxWidth: '500px',
            lineHeight: '1.8'
          }}>
            Estamos trabajando para restaurar la experiencia. 
            Intenta recargar la página.
          </p>
          <button
            onClick={() => window.location.reload()}
            aria-label="Recargar la página"
            style={{
              background: 'var(--text-slate)',
              color: '#fff',
              padding: '18px 45px',
              border: 'none',
              fontSize: '0.7rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.2em',
              cursor: 'pointer'
            }}
          >
            Recargar Página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
