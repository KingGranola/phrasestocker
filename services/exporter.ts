
import { Phrase, ChordEvent } from '../types';
import { DURATION_VALUES, INSTRUMENTS } from '../constants';
import { keyToMidi } from './musicTheory';
import { getChordNotes, getNoteDegree } from './chordLogic';

// ==========================================
// 共通ヘルパー関数
// ==========================================
const downloadBlob = (blob: Blob, filename: string) => { const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url); };
const toVLQ = (num: number): number[] => { let buffer = [num & 0x7f]; while ((num >>= 7)) { buffer.push((num & 0x7f) | 0x80); } return buffer.reverse(); };
const numToBytes = (num: number, bytes: number): number[] => { const arr = []; for (let i = bytes - 1; i >= 0; i--) { arr.push((num >> (8 * i)) & 0xFF); } return arr; };
const strToBytes = (str: string): number[] => str.split('').map(c => c.charCodeAt(0));

export const exportToMidi = (phrase: Phrase) => {
  const TICKS_PER_QUARTER = 480; 
  const createTrack = (events: number[]): number[] => { const lengthBytes = numToBytes(events.length, 4); return [...strToBytes('MTrk'), ...lengthBytes, ...events]; };
  let track0Events: number[] = [];
  const mpqn = Math.floor(60000000 / phrase.bpm);
  track0Events.push(0x00, 0xFF, 0x51, 0x03, ...numToBytes(mpqn, 3)); 
  track0Events.push(0x00, 0xFF, 0x58, 0x04, 0x04, 0x02, 0x18, 0x08); 
  track0Events.push(0x00, 0xFF, 0x2F, 0x00);
  let track1Events: number[] = []; let currentTick = 0; let lastEventTick = 0;
  const programNum = phrase.instrument === 'guitar' ? 26 : 33; 
  track1Events.push(0x00, 0xC0, programNum); 
  phrase.measures.forEach(measure => {
    measure.notes.forEach(note => {
      let durationVal = DURATION_VALUES[note.duration]; if (note.dotted) durationVal *= 1.5; if (note.tuplet) durationVal *= (2/3);
      const durationTicks = Math.round(durationVal * TICKS_PER_QUARTER);
      if (note.isRest) { currentTick += durationTicks; } else {
        const midiNote = keyToMidi(note.keys[0]); const soundingNote = midiNote + INSTRUMENTS[phrase.instrument].transpose; const velocity = 100;
        const deltaOn = currentTick - lastEventTick; track1Events.push(...toVLQ(deltaOn), 0x90, soundingNote, velocity); lastEventTick = currentTick;
        currentTick += durationTicks; const deltaOff = currentTick - lastEventTick; track1Events.push(...toVLQ(deltaOff), 0x80, soundingNote, 0); lastEventTick = currentTick;
      }
    });
  });
  track1Events.push(0x00, 0xFF, 0x2F, 0x00);
  let track2Events: number[] = []; currentTick = 0; lastEventTick = 0;
  track2Events.push(0x00, 0xC1, 4); 
  phrase.measures.forEach(measure => {
    const measureStartTick = currentTick;
    const sortedChords = [...measure.chords].sort((a, b) => a.position - b.position);
    if (sortedChords.length === 0) { currentTick += 4 * TICKS_PER_QUARTER; return; }
    sortedChords.forEach((chord, idx) => {
        const absStartTick = measureStartTick + Math.round(chord.position * TICKS_PER_QUARTER);
        let nextPos = 4; if (idx < sortedChords.length - 1) { nextPos = sortedChords[idx + 1].position; }
        const durationBeats = nextPos - chord.position; const durationTicks = Math.round(durationBeats * TICKS_PER_QUARTER);
        const noteNames = getChordNotes(chord.symbol, 3);
        const notes = noteNames.map(n => { const match = n.match(/^([A-Ga-g][#b]?)([0-9]+)$/); if(!match) return 60; return keyToMidi(`${match[1].toLowerCase()}/${match[2]}`); });
        const deltaOn = absStartTick - lastEventTick;
        notes.forEach((n, i) => { const d = i === 0 ? deltaOn : 0; track2Events.push(...toVLQ(d), 0x91, n, 80); }); lastEventTick = absStartTick;
        const absEndTick = absStartTick + durationTicks; const deltaOff = absEndTick - lastEventTick;
        notes.forEach((n, i) => { const d = i === 0 ? deltaOff : 0; track2Events.push(...toVLQ(d), 0x81, n, 0); }); lastEventTick = absEndTick;
    });
    currentTick = measureStartTick + (4 * TICKS_PER_QUARTER);
  });
  track2Events.push(0x00, 0xFF, 0x2F, 0x00);
  const header = [...strToBytes('MThd'), ...numToBytes(6, 4), ...numToBytes(1, 2), ...numToBytes(3, 2), ...numToBytes(TICKS_PER_QUARTER, 2)];
  const smfData = [...header, ...createTrack(track0Events), ...createTrack(track1Events), ...createTrack(track2Events)];
  const blob = new Blob([new Uint8Array(smfData)], { type: 'audio/midi' });
  downloadBlob(blob, `${phrase.name.replace(/\s+/g, '_')}.mid`);
};

export const exportToMusicXML = (phrase: Phrase, options: { includeDegrees: boolean } = { includeDegrees: false }) => {
  const DIVISIONS = 480; 
  let xml = `<?xml version="1.0" encoding="UTF-8"?><!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN" "http://www.musicxml.org/dtds/partwise.dtd"><score-partwise version="3.1"><work><work-title>${phrase.name}</work-title></work><part-list><score-part id="P1"><part-name>${phrase.instrument === 'guitar' ? 'Guitar' : 'Bass'}</part-name></score-part></part-list><part id="P1">\n`;
  const getFifths = (keySig: string): number => { const map: Record<string, number> = { 'C': 0, 'G': 1, 'D': 2, 'A': 3, 'E': 4, 'B': 5, 'F#': 6, 'C#': 7, 'F': -1, 'Bb': -2, 'Eb': -3, 'Ab': -4, 'Db': -5, 'Gb': -6, 'Cb': -7 }; return map[keySig] || 0; };
  const getPitchXML = (vexKey: string): string => { const [notePart, octaveStr] = vexKey.split('/'); const step = notePart.charAt(0).toUpperCase(); const accidental = notePart.substring(1); const octave = parseInt(octaveStr); let alter = 0; if (accidental === '#') alter = 1; if (accidental === 'b') alter = -1; return `<pitch><step>${step}</step>${alter !== 0 ? `<alter>${alter}</alter>` : ''}<octave>${octave}</octave></pitch>`; };
  const getHarmonyXML = (chord: ChordEvent): string => { const rootMatch = chord.symbol.match(/^([A-G][#b]?)(.*)$/); if (!rootMatch) return ''; const root = rootMatch[1]; const qualityStr = rootMatch[2]; let kind = 'major'; let text = qualityStr; if (qualityStr.includes('m') && !qualityStr.includes('maj')) kind = 'minor'; if (qualityStr.includes('7')) kind = 'dominant'; if (qualityStr.includes('maj7') || qualityStr.includes('△')) kind = 'major-seventh'; if (qualityStr.includes('m7')) kind = 'minor-seventh'; if (qualityStr.includes('dim')) kind = 'diminished'; const step = root.charAt(0); const acc = root.substring(1); let alter = 0; if (acc === '#') alter = 1; if (acc === 'b') alter = -1; return `<harmony><root><root-step>${step}</root-step>${alter !== 0 ? `<root-alter>${alter}</root-alter>` : ''}</root><kind text="${text}">${kind}</kind></harmony>`; };

  phrase.measures.forEach((measure, mIndex) => {
    xml += `    <measure number="${mIndex + 1}">\n`;
    if (mIndex === 0) { const clefSign = phrase.instrument === 'guitar' ? 'G' : 'F'; const clefLine = phrase.instrument === 'guitar' ? 2 : 4; xml += `      <attributes><divisions>${DIVISIONS}</divisions><key><fifths>${getFifths(phrase.keySignature)}</fifths></key><time><beats>4</beats><beat-type>4</beat-type></time><clef><sign>${clefSign}</sign><line>${clefLine}</line>${phrase.instrument === 'guitar' ? '<clef-octave-change>-1</clef-octave-change>' : ''}</clef><staff-details><staff-lines>5</staff-lines></staff-details></attributes>\n`; }
    measure.chords.forEach(chord => { xml += `      ${getHarmonyXML(chord)}\n`; });
    let currentBeat = 0; 
    measure.notes.forEach(note => {
        let durationVal = DURATION_VALUES[note.duration]; if (note.dotted) durationVal *= 1.5; if (note.tuplet) durationVal *= (2/3); const xmlDuration = Math.round(durationVal * DIVISIONS);
        let type = 'quarter'; if (note.duration === 'w') type = 'whole'; if (note.duration === 'h') type = 'half'; if (note.duration === '8') type = 'eighth'; if (note.duration === '16') type = '16th'; if (note.duration === '32') type = '32nd';
        let degreeXML = '';
        if (options.includeDegrees && !note.isRest) {
             const activeChord = [...measure.chords].filter(c => c.position <= currentBeat).sort((a, b) => b.position - a.position)[0];
             if (activeChord) { const degree = getNoteDegree(note.keys[0], activeChord.symbol, phrase.keySignature, note.accidentals); if (degree) { degreeXML = `<lyric number="1"><syllabic>single</syllabic><text>${degree}</text></lyric>`; } }
        }
        xml += `      <note>${note.isRest ? '<rest/>' : getPitchXML(note.keys[0])}<duration>${xmlDuration}</duration><type>${type}</type>${note.dotted ? '<dot/>' : ''}${note.accidentals.includes('#') ? '<accidental>sharp</accidental>' : ''}${note.accidentals.includes('b') ? '<accidental>flat</accidental>' : ''}${note.accidentals.includes('n') ? '<accidental>natural</accidental>' : ''}${!note.isRest ? `<notations><technical><string>${note.string}</string><fret>${note.fret}</fret></technical></notations>` : ''}${degreeXML}</note>\n`;
      currentBeat += durationVal;
    });
    xml += `    </measure>\n`;
  });
  xml += `  </part></score-partwise>`;
  const blob = new Blob([xml], { type: 'application/vnd.recordare.musicxml+xml' });
  downloadBlob(blob, `${phrase.name.replace(/\s+/g, '_')}.musicxml`);
};
