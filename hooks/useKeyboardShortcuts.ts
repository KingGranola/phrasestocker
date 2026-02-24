import { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useEditor } from '../contexts/EditorContext';
import { calculateTabPosition, getValidTabPositions } from '../services/tabLogic';
import { getPitchFromVisual, shiftPitchVisual, shiftPitchChromatic, isNoteInRange, getAccidentalsForContext } from '../services/musicTheory';
import { NoteDuration } from '../types';

interface UseKeyboardShortcutsProps {
    isPlaying: boolean;
    play: () => void;
    stop: () => void;
    previewNote: (pitch: string, instrument: 'guitar' | 'bass') => void;
    onUndo?: () => void;
    onRedo?: () => void;
}

export const useKeyboardShortcuts = ({
    isPlaying,
    play,
    stop,
    previewNote,
    onUndo,
    onRedo
}: UseKeyboardShortcutsProps) => {
    const {
        phrase,
        setPhrase,
        selectedNoteId,
        setSelectedNoteId,
        selectedNote,
        inputMode,
        setInputMode,
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
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLSelectElement ||
                e.target instanceof HTMLTextAreaElement ||
                (e.target instanceof HTMLElement && e.target.isContentEditable)
            ) {
                return;
            }

            const key = e.key.toLowerCase();
            const hasPrimaryModifier = e.metaKey || e.ctrlKey;

            // Undo / Redo (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z, Cmd/Ctrl + Y)
            if (hasPrimaryModifier && key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    onRedo?.();
                } else {
                    onUndo?.();
                }
                return;
            }
            if (hasPrimaryModifier && key === 'y') {
                e.preventDefault();
                onRedo?.();
                return;
            }

            // Mode switching
            if (!hasPrimaryModifier && !e.altKey && key === 'n') {
                setInputMode(inputMode === 'entry' ? 'select' : 'entry');
                setSelectedNoteId(null);
                return;
            }
            if (key === 'escape') {
                setInputMode('select');
                setSelectedNoteId(null);
                return;
            }
            if (!hasPrimaryModifier && !e.altKey && key === 's') setInputMode('select');
            if (!hasPrimaryModifier && !e.altKey && key === 'e') {
                setInputMode(inputMode === 'eraser' ? 'select' : 'eraser');
                setSelectedNoteId(null);
                return;
            }

            // Playback
            if (key === ' ') {
                e.preventDefault();
                isPlaying ? stop() : play();
            }

            // Duration (MuseScore-like: 3=16th, 4=8th, 5=quarter, 6=half, 7=whole)
            if (!hasPrimaryModifier && !e.altKey && ['1', '2', '3', '4', '5', '6', '7', '8'].includes(key)) {
                const map: Record<string, NoteDuration> = {
                    '1': '32',
                    '2': '32',
                    '3': '16',
                    '4': '8',
                    '5': 'q',
                    '6': 'h',
                    '7': 'w',
                    '8': '8'
                };
                const newDuration = map[key];
                setActiveDuration(newDuration);
                updateSelectedNote({ duration: newDuration });
                return;
            }

            // Modifiers
            if (!hasPrimaryModifier && !e.altKey && key === '.') {
                const newVal = !isDotted;
                setIsDotted(newVal);
                updateSelectedNote({ dotted: newVal });
                return;
            }
            if (!hasPrimaryModifier && !e.altKey && key === '0') {
                const newVal = !isRest;
                setIsRest(newVal);
                updateSelectedNote({ isRest: newVal });
                return;
            }
            if (!hasPrimaryModifier && !e.altKey && key === 't') {
                const newVal = !isTriplet;
                setIsTriplet(newVal);
                updateSelectedNote({ tuplet: newVal });
                return;
            }

            // Accidentals for selected note: '-' flat, '=' natural, '+' sharp
            if (selectedNoteId && selectedNote && !selectedNote.isRest && !hasPrimaryModifier && !e.altKey) {
                const [notePart, octave] = selectedNote.keys[0].split('/');
                const letter = notePart.charAt(0).toLowerCase();
                if (e.code === 'Minus') {
                    const newKey = `${letter}b/${octave}`;
                    if (isNoteInRange(newKey, phrase.instrument)) {
                        const tabPos = calculateTabPosition(newKey, phrase.instrument);
                        updateSelectedNote({
                            keys: [newKey],
                            accidentals: ['b'],
                            string: tabPos.string,
                            fret: tabPos.fret,
                            isManualTab: false
                        });
                        previewNote(newKey, phrase.instrument);
                    }
                    return;
                }
                if (e.code === 'Equal') {
                    const newKey = e.shiftKey ? `${letter}#/${octave}` : `${letter}/${octave}`;
                    if (isNoteInRange(newKey, phrase.instrument)) {
                        const tabPos = calculateTabPosition(newKey, phrase.instrument);
                        updateSelectedNote({
                            keys: [newKey],
                            accidentals: e.shiftKey ? ['#'] : ['n'],
                            string: tabPos.string,
                            fret: tabPos.fret,
                            isManualTab: false
                        });
                        previewNote(newKey, phrase.instrument);
                    }
                    return;
                }
            }

            // Letter pitch entry for selected note in note-input mode
            if (
                selectedNoteId &&
                selectedNote &&
                !selectedNote.isRest &&
                inputMode === 'entry' &&
                !hasPrimaryModifier &&
                !e.altKey &&
                !e.shiftKey &&
                /^[a-g]$/.test(key)
            ) {
                const [, octave] = selectedNote.keys[0].split('/');
                const logicalKey = getPitchFromVisual(`${key}/${octave}`, phrase.keySignature);
                if (isNoteInRange(logicalKey, phrase.instrument)) {
                    const tabPos = calculateTabPosition(logicalKey, phrase.instrument);
                    updateSelectedNote({
                        keys: [logicalKey],
                        accidentals: getAccidentalsForContext(logicalKey, phrase.keySignature),
                        string: tabPos.string,
                        fret: tabPos.fret,
                        isManualTab: false
                    });
                    previewNote(logicalKey, phrase.instrument);
                }
                return;
            }

            // Repeat selected note (MuseScore-style R)
            if (selectedNoteId && !hasPrimaryModifier && !e.altKey && key === 'r') {
                e.preventDefault();
                let clonedNoteId: string | null = null;
                let clonedPitch: string | null = null;

                const updatedPhrase = {
                    ...phrase,
                    measures: phrase.measures.map(m => {
                        const index = m.notes.findIndex(n => n.id === selectedNoteId);
                        if (index === -1) return m;
                        const original = m.notes[index];
                        clonedNoteId = uuidv4();
                        const clone = { ...original, id: clonedNoteId };
                        clonedPitch = clone.isRest ? null : clone.keys[0];
                        return {
                            ...m,
                            notes: [...m.notes.slice(0, index + 1), clone, ...m.notes.slice(index + 1)]
                        };
                    })
                };
                setPhrase(updatedPhrase);
                if (clonedNoteId) {
                    setSelectedNoteId(clonedNoteId);
                }
                if (clonedPitch) {
                    previewNote(clonedPitch, phrase.instrument);
                }
                return;
            }

            // Deletion
            if (key === 'backspace' || key === 'delete') {
                if (selectedNoteId) {
                    deleteNote(selectedNoteId);
                }
                return;
            }

            // Horizontal navigation between notes
            if (selectedNoteId && (key === 'arrowleft' || key === 'arrowright') && !hasPrimaryModifier && !e.altKey && !e.shiftKey) {
                e.preventDefault();
                const orderedNoteIds = phrase.measures.flatMap(m => m.notes.map(n => n.id));
                const index = orderedNoteIds.indexOf(selectedNoteId);
                if (index === -1) return;
                const nextIndex = key === 'arrowleft'
                    ? Math.max(0, index - 1)
                    : Math.min(orderedNoteIds.length - 1, index + 1);
                setSelectedNoteId(orderedNoteIds[nextIndex]);
                return;
            }

            // Navigation / Pitch Change
            if (selectedNoteId && (key === 'arrowup' || key === 'arrowdown')) {
                e.preventDefault();
                const dir = key === 'arrowup' ? 1 : -1;

                const updatedPhrase = {
                    ...phrase,
                    measures: phrase.measures.map(m => ({
                        ...m,
                        notes: m.notes.map(n => {
                            if (n.id === selectedNoteId && !n.isRest) {
                                // String/Fret navigation (Ctrl/Cmd + Alt + Arrow)
                                if ((e.ctrlKey || e.metaKey) && e.altKey) {
                                    const valid = getValidTabPositions(n.keys[0], phrase.instrument);
                                    if (valid.length < 1) return n;
                                    let currIdx = valid.findIndex(p => p.string === (n.string || 0) && p.fret === (n.fret || 0));
                                    if (currIdx === -1) currIdx = 0;
                                    let nextIdx = key === 'arrowup' ? currIdx - 1 : currIdx + 1;
                                    if (nextIdx < 0) nextIdx = valid.length - 1;
                                    if (nextIdx >= valid.length) nextIdx = 0;
                                    return { ...n, string: valid[nextIdx].string, fret: valid[nextIdx].fret, isManualTab: true };
                                }

                                // Pitch change:
                                // default = chromatic semitone, Alt+Shift = diatonic, Ctrl/Cmd = octave
                                const logicalKey =
                                    (e.metaKey || e.ctrlKey)
                                        ? shiftPitchChromatic(n.keys[0], dir * 12, phrase.keySignature)
                                        : (e.altKey && e.shiftKey)
                                            ? getPitchFromVisual(shiftPitchVisual(n.keys[0], dir), phrase.keySignature)
                                            : shiftPitchChromatic(n.keys[0], dir, phrase.keySignature);

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
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        phrase, setPhrase, selectedNoteId, setSelectedNoteId, selectedNote, inputMode, setInputMode,
        setActiveDuration, isDotted, setIsDotted, isRest, setIsRest,
        isTriplet, setIsTriplet, updateSelectedNote, deleteNote, isPlaying, play, stop,
        previewNote, onUndo, onRedo
    ]);
};
