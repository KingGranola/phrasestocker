import React, { useState } from 'react';
import { X, FileText, FilePlus } from 'lucide-react';

interface SaveOptionsModalProps {
    isOpen: boolean;
    phraseName: string;
    onOverwrite: () => void;
    onSaveAsNew: () => void;
    onCancel: () => void;
}

export const SaveOptionsModal: React.FC<SaveOptionsModalProps> = ({
    isOpen,
    phraseName,
    onOverwrite,
    onSaveAsNew,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md app-panel shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-color)] bg-[var(--bg-body)]">
                    <span className="font-bold text-sm">保存オプション</span>
                    <button
                        onClick={onCancel}
                        className="hover:text-[var(--text-main)] text-[var(--text-muted)]"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-6 space-y-4 bg-[var(--bg-panel)]">
                    <p className="text-sm text-[var(--text-muted)]">
                        「<span className="font-bold text-[var(--text-main)]">{phraseName}</span>」は既に保存されています。
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                        上書き保存するか、新規ファイルとして保存するかを選択してください。
                    </p>

                    <div className="grid grid-cols-1 gap-3 mt-6">
                        <button
                            onClick={onOverwrite}
                            className="app-btn p-4 flex items-start gap-3 hover:border-[var(--accent)] transition-all"
                        >
                            <FileText size={20} className="text-[var(--accent)] mt-0.5" />
                            <div className="text-left flex-1">
                                <div className="font-bold text-sm mb-1">上書き保存</div>
                                <div className="text-xs text-[var(--text-muted)]">
                                    既存のファイルを更新します
                                </div>
                            </div>
                        </button>

                        <button
                            onClick={onSaveAsNew}
                            className="app-btn p-4 flex items-start gap-3 hover:border-[var(--accent)] transition-all"
                        >
                            <FilePlus size={20} className="text-blue-500 mt-0.5" />
                            <div className="text-left flex-1">
                                <div className="font-bold text-sm mb-1">新規ファイルとして保存</div>
                                <div className="text-xs text-[var(--text-muted)]">
                                    新しいファイル名で保存します（タイムスタンプ付き）
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-[var(--border-color)] bg-[var(--bg-body)]">
                    <button onClick={onCancel} className="app-btn px-4 py-2 text-xs">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    );
};
