import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: string;
  variant?: 'modal' | 'sheet' | 'fullscreen';
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-lg', variant = 'modal' }) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    // ponytail: native dialogs provide focus trapping, Escape, and background inertness.
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title || 'Aksi foto'}
      onCancel={(event) => { event.preventDefault(); onClose(); }}
      onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
      className={`app-dialog ${variant === 'fullscreen' ? 'dialog-fullscreen' : variant === 'sheet' ? 'dialog-sheet' : ''} w-[calc(100%-2rem)] ${variant === 'fullscreen' ? 'max-w-none' : maxWidth} bg-surface text-app-primary border border-subtle rounded-2xl shadow-glass p-0`}
    >
      {isOpen && <div className="flex max-h-[90dvh] flex-col" onClick={(event) => event.stopPropagation()}>
        {title && <div className="flex shrink-0 items-center justify-between gap-3 px-5 py-4 border-b border-subtle">
          <h2 className="text-lg font-semibold text-app-primary">{title}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg text-app-muted hover:text-app-primary hover:bg-white/5" aria-label="Tutup"><X className="w-5 h-5" /></button>
        </div>}
        <div className={variant === 'fullscreen' ? 'min-h-0 flex-1' : 'p-5 overflow-y-auto'}>{children}</div>
      </div>}
    </dialog>
  );
};
