import {StrictMode, Component, ErrorInfo, ReactNode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import firebaseConfig from '../firebase-applet-config.json';
import './index.css';

class ErrorBoundary extends Component<{children: ReactNode}, {error: Error | null}> {
  state = {error: null as Error | null};

  static getDerivedStateFromError(error: Error) {
    return {error};
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '40px auto', color: '#0f172a'}}>
          <h1 style={{fontSize: 24, fontWeight: 800}}>SlotPilot konnte nicht starten</h1>
          <p style={{color: '#475569'}}>Ein Laufzeitfehler hat die App gestoppt:</p>
          <pre style={{background: '#f1f5f9', padding: 16, borderRadius: 8, overflow: 'auto', fontSize: 12}}>
            {String((this.state.error as Error).message || this.state.error)}
          </pre>
          <p style={{color: '#475569', marginTop: 16}}>Details stehen in der Browser-Konsole (F12).</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function ConfigError({missing}: {missing: string[]}) {
  return (
    <div style={{padding: 24, fontFamily: 'system-ui, sans-serif', maxWidth: 720, margin: '40px auto', color: '#0f172a'}}>
      <h1 style={{fontSize: 24, fontWeight: 800}}>Firebase-Konfiguration unvollständig</h1>
      <p style={{color: '#475569'}}>Folgende Felder fehlen in <code>firebase-applet-config.json</code>:</p>
      <ul>
        {missing.map(m => <li key={m}><code>{m}</code></li>)}
      </ul>
      <p style={{color: '#475569'}}>
        Trage die Werte aus der Firebase Console (Project Settings → Your apps → Web app) ein.
        Firebase Web API Keys sind öffentlich; der Schutz erfolgt über Firestore Rules und autorisierte Domains.
      </p>
      <p style={{color: '#475569'}}>
        Zusätzlich in der Firebase Console unter <strong>Authentication → Settings → Authorized domains</strong>
        &nbsp;<code>beko2210.github.io</code> hinzufügen.
      </p>
    </div>
  );
}

const missing = (['apiKey', 'projectId', 'appId', 'authDomain'] as const).filter(
  k => !(firebaseConfig as Record<string, string>)[k]
);

const root = createRoot(document.getElementById('root')!);
root.render(
  <StrictMode>
    <ErrorBoundary>
      {missing.length ? <ConfigError missing={missing} /> : <App />}
    </ErrorBoundary>
  </StrictMode>,
);
