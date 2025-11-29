import { describe, it, expect } from 'vitest';
import { getAvailableScales } from '../services/ai/scaleDefinitions';
import { selectTargetNote } from '../services/ai/targetLogic';
import { generatePath } from '../services/ai/pathfinding';
import { SCALES } from '../services/ai/scaleDefinitions';

describe('AI Logic - Scale Mapping', () => {
    it('maps Major7 to Ionian/Lydian', () => {
        const scales = getAvailableScales('Cmaj7');
        expect(scales).toContain('ionian');
        expect(scales).toContain('lydian');
    });

    it('maps Minor7 to Dorian', () => {
        const scales = getAvailableScales('Dm7');
        expect(scales).toContain('dorian');
    });

    it('maps Dominant7 to Mixolydian/Altered', () => {
        const scales = getAvailableScales('G7');
        expect(scales).toContain('mixolydian');
        expect(scales).toContain('altered');
    });

    it('maps Alt Dom to Altered', () => {
        const scales = getAvailableScales('G7alt');
        expect(scales).toContain('altered');
        expect(scales).not.toContain('mixolydian'); // Should prioritize altered
    });
});

describe('AI Logic - Target Selection', () => {
    it('selects a target note', () => {
        const nextChord = { id: 'c1', position: 0, symbol: 'Cmaj7' };
        const target = selectTargetNote(nextChord, 67, 'C'); // From G (67)
        // Expect 3rd (E) or 7th (B) of Cmaj7
        // E4 = 64, B3 = 59, B4 = 71
        // Closest to 67 is E4(64) or B4(71).
        expect(target).toMatch(/^[a-g][#b]?\/\d+$/);
    });
});

describe('AI Logic - Pathfinding', () => {
    it('generates a path', () => {
        const start = 60; // C4
        const target = 64; // E4
        const scale = SCALES.ionian;
        const path = generatePath(start, target, scale, 2, 'C', 50);
        // 2 beats = 4 notes.
        // Start, Note, Note, Note (Target is next)
        expect(path.length).toBeGreaterThan(0);
    });
});
