

// 基本的な音符の型定義
export type NoteDuration = 'w' | 'h' | 'q' | '8' | '16' | '32';

export interface NoteData {
  id: string;
  keys: string[]; // 例: ["c/4"]
  duration: NoteDuration;
  isRest: boolean;
  dotted: boolean;
  tuplet?: boolean; // 3連符フラグ
  accidentals: string[]; // 例: ["#"]
  // タブ譜用データ
  string?: number;
  fret?: number;
  isManualTab?: boolean;
}

export interface MeasureData {
  id: string;
  notes: NoteData[];
  timeSignature: string; // "4/4" 固定
  chords: ChordEvent[];
}

export interface ChordEvent {
  id: string;
  position: number; // 0.0 - 4.0 (小節内の拍位置)
  symbol: string; // 例: "Cm7", "F7"
}

export interface Phrase {
  id: string;
  name: string;
  tags: string[];
  instrument: 'guitar' | 'bass';
  bpm: number;
  keySignature: string; // 例: "C", "F"
  scale: 'major' | 'minor'; // Added scale support
  measures: MeasureData[];
  updatedAt: number;
}

export interface ChordCategory {
  name: string;
  type: string;
  description: string;
  chords: string[];
}

export type InputMode = 'entry' | 'select' | 'eraser';

export type VoicingMode = 'closed' | 'shell' | 'drop2' | 'rootless' | 'standard';

export interface AppState {
  currentPhrase: Phrase;
  library: Phrase[];
  selectedNoteId: string | null;
  inputMode: InputMode;
  isPlaying: boolean;
  showTab: boolean;
  activeDuration: NoteDuration;
  activeDotted: boolean;
  activeRest: boolean;
  activeTriplet: boolean; // Added
}

// 楽器の定義
export interface InstrumentConfig {
  name: string;
  strings: number[]; // 各弦のMIDIノート番号 (高い弦 -> 低い弦)
  clef: 'treble' | 'bass';
  transpose: number; // MIDI shift from Written to Real
  minMidi: number; // Lowest playable note (Real MIDI)
  maxMidi: number; // Highest playable note (Real MIDI)
}