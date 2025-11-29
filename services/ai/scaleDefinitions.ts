// Scale Definitions and Chord-Scale Mapping
// Based on "Jazz Phrase Generation Logic (Ver 2.0)"

export type ScaleType =
    | 'ionian' | 'lydian'
    | 'dorian' | 'minor_pentatonic'
    | 'mixolydian' | 'altered' | 'hmp5_down' | 'combination_diminished' | 'whole_tone'
    | 'locrian' | 'locrian_natural2'
    | 'diminished_whole_half' | 'chord_tones';

export interface ScaleDefinition {
    name: string;
    intervals: number[]; // Semitones from root
    avoidNotes?: number[]; // Intervals that are avoid notes
}

export const SCALES: Record<ScaleType, ScaleDefinition> = {
    ionian: {
        name: 'Ionian',
        intervals: [0, 2, 4, 5, 7, 9, 11],
        avoidNotes: [5] // 4th
    },
    lydian: {
        name: 'Lydian',
        intervals: [0, 2, 4, 6, 7, 9, 11],
        avoidNotes: []
    },
    dorian: {
        name: 'Dorian',
        intervals: [0, 2, 3, 5, 7, 9, 10],
        avoidNotes: [9] // 6th (sometimes avoid, context dependent)
    },
    minor_pentatonic: {
        name: 'Minor Pentatonic',
        intervals: [0, 3, 5, 7, 10],
        avoidNotes: []
    },
    mixolydian: {
        name: 'Mixolydian',
        intervals: [0, 2, 4, 5, 7, 9, 10],
        avoidNotes: [5] // 4th
    },
    altered: {
        name: 'Altered',
        intervals: [0, 1, 3, 4, 6, 8, 10], // 1, b9, #9, 3, #11, b13, b7
        avoidNotes: []
    },
    hmp5_down: {
        name: 'HMP5 Down',
        intervals: [0, 1, 4, 5, 7, 8, 10], // 1, b9, 3, 4, 5, b13, b7
        avoidNotes: []
    },
    combination_diminished: {
        name: 'Combination of Diminished',
        intervals: [0, 1, 3, 4, 6, 7, 9, 10], // Half-Whole
        avoidNotes: []
    },
    whole_tone: {
        name: 'Whole Tone',
        intervals: [0, 2, 4, 6, 8, 10],
        avoidNotes: []
    },
    locrian: {
        name: 'Locrian',
        intervals: [0, 1, 3, 5, 6, 8, 10],
        avoidNotes: [1] // b2
    },
    locrian_natural2: {
        name: 'Locrian #2',
        intervals: [0, 2, 3, 5, 6, 8, 10],
        avoidNotes: []
    },
    diminished_whole_half: {
        name: 'Diminished (Whole-Half)',
        intervals: [0, 2, 3, 5, 6, 8, 9, 11],
        avoidNotes: []
    },
    chord_tones: {
        name: 'Chord Tones',
        intervals: [0, 4, 7], // Placeholder, dynamic based on chord
        avoidNotes: []
    }
};

export const getAvailableScales = (chordSymbol: string): ScaleType[] => {
    // Normalize symbol
    const rootMatch = chordSymbol.match(/^([A-G][#b]?)(.*)$/);
    if (!rootMatch) return ['ionian'];

    let quality = rootMatch[2].replace(/♭/g, 'b').replace(/♯/g, '#');

    // Major 7 (Ionian, Lydian)
    if (quality.includes('maj7') || quality.includes('Maj7') || quality.includes('M7') || quality.includes('△')) {
        return ['ionian', 'lydian'];
    }

    // Minor 7 (b5) (Locrian, Locrian #2)
    if (quality.includes('m7b5') || quality.includes('m7(b5)')) {
        return ['locrian', 'locrian_natural2'];
    }

    // Minor 7 (Dorian, Minor Pentatonic)
    if (quality.includes('m7') || quality.includes('min7')) {
        return ['dorian', 'minor_pentatonic'];
    }

    // Diminished (Diminished Whole-Half)
    if (quality.includes('dim')) {
        return ['diminished_whole_half'];
    }

    // Dominant 7 (Mixolydian, Altered, etc.)
    if (quality.includes('7')) {
        // Check for alterations in symbol to narrow down
        if (quality.includes('alt')) return ['altered'];
        if (quality.includes('b9') || quality.includes('#9') || quality.includes('#5') || quality.includes('b13')) {
            return ['altered', 'hmp5_down', 'combination_diminished', 'whole_tone'];
        }
        return ['mixolydian', 'altered', 'hmp5_down', 'combination_diminished', 'whole_tone'];
    }

    // Default
    return ['ionian'];
};
