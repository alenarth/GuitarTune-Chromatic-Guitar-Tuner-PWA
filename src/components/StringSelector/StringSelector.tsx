import React from 'react';
import { Tuning } from '../../utils/tunings';
import { midiToFrequency } from '../../utils/noteFrequencies';
import { playReferenceTone } from '../../hooks/useAudioPitch';

interface StringSelectorProps {
  tuning: Tuning;
  activeStringIndex: number | null;
  onStringSelect?: (index: number) => void;
}

const STRING_THICKNESS = [3.5, 3, 2.5, 2, 1.5, 1]; // visual thickness for E2..E4

const StringSelector: React.FC<StringSelectorProps> = ({
  tuning,
  activeStringIndex,
  onStringSelect,
}) => {
  const handlePlay = (e: React.MouseEvent, midi: number) => {
    e.stopPropagation();
    playReferenceTone(midiToFrequency(midi));
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-6 gap-2">
        {tuning.strings.map((str, i) => {
          const isActive = activeStringIndex === i;
          return (
            <button
              key={i}
              onClick={() => onStringSelect?.(i)}
              className="flex flex-col items-center gap-1.5 py-3 px-1 rounded-xl transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
              style={{
                background: isActive
                  ? 'rgba(245,158,11,0.12)'
                  : 'rgba(30,30,34,0.5)',
                border: `1px solid ${isActive ? 'rgba(245,158,11,0.5)' : '#2a2a30'}`,
              }}
              title={`String ${i + 1}: ${str.name} — click to play reference tone`}
              aria-label={`String ${i + 1}: ${str.name}`}
              aria-pressed={isActive}
            >
              {/* Visual string line */}
              <div
                className="w-full rounded-full transition-colors duration-150"
                style={{
                  height: `${STRING_THICKNESS[i]}px`,
                  background: isActive
                    ? '#f59e0b'
                    : `rgba(156,163,175,${0.3 + (5 - i) * 0.08})`,
                  boxShadow: isActive ? '0 0 6px rgba(245,158,11,0.6)' : 'none',
                }}
              />

              {/* Note name */}
              <span
                className="font-mono text-xs font-semibold transition-colors duration-150"
                style={{ color: isActive ? '#f59e0b' : '#6b7280' }}
              >
                {str.name}
              </span>

              {/* String number */}
              <span
                className="text-xs transition-colors duration-150"
                style={{ color: isActive ? 'rgba(245,158,11,0.6)' : '#374151' }}
              >
                {i + 1}
              </span>

              {/* Play reference button */}
              <button
                onClick={(e) => handlePlay(e, str.midi)}
                className="mt-0.5 p-0.5 rounded transition-opacity duration-150 hover:opacity-100 focus:outline-none"
                style={{ opacity: 0.4 }}
                title="Play reference tone"
                aria-label={`Play ${str.name} reference tone`}
              >
                <PlayIcon size={10} color={isActive ? '#f59e0b' : '#6b7280'} />
              </button>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const PlayIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 10 10"
    fill={color}
    aria-hidden="true"
  >
    <polygon points="2,1 9,5 2,9" />
  </svg>
);

export default StringSelector;
