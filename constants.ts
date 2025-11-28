

import { InstrumentConfig, Phrase, NoteDuration } from './types';

// Circle of Fifths order for better UX
export const KEYS = [
  'C', 
  'F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 
  'B', 'E', 'A', 'D', 'G'
];

export const DURATION_VALUES: Record<NoteDuration, number> = {
  'w': 4,
  'h': 2,
  'q': 1,
  '8': 0.5,
  '16': 0.25,
  '32': 0.125
};

export const MAX_BEATS_PER_MEASURE = 4;

export const INSTRUMENTS: Record<string, InstrumentConfig> = {
  guitar: {
    name: 'Guitar',
    // Standard Tuning EADGBE
    // High E (1st string) = MIDI 64
    // Low E (6th string) = MIDI 40
    strings: [64, 59, 55, 50, 45, 40], 
    clef: 'treble',
    // Written C4 (MIDI 60) sounds as C3 (MIDI 48) -> Transpose -12
    transpose: -12,
    // E2 (40) to E6 (88) (24 frets)
    minMidi: 40,
    maxMidi: 88
  },
  bass: {
    name: 'Bass',
    // Standard Tuning EADG
    // G (1st string) = MIDI 43
    // E (4th string) = MIDI 28
    strings: [43, 38, 33, 28],
    clef: 'bass',
    // Bass written C3 (MIDI 48) sounds as C2 (MIDI 36) -> Transpose -12
    transpose: -12,
    // E1 (28) to G4 (67) (24 frets)
    minMidi: 28,
    maxMidi: 67
  }
};

export const INITIAL_PHRASE: Phrase = {
  id: 'init',
  name: 'New Phrase',
  tags: [],
  instrument: 'guitar',
  bpm: 120,
  keySignature: 'C',
  scale: 'major',
  updatedAt: Date.now(),
  measures: [
    {
      id: 'm1',
      timeSignature: '4/4',
      notes: [],
      chords: []
    },
    {
      id: 'm2',
      timeSignature: '4/4',
      notes: [],
      chords: []
    }
  ]
};

export const NOTE_ORDER = ['c', 'd', 'e', 'f', 'g', 'a', 'b'];

export const CLEF_NOTE_MAP: Record<string, { topNote: string, topOctave: number }> = {
  treble: { topNote: 'f', topOctave: 5 },
  bass: { topNote: 'a', topOctave: 3 }
};

// 保存時に選択できる推奨タグ
export const PRESET_TAGS = [
    'II-V-I', 
    'V7', 
    'IM7', 
    'Lick', 
    'Blues', 
    'Turnaround',
    'Minor', 
    'Dorian', 
    'Altered', 
    'Ending'
];

// 書籍『JAZZ STANDARD THEORY』に基づくサンプルプリセット
export const SAMPLE_PHRASES: Phrase[] = [
    {
        id: 'preset_c_major',
        name: 'C Major Scale (8th)',
        tags: ['Scale', 'Major', 'Beginner'],
        instrument: 'guitar',
        bpm: 120,
        keySignature: 'C',
        scale: 'major',
        updatedAt: Date.now(),
        measures: [
            {
                id: 'm1',
                timeSignature: '4/4',
                chords: [{ id: 'c1', position: 0, symbol: 'CM7' }],
                notes: [
                    { id: 'n1', keys: ['c/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 5, fret: 3 },
                    { id: 'n2', keys: ['d/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 4, fret: 0 },
                    { id: 'n3', keys: ['e/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 4, fret: 2 },
                    { id: 'n4', keys: ['f/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 4, fret: 3 },
                    { id: 'n5', keys: ['g/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 3, fret: 0 },
                    { id: 'n6', keys: ['a/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 3, fret: 2 },
                    { id: 'n7', keys: ['b/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 2, fret: 0 },
                    { id: 'n8', keys: ['c/5'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 2, fret: 1 },
                ]
            },
            {
                id: 'm2',
                timeSignature: '4/4',
                chords: [], 
                notes: [
                    { id: 'n9', keys: ['c/5'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 2, fret: 1 },
                    { id: 'n10', keys: ['b/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 2, fret: 0 },
                    { id: 'n11', keys: ['a/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 3, fret: 2 },
                    { id: 'n12', keys: ['g/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 3, fret: 0 },
                    { id: 'n13', keys: ['f/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 4, fret: 3 },
                    { id: 'n14', keys: ['e/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 4, fret: 2 },
                    { id: 'n15', keys: ['d/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 4, fret: 0 },
                    { id: 'n16', keys: ['c/4'], duration: '8', isRest: false, dotted: false, accidentals: [], string: 5, fret: 3 },
                ]
            }
        ]
    }
];
