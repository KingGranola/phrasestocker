import { NoteData, InstrumentConfig } from '../../types';
import { keyToMidi, midiToKey } from '../musicTheory';

export interface InstrumentConstraints {
    tuning: number[]; // MIDI numbers of open strings (low to high)
    maxFret: number;
    preferredPositionWidth: number; // e.g. 4 or 5 frets
    stringSkipPenalty: number;
    positionShiftPenalty: number;
    minMidi: number;
    maxMidi: number;
}

export const BASS_CONSTRAINTS: InstrumentConstraints = {
    tuning: [28, 33, 38, 43], // E1, A1, D2, G2
    maxFret: 20,
    preferredPositionWidth: 4,
    stringSkipPenalty: 2.0,
    positionShiftPenalty: 1.5,
    minMidi: 28, // E1
    maxMidi: 63  // Eb4
};

export const GUITAR_CONSTRAINTS: InstrumentConstraints = {
    tuning: [40, 45, 50, 55, 59, 64], // E2, A2, D3, G3, B3, E4
    maxFret: 22,
    preferredPositionWidth: 5,
    stringSkipPenalty: 1.5,
    positionShiftPenalty: 1.0,
    minMidi: 40, // E2
    maxMidi: 88  // E6
};

export const getInstrumentConstraints = (instrumentName: string): InstrumentConstraints => {
    if (instrumentName === 'bass') return BASS_CONSTRAINTS;
    return GUITAR_CONSTRAINTS;
};

export const isPlayable = (midi: number, constraints: InstrumentConstraints): boolean => {
    return midi >= constraints.minMidi && midi <= constraints.maxMidi;
};

export const clampToRange = (midi: number, constraints: InstrumentConstraints): number => {
    if (midi < constraints.minMidi) {
        // Octave up until in range
        let m = midi;
        while (m < constraints.minMidi) m += 12;
        return m;
    }
    if (midi > constraints.maxMidi) {
        // Octave down until in range
        let m = midi;
        while (m > constraints.maxMidi) m -= 12;
        return m;
    }
    return midi;
};

// Simple fingering optimization
// This is a greedy approach for now. A full Dijkstra would be better but this is MVP.
export const optimizeFingering = (notes: NoteData[], constraints: InstrumentConstraints): NoteData[] => {
    if (notes.length === 0) return notes;

    // Initial position: determine based on first note's best location (e.g. lowest fret possible or middle of neck)
    // For bass, maybe start around 5th fret if possible?
    let currentPosition = 0; // Fret number of index finger

    // Helper to find all locations for a midi note
    const findLocations = (midi: number) => {
        const locations: { string: number, fret: number }[] = [];
        constraints.tuning.forEach((openMidi, stringIdx) => {
            const fret = midi - openMidi;
            if (fret >= 0 && fret <= constraints.maxFret) {
                locations.push({ string: stringIdx + 1, fret }); // string is 1-based in NoteData usually?
            }
        });
        return locations;
    };

    // Determine start position from first note
    const firstNoteMidi = keyToMidi(notes[0].keys[0]); // Assuming single note
    const firstLocs = findLocations(firstNoteMidi);

    // Pick location closest to 5th fret (arbitrary "middle" preference) or 0 if available
    // Let's prefer lower positions for walking bass, mid for solo.
    // Defaulting to "lowest valid fret" for stability.
    if (firstLocs.length > 0) {
        // Sort by fret number
        firstLocs.sort((a, b) => a.fret - b.fret);
        currentPosition = firstLocs[0].fret;
    }

    const optimizedNotes = notes.map((note, index) => {
        if (note.isRest) return note;

        const midi = keyToMidi(note.keys[0]);
        const locations = findLocations(midi);

        if (locations.length === 0) {
            // Should not happen if clamped, but safety fallback
            return note;
        }

        // Find best location based on currentPosition
        // Cost = distance from current box + string skip
        // Box is [currentPosition, currentPosition + width]

        let bestLoc = locations[0];
        let minCost = Infinity;

        locations.forEach(loc => {
            // Check if inside box
            const inBox = loc.fret >= currentPosition && loc.fret <= currentPosition + constraints.preferredPositionWidth;

            let cost = 0;
            if (!inBox) {
                // Distance from box
                const dist = Math.min(Math.abs(loc.fret - currentPosition), Math.abs(loc.fret - (currentPosition + constraints.preferredPositionWidth)));
                cost += dist * constraints.positionShiftPenalty;
            }

            // String skip (relative to previous note if exists)
            if (index > 0) {
                const prevNote = notes[index - 1];
                if (!prevNote.isRest && prevNote.string) {
                    const stringDiff = Math.abs(loc.string - prevNote.string);
                    if (stringDiff > 1) {
                        cost += (stringDiff - 1) * constraints.stringSkipPenalty;
                    }
                }
            }

            if (cost < minCost) {
                minCost = cost;
                bestLoc = loc;
            }
        });

        // Update current position if we moved significantly?
        // Simple "Box System": If we pick a note far outside, we shift the box.
        if (bestLoc.fret < currentPosition || bestLoc.fret > currentPosition + constraints.preferredPositionWidth) {
            // Shift position to center on this new note? Or just set it to this note's fret?
            // Let's set index finger to this fret (or slightly lower)
            currentPosition = Math.max(0, bestLoc.fret - 1);
        }

        return {
            ...note,
            string: bestLoc.string,
            fret: bestLoc.fret
        };
    });

    return optimizedNotes;
};
