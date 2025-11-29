import { useEffect } from 'react';
import { useEditor } from '../contexts/EditorContext';
import { calculateTabPosition, getValidTabPositions } from '../services/tabLogic';
import { getPitchFromVisual, shiftPitchVisual, shiftPitchChromatic, isNoteInRange, getAccidentalsForContext } from '../services/musicTheory';
import { NoteDuration } from '../types';

interface UseKeyboardShortcutsProps {
    isPlaying: boolean;
    play: () => void;
    stop: () => void;
    previewNote: (pitch: string, instrument: 'guitar' | 'bass') => void;
}

export const useKeyboardShortcuts = ({
    isPlaying,
    play,
    stop,
    previewNote
}: UseKeyboardShortcutsProps) => {
    const {
        phrase,
        setPhrase,
        selectedNoteId,
        setSelectedNoteId,
        selectedNote,
        selectionSource,
        inputMode,
        setInputMode,
        activeDuration,
        setActiveDuration,
        isDotted,
        setIsDotted,
        isRest,
        setIsRest,
        isTriplet,
        setIsTriplet,
        updateSelectedNote,
        deleteNote
    } = useEditor();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
            const key = e.key.toLowerCase();

            // Mode switching
            if (key === 'n') {
                setInputMode(inputMode === 'entry' ? 'select' : 'entry');
                setSelectedNoteId(null);
                return;
            }
            if (key === 'escape') {
                setInputMode('select');
                setSelectedNoteId(null);
                return;
            }
            if (key === 's') setInputMode('select');
            if (key === 'e') {
                setInputMode(inputMode === 'eraser' ? 'select' : 'eraser');
                setSelectedNoteId(null);
                return;
            }

            // Playback
            if (key === ' ') {
                e.preventDefault();
                isPlaying ? stop() : play();
            }

            // Duration
            if (['1', '2', '4', '8'].includes(key)) {
                const map: Record<string, NoteDuration> = { '1': 'w', '2': 'h', '4': 'q', '8': '8' };
                const newDuration = map[key];
                setActiveDuration(newDuration);
                updateSelectedNote({ duration: newDuration });
            }

            // Modifiers
            if (key === '.') {
                const newVal = !isDotted;
                setIsDotted(newVal);
                updateSelectedNote({ dotted: newVal });
            }
            if (key === '0') {
                const newVal = !isRest;
                setIsRest(newVal);
                updateSelectedNote({ isRest: newVal });
            }
            if (key === '3') {
                const newVal = !isTriplet;
                setIsTriplet(newVal);
                updateSelectedNote({ tuplet: newVal });
            }

            // Deletion
            if (key === 'backspace' || key === 'delete') {
                if (selectedNoteId) {
                    deleteNote(selectedNoteId);
                }
            }

            // Navigation / Pitch Change
            if (selectedNoteId && (key === 'arrowup' || key === 'arrowdown')) {
                e.preventDefault();
                const dir = key === 'arrowup' ? 1 : -1;

                // We need to update the phrase directly here because we need complex logic 
                // that depends on the current state of the note which might not be fully reflected 
                // in 'selectedNote' if we just used updateSelectedNote for everything (esp. for multi-property updates)
                // However, we can try to use updateSelectedNote if possible, but the original code used setPhrase map.
                // Let's stick to the original logic for safety but adapted to use setPhrase from context.

                // Actually, we can use the logic from App.tsx but we need access to the current phrase state.
                // 'phrase' is available from useEditor().

                const updatedPhrase = {
                    ...phrase,
                    measures: phrase.measures.map(m => ({
                        ...m,
                        notes: m.notes.map(n => {
                            if (n.id === selectedNoteId && !n.isRest) {
                                // String/Fret navigation (Ctrl + Arrow)
                                if (e.ctrlKey) {
                                    const valid = getValidTabPositions(n.keys[0], phrase.instrument);
                                    if (valid.length < 1) return n;
                                    let currIdx = valid.findIndex(p => p.string === (n.string || 0) && p.fret === (n.fret || 0));
                                    if (currIdx === -1) currIdx = 0;
                                    let nextIdx = key === 'arrowup' ? currIdx - 1 : currIdx + 1;
                                    if (nextIdx < 0) nextIdx = valid.length - 1;
                                    if (nextIdx >= valid.length) nextIdx = 0;
                                    return { ...n, string: valid[nextIdx].string, fret: valid[nextIdx].fret, isManualTab: true };
                                }

                                // Pitch change
                                const isChromatic = e.shiftKey || selectionSource === 'tab';
                                const logicalKey = isChromatic
                                    ? shiftPitchChromatic(n.keys[0], dir, phrase.keySignature)
                                    : getPitchFromVisual(shiftPitchVisual(n.keys[0], dir), phrase.keySignature);

                                if (!isNoteInRange(logicalKey, phrase.instrument)) return n;

                                previewNote(logicalKey, phrase.instrument);

                                return {
                                    ...n,
                                    keys: [logicalKey],
                                    accidentals: getAccidentalsForContext(logicalKey, phrase.keySignature),
                                    ...calculateTabPosition(logicalKey, phrase.instrument),
                                    isManualTab: false
                                };
                            }
                            return n;
                        })
                    }))
                };
                setPhrase(updatedPhrase);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        phrase, setPhrase, selectedNoteId, setSelectedNoteId, inputMode, setInputMode,
        activeDuration, setActiveDuration, isDotted, setIsDotted, isRest, setIsRest,
        isTriplet, setIsTriplet, updateSelectedNote, deleteNote, isPlaying, play, stop,
        previewNote, selectionSource
    ]);
};
