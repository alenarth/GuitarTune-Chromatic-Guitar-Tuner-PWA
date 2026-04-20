export interface StringDef {
  name: string;
  note: string;
  octave: number;
  midi: number;
}

export interface Tuning {
  id: string;
  name: string;
  shortName: string;
  strings: StringDef[];
}

function s(name: string, note: string, octave: number, midi: number): StringDef {
  return { name, note, octave, midi };
}

export const TUNINGS: Tuning[] = [
  {
    id: 'standard',
    name: 'Standard',
    shortName: 'EADGBe',
    strings: [
      s('E2', 'E', 2, 40),
      s('A2', 'A', 2, 45),
      s('D3', 'D', 3, 50),
      s('G3', 'G', 3, 55),
      s('B3', 'B', 3, 59),
      s('E4', 'E', 4, 64),
    ],
  },
  {
    id: 'drop-d',
    name: 'Drop D',
    shortName: 'DADGBe',
    strings: [
      s('D2', 'D', 2, 38),
      s('A2', 'A', 2, 45),
      s('D3', 'D', 3, 50),
      s('G3', 'G', 3, 55),
      s('B3', 'B', 3, 59),
      s('E4', 'E', 4, 64),
    ],
  },
  {
    id: 'drop-c',
    name: 'Drop C',
    shortName: 'CGCFAd',
    strings: [
      s('C2', 'C', 2, 36),
      s('G2', 'G', 2, 43),
      s('C3', 'C', 3, 48),
      s('F3', 'F', 3, 53),
      s('A3', 'A', 3, 57),
      s('D4', 'D', 4, 62),
    ],
  },
  {
    id: 'half-step-down',
    name: 'Half Step Down',
    shortName: 'Eb Ab Db...',
    strings: [
      s('Eb2', 'D#', 2, 39),
      s('Ab2', 'G#', 2, 44),
      s('Db3', 'C#', 3, 49),
      s('Gb3', 'F#', 3, 54),
      s('Bb3', 'A#', 3, 58),
      s('Eb4', 'D#', 4, 63),
    ],
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    shortName: 'DADGAD',
    strings: [
      s('D2', 'D', 2, 38),
      s('A2', 'A', 2, 45),
      s('D3', 'D', 3, 50),
      s('G3', 'G', 3, 55),
      s('A3', 'A', 3, 57),
      s('D4', 'D', 4, 62),
    ],
  },
  {
    id: 'open-g',
    name: 'Open G',
    shortName: 'DGDGBd',
    strings: [
      s('D2', 'D', 2, 38),
      s('G2', 'G', 2, 43),
      s('D3', 'D', 3, 50),
      s('G3', 'G', 3, 55),
      s('B3', 'B', 3, 59),
      s('D4', 'D', 4, 62),
    ],
  },
];

export const DEFAULT_TUNING = TUNINGS[0];
