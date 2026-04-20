import React, { useRef, useEffect } from 'react';

interface PitchHistoryProps {
  history: number[]; // array of cents values
  tuningState: 'flat' | 'near' | 'in-tune' | 'sharp';
}

const WIDTH = 280;
const HEIGHT = 50;
const CENTER_Y = HEIGHT / 2;
const MAX_CENTS = 30;

function stateColor(cents: number): string {
  const abs = Math.abs(cents);
  if (abs <= 3) return '#22c55e';
  if (abs <= 12) return '#eab308';
  return '#ef4444';
}

const PitchHistory: React.FC<PitchHistoryProps> = ({ history, tuningState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Background
    ctx.fillStyle = '#161618';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Center line (0 cents)
    ctx.strokeStyle = 'rgba(34,197,94,0.2)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, CENTER_Y);
    ctx.lineTo(WIDTH, CENTER_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    if (history.length < 2) return;

    // Draw sparkline
    const step = WIDTH / (history.length - 1);

    ctx.beginPath();
    history.forEach((cents, i) => {
      const x = i * step;
      const clamped = Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents));
      const y = CENTER_Y - (clamped / MAX_CENTS) * (CENTER_Y - 4);

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = 'rgba(245,158,11,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw colored dots for recent values
    const last = history.slice(-10);
    last.forEach((cents, i) => {
      const baseI = history.length - last.length + i;
      const x = baseI * step;
      const clamped = Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents));
      const y = CENTER_Y - (clamped / MAX_CENTS) * (CENTER_Y - 4);

      ctx.beginPath();
      ctx.arc(x, y, 2, 0, Math.PI * 2);
      ctx.fillStyle = stateColor(cents);
      ctx.fill();
    });
  }, [history, tuningState]);

  return (
    <div className="w-full rounded-lg overflow-hidden" style={{ border: '1px solid #2a2a30' }}>
      <div
        className="px-3 py-1 flex items-center justify-between"
        style={{ background: '#161618', borderBottom: '1px solid #1e1e22' }}
      >
        <span className="text-xs font-mono text-gray-500 tracking-wider uppercase">
          Pitch History
        </span>
        <span className="text-xs font-mono" style={{ color: '#374151' }}>
          2s
        </span>
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        style={{ display: 'block', width: '100%', height: `${HEIGHT}px` }}
        aria-label="Pitch stability history chart"
      />
    </div>
  );
};

export default PitchHistory;
