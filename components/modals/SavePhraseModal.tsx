import React, { useState, useEffect } from 'react';
import { X, Tag } from 'lucide-react';
import clsx from 'clsx';
import { PRESET_TAGS } from '../../constants';

interface SavePhraseModalProps {
    isOpen: boolean;
    initialName: string;
    initialTags: string[];
    onSave: (name: string, tags: string[]) => void;
    onCancel: () => void;
}

export const SavePhraseModal: React.FC<SavePhraseModalProps> = ({
    isOpen,
    initialName,
    initialTags,
    onSave,
    onCancel
}) => {
    const [name, setName] = useState(initialName);
    const [selectedTags, setSelectedTags] = useState<string[]>(initialTags);

    useEffect(() => {
        if (isOpen) {
            setName(initialName);
            setSelectedTags(initialTags || []);
        }
    }, [isOpen, initialName, initialTags]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md app-panel overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-body)]">
                    <span className="font-bold text-sm">Save Phrase</span>
                    <button
                        onClick={onCancel}
                        className="hover:text-[var(--text-main)] text-[var(--text-muted)]"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 space-y-5 bg-[var(--bg-panel)]">
                    <div>
                        <label className="block text-xs font-bold mb-2 text-[var(--text-muted)] uppercase tracking-wider">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full app-input px-3 py-2 text-sm font-medium"
                            placeholder="My Awesome Lick"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold mb-2 text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
                            <Tag size={12} /> Tags
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {PRESET_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    onClick={() => toggleTag(tag)}
                                    className={clsx(
                                        "text-xs px-2.5 py-1 rounded-full border transition-all duration-200 active:scale-95",
                                        selectedTags.includes(tag)
                                            ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                                            : "bg-transparent text-[var(--text-muted)] border-[var(--border-color)] hover:border-[var(--text-main)] hover:text-[var(--text-main)]"
                                    )}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-3 p-4 border-t border-[var(--border-color)] bg-[var(--bg-body)]">
                    <button onClick={onCancel} className="app-btn px-4 py-2 text-xs">
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(name, selectedTags)}
                        className="app-btn app-btn-primary px-6 py-2 text-xs active:scale-95"
                        disabled={!name.trim()}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};
