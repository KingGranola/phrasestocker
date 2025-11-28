
import React, { useState, useRef, useLayoutEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { KEYS } from './constants';
import ScoreCanvas from './components/ScoreCanvas';
import Toolbar from './components/Toolbar';
import ChordPalette from './components/ChordPalette';
import { Sidebar, Header } from './components/Layout';
import { HelpModal, SavePhraseModal, ConfirmationModal, NotificationToast, SaveOptionsModal } from './components/modals';
import { useAudio, PlaybackConfig } from './hooks/useAudio';
import { canAddNote, validateMeasure, getPitchFromVisual, getAccidentalsForContext, shiftPitchVisual, shiftPitchChromatic } from './services/musicTheory';
import { calculateTabPosition, getValidTabPositions } from './services/tabLogic';
import { exportToMidi, exportToMusicXML } from './services/exporter';
import { isNoteInRange } from './services/musicTheory';
import { RotateCcw, AlertCircle } from 'lucide-react';
import { EditorProvider, useEditor } from './contexts/EditorContext';
import { LibraryProvider, useLibrary } from './contexts/LibraryContext';
import { NoteData } from './types';
import { isPhraseSaved, markPhraseSaved, generateNewFileName } from './utils/saveTracking';

/**
 * メインアプリケーションコンポーネント（Context内部）
 */
const AppContent: React.FC = () => {
  // Context hooks
  const {
    phrase,
    setPhrase,
    updatePhrase,
    selectedNoteId,
    setSelectedNoteId,
    selectedNote,
    selectionSource,
    setSelectionSource,
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
    showDegrees,
    setShowDegrees,
    updateSelectedNote,
    deleteNote,
    deleteChord,
    updateMeasureCount,
    clearPhrase,
    newPhrase
  } = useEditor();

  const { library, savePhrase, deletePhrase: deletePhraseFromLibrary, searchLibrary, importLibrary } = useLibrary();

  // ローカル状態（UIのみに関連）
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [canvasWidth, setCanvasWidth] = useState(820);
  const [playbackConfig, setPlaybackConfig] = useState<PlaybackConfig>({
    melodyVolume: -5,
    chordVolume: -10,
    melodyInstrument: 'piano',
    chordInstrument: 'piano',
    voicing: 'closed',
    isMetronomeOn: false,
    metronomeVolume: -10,
    metronomePattern: 'all',
    metronomeSound: 'click'
  });
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean, message: string, onConfirm: () => void } | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [isSaveOptionsModalOpen, setIsSaveOptionsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const canvasColors = { primary: '#000000', secondary: '#ffffff', error: '#fee2e2' };
  const { isPlaying, isLoaded, play, stop, previewNote } = useAudio(phrase, playbackConfig);
  const activeAccidental = selectedNote?.accidentals.includes('#') ? 'sharp' : selectedNote?.accidentals.includes('b') ? 'flat' : selectedNote?.accidentals.includes('n') ? 'natural' : null;

  // Canvas幅の管理
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (canvasContainerRef.current) {
        setCanvasWidth(Math.max(300, canvasContainerRef.current.clientWidth - 40));
      }
    };
    updateWidth();
    const timeout = setTimeout(updateWidth, 250);
    const observer = new ResizeObserver(updateWidth);
    if (canvasContainerRef.current) observer.observe(canvasContainerRef.current);
    window.addEventListener('resize', updateWidth);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateWidth);
      observer.disconnect();
    };
  }, [sidebarOpen]);

  // ヘルパー関数
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
  };

  const handleDurationChange = (duration: typeof activeDuration) => {
    setActiveDuration(duration);
    updateSelectedNote({ duration });
  };

  const handleDottedToggle = () => {
    setIsDotted(!isDotted);
    updateSelectedNote({ dotted: !isDotted });
  };

  const handleRestToggle = () => {
    setIsRest(!isRest);
    updateSelectedNote({ isRest: !isRest });
  };

  const handleTripletToggle = () => {
    setIsTriplet(!isTriplet);
    updateSelectedNote({ tuplet: !isTriplet });
  };

  const handleNewPhrase = () => {
    newPhrase();
    showToast("New File Created", "info");
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const handleOpenSaveModal = () => {
    // 既に保存されているフレーズかチェック
    if (isPhraseSaved(phrase.id)) {
      setIsSaveOptionsModalOpen(true);
    } else {
      setIsSaveModalOpen(true);
    }
  };

  const handleSaveConfirmed = async (name: string, tags: string[]) => {
    const updatedPhrase = { ...phrase, name, tags };
    setPhrase(updatedPhrase);
    await savePhrase(updatedPhrase);
    markPhraseSaved(updatedPhrase.id);
    setIsSaveModalOpen(false);
    showToast("Saved to Disk");
  };

  const handleOverwriteSave = async () => {
    await savePhrase(phrase);
    setIsSaveOptionsModalOpen(false);
    showToast("Overwrite Saved");
  };

  const handleSaveAsNew = () => {
    const newName = generateNewFileName(phrase);
    const newPhrase = { ...phrase, name: newName };
    setPhrase(newPhrase);
    setIsSaveOptionsModalOpen(false);
    setIsSaveModalOpen(true);
  };

  const handleImport = async () => {
    try {
      const count = await importLibrary();
      showToast(`${count} phrases imported!`, 'success');
    } catch (error) {
      showToast('Import failed', 'info');
    }
  };

  const handleDeleteFromLibrary = (id: string) => {
    setConfirmModal({
      isOpen: true,
      message: "Delete this item permanently?",
      onConfirm: () => {
        deletePhraseFromLibrary(id);
        if (phrase.id === id) {
          newPhrase();
        }
        setConfirmModal(null);
        showToast("Item Deleted");
      }
    });
  };

  const handleClear = () => {
    setConfirmModal({
      isOpen: true,
      message: "Clear all notes?",
      onConfirm: () => {
        clearPhrase();
        setConfirmModal(null);
        showToast("Canvas Cleared");
      }
    });
  };

  const handleDeleteSelected = () => {
    if (selectedNoteId) {
      deleteNote(selectedNoteId);
    }
  };

  const handleAccidentalChange = (type: 'sharp' | 'flat' | 'natural') => {
    if (!selectedNoteId || !selectedNote) return;

    const [notePart, octave] = selectedNote.keys[0].split('/');
    const letter = notePart.charAt(0).toLowerCase();
    const newKey = type === 'sharp' ? `${letter}#/${octave}` : type === 'flat' ? `${letter}b/${octave}` : `${letter}/${octave}`;
    const tabPos = calculateTabPosition(newKey, phrase.instrument);

    updateSelectedNote({
      keys: [newKey],
      accidentals: type === 'sharp' ? ['#'] : type === 'flat' ? ['b'] : ['n'],
      string: tabPos.string,
      fret: tabPos.fret
    });
  };

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

  const handleChordClick = (chordId: string) => {
    if (inputMode === 'eraser') deleteChord(chordId);
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

  // キーボードショートカット
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return;
      const key = e.key.toLowerCase();

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
      if (key === ' ') {
        e.preventDefault();
        isPlaying ? stop() : play();
      }
      if (['1', '2', '4', '8'].includes(key)) {
        const map: any = { '1': 'w', '2': 'h', '4': 'q', '8': '8' };
        handleDurationChange(map[key]);
      }
      if (key === '.') handleDottedToggle();
      if (key === '0') handleRestToggle();
      if (key === '3') handleTripletToggle();
      if (key === 'backspace' || key === 'delete') handleDeleteSelected();

      if (selectedNoteId && (key === 'arrowup' || key === 'arrowdown')) {
        e.preventDefault();
        const dir = key === 'arrowup' ? 1 : -1;

        const updatedPhrase = {
          ...phrase,
          measures: phrase.measures.map(m => ({
            ...m,
            notes: m.notes.map(n => {
              if (n.id === selectedNoteId && !n.isRest) {
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
  }, [isPlaying, play, stop, selectedNoteId, inputMode, isDotted, isRest, isTriplet, activeDuration, previewNote, selectionSource]);

  const filteredLibrary = searchLibrary(searchQuery);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--bg-body)]">
      <div className="portrait-warning hidden fixed inset-0 z-[9999] bg-[var(--bg-body)] text-[var(--text-main)] flex-col items-center justify-center p-8 text-center">
        <RotateCcw size={64} className="text-[var(--accent)] mb-6 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">Please Rotate Device</h1>
        <p className="text-[var(--text-muted)]">PhraseStocker is designed for landscape mode.</p>
      </div>
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleNewPhrase={handleNewPhrase}
        library={filteredLibrary}
        currentPhraseId={phrase.id}
        onSelectPhrase={setPhrase}
        onDeletePhrase={handleDeleteFromLibrary}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--bg-body)] relative">
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          phrase={phrase}
          setPhrase={setPhrase}
          showDegrees={showDegrees}
          setShowDegrees={setShowDegrees}
          updateMeasureCount={updateMeasureCount}
        />
        <div className="border-b border-[var(--border-color)] bg-[var(--bg-panel)] z-10">
          <Toolbar
            inputMode={inputMode}
            setInputMode={setInputMode}
            activeDuration={activeDuration}
            setDuration={handleDurationChange}
            isDotted={isDotted}
            toggleDotted={handleDottedToggle}
            isRest={isRest}
            toggleRest={handleRestToggle}
            isTriplet={isTriplet}
            toggleTriplet={handleTripletToggle}
            onUndo={() => { }}
            onRedo={() => { }}
            onSave={handleOpenSaveModal}
            onClear={handleClear}
            onDeleteSelected={handleDeleteSelected}
            hasSelection={!!selectedNoteId}
            isPlaying={isPlaying}
            onPlayToggle={isPlaying ? stop : play}
            isLoaded={isLoaded}
            bpm={phrase.bpm}
            setBpm={(bpm) => updatePhrase({ bpm })}
            onAccidental={handleAccidentalChange}
            activeAccidental={activeAccidental}
            playbackConfig={playbackConfig}
            setPlaybackConfig={setPlaybackConfig}
            onExportMidi={() => exportToMidi(phrase)}
            onExportXml={() => exportToMusicXML(phrase, { includeDegrees: showDegrees })}
            onImport={handleImport}
          />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-[var(--bg-sub)] p-4 lg:p-8 shadow-inner relative" ref={canvasContainerRef}>
            <div className="bg-white rounded-sm shadow-xl overflow-hidden relative mx-auto" style={{ width: `${canvasWidth}px`, minHeight: '450px' }}>
              <div className="absolute top-0 left-0 w-full h-1 bg-[var(--accent)]"></div>
              <ScoreCanvas
                phrase={phrase}
                width={canvasWidth}
                selectedNoteId={selectedNoteId}
                inputMode={inputMode}
                activeDuration={activeDuration}
                isDotted={isDotted}
                isRest={isRest}
                activeTriplet={isTriplet}
                onNoteClick={handleNoteSelect}
                onCanvasClick={handleCanvasClick}
                onNoteDrag={handleNoteDrag}
                onChordDrop={handleChordDrop}
                onChordClick={handleChordClick}
                onPreviewNote={(p) => previewNote(p, phrase.instrument)}
                showDegrees={showDegrees}
                primaryColor={canvasColors.primary}
                secondaryColor={canvasColors.secondary}
                errorColor={canvasColors.error}
              />
            </div>
          </div>
          <div className="h-48 lg:h-60 shrink-0 border-t border-[var(--border-color)] bg-[var(--bg-panel)] z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            <ChordPalette
              currentKey={phrase.keySignature}
              currentScale={phrase.scale}
              keys={KEYS}
              onKeyChange={(k) => updatePhrase({ keySignature: k })}
              onScaleChange={(s) => updatePhrase({ scale: s })}
              onChordClick={(c) => { }}
            />
          </div>
        </div>
        <div className="absolute bottom-64 right-6 flex flex-col gap-3 z-50 pointer-events-none">
          {notification && <NotificationToast message={notification.message} type={notification.type} onClose={() => setNotification(null)} />}
          {phrase.measures.map((m, idx) => {
            const val = validateMeasure(m);
            if (val.isValid || val.type !== 'error') return null;
            return (
              <div key={m.id} className="pointer-events-auto flex items-start gap-3 p-3 bg-white border-l-4 border-red-500 rounded shadow-lg text-slate-800 animate-in slide-in-from-right-10 fade-in duration-300">
                <AlertCircle size={20} className="text-red-500 shrink-0" />
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wide text-red-600">Bar {idx + 1} Error</h4>
                  <p className="text-xs font-medium">{val.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {confirmModal && (
        <ConfirmationModal
          isOpen={confirmModal.isOpen}
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}

      <SaveOptionsModal
        isOpen={isSaveOptionsModalOpen}
        phraseName={phrase.name}
        onOverwrite={handleOverwriteSave}
        onSaveAsNew={handleSaveAsNew}
        onCancel={() => setIsSaveOptionsModalOpen(false)}
      />

      <SavePhraseModal
        isOpen={isSaveModalOpen}
        initialName={phrase.name}
        initialTags={phrase.tags || []}
        onSave={handleSaveConfirmed}
        onCancel={() => setIsSaveModalOpen(false)}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
};

/**
 * ルートアプリケーションコンポーネント（Contextプロバイダー）
 */
const App: React.FC = () => {
  return (
    <EditorProvider>
      <LibraryProvider>
        <AppContent />
      </LibraryProvider>
    </EditorProvider>
  );
};

export default App;
