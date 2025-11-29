import React, { useState, useEffect } from 'react';
import { X, Check, Volume2 } from 'lucide-react';
import clsx from 'clsx';

interface ChordEditorProps {
    initialSymbol: string;
    onSave: (newSymbol: string) => void;
    onCancel: () => void;
    onPreview: (symbol: string) => void;
    position: { x: number, y: number };
}

const ROOTS = ['C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'];
const QUALITIES = [
    { label: 'Maj', value: '' },
    { label: 'm', value: 'm' },
    { label: '7', value: '7' },
    { label: 'm7', value: 'm7' },
    { label: 'Maj7', value: 'maj7' },
    { label: 'add9', value: 'add9' },
    { label: 'dim', value: 'dim' },
    { label: 'dim7', value: 'dim7' },
    { label: 'aug', value: 'aug' },
    { label: 'sus4', value: 'sus4' },
    { label: 'm7(b5)', value: 'm7(b5)' },
    { label: '6', value: '6' },
    { label: 'm6', value: 'm6' },
];

const TENSIONS = ['b9', '9', '#9', '11', '#11', 'b13', '13'];

const ChordEditor: React.FC<ChordEditorProps> = ({ initialSymbol, onSave, onCancel, onPreview, position }) => {
    const [root, setRoot] = useState('C');
    const [quality, setQuality] = useState('');
    const [tensions, setTensions] = useState<string[]>([]);
    const [bass, setBass] = useState('');

    useEffect(() => {
        // Parse initial symbol
        // Regex to separate Root, Quality, Tensions, and Bass
        // Example: Cmaj7(9)/G
        // Root: C
        // Quality: maj7
        // Tensions: (9) -> 9
        // Bass: /G -> G

        const parseChord = (symbol: string) => {
            let remaining = symbol;

            // Extract Bass
            let parsedBass = '';
            if (remaining.includes('/')) {
                const parts = remaining.split('/');
                parsedBass = parts[1];
                remaining = parts[0];
            }
            setBass(parsedBass);

            // Extract Root
            let parsedRoot = '';
            for (const r of ROOTS.sort((a, b) => b.length - a.length)) {
                if (remaining.startsWith(r)) {
                    parsedRoot = r;
                    remaining = remaining.substring(r.length);
                    break;
                }
            }
            setRoot(parsedRoot || 'C');

            // Extract Tensions (in parentheses)
            const tensionMatch = remaining.match(/\((.*?)\)/);
            let parsedTensions: string[] = [];
            if (tensionMatch) {
                const tensionStr = tensionMatch[1];
                // Split by comma and trim, then filter to known tensions
                const parts = tensionStr.split(',').map(s => s.trim());
                parsedTensions = parts.filter(t => TENSIONS.includes(t));
                remaining = remaining.replace(tensionMatch[0], '');
            }
            setTensions(parsedTensions);

            // Remaining is Quality
            // Normalize quality string if needed, but for now take as is or match against known qualities
            // If remaining is empty, it's Major (value '')
            setQuality(remaining);
        };

        parseChord(initialSymbol);
    }, [initialSymbol]);

    const toggleTension = (t: string) => {
        setTensions(prev =>
            prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]
        );
    };

    const constructSymbol = () => {
        let sym = root + quality;
        if (tensions.length > 0) {
            // Sort tensions order if needed, or keep selection order
            // Standard order: 9, 11, 13
            const sortedTensions = [...tensions].sort((a, b) => {
                const order = ['b9', '9', '#9', '11', '#11', 'b13', '13'];
                return order.indexOf(a) - order.indexOf(b);
            });
            sym += `(${sortedTensions.join(',')})`;
        }
        if (bass) {
            sym += `/${bass}`;
        }
        return sym;
    };

    const handleSave = () => {
        onSave(constructSymbol());
    };

    return (
        <div
            className="fixed z-50 bg-[var(--bg-panel)] rounded-lg shadow-xl border border-[var(--border-color)] p-4 w-64 flex flex-col gap-3 text-[var(--text-main)]"
            style={{ left: position.x, top: position.y }}
        >
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-2">
                <h3 className="font-bold text-sm">Edit Chord</h3>
                <button onClick={onCancel} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                    <X size={16} />
                </button>
            </div>

            <div className="flex gap-2">
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">ROOT</label>
                    <select
                        value={root}
                        onChange={(e) => setRoot(e.target.value)}
                        className="w-full text-sm border border-[var(--border-color)] rounded p-1 bg-[var(--bg-body)] text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                    >
                        {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">BASS</label>
                    <select
                        value={bass}
                        onChange={(e) => setBass(e.target.value)}
                        className="w-full text-sm border border-[var(--border-color)] rounded p-1 bg-[var(--bg-body)] text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                    >
                        <option value="">None</option>
                        {ROOTS.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                </div>
            </div>

            <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">QUALITY</label>
                <select
                    value={quality}
                    onChange={(e) => setQuality(e.target.value)}
                    className="w-full text-sm border border-[var(--border-color)] rounded p-1 bg-[var(--bg-body)] text-[var(--text-main)] outline-none focus:border-[var(--accent)]"
                >
                    {QUALITIES.map(q => <option key={q.value} value={q.value}>{q.label || '(Major)'}</option>)}
                    {/* Add option for custom/unknown quality if not in list */}
                    {!QUALITIES.some(q => q.value === quality) && <option value={quality}>{quality}</option>}
                </select>
            </div>

            <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] block mb-1">TENSIONS</label>
                <div className="flex flex-wrap gap-1">
                    {TENSIONS.map(t => (
                        <button
                            key={t}
                            onClick={() => toggleTension(t)}
                            className={clsx(
                                "text-[10px] px-2 py-1 rounded border transition-colors",
                                tensions.includes(t)
                                    ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                    : "bg-[var(--bg-sub)] text-[var(--text-muted)] border-[var(--border-color)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)]"
                            )}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="pt-2 border-t border-[var(--border-color)] mt-1">
                <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 text-center font-bold text-lg p-2 bg-[var(--bg-sub)] rounded text-[var(--text-main)]">
                        {constructSymbol()}
                    </div>
                    <button
                        onClick={() => onPreview(constructSymbol())}
                        className="p-2 rounded bg-[var(--bg-sub)] border border-[var(--border-color)] text-[var(--text-main)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                        title="Preview Chord"
                    >
                        <Volume2 size={20} />
                    </button>
                </div>
                <button
                    onClick={handleSave}
                    className="w-full bg-[var(--accent)] text-white rounded py-1.5 text-sm font-bold hover:opacity-90 flex items-center justify-center gap-2 transition-opacity"
                >
                    <Check size={16} /> Update Chord
                </button>
            </div>
        </div>
    );
};
export default ChordEditor;
