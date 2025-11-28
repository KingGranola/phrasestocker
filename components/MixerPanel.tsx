
import React from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import { PlaybackConfig } from '../hooks/useAudio';
import { VoicingMode } from '../types';

export const MixerPanel: React.FC<{ config: PlaybackConfig; onChange: (c: PlaybackConfig) => void; onClose: () => void; }> = ({ config, onChange, onClose }) => {
    const voicings: { id: VoicingMode; name: string }[] = [
        { id: 'standard', name: 'Standard (Root+3+5+9)' },
        { id: 'closed', name: 'Closed (Simple)' },
        { id: 'shell', name: 'Shell (Jazz Piano LH)' },
        { id: 'drop2', name: 'Drop 2 (Guitar)' },
        { id: 'rootless', name: 'Rootless (Evans Style)' },
    ];

    return (
        <div className="absolute top-12 right-0 z-50 w-72 app-panel p-4 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-[var(--border-color)]">
                <h3 className="text-xs font-bold text-[var(--text-muted)] tracking-wider">MIXER / METRONOME</h3>
                <button onClick={onClose} className="hover:text-[var(--text-main)]"><X size={14}/></button>
            </div>
            <div className="space-y-4 text-xs">
                {/* Levels */}
                <div>
                    <div className="flex justify-between mb-1 text-[var(--text-muted)]"><span>MELODY VOL</span><span>{config.melodyVolume}dB</span></div>
                    <input type="range" min="-60" max="0" step="1" value={config.melodyVolume} onChange={e => onChange({ ...config, melodyVolume: parseInt(e.target.value) })} className="w-full h-1 bg-[var(--bg-sub)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                </div>
                <div>
                    <div className="flex justify-between mb-1 text-[var(--text-muted)]"><span>CHORDS VOL</span><span>{config.chordVolume}dB</span></div>
                    <input type="range" min="-60" max="0" step="1" value={config.chordVolume} onChange={e => onChange({ ...config, chordVolume: parseInt(e.target.value) })} className="w-full h-1 bg-[var(--bg-sub)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]" />
                </div>
                <div className="h-px bg-[var(--border-color)] my-2"></div>
                {/* Metronome */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <button onClick={() => onChange({ ...config, isMetronomeOn: !config.isMetronomeOn })} className={clsx("w-8 h-4 rounded-full relative transition-colors", config.isMetronomeOn ? "bg-[var(--accent)]" : "bg-[var(--bg-sub)]")}><div className={clsx("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform", config.isMetronomeOn ? "left-4.5 translate-x-0" : "left-0.5")} /></button>
                            <span className="font-bold text-[var(--text-main)]">METRONOME</span>
                        </div>
                        <span className="text-[var(--text-muted)]">{config.metronomeVolume}dB</span>
                    </div>
                    <input type="range" min="-60" max="0" step="1" value={config.metronomeVolume} onChange={e => onChange({ ...config, metronomeVolume: parseInt(e.target.value) })} className="w-full h-1 bg-[var(--bg-sub)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)] mb-3" disabled={!config.isMetronomeOn} />
                    <div className="flex gap-2 mb-2"><div className="flex-1"><span className="block text-[10px] text-[var(--text-muted)] mb-1">Sound</span><select className="w-full app-input p-1" value={config.metronomeSound || 'click'} onChange={e => onChange({ ...config, metronomeSound: e.target.value as any })} disabled={!config.isMetronomeOn}><option value="click">Click</option><option value="kick">Kick</option><option value="beep">Beep</option></select></div></div>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => onChange({...config, metronomePattern: 'all'})} className={clsx("py-1.5 px-2 rounded border text-[10px] font-bold", config.metronomePattern === 'all' ? "bg-[var(--accent)] text-white border-transparent" : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]")} disabled={!config.isMetronomeOn}>All Beats (1-2-3-4)</button>
                        <button onClick={() => onChange({...config, metronomePattern: '2-4'})} className={clsx("py-1.5 px-2 rounded border text-[10px] font-bold", config.metronomePattern === '2-4' ? "bg-[var(--accent)] text-white border-transparent" : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)]")} disabled={!config.isMetronomeOn}>Jazz (2 & 4)</button>
                    </div>
                </div>
                <div className="h-px bg-[var(--border-color)] my-2"></div>
                {/* Voicing */}
                <div>
                    <div className="flex justify-between mb-1 mt-1 text-[var(--text-muted)]"><span>PIANO VOICING</span></div>
                    <select className="w-full app-input mb-1 p-1.5" value={config.voicing || 'closed'} onChange={e => onChange({ ...config, voicing: e.target.value as VoicingMode })}>{voicings.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select>
                </div>
            </div>
        </div>
    );
};
