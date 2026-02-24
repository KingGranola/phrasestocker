import { v4 as uuidv4 } from 'uuid';
import { MeasureData, NoteData, NoteDuration, Phrase } from '../types';
import { getAccidentalsForContext, keyToMidi, midiToKey } from './musicTheory';
import { getAvailableScales, SCALES } from './ai/scaleDefinitions';
import { selectTargetNote } from './ai/targetLogic';
import { generatePath } from './ai/pathfinding';
import { getInstrumentConstraints, clampToRange, optimizeFingering } from './ai/instrumentLogic';

export interface GenerationSettings {
    density: 'low' | 'medium' | 'high';
    style: number; // 0-100 (Bebop -> Contemporary)
    targetMeasures: number[]; // Indices of measures to generate for
}

const noteDurationInBeats = (note: Pick<NoteData, 'duration' | 'dotted' | 'tuplet'>): number => {
    let beats = note.duration in NOTE_DURATION_MAP ? NOTE_DURATION_MAP[note.duration] : 0;
    if (note.dotted) beats *= 1.5;
    if (note.tuplet) beats = (beats * 2) / 3;
    return beats;
};
const NOTE_DURATION_MAP: Record<NoteDuration, number> = { w: 4, h: 2, q: 1, '8': 0.5, '16': 0.25, '32': 0.125 };
const REST_FILL_ORDER: NoteDuration[] = ['q', '8', '16', '32'];

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

        }

        // Final Duration Check & Fix
        const totalDuration = Number(newNotes.reduce((sum, note) => sum + noteDurationInBeats(note), 0).toFixed(4));

        // Fill remaining space with rest if any (or extend last note)
        if (totalDuration < beatsPerMeasure) {
            let remaining = Number((beatsPerMeasure - totalDuration).toFixed(4));
            let safety = 0;
            while (remaining > 0.01 && safety < 64) {
                const duration =
                    REST_FILL_ORDER.find((candidate) => NOTE_DURATION_MAP[candidate] <= remaining + 0.0001) ?? '32';
                const value = NOTE_DURATION_MAP[duration];
                newNotes.push({
                    id: uuidv4(),
                    keys: ['b/4'], // Dummy key for rest
                    duration,
                    isRest: true,
                    dotted: false,
                    accidentals: [],
                    string: 0,
                    fret: 0
                });
                remaining = Number((remaining - value).toFixed(4));
                safety += 1;
            }
        }

        // 5. Optimize Fingering (Batch)
        const optimizedNotes = optimizeFingering(newNotes, instrumentConstraints);

        newMeasures[i] = { ...measure, notes: optimizedNotes };
    }

    return newMeasures;
};
