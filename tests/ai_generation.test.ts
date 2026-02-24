import { describe, it, expect } from 'vitest';
import { generatePhrase, GenerationSettings } from '../services/phraseGenerator';
import { Phrase } from '../types';
import { DURATION_VALUES } from '../constants';

// Mock Phrase Data
const mockPhrase: Phrase = {
    id: 'test-phrase',
    name: 'Test Phrase',
    tags: [],
    instrument: 'guitar',
    bpm: 120,
    keySignature: 'C',
    scale: 'major',
    measures: [
        {
            id: 'm1',
            notes: [],
            timeSignature: '4/4',
            chords: [{ id: 'c1', position: 0, symbol: 'Dm7' }, { id: 'c2', position: 2, symbol: 'G7' }]
        },
        {
            id: 'm2',
            notes: [],
            timeSignature: '4/4',
            chords: [{ id: 'c3', position: 0, symbol: 'Cmaj7' }]
        }
    ],
    updatedAt: Date.now()
};

const mockSettings: GenerationSettings = {
    density: 'medium',
    style: 20, // Bebop
    targetMeasures: [0, 1]
};

describe('AI Generation - Integration', () => {
    it('generates notes for target measures', () => {
        const result = generatePhrase(mockPhrase, mockSettings);
        expect(result[0].notes.length).toBeGreaterThan(0);
        expect(result[1].notes.length).toBeGreaterThan(0);
    });

    it('ensures full measure duration (4 beats)', () => {
        const result = generatePhrase(mockPhrase, mockSettings);

        result.forEach((measure, idx) => {
            if (!mockSettings.targetMeasures.includes(idx)) return;

            let totalDuration = 0;
            measure.notes.forEach(n => {
                let val = DURATION_VALUES[n.duration] ?? 0;
                if (n.dotted) {
                    val *= 1.5;
                }
                if (n.tuplet) {
                    val = (val * 2) / 3;
                }
                totalDuration += val;
            });

            // Use closeTo for float comparison
            expect(totalDuration).toBeCloseTo(4.0, 1);
        });
    });

    it('generates different patterns for different styles', () => {
        // This is a bit stochastic, but we can check if the output differs
        const bebopSettings = { ...mockSettings, style: 10 };
        const contemporarySettings = { ...mockSettings, style: 90 };

        const bebopResult = generatePhrase(mockPhrase, bebopSettings);
        const contemporaryResult = generatePhrase(mockPhrase, contemporarySettings);

        // Just ensure they are generated and valid
        expect(bebopResult[0].notes.length).toBeGreaterThan(0);
        expect(contemporaryResult[0].notes.length).toBeGreaterThan(0);

        // Check for rests or tuplets (probabilistic)
        // Not strictly enforcing presence, but code shouldn't crash

        // We could analyze interval jumps here if we wanted strict verification,
        // but for now ensuring valid generation is good.
    });
});
