import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="error-screen on-dark">
        <p className="eyebrow">Algo salió mal</p>
        <h1 className="h2">Necesitamos <em>un respiro.</em></h1>
        <p className="lead">Recarga la página para volver a intentarlo.</p>
        <button className="btn btn--caramel" onClick={() => window.location.reload()}>
          Recargar
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;
