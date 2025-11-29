import { ScaleDefinition } from './scaleDefinitions';
import { keyToMidi, midiToKey } from '../musicTheory';
import { NoteDuration } from '../../types';

// Pathfinding Logic
// Based on "Jazz Phrase Generation Logic (Ver 5.0)"

export interface GeneratedNote {
    key: string;
    duration: NoteDuration;
    isRest?: boolean;
    tuplet?: boolean;
}

export const generatePath = (
    startMidi: number,
    targetMidi: number,
    scale: ScaleDefinition,
    beats: number,
    keySignature: string,
    style: number // 0-100
): GeneratedNote[] => {
    // Determine style characteristics
    const isBebop = style < 33;
    const isContemporary = style > 66;

    // Rhythm Generation Strategy
    // Instead of fixed slots, we build a rhythm queue
    const notes: GeneratedNote[] = [];
    let remainingBeats = beats;

    // 1. Off-beat Start (Upbeat)
    // Probability increases with Bebop/Contemporary style
    const offBeatProb = isBebop ? 0.4 : isContemporary ? 0.3 : 0.1;
    if (Math.random() < offBeatProb && remainingBeats >= 1.0) {
        // Start with an 8th rest
        notes.push({ key: 'b/4', duration: '8', isRest: true });
        remainingBeats -= 0.5;
    }

    let currentMidi = startMidi;
    const direction = targetMidi > startMidi ? 1 : -1;

    while (remainingBeats > 0) {
        // Decide next note duration/type
        // Options: 8th, Triplet (3 notes in 1 beat), Quarter, Rest

        let durationVal = 0.5; // Default 8th
        let durationCode: NoteDuration = '8';
        let isTuplet = false;
        let isRest = false;

        // Triplet Chance (only if we have full beat)
        // Bebop loves triplets
        const tripletProb = isBebop ? 0.3 : 0.1;

        if (remainingBeats >= 1.0 && Math.random() < tripletProb) {
            // Generate Triplet (3 notes)
            // We handle this by pushing 3 notes now
            const tripletNotes = generateTriplet(currentMidi, targetMidi, direction, scale, isBebop, isContemporary);
            tripletNotes.forEach(n => {
                notes.push({
                    key: midiToKey(n, keySignature),
                    duration: '8', // Display as 8th but marked tuplet
                    tuplet: true
                });
                currentMidi = n;
            });
            remainingBeats -= 1.0;
            continue;
        }

        // Rest Chance (Breathing)
        // Contemporary might have more space
        const restProb = isContemporary ? 0.15 : 0.05;
        if (Math.random() < restProb) {
            isRest = true;
        }

        // Note Generation Logic (if not rest)
        let nextMidi = currentMidi;
        if (!isRest) {
            if (isBebop) {
                // Bebop logic
                if (Math.random() > 0.6) {
                    // Arpeggio / Leap
                    nextMidi = currentMidi + (direction * (Math.random() > 0.5 ? 3 : 4));
                } else {
                    // Scale/Chromatic
                    if (Math.random() > 0.7) {
                        nextMidi = currentMidi + direction; // Chromatic
                    } else {
                        nextMidi = currentMidi + (direction * 2); // Scale step approx
                    }
                }
            } else if (isContemporary) {
                // Contemporary logic
                if (Math.random() > 0.4) {
                    // Wide leap
                    const interval = [5, 7, 10, 11][Math.floor(Math.random() * 4)];
                    nextMidi = currentMidi + (direction * interval);
                } else {
                    nextMidi = currentMidi + (direction * (Math.random() > 0.5 ? 2 : 1));
                }
            } else {
                // Modern/Standard
                if (Math.random() > 0.8) {
                    nextMidi = currentMidi + (direction * 4);
                } else {
                    nextMidi = currentMidi + (direction * (Math.random() > 0.3 ? 2 : 1));
                }
            }
        }

        notes.push({
            key: isRest ? 'b/4' : midiToKey(nextMidi, keySignature),
            duration: durationCode,
            isRest: isRest,
            tuplet: false
        });

        if (!isRest) currentMidi = nextMidi;
        remainingBeats -= durationVal;
    }

    return notes;
};

const generateTriplet = (current: number, target: number, dir: number, scale: ScaleDefinition, isBebop: boolean, isContemporary: boolean): number[] => {
    // Generate 3 notes
    // Pattern: Enclosure or Run
    const result: number[] = [];
    let note = current;

    // Simple run for now
    for (let i = 0; i < 3; i++) {
        note += (dir * (Math.random() > 0.5 ? 1 : 2));
        result.push(note);
    }
    return result;
};

const getNextScaleNote = (currentMidi: number, direction: number, scale: ScaleDefinition): number => {
    // Placeholder for better scale logic
    return currentMidi + (direction * (Math.random() > 0.3 ? 2 : 1));
};
