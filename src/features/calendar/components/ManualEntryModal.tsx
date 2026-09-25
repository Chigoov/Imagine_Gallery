import React, { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate: string; // YYYY-MM-DD
  onSaveEntry: (entry: {
    entry_date: string;
    count_value: number;
    duration_seconds: number;
    notes?: string;
  }) => void | Promise<void>;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  onSaveEntry,
}) => {
  const [date, setDate] = useState<string>(initialDate);
  const [count, setCount] = useState<number>(1);
  const [durationMinutes, setDurationMinutes] = useState<number>(20);
  const [isDurationKnown, setIsDurationKnown] = useState<boolean>(false);
  const [notes, setNotes] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) { setDate(initialDate); setCount(1); setNotes(''); setIsDurationKnown(false); setError(''); }
  }, [isOpen, initialDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
    await onSaveEntry({
      entry_date: date,
      count_value: Math.max(1, count),
      duration_seconds: isDurationKnown ? Math.max(0, durationMinutes * 60) : 0,
      notes: notes.trim() || undefined,
    });
    onClose();
    } catch { setError('Catatan tidak dapat disimpan. Coba lagi.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Tambah catatan kalender manual">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Tanggal
          </label>
          <input
            type="date"
              aria-label="Tanggal"
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-sm text-app-primary focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Jumlah sesi
            </label>
            <input
              type="number"
              aria-label="Jumlah sesi"
              required
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-sm text-app-primary focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
                Durasi (menit)
              </label>
              <label className="flex items-center gap-1.5 text-[11px] text-app-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={!isDurationKnown}
                  onChange={(e) => setIsDurationKnown(!e.target.checked)}
                  className="rounded border-subtle bg-elevated text-accent focus:ring-0"
                />
                <span>Tidak diketahui</span>
              </label>
            </div>
            <input
              type="number"
              aria-label="Durasi dalam menit"
              required={isDurationKnown}
              min="0"
              max="480"
              disabled={!isDurationKnown}
              value={isDurationKnown ? durationMinutes : ''}
              placeholder={isDurationKnown ? '20' : 'Tidak diketahui'}
              onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 0)}
              className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-sm text-app-primary focus:outline-none focus:border-accent disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Catatan (opsional, pribadi)
          </label>
          <textarea
            aria-label="Catatan"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Contoh: Menikmati tema alam dan pegunungan"
            rows={2}
            className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2 text-sm text-app-primary focus:outline-none focus:border-accent resize-none"
          />
        </div>

        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Batal
          </Button>
          <Button variant="primary" type="submit" disabled={saving} icon={<PlusCircle className="w-4 h-4" />}>
            {saving ? 'Menyimpan…' : 'Simpan catatan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
