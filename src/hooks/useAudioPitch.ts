import { useRef, useState, useCallback, useEffect } from 'react';
import { detectPitchYIN, calculateRMS } from '../utils/pitchDetection';
import { findClosestNote, NoteInfo } from '../utils/noteFrequencies';

export type AudioStatus = 'idle' | 'requesting' | 'active' | 'error';

export interface PitchResult {
  frequency: number;
  note: NoteInfo & { cents: number };
  rms: number;
}

interface UseAudioPitchReturn {
  status: AudioStatus;
  error: string | null;
  result: PitchResult | null;
  pitchHistory: number[];
  start: () => Promise<void>;
  stop: () => void;
}

const BUFFER_SIZE = 2048;
const HISTORY_MAX = 60; // ~2 seconds at 30fps

export function useAudioPitch(): UseAudioPitchReturn {
  const [status, setStatus] = useState<AudioStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PitchResult | null>(null);
  const [pitchHistory, setPitchHistory] = useState<number[]>([]);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const bufferRef = useRef<Float32Array<ArrayBuffer>>(new Float32Array(BUFFER_SIZE) as Float32Array<ArrayBuffer>);

  const stop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    setStatus('idle');
    setResult(null);
    setPitchHistory([]);
  }, []);

  const start = useCallback(async () => {
    if (status === 'active' || status === 'requesting') return;

    setStatus('requesting');
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
        },
      });

      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = BUFFER_SIZE * 2;
      analyser.smoothingTimeConstant = 0;
      analyserRef.current = analyser;

      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      setStatus('active');

      const loop = () => {
        if (!analyserRef.current || !audioContextRef.current) return;

        const buffer = bufferRef.current;
        analyserRef.current.getFloatTimeDomainData(buffer);

        const rms = calculateRMS(buffer);

        if (rms > 0.005) {
          const freq = detectPitchYIN(buffer, audioContextRef.current.sampleRate);

          if (freq > 50 && freq < 1400) {
            const noteInfo = findClosestNote(freq);
            if (noteInfo) {
              setResult({ frequency: freq, note: noteInfo, rms });
              setPitchHistory((prev) => {
                const next = [...prev, noteInfo.cents];
                return next.length > HISTORY_MAX ? next.slice(-HISTORY_MAX) : next;
              });
            }
          }
        } else {
          // Signal too quiet — clear result
          setResult(null);
        }

        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    } catch (err) {
      const msg =
        err instanceof DOMException
          ? err.name === 'NotAllowedError'
            ? 'Microphone access denied. Please allow microphone access and try again.'
            : err.name === 'NotFoundError'
            ? 'No microphone found. Please connect a microphone and try again.'
            : `Audio error: ${err.message}`
          : 'Could not access microphone.';

      setError(msg);
      setStatus('error');
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return { status, error, result, pitchHistory, start, stop };
}

/**
 * Play a reference tone using an OscillatorNode.
 */
export function playReferenceTone(frequency: number, duration = 1.5): void {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = frequency;

  gain.gain.setValueAtTime(0, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
  gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + duration - 0.1);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);

  osc.onended = () => ctx.close();
}
