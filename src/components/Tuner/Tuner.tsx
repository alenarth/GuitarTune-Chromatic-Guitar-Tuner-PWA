import React, { useState, useEffect, useCallback } from 'react';
import { useAudioPitch } from '../../hooks/useAudioPitch';
import { TUNINGS, DEFAULT_TUNING, Tuning } from '../../utils/tunings';
import { NoteInfo } from '../../utils/noteFrequencies';
import NeedleGauge from '../NeedleGauge/NeedleGauge';
import NoteDisplay from '../NoteDisplay/NoteDisplay';
import StringSelector from '../StringSelector/StringSelector';
import PitchHistory from '../PitchHistory/PitchHistory';

type TuningMode = 'chromatic' | 'guitar';
type TuningState = 'flat' | 'near' | 'in-tune' | 'sharp';

function getTuningState(cents: number): TuningState {
  const abs = Math.abs(cents);
  if (abs <= 3) return 'in-tune';
  if (abs <= 12) return 'near';
  return cents < 0 ? 'flat' : 'sharp';
}

function findClosestString(
  noteName: string,
  octave: number,
  tuning: Tuning
): number {
  const midiTarget =
    ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'].indexOf(
      noteName
    ) +
    (octave + 1) * 12;

  let best = 0;
  let bestDiff = Infinity;
  tuning.strings.forEach((s, i) => {
    const diff = Math.abs(s.midi - midiTarget);
    if (diff < bestDiff) {
      bestDiff = diff;
      best = i;
    }
  });
  return best;
}

const Tuner: React.FC = () => {
  const { status, error, result, pitchHistory, start, stop } = useAudioPitch();
  const [mode, setMode] = useState<TuningMode>('guitar');
  const [tuning, setTuning] = useState<Tuning>(DEFAULT_TUNING);
  const [activeString, setActiveString] = useState<number | null>(null);
  const [showTuningPicker, setShowTuningPicker] = useState(false);
  const hapticTimerRef = React.useRef<number>(0);

  const isActive = status === 'active';
  const isLoading = status === 'requesting';

  // Auto-detect nearest string in guitar mode
  useEffect(() => {
    if (!result || mode !== 'guitar') return;
    const idx = findClosestString(result.note.name, result.note.octave, tuning);
    setActiveString(idx);
  }, [result, mode, tuning]);

  // Haptic feedback on in-tune
  useEffect(() => {
    if (!result) return;
    const state = getTuningState(result.note.cents);
    if (state === 'in-tune' && 'vibrate' in navigator) {
      clearTimeout(hapticTimerRef.current);
      hapticTimerRef.current = window.setTimeout(() => {
        navigator.vibrate([30, 30, 30]);
      }, 200);
    }
    return () => clearTimeout(hapticTimerRef.current);
  }, [result]);

  const handleToggle = useCallback(() => {
    if (isActive) stop();
    else start();
  }, [isActive, start, stop]);

  const cents = result?.note.cents ?? 0;
  const tuningState: TuningState = result ? getTuningState(cents) : 'flat';
  const displayNote = result?.note ?? ({ name: 'A', octave: 4 } as NoteInfo & { cents: number });
  const displayFreq = result?.frequency ?? 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-sm mx-auto px-4">

      {/* Mode toggle */}
      <div
        className="flex rounded-lg overflow-hidden"
        style={{ border: '1px solid #2a2a30' }}
        role="group"
        aria-label="Tuning mode"
      >
        {(['guitar', 'chromatic'] as TuningMode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className="px-4 py-2 text-xs font-semibold font-mono tracking-wider uppercase transition-all duration-150"
            style={{
              background: mode === m ? 'rgba(245,158,11,0.15)' : 'transparent',
              color: mode === m ? '#f59e0b' : '#6b7280',
              borderRight: m === 'guitar' ? '1px solid #2a2a30' : 'none',
            }}
            aria-pressed={mode === m}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Tuning selector (guitar mode only) */}
      {mode === 'guitar' && (
        <div className="relative w-full">
          <button
            onClick={() => setShowTuningPicker((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
            style={{
              background: '#161618',
              border: '1px solid #2a2a30',
              color: '#d1d5db',
            }}
          >
            <span className="font-mono text-amber-400">{tuning.name}</span>
            <span className="text-gray-500 text-xs font-mono">{tuning.shortName}</span>
            <ChevronIcon open={showTuningPicker} />
          </button>

          {showTuningPicker && (
            <div
              className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden z-20"
              style={{ border: '1px solid #2a2a30', background: '#161618' }}
            >
              {TUNINGS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => {
                    setTuning(t);
                    setShowTuningPicker(false);
                    setActiveString(null);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100"
                  style={{
                    background:
                      tuning.id === t.id ? 'rgba(245,158,11,0.1)' : 'transparent',
                    color: tuning.id === t.id ? '#f59e0b' : '#9ca3af',
                    borderBottom: '1px solid #1e1e22',
                  }}
                >
                  <span className="font-medium">{t.name}</span>
                  <span className="font-mono text-xs text-gray-600">{t.shortName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Note Display */}
      <NoteDisplay
        noteName={result ? displayNote.name : '—'}
        octave={result ? displayNote.octave : 0}
        frequency={displayFreq}
        tuningState={tuningState}
        isActive={!!result}
      />

      {/* Needle Gauge */}
      <NeedleGauge cents={result ? cents : 0} tuningState={tuningState} />

      {/* String Selector (guitar mode only) */}
      {mode === 'guitar' && (
        <StringSelector
          tuning={tuning}
          activeStringIndex={activeString}
          onStringSelect={(i) => setActiveString(i)}
        />
      )}

      {/* Pitch History */}
      {isActive && pitchHistory.length > 2 && (
        <PitchHistory history={pitchHistory} tuningState={tuningState} />
      )}

      {/* Error */}
      {error && (
        <div
          className="w-full rounded-xl px-4 py-3 text-sm"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
          }}
          role="alert"
        >
          <p className="font-semibold mb-1">Microphone Error</p>
          <p className="text-xs opacity-80">{error}</p>
        </div>
      )}

      {/* Start/Stop Button */}
      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="w-full py-4 rounded-2xl text-base font-bold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        style={{
          background: isActive
            ? 'rgba(239,68,68,0.12)'
            : isLoading
            ? 'rgba(245,158,11,0.06)'
            : 'rgba(245,158,11,0.12)',
          border: `1.5px solid ${
            isActive ? 'rgba(239,68,68,0.4)' : isLoading ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.4)'
          }`,
          color: isActive ? '#fca5a5' : isLoading ? '#6b7280' : '#f59e0b',
          boxShadow: isActive
            ? '0 0 20px rgba(239,68,68,0.1)'
            : isLoading
            ? 'none'
            : '0 0 20px rgba(245,158,11,0.1)',
        }}
        aria-label={isActive ? 'Stop tuner' : 'Start tuner'}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingSpinner /> Requesting microphone…
          </span>
        ) : isActive ? (
          <span className="flex items-center justify-center gap-2">
            <StopIcon /> Stop Tuner
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <MicIcon /> Start Tuner
          </span>
        )}
      </button>

      {/* Signal level indicator */}
      {isActive && (
        <div className="w-full flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600">SIGNAL</span>
          <div
            className="flex-1 rounded-full overflow-hidden"
            style={{ height: '4px', background: '#1e1e22' }}
          >
            <div
              className="h-full rounded-full transition-all duration-75"
              style={{
                width: `${Math.min(100, (result?.rms ?? 0) * 300)}%`,
                background:
                  (result?.rms ?? 0) > 0.02 ? '#22c55e' : '#374151',
              }}
            />
          </div>
          <span className="text-xs font-mono" style={{ color: '#374151', minWidth: '2rem', textAlign: 'right' }}>
            {result ? `${Math.round((result.rms) * 100)}%` : '0%'}
          </span>
        </div>
      )}
    </div>
  );
};

// ── Icons ──────────────────────────────────────────────────────────────────────

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="8" y1="22" x2="16" y2="22"/>
  </svg>
);

const StopIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <rect x="6" y="6" width="12" height="12" rx="2"/>
  </svg>
);

const LoadingSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/>
    <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
  </svg>
);

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
      transition: 'transform 0.2s ease',
      color: '#6b7280',
    }}
  >
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

export default Tuner;
