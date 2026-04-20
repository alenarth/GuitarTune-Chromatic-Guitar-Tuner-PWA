import React, { useRef, useEffect } from 'react';

interface NeedleGaugeProps {
  cents: number;      // -50 to +50
  tuningState: 'flat' | 'near' | 'in-tune' | 'sharp';
}

const MAX_CENTS = 50;

// Map cents to SVG needle rotation degrees
function centsToAngle(cents: number): number {
  const clamped = Math.max(-MAX_CENTS, Math.min(MAX_CENTS, cents));
  return (clamped / MAX_CENTS) * 70; // ±70° from center
}

function getTuningColor(state: NeedleGaugeProps['tuningState']): string {
  switch (state) {
    case 'in-tune': return '#22c55e';
    case 'near':    return '#eab308';
    default:        return '#ef4444';
  }
}

const NeedleGauge: React.FC<NeedleGaugeProps> = ({ cents, tuningState }) => {
  const needleRef = useRef<SVGGElement>(null);
  const prevAngleRef = useRef<number>(0);
  const animFrameRef = useRef<number>(0);
  const currentAngleRef = useRef<number>(0);

  const targetAngle = centsToAngle(cents);
  const color = getTuningColor(tuningState);

  useEffect(() => {
    const target = targetAngle;

    const animate = () => {
      const current = currentAngleRef.current;
      const diff = target - current;

      if (Math.abs(diff) < 0.1) {
        currentAngleRef.current = target;
      } else {
        currentAngleRef.current += diff * 0.25;
      }

      if (needleRef.current) {
        needleRef.current.setAttribute(
          'transform',
          `rotate(${currentAngleRef.current}, 100, 110)`
        );
      }

      if (Math.abs(target - currentAngleRef.current) > 0.05) {
        animFrameRef.current = requestAnimationFrame(animate);
      }

      prevAngleRef.current = currentAngleRef.current;
    };

    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animFrameRef.current);
  }, [targetAngle]);

  // Arc tick marks
  const ticks = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];

  const arcTick = (cents: number, big: boolean) => {
    const angle = (cents / MAX_CENTS) * 70;
    const rad = (angle - 90) * (Math.PI / 180);
    const r1 = big ? 68 : 72;
    const r2 = 78;
    const x1 = 100 + r1 * Math.cos(rad);
    const y1 = 110 + r1 * Math.sin(rad);
    const x2 = 100 + r2 * Math.cos(rad);
    const y2 = 110 + r2 * Math.sin(rad);
    return { x1, y1, x2, y2 };
  };

  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 200 130"
        className="w-full max-w-xs"
        style={{ overflow: 'visible' }}
        aria-label={`Tuning gauge: ${cents > 0 ? '+' : ''}${cents.toFixed(1)} cents`}
      >
        {/* Background arc */}
        <path
          d="M 22,110 A 78,78 0 0,1 178,110"
          fill="none"
          stroke="#2a2a30"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Colored center zone (±5 cents) */}
        <path
          d="M 88,34 A 78,78 0 0,1 112,34"
          fill="none"
          stroke="rgba(34,197,94,0.25)"
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Active arc — fills from center to needle */}
        {cents !== 0 && (
          <path
            d={`M 100,32 A 78,78 0 0,${cents > 0 ? 1 : 0} ${
              100 + 78 * Math.cos(((centsToAngle(cents) - 90) * Math.PI) / 180)
            },${110 + 78 * Math.sin(((centsToAngle(cents) - 90) * Math.PI) / 180)}`}
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
            opacity="0.6"
          />
        )}

        {/* Tick marks */}
        {ticks.map((t) => {
          const { x1, y1, x2, y2 } = arcTick(t, t % 10 === 0);
          const isMajor = t % 10 === 0;
          const isCenter = t === 0;
          return (
            <line
              key={t}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke={isCenter ? '#22c55e' : isMajor ? '#6b7280' : '#374151'}
              strokeWidth={isCenter ? 2.5 : isMajor ? 1.5 : 1}
            />
          );
        })}

        {/* Labels */}
        {[-50, -25, 0, 25, 50].map((label) => {
          const angle = (label / MAX_CENTS) * 70;
          const rad = (angle - 90) * (Math.PI / 180);
          const r = 58;
          const x = 100 + r * Math.cos(rad);
          const y = 110 + r * Math.sin(rad);
          return (
            <text
              key={label}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="7"
              fill={label === 0 ? '#22c55e' : '#6b7280'}
              fontFamily="JetBrains Mono, monospace"
            >
              {label === 0 ? '0' : label > 0 ? `+${label}` : label}
            </text>
          );
        })}

        {/* Needle pivot shadow */}
        <circle cx="100" cy="110" r="7" fill="#111113" />

        {/* Needle */}
        <g ref={needleRef} transform="rotate(0, 100, 110)">
          <line
            x1="100" y1="110"
            x2="100" y2="36"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            style={{ transition: 'stroke 0.2s ease' }}
          />
          <polygon
            points="100,28 96,40 104,40"
            fill={color}
            style={{ transition: 'fill 0.2s ease' }}
          />
        </g>

        {/* Needle pivot dot */}
        <circle cx="100" cy="110" r="5" fill={color} style={{ transition: 'fill 0.2s ease' }} />
        <circle cx="100" cy="110" r="2.5" fill="#0d0d0f" />
      </svg>

      {/* Cents readout */}
      <div
        className="mt-1 font-mono text-sm font-semibold tracking-widest transition-colors duration-200"
        style={{ color }}
      >
        {cents > 0 ? '+' : ''}{cents.toFixed(1)} ¢
      </div>
    </div>
  );
};

export default NeedleGauge;
