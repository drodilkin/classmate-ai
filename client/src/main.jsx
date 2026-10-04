import './index.css'
import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error("App render error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          fontFamily: "'Onest', sans-serif",
          background: '#090d16',
          color: '#ffffff',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '0.8rem' }}>⚠️ Ошибка инициализации интерфейса</h2>
          <p style={{ color: '#94a3b8', maxWidth: '420px', marginBottom: '1.5rem', fontSize: '0.85rem', lineHeight: '1.5' }}>
            {String(this.state.error?.message || this.state.error)}
          </p>
          <button
            onClick={() => {
              try { localStorage.clear(); sessionStorage.clear(); } catch {}
              window.location.reload();
            }}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#4f46e5',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.85rem',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.9rem'
            }}
          >
            🔄 Очистить кэш и перезагрузить
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
