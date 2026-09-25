import React, { useState } from 'react';
import { BookmarkPlus } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface SaveCompositionModalProps {
  isOpen: boolean;
  onClose: () => void;
  photoCount: number;
  onSave: (name: string) => void;
}

export const SaveCompositionModal: React.FC<SaveCompositionModalProps> = ({
  isOpen,
  onClose,
  photoCount,
  onSave,
}) => {
  const [name, setName] = useState(`Susunan ${new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}`);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSave(name.trim());
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Simpan susunan saat ini">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
            Nama susunan
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-sm text-app-primary focus:outline-none focus:border-accent"
            placeholder="Contoh: Nuansa senja"
            autoFocus
          />
          <p className="text-[11px] text-app-muted mt-1.5">
            Menyimpan {photoCount} foto, posisi masing-masing, dan foto yang disematkan.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" icon={<BookmarkPlus className="w-4 h-4" />}>
            Simpan susunan
          </Button>
        </div>
      </form>
    </Modal>
  );
};
