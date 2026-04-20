import React from 'react';
import Tuner from './components/Tuner/Tuner';
import AdBanner from './components/AdBanner/AdBanner';

const App: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: '#0d0d0f', color: '#f9fafb' }}
    >
      {/* Top Ad Banner */}
      <AdBanner position="top" />

      {/* Header */}
      <header
        className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid #1e1e22' }}
      >
        <div className="flex items-center gap-2.5">
          <GuitarIcon />
          <div>
            <h1 className="text-base font-bold tracking-tight leading-none" style={{ color: '#f9fafb' }}>
              GuitarTune
            </h1>
            <p className="text-xs font-mono" style={{ color: '#6b7280' }}>
              Chromatic Tuner
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div
            className="px-2 py-0.5 rounded text-xs font-mono font-medium"
            style={{
              background: 'rgba(245,158,11,0.1)',
              color: '#f59e0b',
              border: '1px solid rgba(245,158,11,0.2)',
            }}
          >
            ±1¢
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-start py-6 overflow-y-auto">
        <Tuner />
      </main>

      {/* Footer */}
      <footer
        className="px-5 py-3 flex items-center justify-center"
        style={{ borderTop: '1px solid #1e1e22' }}
      >
        <span className="text-xs font-mono" style={{ color: '#374151' }}>
          GuitarTune — Professional Chromatic Tuner
        </span>
      </footer>

      {/* Bottom Ad Banner */}
      <AdBanner position="bottom" />
    </div>
  );
};

const GuitarIcon: React.FC = () => (
  <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <ellipse cx="14" cy="22" rx="8" ry="7" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" />
    <ellipse cx="14" cy="22" rx="4.5" ry="3.5" fill="none" stroke="rgba(245,158,11,0.3)" strokeWidth="1" />
    <rect x="15.5" y="3" width="3" height="14" rx="1.5" fill="rgba(245,158,11,0.15)" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="14" cy="4" r="1.5" fill="#f59e0b" />
    <circle cx="20" cy="4" r="1.5" fill="#f59e0b" />
    <circle cx="14" cy="22" r="2.5" fill="none" stroke="rgba(245,158,11,0.5)" strokeWidth="1" />
    <line x1="12" y1="17" x2="12" y2="29" stroke="rgba(245,158,11,0.4)" strokeWidth="0.5" />
    <line x1="14" y1="17" x2="14" y2="29" stroke="rgba(245,158,11,0.4)" strokeWidth="0.5" />
    <line x1="16" y1="17" x2="16" y2="29" stroke="rgba(245,158,11,0.4)" strokeWidth="0.5" />
  </svg>
);

export default App;
