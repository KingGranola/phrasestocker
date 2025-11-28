
import { MeasureData, NoteDuration, InstrumentConfig } from '../types';
import { INSTRUMENTS, DURATION_VALUES, NOTE_ORDER, CLEF_NOTE_MAP, MAX_BEATS_PER_MEASURE } from '../constants';

// Re-export specific logic from modules
export { calculateTabPosition, getValidTabPositions } from './tabLogic';
export { getAllChords, getNoteDegree, isChordTone, getChordNotes } from './chordLogic';

// ==========================================
// 音程とMIDI変換のロジック (Core)
// ==========================================

export const keyToMidi = (key: string): number => {
  const [noteStr, octave] = key.split('/');
  const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const root = noteStr.charAt(0).toLowerCase();
  const accidental = noteStr.slice(1);
  let base = noteMap[root];
  if (accidental.includes('#')) base += 1;
  if (accidental.includes('b')) base -= 1;
  return base + (parseInt(octave) + 1) * 12;
};

export const midiToKey = (midi: number, keySignature: string): string => {
    const octave = Math.floor(midi / 12) - 1;
    const noteVal = midi % 12;
    const sharpNames = ['c', 'c#', 'd', 'd#', 'e', 'f', 'f#', 'g', 'g#', 'a', 'a#', 'b'];
    const flatNames  = ['c', 'db', 'd', 'eb', 'e', 'f', 'gb', 'g', 'ab', 'a', 'bb', 'b'];
    const flatKeys = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb'];
    const useFlat = flatKeys.includes(keySignature);
    const noteName = useFlat ? flatNames[noteVal] : sharpNames[noteVal];
    return `${noteName}/${octave}`;
};

export const shiftPitchVisual = (key: string, steps: number): string => {
    const [notePart, octaveStr] = key.split('/');
    const noteChar = notePart.charAt(0).toLowerCase();
    let octave = parseInt(octaveStr);
    let noteIndex = NOTE_ORDER.indexOf(noteChar); 
    for(let i = 0; i < Math.abs(steps); i++) {
        if (steps > 0) {
            noteIndex++;
            if (noteIndex > 6) { noteIndex = 0; octave++; }
        } else {
            noteIndex--;
            if (noteIndex < 0) { noteIndex = 6; octave--; }
        }
    }
    return `${NOTE_ORDER[noteIndex]}/${octave}`;
};

export const shiftPitchChromatic = (key: string, semitones: number, keySignature: string): string => {
    const currentMidi = keyToMidi(key);
    const newMidi = currentMidi + semitones;
    return midiToKey(newMidi, keySignature);
};

export const getYToKey = (relativeLine: number, clef: 'treble' | 'bass'): string => {
  const config = CLEF_NOTE_MAP[clef];
  const stepsDown = Math.round(relativeLine * 2); 
  const topNoteIndex = NOTE_ORDER.indexOf(config.topNote); 
  let currentIndex = (topNoteIndex - stepsDown);
  let noteIndex = currentIndex % 7;
  if (noteIndex < 0) noteIndex += 7;
  const noteName = NOTE_ORDER[noteIndex];
  let currentOctave = config.topOctave;
  let ptr = topNoteIndex;
  for (let i = 0; i < Math.abs(stepsDown); i++) {
     if (stepsDown > 0) {
         if (NOTE_ORDER[ptr] === 'c') currentOctave--;
         ptr--;
         if (ptr < 0) ptr = 6;
     } else {
         ptr++;
         if (ptr > 6) ptr = 0;
         if (NOTE_ORDER[ptr] === 'c') currentOctave++;
     }
  }
  return `${noteName}/${currentOctave}`;
};

export const isNoteInRange = (noteKey: string, instrument: 'guitar' | 'bass'): boolean => {
    const config = INSTRUMENTS[instrument];
    const writtenMidi = keyToMidi(noteKey);
    const realMidi = writtenMidi + config.transpose;
    return realMidi >= config.minMidi && realMidi <= config.maxMidi;
};

// ==========================================
// 調号・バリデーション (Core)
// ==========================================

const KEY_SIGNATURE_ACCIDENTALS: Record<string, Record<string, number>> = {
    'C': {}, 'F': { 'b': -1 }, 'Bb': { 'b': -1, 'e': -1 },
    'Eb': { 'b': -1, 'e': -1, 'a': -1 }, 'Ab': { 'b': -1, 'e': -1, 'a': -1, 'd': -1 },
    'Db': { 'b': -1, 'e': -1, 'a': -1, 'd': -1, 'g': -1 }, 'Gb': { 'b': -1, 'e': -1, 'a': -1, 'd': -1, 'g': -1, 'c': -1 },
    'B': { 'f': 1, 'c': 1, 'g': 1, 'd': 1, 'a': 1 }, 'E': { 'f': 1, 'c': 1, 'g': 1, 'd': 1 },
    'A': { 'f': 1, 'c': 1, 'g': 1 }, 'D': { 'f': 1, 'c': 1 }, 'G': { 'f': 1 },
    'C#': { 'f': 1, 'c': 1, 'g': 1, 'd': 1, 'a': 1, 'e': 1, 'b': 1 },
    'F#': { 'f': 1, 'c': 1, 'g': 1, 'd': 1, 'a': 1, 'e': 1 },
    'Cb': { 'b': -1, 'e': -1, 'a': -1, 'd': -1, 'g': -1, 'c': -1, 'f': -1 },
};

export const getPitchFromVisual = (visualKey: string, keySignature: string): string => {
    const [noteLetter, octave] = visualKey.split('/');
    const letter = noteLetter.toLowerCase();
    const keyAcc = KEY_SIGNATURE_ACCIDENTALS[keySignature];
    if (!keyAcc) return visualKey;
    const modifier = keyAcc[letter];
    if (modifier === 1) return `${letter}#/${octave}`;
    if (modifier === -1) return `${letter}b/${octave}`;
    return visualKey;
};

export const getAccidentalsForContext = (pitch: string, keySignature: string): string[] => {
    const [notePart, ] = pitch.split('/');
    const letter = notePart.charAt(0).toLowerCase();
    const pitchAcc = notePart.slice(1);
    const keyAcc = KEY_SIGNATURE_ACCIDENTALS[keySignature] || {};
    const keyModifier = keyAcc[letter] || 0;
    let expectedAcc = '';
    if (keyModifier === 1) expectedAcc = '#';
    if (keyModifier === -1) expectedAcc = 'b';
    if (pitchAcc === expectedAcc) return [];
    if (pitchAcc === '') return ['n'];
    return [pitchAcc];
};

export const calculateMeasureDuration = (measure: MeasureData): number => {
    let total = 0;
    measure.notes.forEach(n => {
        let val = DURATION_VALUES[n.duration];
        if (n.dotted) val *= 1.5;
        if (n.tuplet) val *= (2/3);
        total += val;
    });
    return total;
};

export interface ValidationResult { isValid: boolean; currentBeats: number; requiredBeats: number; message?: string; type?: 'error' | 'warning'; }

export const validateMeasure = (measure: MeasureData): ValidationResult => {
    const required = MAX_BEATS_PER_MEASURE;
    const total = calculateMeasureDuration(measure);
    if (Math.abs(total - required) < 0.01) return { isValid: true, currentBeats: total, requiredBeats: required };
    if (total < required) return { isValid: false, currentBeats: total, requiredBeats: required, message: `${(required - total).toFixed(2)} 拍不足しています`, type: 'warning' };
    return { isValid: false, currentBeats: total, requiredBeats: required, message: `${(total - required).toFixed(2)} 拍超過しています`, type: 'error' };
};

export const canAddNote = (measure: MeasureData, duration: NoteDuration, isDotted: boolean, isTuplet: boolean = false): boolean => {
    const MAX = MAX_BEATS_PER_MEASURE;
    const currentTotal = calculateMeasureDuration(measure);
    let noteVal = DURATION_VALUES[duration];
    if (isDotted) noteVal *= 1.5;
    if (isTuplet) noteVal *= (2/3);
    return (currentTotal + noteVal) <= (MAX + 0.01);
};
