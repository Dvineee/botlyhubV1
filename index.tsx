import React, { ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { TranslationProvider } from './TranslationContext';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import './index.css';

console.log("Application initializing...");

// --- Error Boundary for Production Debugging ---
interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null, errorInfo: null };

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 20, color: '#fff', backgroundColor: '#991b1b', height: '100vh', overflow: 'auto', fontFamily: 'monospace', zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}>
          <h2>⚠️ Uygulama Hatası</h2>
          <p>Bir şeyler ters gitti.</p>
          <br/>
          <strong>Hata:</strong> {this.state.error?.toString()}
          <br/><br/>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.errorInfo?.componentStack}
          </details>
          <br/>
          <button 
            onClick={() => window.location.reload()} 
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', backgroundColor: '#fff', color: '#991b1b', fontWeight: 'bold' }}
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

try {
  const manifestUrl = 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json';
  const root = createRoot(rootElement);

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <TonConnectUIProvider manifestUrl={manifestUrl}>
          <TranslationProvider>
            <App />
          </TranslationProvider>
        </TonConnectUIProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
  console.log("React mount successful");
} catch (e) {
  console.error("Critical mount error:", e);
  // Fallback error display if React completely fails to mount
  rootElement.innerHTML = `<div style="color:red; padding:20px;">CRITICAL STARTUP ERROR: ${e}</div>`;
}