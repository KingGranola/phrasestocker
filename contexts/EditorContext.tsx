import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Phrase, InputMode, NoteData, NoteDuration } from '../types';
import { INITIAL_PHRASE } from '../constants';

/**
 * エディタの状態を管理するContext
 */
interface EditorContextType {
  // 現在のフレーズ
  phrase: Phrase;
  setPhrase: (phrase: Phrase) => void;
  updatePhrase: (updates: Partial<Phrase>) => void;
  
  // 選択状態
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;
  selectedNote: NoteData | undefined;
  selectionSource: 'score' | 'tab';
  setSelectionSource: (source: 'score' | 'tab') => void;
  
  // 入力モード
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  
  // アクティブな音符設定
  activeDuration: NoteDuration;
  setActiveDuration: (duration: NoteDuration) => void;
  isDotted: boolean;
  setIsDotted: (dotted: boolean) => void;
  isRest: boolean;
  setIsRest: (rest: boolean) => void;
  isTriplet: boolean;
  setIsTriplet: (triplet: boolean) => void;
  
  // UI状態
  showDegrees: boolean;
  setShowDegrees: (show: boolean) => void;
  
  // ヘルパーメソッド
  updateSelectedNote: (updates: Partial<NoteData>) => void;
  deleteNote: (noteId: string) => void;
  deleteChord: (chordId: string) => void;
  updateMeasureCount: (count: number) => void;
  clearPhrase: () => void;
  newPhrase: () => void;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

/**
 * EditorProviderコンポーネント
 */
export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getInitialPhrase = (): Phrase => JSON.parse(JSON.stringify(INITIAL_PHRASE));
  
  // State
  const [phrase, setPhrase] = useState<Phrase>(getInitialPhrase());
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [selectionSource, setSelectionSource] = useState<'score' | 'tab'>('score');
  const [inputMode, setInputMode] = useState<InputMode>('entry');
  const [activeDuration, setActiveDuration] = useState<NoteDuration>('q');
  const [isDotted, setIsDotted] = useState(false);
  const [isRest, setIsRest] = useState(false);
  const [isTriplet, setIsTriplet] = useState(false);
  const [showDegrees, setShowDegrees] = useState(true);
  
  // 選択中の音符を取得
  const selectedNote = phrase.measures
    .flatMap(m => m.notes)
    .find(n => n.id === selectedNoteId);
  
  // 選択中の音符が変更されたら、アクティブ設定を同期
  useEffect(() => {
    if (selectedNote) {
      setActiveDuration(selectedNote.duration);
      setIsDotted(selectedNote.dotted);
      setIsRest(selectedNote.isRest);
      setIsTriplet(!!selectedNote.tuplet);
    }
  }, [selectedNoteId]);
  
  /**
   * フレーズの一部を更新
   */
  const updatePhrase = (updates: Partial<Phrase>) => {
    setPhrase(current => ({ ...current, ...updates }));
  };
  
  /**
   * 選択中の音符を更新
   */
  const updateSelectedNote = (updates: Partial<NoteData>) => {
    if (!selectedNoteId) return;
    
    setPhrase(current => ({
      ...current,
      measures: current.measures.map(m => ({
        ...m,
        notes: m.notes.map(n =>
          n.id === selectedNoteId ? { ...n, ...updates } : n
        )
      }))
    }));
  };
  
  /**
   * 音符を削除
   */
  const deleteNote = (noteId: string) => {
    setPhrase(current => ({
      ...current,
      measures: current.measures.map(m => ({
        ...m,
        notes: m.notes.filter(n => n.id !== noteId)
      }))
    }));
    
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
    }
  };
  
  /**
   * コードを削除
   */
  const deleteChord = (chordId: string) => {
    setPhrase(current => ({
      ...current,
      measures: current.measures.map(m => ({
        ...m,
        chords: m.chords.filter(c => c.id !== chordId)
      }))
    }));
  };
  
  /**
   * 小節数を更新
   */
  const updateMeasureCount = (count: number) => {
    setPhrase(current => {
      if (count === current.measures.length) return current;
      
      // 小節を追加
      if (count > current.measures.length) {
        return {
          ...current,
          measures: [
            ...current.measures,
            ...Array(count - current.measures.length)
              .fill(null)
              .map(() => ({
                id: uuidv4(),
                timeSignature: '4/4',
                notes: [],
                chords: []
              }))
          ]
        };
      }
      
      // 小節を削除（データがある場合は確認）
      if (current.measures.slice(count).some(m => m.notes.length > 0 || m.chords.length > 0)) {
        if (!window.confirm("Data exists in measures to be deleted. Proceed?")) {
          return current;
        }
      }
      
      return {
        ...current,
        measures: current.measures.slice(0, count)
      };
    });
  };
  
  /**
   * フレーズをクリア
   */
  const clearPhrase = () => {
    setPhrase({
      ...phrase,
      measures: phrase.measures.map(m => ({
        ...m,
        notes: [],
        chords: []
      }))
    });
    setSelectedNoteId(null);
  };
  
  /**
   * 新しいフレーズを作成
   */
  const newPhrase = () => {
    const newPhrase = getInitialPhrase();
    newPhrase.id = uuidv4();
    newPhrase.updatedAt = Date.now();
    setPhrase(newPhrase);
    setSelectedNoteId(null);
  };
  
  const value: EditorContextType = {
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
  };
  
  return (
    <EditorContext.Provider value={value}>
      {children}
    </EditorContext.Provider>
  );
};

/**
 * EditorContextを使用するカスタムフック
 */
export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within EditorProvider');
  }
  return context;
};
