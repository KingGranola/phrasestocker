import { v4 as uuidv4 } from 'uuid';
import { MeasureData, NoteData, NoteDuration, Phrase } from '../types';
import { getChordNotes, getAccidentalsForContext, isNoteInRange, keyToMidi, midiToKey } from './musicTheory';
import { calculateTabPosition } from './tabLogic';
import { getAvailableScales, SCALES } from './ai/scaleDefinitions';
import { selectTargetNote } from './ai/targetLogic';
import { generatePath } from './ai/pathfinding';
import { getInstrumentConstraints, clampToRange, optimizeFingering } from './ai/instrumentLogic';

export interface GenerationSettings {
    density: 'low' | 'medium' | 'high';
    style: number; // 0-100 (Bebop -> Contemporary)
    targetMeasures: number[]; // Indices of measures to generate for
}

const convertPitchFormat = (pitch: string): string => {
    // Converts "C4" -> "c/4", "F#3" -> "f#/3", "Bb3" -> "bb/3"
    const match = pitch.match(/^([A-G][#b]?)(-?\d+)$/);
    if (!match) return 'c/4';
    return `${match[1].toLowerCase()}/${match[2]}`;
};

export const generatePhrase = (
    currentPhrase: Phrase,
    settings: GenerationSettings
): MeasureData[] => {
    const newMeasures = [...currentPhrase.measures];
    const { targetMeasures, style } = settings;
    const instrumentConstraints = getInstrumentConstraints(currentPhrase.instrument);

    // We need to process sequentially to maintain voice leading
    // Find the first measure to generate
    const startIdx = Math.min(...targetMeasures);
    const endIdx = Math.max(...targetMeasures);

    let currentNoteMidi: number | null = null;
    // Try to find the last note of the previous measure for context
    if (startIdx > 0) {
        const prevMeasure = newMeasures[startIdx - 1];
        const lastNote = prevMeasure.notes.slice().reverse().find(n => !n.isRest);
        if (lastNote) {
            currentNoteMidi = keyToMidi(lastNote.keys[0]);
        }
    }

    for (let i = startIdx; i <= endIdx; i++) {
        if (!targetMeasures.includes(i)) continue;

        const measure = newMeasures[i];
        const newNotes: NoteData[] = [];
        const chords = measure.chords;

        // Parse time signature (e.g. "4/4")
        const timeSigStr = measure.timeSignature || "4/4";
        const [beatsPerMeasureStr] = timeSigStr.split('/');
        const beatsPerMeasure = parseInt(beatsPerMeasureStr, 10);

        // If no chords, assume C major or key center
        if (chords.length === 0) {
            // Fallback or skip
            continue;
        }

        // Sort chords
        const sortedChords = [...chords].sort((a, b) => a.position - b.position);

        // Track current beat position in measure
        let currentBeatPos = 0.0;

        // For each chord, generate a phrase segment
        for (let cIdx = 0; cIdx < sortedChords.length; cIdx++) {
            const chord = sortedChords[cIdx];
            const nextChord = sortedChords[cIdx + 1] || (i < newMeasures.length - 1 ? newMeasures[i + 1].chords[0] : null);

            // Determine duration of this chord
            // If it's the last chord in measure, it lasts until end of measure
            let nextPos = nextChord ? nextChord.position : beatsPerMeasure;

            // If next chord is in next measure, current chord lasts until end of this measure
            if (nextChord && sortedChords[cIdx + 1] === undefined) {
                nextPos = beatsPerMeasure;
            } else if (nextChord && nextChord.position < chord.position) {
                // Should not happen if sorted, but safety check
                nextPos = beatsPerMeasure;
            }

            const durationBeats = nextPos - chord.position;

            // If duration is 0 or negative, skip
            if (durationBeats <= 0) continue;

            // 1. Select Scale
            const availableScales = getAvailableScales(chord.symbol);
            const selectedScaleKey = availableScales[0]; // Pick first priority for now
            const scaleDef = SCALES[selectedScaleKey];

            // 2. Select Target for NEXT chord (or end of phrase)
            let targetMidi: number;
            if (nextChord) {
                const targetKey = selectTargetNote(nextChord, currentNoteMidi, currentPhrase.keySignature);
                targetMidi = keyToMidi(targetKey);
            } else {
                targetMidi = currentNoteMidi ? currentNoteMidi : 60;
            }

            // 3. Generate Path
            if (currentNoteMidi === null) {
                const startKey = selectTargetNote(chord, null, currentPhrase.keySignature);
                currentNoteMidi = keyToMidi(startKey);
            }

            const generatedNotes = generatePath(
                currentNoteMidi,
                targetMidi,
                scaleDef,
                durationBeats,
                currentPhrase.keySignature,
                style
            );

            // 4. Convert to NoteData
            generatedNotes.forEach(noteInfo => {
                let noteMidi = keyToMidi(noteInfo.key);

                // Apply Range Constraints
                if (!noteInfo.isRest) {
                    noteMidi = clampToRange(noteMidi, instrumentConstraints);
                }

                // We don't calculate Tab Position here anymore, we do it in a batch later for optimization
                // But we need a placeholder
                const noteKey = midiToKey(noteMidi, currentPhrase.keySignature);

                newNotes.push({
                    id: uuidv4(),
                    keys: [noteKey],
                    duration: noteInfo.duration,
                    isRest: !!noteInfo.isRest,
                    dotted: false,
                    tuplet: !!noteInfo.tuplet,
                    accidentals: noteInfo.isRest ? [] : getAccidentalsForContext(noteKey, currentPhrase.keySignature),
                    string: 0, // Placeholder
                    fret: 0    // Placeholder
                });

                if (!noteInfo.isRest) {
                    currentNoteMidi = noteMidi;
                }
            });

            currentBeatPos += durationBeats;
        }

        // Final Duration Check & Fix
        // Calculate total duration of generated notes
        let totalDuration = 0;
        newNotes.forEach(n => {
            let durVal = n.duration === '8' ? 0.5 : n.duration === 'q' ? 1.0 : n.duration === 'h' ? 2.0 : n.duration === 'w' ? 4.0 : 0;
            if (n.tuplet) {
                // Triplet 8th: 3 notes = 1 beat. So 1 note = 0.333...
                // But we generated them in groups of 3 for 1 beat.
                // Simplified calculation: if tuplet, assume it's part of a 1-beat group.
                // Actually, our generator subtracts 1.0 for 3 notes.
                // So each note is 1/3 beat.
                durVal = 1.0 / 3.0;
            }
            totalDuration += durVal;
        });

        // Round to avoid float errors
        totalDuration = Math.round(totalDuration * 100) / 100;

        // Fill remaining space with rest if any (or extend last note)
        if (totalDuration < beatsPerMeasure) {
            const missing = beatsPerMeasure - totalDuration;
            // Simplified filling
            let remaining = missing;
            while (remaining >= 0.5) {
                let dur: NoteDuration = '8';
                let val = 0.5;
                if (remaining >= 1.0) {
                    dur = 'q';
                    val = 1.0;
                }

                newNotes.push({
                    id: uuidv4(),
                    keys: ['b/4'], // Dummy key for rest
                    duration: dur,
                    isRest: true,
                    dotted: false,
                    accidentals: [],
                    string: 0,
                    fret: 0
                });
                remaining -= val;
            }
        }

        // 5. Optimize Fingering (Batch)
        const optimizedNotes = optimizeFingering(newNotes, instrumentConstraints);

        newMeasures[i] = { ...measure, notes: optimizedNotes };
    }

    return newMeasures;
};
