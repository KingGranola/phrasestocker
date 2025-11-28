

import { NoteData, InstrumentConfig } from '../types';
import { INSTRUMENTS } from '../constants'; 

// keyToMidiはmusicTheory.tsにあるが、ここでは依存関係解決のため単純な実装を持つか、musicTheoryをCoreとUtilityに分けるべきだが、
// 今回は単純化のためmusicTheoryからkeyToMidiをインポートする形にする。
// ※実際の実行順序では musicTheory -> tabLogic の順に読み込まれるように配慮する。

// 循環参照回避のため、必要なヘルパーをここで再定義するか、引数で受け取る設計にします。
// ここでは keyToMidi ロジックを内部で持つか、musicTheory.ts の軽量版として実装します。

const simpleKeyToMidi = (key: string): number => {
  const [noteStr, octave] = key.split('/');
  const noteMap: Record<string, number> = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
  const root = noteStr.charAt(0).toLowerCase();
  const accidental = noteStr.slice(1);
  let base = noteMap[root];
  if (accidental.includes('#')) base += 1;
  if (accidental.includes('b')) base -= 1;
  return base + (parseInt(octave) + 1) * 12;
};

// ==========================================
// TAB譜（弦・フレット）計算ロジック
// ==========================================

export const calculateTabPosition = (
  noteKey: string,
  instrument: 'guitar' | 'bass',
  previousNote?: NoteData
): { string: number; fret: number } => {
  const config = INSTRUMENTS[instrument];
  const writtenMidi = simpleKeyToMidi(noteKey);
  const realMidi = writtenMidi + config.transpose; 
  
  const candidates: { string: number; fret: number; score: number }[] = [];

  config.strings.forEach((stringMidi, index) => {
    const fret = realMidi - stringMidi;
    
    if (fret >= 0 && fret <= 24) {
      let score = fret; 
      // ローポジション優先 (0-4フレットはスコアを良くする)
      if (fret <= 4) score -= 5;
      
      // 前の音符がある場合、運指の近さを考慮
      if (previousNote && previousNote.string && previousNote.fret !== undefined) {
         const stringDiff = Math.abs((index + 1) - previousNote.string);
         const fretDiff = Math.abs(fret - previousNote.fret);
         // 弦移動のコストを高めに設定
         score += (stringDiff * 4) + (fretDiff * 1);
      }

      candidates.push({ string: index + 1, fret, score });
    }
  });

  candidates.sort((a, b) => a.score - b.score);
  
  if (candidates.length > 0) {
    return { string: candidates[0].string, fret: candidates[0].fret };
  }

  // デフォルト値
  return { string: 1, fret: 0 };
};

export const getValidTabPositions = (
    noteKey: string,
    instrument: 'guitar' | 'bass'
): { string: number; fret: number }[] => {
    const config = INSTRUMENTS[instrument];
    const writtenMidi = simpleKeyToMidi(noteKey);
    const realMidi = writtenMidi + config.transpose;

    const candidates: { string: number; fret: number }[] = [];

    config.strings.forEach((stringMidi, index) => {
        const fret = realMidi - stringMidi;
        if (fret >= 0 && fret <= 24) {
            candidates.push({ string: index + 1, fret });
        }
    });

    return candidates.sort((a, b) => a.string - b.string);
};