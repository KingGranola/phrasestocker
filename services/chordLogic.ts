
import { ChordCategory, VoicingMode } from '../types';

// ==========================================
// コード理論・ボイシング・度数計算ロジック
// ==========================================

const NOTE_TO_INT: Record<string, number> = {
    'c': 0, 'c#': 1, 'db': 1, 
    'd': 2, 'd#': 3, 'eb': 3, 
    'e': 4, 'fb': 4, 'e#': 5,
    'f': 5, 'f#': 6, 'gb': 6,
    'g': 7, 'g#': 8, 'ab': 8, 
    'a': 9, 'a#': 10, 'bb': 10, 
    'b': 11, 'cb': 11, 'b#': 0
};

const DEGREE_NAMES = [
    'R', 'b9', '9', 'b3', '3', '11', '#11', '5', 'b13', '13', 'b7', '7'
];

const getKeyNotes = (key: string): string[] => {
  const keyMap: Record<string, string[]> = {
    'C': ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    'F': ['F', 'G', 'A', 'Bb', 'C', 'D', 'E'],
    'Bb': ['Bb', 'C', 'D', 'Eb', 'F', 'G', 'A'],
    'Eb': ['Eb', 'F', 'G', 'Ab', 'Bb', 'C', 'D'],
    'Ab': ['Ab', 'Bb', 'C', 'Db', 'Eb', 'F', 'G'],
    'Db': ['Db', 'Eb', 'F', 'Gb', 'Ab', 'Bb', 'C'],
    'Gb': ['Gb', 'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'F'],
    'G': ['G', 'A', 'B', 'C', 'D', 'E', 'F#'],
    'D': ['D', 'E', 'F#', 'G', 'A', 'B', 'C#'],
    'A': ['A', 'B', 'C#', 'D', 'E', 'F#', 'G#'],
    'E': ['E', 'F#', 'G#', 'A', 'B', 'C#', 'D#'],
    'B': ['B', 'C#', 'D#', 'E', 'F#', 'G#', 'A#'],
  };
  return keyMap[key] || keyMap['C'];
};

const flatNote = (note: string): string => note.includes('#') ? note.replace('#', '') : note + 'b';
const sharpNote = (note: string): string => note.includes('b') ? note.replace('b', '') : note + '#';

export const getAllChords = (key: string, scale: 'major' | 'minor'): ChordCategory[] => {
  const notes = getKeyNotes(key);
  
  if (scale === 'major') {
    return [
      { 
        name: 'ダイアトニック', type: 'diatonic', description: '基本となる7つのコード。',
        chords: [`${notes[0]}△7`, `${notes[1]}m7`, `${notes[2]}m7`, `${notes[3]}△7`, `${notes[4]}7`, `${notes[5]}m7`, `${notes[6]}m7(♭5)`] 
      },
      { 
        name: 'セカンダリー', type: 'secondary', description: '一時的な転調感を作るドミナントコード。',
        chords: [`${notes[5]}7`, `${notes[6]}7`, `${notes[0]}7`, `${notes[1]}7`, `${notes[2]}7`] 
      },
      {
        name: '裏コード (Sub V)', type: 'substitute', description: 'ドミナント7thの代理として使えるコード。',
        chords: [`${flatNote(notes[1])}7`, `${flatNote(notes[2])}7`, `${flatNote(notes[5])}7`, `${flatNote(notes[6])}7`]
      },
      { 
        name: 'モーダル (SDm)', type: 'modal', description: 'マイナーキーから借りてきた哀愁のあるコード。',
        chords: [`${notes[3]}m7`, `${flatNote(notes[5])}△7`, `${flatNote(notes[6])}7`, `${notes[1]}m7(♭5)`]
      },
      {
        name: 'ディミニッシュ', type: 'diminished', description: 'コード間を滑らかにつなぐコード。',
        chords: [`${sharpNote(notes[0])}dim7`, `${sharpNote(notes[1])}dim7`, `${flatNote(notes[2])}dim7`]
      },
      {
        name: 'S.F.D / Blues', type: 'special', description: 'ブルージーな響きを持つ特殊なドミナント。',
        chords: [`${notes[0]}7`, `${notes[3]}7`]
      }
    ];
  } else {
    return [
      {
        name: 'ダイアトニック (基本)', type: 'diatonic', description: 'マイナーキーの基本コード。',
        chords: [`${notes[0]}m7`, `${notes[1]}m7(♭5)`, `${notes[2]}△7`, `${notes[3]}m7`, `${notes[4]}7`, `${notes[5]}△7`, `${notes[6]}7`]
      },
      {
        name: 'マイナー機能拡張', type: 'special', description: 'メロディックマイナー由来の重要なコード。',
        chords: [`${notes[0]}m6`, `${notes[0]}m(maj7)`, `${notes[3]}7`, `${notes[5]}m7(♭5)`]
      },
      {
        name: 'セカンダリー', type: 'secondary', description: 'マイナーキーにおける一時転調。',
        chords: [`${notes[0]}7`, `${notes[2]}7`, `${notes[6]}7`]
      },
      {
         name: '裏コード (Sub V)', type: 'substitute', description: 'ドミナントの代理コード。',
         chords: [`${flatNote(notes[1])}7`]
      },
      {
        name: 'ディミニッシュ', type: 'diminished', description: 'パッシングなど。',
        chords: [`${notes[6]}dim7`]
      }
    ];
  }
};

export const getNoteDegree = (noteKey: string, chordSymbol: string, keySignature: string = 'C', accidentals: string[] = []): string => {
    const rootMatch = chordSymbol.match(/^([A-G][#b]?)(.*)$/);
    if (!rootMatch) return '';
    const rootNote = rootMatch[1].toLowerCase();
    const qualityStr = rootMatch[2].replace(/♭/g, 'b').replace(/♯/g, '#');
    const normalizedSymbol = rootNote.toUpperCase() + qualityStr;

    const rootVal = NOTE_TO_INT[rootNote];
    if (rootVal === undefined) return '';

    const [n, ] = noteKey.split('/');
    const noteLetter = n.charAt(0).toLowerCase();
    let finalVal = NOTE_TO_INT[noteLetter];
    const fullNoteName = n.toLowerCase();
    if (NOTE_TO_INT[fullNoteName] !== undefined) finalVal = NOTE_TO_INT[fullNoteName];
    finalVal = (finalVal % 12 + 12) % 12; 

    if (finalVal === undefined) return '';

    let diff = finalVal - rootVal;
    if (diff < 0) diff += 12;
    
    const isDim = normalizedSymbol.includes('dim');
    const isHalfDim = normalizedSymbol.includes('m7(b5)') || normalizedSymbol.includes('m7b5');
    const isAug = normalizedSymbol.includes('aug') || normalizedSymbol.includes('#5');
    const isSus = normalizedSymbol.includes('sus');
    const isSix = normalizedSymbol.includes('6') && !normalizedSymbol.includes('13');

    if (diff === 5 && isSus) return '4';
    if (diff === 6 && (isHalfDim || isDim || normalizedSymbol.includes('b5'))) return 'b5';
    if (diff === 8 && isAug) return '#5';
    if (diff === 9) {
        if (isDim) return 'bb7';
        if (isSix) return '6';
    }
    return DEGREE_NAMES[diff];
};

export const isChordTone = (degree: string, chordSymbol: string): boolean => {
    if (degree === 'R') return true;
    let qualityStr = chordSymbol.replace(/^[A-G][#b]?/, '').replace(/♭/g, 'b').replace(/♯/g, '#');
    const isMinor = (qualityStr.includes('m') && !qualityStr.includes('maj') && !qualityStr.includes('Maj') && !qualityStr.includes('dim')) || qualityStr.includes('min');
    const isDim = qualityStr.includes('dim');
    const isDim7 = qualityStr.includes('dim7');
    const isHalfDim = qualityStr.includes('m7b5') || qualityStr.includes('m7(b5)');
    const isAug = qualityStr.includes('aug') || qualityStr.includes('#5');
    const isSus = qualityStr.includes('sus');
    const isMajor7 = qualityStr.includes('maj7') || qualityStr.includes('Maj7') || qualityStr.includes('M7') || qualityStr.includes('△');
    const isDom7 = qualityStr.includes('7') && !isMajor7 && !isDim && !isHalfDim && !isMinor; 
    const isSix = qualityStr.includes('6') && !qualityStr.includes('13');

    if (degree === '5' && !isDim && !isHalfDim && !isAug) return true;
    if (degree === 'b5' && (isDim || isHalfDim || qualityStr.includes('b5'))) return true;
    if (degree === '#5' && isAug) return true;
    if (degree === '4' && isSus) return true;
    if (degree === '3' && !isMinor && !isDim && !isSus) return true;
    if (degree === 'b3' && (isMinor || isDim || isHalfDim)) return true;
    if (degree === '7' && isMajor7) return true;
    if (degree === 'b7' && (isMinor || isDom7 || isHalfDim) && !isMajor7 && !isDim7) return true;
    if ((degree === 'bb7' || degree === '6') && isDim7) return true;
    if (degree === '6' && isSix) return true;
    return false;
}

// Inversion & Voicing Generation
const generateInversions = (notes: number[]): number[][] => {
    const inversions: number[][] = [];
    const sortedNotes = [...notes].sort((a, b) => a - b);
    inversions.push(sortedNotes);
    let currentInv = [...sortedNotes];
    for (let i = 0; i < sortedNotes.length - 1; i++) {
        const bottom = currentInv[0];
        const rest = currentInv.slice(1);
        const nextInv = [...rest, bottom + 12];
        inversions.push(nextInv);
        currentInv = nextInv;
    }
    return inversions;
};

const selectBestVoicing = (candidates: number[][], previousNotes: number[]): number[] => {
    let bestVoicing = candidates[0];
    let minDistance = Infinity;
    const prevAvg = previousNotes.reduce((a, b) => a + b, 0) / previousNotes.length;
    candidates.forEach(cand => {
        const currAvg = cand.reduce((a, b) => a + b, 0) / cand.length;
        const distance = Math.abs(currAvg - prevAvg);
        if (distance < minDistance) {
            minDistance = distance;
            bestVoicing = cand;
        }
    });
    return bestVoicing;
};

export const getChordNotes = (
    symbol: string, 
    rootOctave: number = 3,
    voicing: VoicingMode = 'closed',
    previousNotes: number[] = [] 
): string[] => {
    const rootMatch = symbol.match(/^([A-G][#b]?)(.*)$/);
    if (!rootMatch) return [];
    
    const rootStr = rootMatch[1];
    let qualityStr = rootMatch[2].replace(/♭/g, 'b').replace(/♯/g, '#');
    const rootVal = NOTE_TO_INT[rootStr.toLowerCase()];
    if (rootVal === undefined) return [];

    let isMinor = false;
    let hasFlat5 = false;
    let hasSharp5 = false;
    
    if ((qualityStr.includes('m') && !qualityStr.includes('maj') && !qualityStr.includes('Maj') && !qualityStr.includes('M7') && !qualityStr.includes('dim')) || qualityStr.includes('min')) isMinor = true;
    if (qualityStr.includes('dim')) isMinor = true;
    if (qualityStr.includes('b5') || qualityStr.includes('dim')) hasFlat5 = true;
    if (qualityStr.includes('#5') || qualityStr.includes('aug')) hasSharp5 = true;
    
    const interval3 = isMinor ? 3 : 4;
    const interval5 = hasFlat5 ? 6 : hasSharp5 ? 8 : 7;
    let interval7 = 10; 
    const isMajor7 = qualityStr.includes('maj7') || qualityStr.includes('Maj7') || qualityStr.includes('M7') || qualityStr.includes('△');

    if (isMajor7) interval7 = 11;
    else if (qualityStr.includes('dim7')) interval7 = 9; 
    else if (qualityStr.includes('6')) interval7 = 9; 
    else if (qualityStr === '' || (qualityStr === 'm' && !qualityStr.includes('7'))) interval7 = -1;

    let interval9 = 14; 
    if (qualityStr.includes('b9')) interval9 = 13;
    if (qualityStr.includes('#9')) interval9 = 15;
    
    const allowAutoTension = !qualityStr.includes('b5') && !qualityStr.includes('dim') && !qualityStr.includes('aug');

    let midiNotes: number[] = [];
    const baseRootMidi = (rootOctave + 1) * 12 + rootVal;

    switch (voicing) {
        case 'shell':
            midiNotes.push(baseRootMidi); 
            if (interval7 !== -1) midiNotes.push(baseRootMidi + interval7); else midiNotes.push(baseRootMidi + interval5);
            midiNotes.push(baseRootMidi + 12 + interval3); 
            break;
        case 'drop2':
            midiNotes.push(baseRootMidi); midiNotes.push(baseRootMidi + interval5); 
            if (interval7 !== -1) midiNotes.push(baseRootMidi + interval7); 
            midiNotes.push(baseRootMidi + 12 + interval3); 
            break;
        case 'rootless':
            midiNotes.push(baseRootMidi + interval3); midiNotes.push(baseRootMidi + interval5);
            if (interval7 !== -1) midiNotes.push(baseRootMidi + interval7); 
            if (allowAutoTension || qualityStr.includes('9')) midiNotes.push(baseRootMidi + interval9);
            break;
        case 'standard':
            midiNotes.push(baseRootMidi); midiNotes.push(baseRootMidi + interval3); midiNotes.push(baseRootMidi + interval5);
            if (interval7 !== -1) midiNotes.push(baseRootMidi + interval7);
            if (allowAutoTension || qualityStr.includes('9')) midiNotes.push(baseRootMidi + interval9);
            break;
        case 'closed':
        default:
            midiNotes.push(baseRootMidi); midiNotes.push(baseRootMidi + interval3); midiNotes.push(baseRootMidi + interval5);
            if (interval7 !== -1) midiNotes.push(baseRootMidi + interval7);
            if (qualityStr.includes('9')) midiNotes.push(baseRootMidi + interval9);
            break;
    }
    
    if (previousNotes.length > 0 && (voicing === 'closed' || voicing === 'rootless')) {
        const baseMidiNotes = [...midiNotes];
        const lowerOctave = baseMidiNotes.map(n => n - 12);
        const upperOctave = baseMidiNotes.map(n => n + 12);
        const candidates = [...generateInversions(lowerOctave), ...generateInversions(baseMidiNotes), ...generateInversions(upperOctave)];
        midiNotes = selectBestVoicing(candidates, previousNotes);
    } else if (previousNotes.length === 0 && (voicing === 'closed')) {
        const avg = midiNotes.reduce((a,b)=>a+b,0) / midiNotes.length;
        if (avg < 53) midiNotes = midiNotes.map(n => n + 12); 
        if (avg > 72) midiNotes = midiNotes.map(n => n - 12);
    }

    const pitchStrings: string[] = [];
    midiNotes.forEach(midi => {
        const val = midi % 12;
        const oct = Math.floor(midi / 12) - 1;
        const names = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
        pitchStrings.push(`${names[val]}${oct}`);
    });
    return pitchStrings;
};
