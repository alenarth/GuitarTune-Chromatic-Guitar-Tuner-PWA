// All chromatic notes
export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const;
export type NoteName = typeof NOTE_NAMES[number];

export interface NoteInfo {
  name: NoteName;
  octave: number;
  frequency: number;
  midi: number;
}

// A4 = 440 Hz reference
const A4_FREQ = 440;
const A4_MIDI = 69;

export function midiToFrequency(midi: number): number {
  return A4_FREQ * Math.pow(2, (midi - A4_MIDI) / 12);
}

export function frequencyToMidi(freq: number): number {
  return A4_MIDI + 12 * Math.log2(freq / A4_FREQ);
}

export function getNoteInfo(freq: number): NoteInfo & { cents: number } {
  const midiFloat = frequencyToMidi(freq);
  const midi = Math.round(midiFloat);
  const cents = (midiFloat - midi) * 100;

  const noteIndex = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[noteIndex];
  const frequency = midiToFrequency(midi);

  return { name, octave, frequency, midi, cents };
}

// Build a full lookup table for notes C0–C8
export function buildNoteTable(): NoteInfo[] {
  const notes: NoteInfo[] = [];
  for (let midi = 12; midi <= 108; midi++) {
    const noteIndex = ((midi % 12) + 12) % 12;
    const octave = Math.floor(midi / 12) - 1;
    notes.push({
      name: NOTE_NAMES[noteIndex],
      octave,
      frequency: midiToFrequency(midi),
      midi,
    });
  }
  return notes;
}

export const NOTE_TABLE = buildNoteTable();

// Find the closest note to a frequency
export function findClosestNote(freq: number): (NoteInfo & { cents: number }) | null {
  if (freq <= 0 || !isFinite(freq)) return null;
  return getNoteInfo(freq);
}
