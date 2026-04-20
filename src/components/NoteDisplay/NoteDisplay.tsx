import React from 'react';

interface NoteDisplayProps {
  noteName: string;
  octave: number;
  frequency: number;
  tuningState: 'flat' | 'near' | 'in-tune' | 'sharp';
  isActive: boolean;
}

const STATE_CONFIG = {
  'in-tune': {
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.08)',
    border: 'rgba(34,197,94,0.3)',
    label: 'IN TUNE',
  },
  near: {
    color: '#eab308',
    bg: 'rgba(234,179,8,0.08)',
    border: 'rgba(234,179,8,0.3)',
    label: 'CLOSE',
  },
  flat: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    label: '♭ FLAT',
  },
  sharp: {
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
    border: 'rgba(239,68,68,0.3)',
    label: '♯ SHARP',
  },
};

// Render sharps as proper ♯ superscript
function formatNoteName(name: string): { base: string; accidental: string } {
  if (name.includes('#')) {
    return { base: name.replace('#', ''), accidental: '♯' };
  }
  if (name.includes('b')) {
    return { base: name.replace('b', ''), accidental: '♭' };
  }
  return { base: name, accidental: '' };
}

const NoteDisplay: React.FC<NoteDisplayProps> = ({
  noteName,
  octave,
  frequency,
  tuningState,
  isActive,
}) => {
  const config = STATE_CONFIG[tuningState];
  const { base, accidental } = formatNoteName(noteName);

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-2xl px-8 py-6 transition-all duration-200"
      style={{
        background: isActive ? config.bg : 'rgba(30,30,34,0.5)',
        border: `1px solid ${isActive ? config.border : '#2a2a30'}`,
        minWidth: '160px',
      }}
    >
      {/* In-tune glow ring */}
      {isActive && tuningState === 'in-tune' && (
        <div
          className="absolute inset-0 rounded-2xl animate-pulse"
          style={{
            boxShadow: '0 0 24px 4px rgba(34,197,94,0.25)',
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Note name */}
      <div className="relative flex items-start leading-none" style={{ lineHeight: 1 }}>
        <span
          className="font-sans font-bold transition-colors duration-200"
          style={{
            fontSize: 'clamp(4rem, 18vw, 6rem)',
            color: isActive ? config.color : '#4b5563',
            letterSpacing: '-0.02em',
          }}
        >
          {base}
        </span>
        <span
          className="font-sans font-semibold transition-colors duration-200"
          style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.2rem)',
            color: isActive ? config.color : '#4b5563',
            marginTop: '0.3em',
            marginLeft: '0.05em',
          }}
        >
          {accidental}
          <sub style={{ fontSize: '0.7em', verticalAlign: 'sub' }}>{octave}</sub>
        </span>
      </div>

      {/* Frequency */}
      <div
        className="font-mono text-sm font-medium mt-2 transition-colors duration-200"
        style={{ color: isActive ? '#9ca3af' : '#374151' }}
      >
        {isActive ? `${frequency.toFixed(1)} Hz` : '— Hz'}
      </div>

      {/* State badge */}
      {isActive && (
        <div
          className="mt-3 px-3 py-0.5 rounded-full text-xs font-bold tracking-widest font-mono transition-all duration-200"
          style={{
            color: config.color,
            background: config.bg,
            border: `1px solid ${config.border}`,
          }}
        >
          {config.label}
        </div>
      )}
    </div>
  );
};

export default NoteDisplay;
