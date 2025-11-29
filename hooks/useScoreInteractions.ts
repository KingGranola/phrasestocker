import { useEditor } from '../contexts/EditorContext';
import { v4 as uuidv4 } from 'uuid';
import { canAddNote, getPitchFromVisual, isNoteInRange, getAccidentalsForContext } from '../services/musicTheory';
import { calculateTabPosition, getValidTabPositions } from '../services/tabLogic';
import { NoteData } from '../types';

interface UseScoreInteractionsProps {
    previewNote: (pitch: string, instrument: 'guitar' | 'bass') => void;
}

export const useScoreInteractions = ({ previewNote }: UseScoreInteractionsProps) => {
    const {
        phrase,
        setPhrase,
        selectedNoteId,
        setSelectedNoteId,
        selectedNote,
        setSelectionSource,
        inputMode,
        activeDuration,
        isDotted,
        isRest,
        isTriplet,
        updateSelectedNote,
        deleteNote,
        deleteChord
    } = useEditor();

    const handleNoteSelect = (id: string | null, source?: 'score' | 'tab', x?: number, y?: number) => {
        if (inputMode === 'eraser' && id) {
            deleteNote(id);
            return;
        }

        if (inputMode === 'select' && source === 'tab' && id && id === selectedNoteId) {
            const note = selectedNote;
            if (note && !note.isRest) {
                const valid = getValidTabPositions(note.keys[0], phrase.instrument);
                if (valid.length <= 1) return;

                let currIdx = valid.findIndex(p => p.string === (note.string || 0) && p.fret === (note.fret || 0));
                if (currIdx === -1) currIdx = 0;
                const nextIdx = (currIdx + 1) % valid.length;

                updateSelectedNote({
                    string: valid[nextIdx].string,
                    fret: valid[nextIdx].fret,
                    isManualTab: true
                });
            }
            return;
        }

        setSelectedNoteId(id);
        if (source) setSelectionSource(source);
        else if (id === null) setSelectionSource('score');
    };

    const handleCanvasClick = (measureIndex: number, visualPitch: string) => {
        if (inputMode === 'entry') {
            const targetMeasure = phrase.measures[measureIndex];
            if (!canAddNote(targetMeasure, activeDuration, isDotted, isTriplet)) return;

            let logicalPitch = isRest ? (phrase.instrument === 'bass' ? 'd/3' : 'b/4') : getPitchFromVisual(visualPitch, phrase.keySignature);
            if (!isRest && !isNoteInRange(logicalPitch, phrase.instrument)) return;

            const newNote: NoteData = {
                id: uuidv4(),
                keys: [logicalPitch],
                duration: activeDuration,
                isRest: isRest,
                dotted: isDotted,
                tuplet: isTriplet,
                accidentals: isRest ? [] : getAccidentalsForContext(logicalPitch, phrase.keySignature)
            };

            if (!isRest) {
                const tabPos = calculateTabPosition(logicalPitch, phrase.instrument, phrase.measures[measureIndex].notes.slice(-1)[0]);
                newNote.string = tabPos.string;
                newNote.fret = tabPos.fret;
                previewNote(logicalPitch, phrase.instrument);
            }

            setPhrase({
                ...phrase,
                measures: phrase.measures.map((m, i) =>
                    i === measureIndex ? { ...m, notes: [...m.notes, newNote] } : m
                )
            });
        }
    };

    const handleNoteDrag = (noteId: string, visualPitch: string) => {
        const logicalPitch = getPitchFromVisual(visualPitch, phrase.keySignature);
        if (!isNoteInRange(logicalPitch, phrase.instrument)) return;

        setPhrase({
            ...phrase,
            measures: phrase.measures.map(m => ({
                ...m,
                notes: m.notes.map(n =>
                    n.id === noteId && !n.isRest
                        ? {
                            ...n,
                            keys: [logicalPitch],
                            accidentals: getAccidentalsForContext(logicalPitch, phrase.keySignature),
                            ...calculateTabPosition(logicalPitch, phrase.instrument),
                            isManualTab: false
                        }
                        : n
                )
            }))
        });
    };

    const handleChordDrop = (measureIndex: number, position: number, symbol: string) => {
        const snappedBeat = position < 2 ? 0 : 2;
        setPhrase({
            ...phrase,
            measures: phrase.measures.map((m, idx) =>
                idx !== measureIndex
                    ? m
                    : {
                        ...m,
                        chords: [
                            ...m.chords.filter(c => Math.abs(c.position - snappedBeat) >= 0.1),
                            { id: uuidv4(), symbol, position: snappedBeat }
                        ].sort((a, b) => a.position - b.position)
                    }
            )
        });
    };

    const handleChordClick = (chordId: string, onEditChord?: (id: string) => void) => {
        if (inputMode === 'eraser') {
            deleteChord(chordId);
        } else if (onEditChord) {
            onEditChord(chordId);
        }
    };

    return {
        handleNoteSelect,
        handleCanvasClick,
        handleNoteDrag,
        handleChordDrop,
        handleChordClick
    };
};
