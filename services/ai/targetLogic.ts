import { ChordEvent } from '../../types';
import { getChordNotes, keyToMidi, midiToKey } from '../musicTheory';

// Target Selection Logic
// Based on "Jazz Phrase Generation Logic (Ver 2.0)"

export const selectTargetNote = (
    nextChord: ChordEvent,
    currentNoteMidi: number | null,
    keySignature: string
): string => {
    // 1. Get Guide Tones (3rd and 7th) of next chord
    // We get chord notes in a standard voicing (Root, 3rd, 5th, 7th)
    // We need to identify which is 3rd and 7th.
    // getChordNotes returns pitch strings (e.g. "C3", "E3").

    // Strategy: Get chord notes for a few octaves to find the closest one
    const baseOctave = currentNoteMidi ? Math.floor(currentNoteMidi / 12) - 1 : 3;

    // Get notes for base octave and adjacent octaves
    const notesLow = getChordNotes(nextChord.symbol, baseOctave - 1, 'standard');
    const notesMid = getChordNotes(nextChord.symbol, baseOctave, 'standard');
    const notesHigh = getChordNotes(nextChord.symbol, baseOctave + 1, 'standard');

    // Combine and parse to MIDI
    const allNotes = [...notesLow, ...notesMid, ...notesHigh];
    const allNotesMidi = allNotes.map(n => ({ key: n, midi: keyToMidi(convertPitchFormat(n)) }));

    // Identify 3rd and 7th
    // In 'standard' voicing from chordLogic: [Root, 3rd, 5th, 7th, (9th)]
    // We can assume index 1 is 3rd, index 3 is 7th (if exists)
    // But getChordNotes returns a flat array of strings.
    // We need to know the degree.
    // Let's use a helper that returns degrees + notes? 
    // Or just rely on the order from 'standard' voicing: Root, 3rd, 5th, 7th, 9th

    // Let's filter candidates based on degree logic (simplified by index for now)
    // Standard voicing: 0=Root, 1=3rd, 2=5th, 3=7th
    const candidates: { midi: number, priority: 'high' | 'medium' }[] = [];

    [notesLow, notesMid, notesHigh].forEach(octaveNotes => {
        if (octaveNotes.length > 1) candidates.push({ midi: keyToMidi(convertPitchFormat(octaveNotes[1])), priority: 'high' }); // 3rd
        if (octaveNotes.length > 3) candidates.push({ midi: keyToMidi(convertPitchFormat(octaveNotes[3])), priority: 'high' }); // 7th
        if (octaveNotes.length > 0) candidates.push({ midi: keyToMidi(convertPitchFormat(octaveNotes[0])), priority: 'medium' }); // Root
        if (octaveNotes.length > 2) candidates.push({ midi: keyToMidi(convertPitchFormat(octaveNotes[2])), priority: 'medium' }); // 5th
    });

    if (candidates.length === 0) return 'c/4'; // Fallback

    // 2. Select best target based on Voice Leading
    // If currentNoteMidi is null (start of phrase), pick a random high priority note in middle range
    if (currentNoteMidi === null) {
        const midRange = candidates.filter(c => c.midi >= 48 && c.midi <= 72 && c.priority === 'high');
        const pool = midRange.length > 0 ? midRange : candidates;
        const selected = pool[Math.floor(Math.random() * pool.length)];
        return midiToKey(selected.midi, keySignature);
    }

    // Find closest target
    // Prioritize High priority targets
    let bestTarget = candidates[0];
    let minDist = Infinity;

    // First pass: High priority only
    const highPriority = candidates.filter(c => c.priority === 'high');
    if (highPriority.length > 0) {
        highPriority.forEach(c => {
            const dist = Math.abs(c.midi - currentNoteMidi);
            if (dist < minDist) {
                minDist = dist;
                bestTarget = c;
            }
        });
    }

    // If distance is too large (> 5 semitones), consider medium priority
    if (minDist > 5) {
        candidates.forEach(c => {
            const dist = Math.abs(c.midi - currentNoteMidi);
            if (dist < minDist) {
                minDist = dist;
                bestTarget = c;
            }
        });
    }

    return midiToKey(bestTarget.midi, keySignature);
};

const convertPitchFormat = (pitch: string): string => {
    const match = pitch.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 'c/4';
    return `${match[1].toLowerCase()}/${match[2]}`;
};
