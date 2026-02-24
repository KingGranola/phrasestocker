import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmationModalProps {
    isOpen: boolean;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
    isOpen,
    message,
    onConfirm,
    onCancel
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-sm app-panel shadow-2xl p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mb-4">
                    <AlertTriangle size={24} />
                </div>
                <h3 className="font-bold text-lg mb-2">Confirm Action</h3>
                <p className="text-[var(--text-muted)] text-sm mb-6">{message}</p>
                <div className="flex gap-3 w-full">
                    <button onClick={onCancel} className="app-btn flex-1 py-2">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="app-btn bg-red-500 text-white hover:bg-red-600 border-red-500 flex-1 py-2"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};
