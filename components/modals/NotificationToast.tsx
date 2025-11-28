import React, { useEffect } from 'react';
import { CheckCircle, FileMusic } from 'lucide-react';
import clsx from 'clsx';

interface NotificationToastProps {
    message: string;
    type: 'success' | 'info';
    onClose: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div
            className={clsx(
                "pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 animate-in slide-in-from-right-10 fade-in duration-300",
                type === 'success'
                    ? "bg-[var(--bg-panel)] border-green-500"
                    : "bg-[var(--bg-panel)] border-[var(--accent)]"
            )}
        >
            {type === 'success' ? (
                <CheckCircle size={18} className="text-green-500" />
            ) : (
                <FileMusic size={18} className="text-[var(--accent)]" />
            )}
            <span className="text-sm font-medium">{message}</span>
        </div>
    );
};
