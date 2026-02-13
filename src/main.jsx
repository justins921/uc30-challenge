import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './styles/global.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh', background: '#0a0a0f', color: '#e8e6e3',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 20, fontFamily: 'monospace',
        }}>
          <div style={{ maxWidth: 600, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>UC30</div>
            <div style={{ color: '#e94560', fontSize: 18, marginBottom: 16 }}>Something went wrong</div>
            <div style={{
              background: 'rgba(233,69,96,0.1)', border: '1px solid rgba(233,69,96,0.3)',
              borderRadius: 8, padding: 16, textAlign: 'left', fontSize: 13,
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>
              {this.state.error.toString()}
            </div>
            <button
              onClick={() => { localStorage.clear(); window.location.reload(); }}
              style={{
                marginTop: 20, padding: '12px 24px', background: '#e94560',
                color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontSize: 14,
              }}
            >
              Clear Data & Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
