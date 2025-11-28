

import React, { useState } from 'react';
import { NoteDuration, InputMode } from '../types';
import { Music, MousePointer2, Undo, Redo, Save, Trash2, Play, Square, Sliders, Eraser, FileAudio, FileCode, Loader2, Upload } from 'lucide-react';
import clsx from 'clsx';
import { PlaybackConfig } from '../hooks/useAudio';
import { MixerPanel } from './MixerPanel';

interface ToolbarProps {
  inputMode: InputMode; setInputMode: (m: InputMode) => void;
  activeDuration: NoteDuration; setDuration: (d: NoteDuration) => void;
  isDotted: boolean; toggleDotted: () => void;
  isRest: boolean; toggleRest: () => void;
  isTriplet: boolean; toggleTriplet: () => void;
  onUndo: () => void; onRedo: () => void;
  onSave: () => void; onClear: () => void; onDeleteSelected: () => void; hasSelection: boolean;
  isPlaying: boolean; onPlayToggle: () => void; isLoaded: boolean;
  bpm: number; setBpm: (bpm: number) => void;
  playbackConfig: PlaybackConfig; setPlaybackConfig: (config: PlaybackConfig) => void;
  onAccidental: (type: 'sharp' | 'flat' | 'natural') => void; activeAccidental?: 'sharp' | 'flat' | 'natural' | null;
  onExportMidi: () => void; onExportXml: () => void;
  onImport: () => void; // 追加
}

const ToolBtn: React.FC<{ isActive?: boolean; onClick: () => void; title: string; children: React.ReactNode; className?: string; disabled?: boolean }> = ({ isActive, onClick, title, children, className, disabled }) => (
  <button onClick={onClick} disabled={disabled} className={clsx("app-btn w-9 h-9 shrink-0 relative overflow-hidden transition-all duration-100 active:scale-95", isActive && "app-btn-active ring-2 ring-[var(--accent)]/30 ring-offset-1 ring-offset-[var(--bg-panel)]", className)} title={title}>{children}</button>
);
const Separator = () => <div className="w-px h-6 bg-[var(--border-color)] mx-2 shrink-0"></div>;
const DurationIcon: React.FC<{ duration: NoteDuration }> = ({ duration }) => {
  const notes: Record<string, string> = { 'w': '𝅝', 'h': '𝅗', 'q': '♩', '8': '♪', '16': '𝅘𝅥𝅯' };
  return <span className="text-xl leading-none font-serif">{notes[duration]}</span>;
};

const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [showMixer, setShowMixer] = useState(false);
  return (
    <div className="flex items-center justify-between w-full h-12 px-2 select-none">
      <div className="flex items-center gap-1 overflow-x-auto overflow-y-hidden scrollbar-none flex-1 pr-4">
        <div className="flex items-center gap-1">
          <ToolBtn isActive={props.inputMode === 'entry'} onClick={() => props.setInputMode('entry')} title="Note Input (N)"><Music size={18} /></ToolBtn>
          <ToolBtn isActive={props.inputMode === 'select'} onClick={() => props.setInputMode('select')} title="Select (Esc)"><MousePointer2 size={18} /></ToolBtn>
          <ToolBtn isActive={props.inputMode === 'eraser'} onClick={() => props.setInputMode('eraser')} title="Eraser Tool"><Eraser size={18} /></ToolBtn>
        </div>
        <Separator />
        <div className="flex items-center gap-1">{(['w', 'h', 'q', '8', '16'] as NoteDuration[]).map((d) => (<ToolBtn key={d} isActive={props.activeDuration === d} onClick={() => props.setDuration(d)} title={d}><DurationIcon duration={d} /></ToolBtn>))}</div>
        <Separator />
        <div className="flex items-center gap-1">
          <ToolBtn isActive={props.isDotted} onClick={props.toggleDotted} title="Dotted (.)"><div className="w-1 h-1 rounded-full bg-current mb-1"></div><span className="text-[10px] font-bold absolute bottom-1 right-1">.</span></ToolBtn>
          <ToolBtn isActive={props.isTriplet} onClick={props.toggleTriplet} title="Triplet (3)"><span className="text-xs font-bold font-mono">3</span></ToolBtn>
          <ToolBtn isActive={props.isRest} onClick={props.toggleRest} title="Rest (0)"><span className="text-sm font-bold font-serif">𝄽</span></ToolBtn>
        </div>
        <Separator />
        <div className="flex items-center gap-1">
          <ToolBtn isActive={props.activeAccidental === 'flat'} onClick={() => props.onAccidental('flat')} title="Flat"><span className="font-serif italic text-lg">♭</span></ToolBtn>
          <ToolBtn isActive={props.activeAccidental === 'natural'} onClick={() => props.onAccidental('natural')} title="Natural"><span className="font-serif text-lg">♮</span></ToolBtn>
          <ToolBtn isActive={props.activeAccidental === 'sharp'} onClick={() => props.onAccidental('sharp')} title="Sharp"><span className="font-serif italic text-lg">♯</span></ToolBtn>
        </div>
        <div className="flex items-center gap-1 ml-2"><button onClick={props.onUndo} className="app-btn w-8 h-8 p-0 active:scale-95" title="Undo"><Undo size={14} /></button><button onClick={props.onRedo} className="app-btn w-8 h-8 p-0 active:scale-95" title="Redo"><Redo size={14} /></button></div>
      </div>
      <div className="flex items-center gap-3 shrink-0 relative">
        <div className="flex items-center bg-[var(--bg-body)] rounded-md border border-[var(--border-color)] overflow-hidden">
          <button onClick={props.onPlayToggle} disabled={!props.isLoaded} className={clsx("px-4 py-1.5 flex items-center gap-2 text-xs font-bold transition-colors active:bg-[var(--bg-sub)]", !props.isLoaded ? "text-[var(--text-muted)] cursor-not-allowed opacity-50" : props.isPlaying ? "text-[var(--accent)] hover:bg-[var(--bg-hover)]" : "text-[var(--text-main)] hover:bg-[var(--bg-hover)]")}>
            {!props.isLoaded ? (<><Loader2 size={12} className="animate-spin" /> LOADING...</>) : (<>{props.isPlaying ? <Square size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}{props.isPlaying ? 'STOP' : 'PLAY'}</>)}
          </button>
          <div className="w-px h-full bg-[var(--border-color)]"></div>
          <div className="flex items-center px-2 py-1 gap-1"><span className="text-[10px] text-[var(--text-muted)] font-bold">BPM</span><input type="number" value={props.bpm} onChange={e => props.setBpm(parseInt(e.target.value))} className="w-10 bg-transparent outline-none text-right font-mono text-xs text-[var(--text-main)]" /></div>
          <div className="w-px h-full bg-[var(--border-color)]"></div>
          <button onClick={() => setShowMixer(!showMixer)} className={clsx("p-2 hover:text-[var(--text-main)] active:bg-[var(--bg-sub)]", showMixer ? "text-[var(--accent)]" : "text-[var(--text-muted)]")}><Sliders size={14} /></button>
        </div>
        {showMixer && <MixerPanel config={props.playbackConfig} onChange={props.setPlaybackConfig} onClose={() => setShowMixer(false)} />}
        <div className="flex items-center gap-1 border-l border-[var(--border-color)] pl-3">
          <button onClick={props.onClear} className="app-btn w-8 h-8 p-0 text-red-400 hover:text-red-500 hover:bg-red-500/10 active:scale-95" title="Clear Score"><Trash2 size={16} /></button>
          <button onClick={props.onImport} className="app-btn w-8 h-8 p-0 active:scale-95" title="Import JSON Files"><Upload size={16} /></button>
          <button onClick={props.onExportMidi} className="app-btn w-8 h-8 p-0 active:scale-95" title="Export MIDI"><FileAudio size={16} /></button>
          <button onClick={props.onExportXml} className="app-btn w-8 h-8 p-0 active:scale-95" title="Export MusicXML"><FileCode size={16} /></button>
          <button onClick={props.onSave} className="app-btn app-btn-primary px-4 py-1.5 gap-2 text-xs ml-1 active:scale-95"><Save size={14} /> <span>SAVE</span></button>
        </div>
      </div>
    </div>
  );
};
export default Toolbar;
