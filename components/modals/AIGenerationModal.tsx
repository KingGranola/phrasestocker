import React, { useEffect, useMemo, useState } from 'react';
import { X, Wand2 } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { generatePhrase, GenerationSettings } from '../../services/phraseGenerator';

interface AIGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const AIGenerationModal: React.FC<AIGenerationModalProps> = ({ isOpen, onClose }) => {
    const { phrase, setPhrase, selectedNoteId } = useEditor();
    const [density, setDensity] = useState<GenerationSettings['density']>('medium');
    const [styleValue, setStyleValue] = useState<number>(20); // 0-100, default Bebop-ish
    const [targetRange, setTargetRange] = useState<'all' | 'selected'>('all');

    const selectedMeasureIndex = useMemo(
        () => phrase.measures.findIndex((measure) => measure.notes.some((note) => note.id === selectedNoteId)),
        [phrase.measures, selectedNoteId]
    );
    const hasSelectedMeasure = selectedMeasureIndex >= 0;

    useEffect(() => {
        if (!isOpen) return;
        if (!hasSelectedMeasure && targetRange === 'selected') {
            setTargetRange('all');
        }
    }, [isOpen, hasSelectedMeasure, targetRange]);

    if (!isOpen) return null;

    const handleGenerate = () => {
        const targetMeasures =
            targetRange === 'selected' && hasSelectedMeasure
                ? [selectedMeasureIndex]
                : phrase.measures.map((_, i) => i);

        const newMeasures = generatePhrase(phrase, {
            density,
            style: styleValue,
            targetMeasures
        });

        setPhrase({
            ...phrase,
            measures: newMeasures
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="app-panel shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)] bg-[var(--bg-body)]">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-[var(--text-main)]">
                        <Wand2 size={20} className="text-[var(--accent)]" />
                        AI Phrase Generator <span className="text-xs font-normal text-[var(--text-muted)]">(beta)</span>
                    </h2>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-6 bg-[var(--bg-panel)]">
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-[var(--text-main)]">Note Density</label>
                        <div className="flex gap-2">
                            {(['low', 'medium', 'high'] as const).map((d) => (
                                <button
                                    key={d}
                                    onClick={() => setDensity(d)}
                                    className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-all ${density === d
                                        ? 'bg-[var(--accent)] text-white ring-2 ring-[var(--accent)]/30 ring-offset-1 ring-offset-[var(--bg-panel)]'
                                        : 'bg-[var(--bg-sub)] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]'
                                        }`}
                                >
                                    {d.charAt(0).toUpperCase() + d.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold text-[var(--text-main)]">Style</label>
                            <span className="text-xs font-medium text-cyan-300 bg-cyan-400/10 px-2 py-1 rounded">
                                {styleValue < 33 ? 'Bebop' : styleValue < 66 ? 'Modern' : 'Contemporary'}
                            </span>
                        </div>
                        <div className="pt-2 pb-1">
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={styleValue}
                                onChange={(e) => setStyleValue(parseInt(e.target.value))}
                                className="w-full h-2 bg-[var(--bg-sub)] rounded-lg appearance-none cursor-pointer accent-[var(--accent)]"
                            />
                            <div className="flex justify-between text-[10px] text-[var(--text-muted)] mt-1 font-medium">
                                <span>Bebop</span>
                                <span>Modern</span>
                                <span>Contemporary</span>
                            </div>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                            {styleValue < 33 && 'Dense 8th note lines, chromatic approaches, chord tone focus.'}
                            {styleValue >= 33 && styleValue < 66 && 'Balanced mix of inside/outside playing with rhythmic variety.'}
                            {styleValue >= 66 && 'Wide intervals, quartal harmony, rhythmic freedom, outside scales.'}
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-[var(--text-main)]">Target</label>
                        <select
                            value={targetRange}
                            onChange={(e) => setTargetRange(e.target.value as 'all' | 'selected')}
                            className="w-full app-input p-2 text-sm"
                        >
                            <option value="all">All Measures</option>
                            <option value="selected" disabled={!hasSelectedMeasure}>
                                {hasSelectedMeasure ? `Selected Measure (Bar ${selectedMeasureIndex + 1})` : 'Selected Measure (Pick a note first)'}
                            </option>
                        </select>
                        {!hasSelectedMeasure && (
                            <p className="text-[11px] text-[var(--text-muted)]">
                                Tip: Select a note in the score to target only that bar.
                            </p>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-[var(--bg-body)] border-t border-[var(--border-color)] flex justify-end gap-3">
                    <button onClick={onClose} className="app-btn px-4 py-2 text-xs">
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="app-btn app-btn-primary px-4 py-2 text-xs flex items-center gap-2"
                    >
                        <Wand2 size={16} />
                        Generate Phrase
                    </button>
                </div>
            </div>
        </div>
    );
};
