import React, { useState, useEffect } from 'react';
import { Bookmark, FolderPlus, Check } from 'lucide-react';
import { BottomSheet } from '../../../components/ui/BottomSheet';
import { Button } from '../../../components/ui/Button';
import { Photo } from '../../../types/photo';
import { Collection } from '../../../types/collection';

interface KeepPhotoSheetProps {
  isOpen: boolean;
  onClose: () => void;
  photo: Photo | null;
  collections: Collection[];
  onKeepSuccess: (photo: Photo, collectionId: string, namingRule: string, customName?: string) => void | Promise<void>;
  onCreateCollection: (name: string) => string | Promise<string>;
}

export const KeepPhotoSheet: React.FC<KeepPhotoSheetProps> = ({
  isOpen,
  onClose,
  photo,
  collections,
  onKeepSuccess,
  onCreateCollection,
}) => {
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>(collections[0]?.id || '');
  const [namingRule, setNamingRule] = useState<string>('original');
  const [newCollectionName, setNewCollectionName] = useState<string>('');
  const [isAddingNewCol, setIsAddingNewCol] = useState(false);
  const [customName, setCustomName] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (isOpen) { setError(''); setCustomName(''); setNamingRule('original'); setIsAddingNewCol(false); }
  }, [isOpen, photo?.id]);

  if (!isOpen || !photo) return null;

  const handleSave = async () => {
    if (saving) return;
    if (isAddingNewCol && !newCollectionName.trim()) { setError('Masukkan nama koleksi.'); return; }
    if (namingRule === 'custom' && !customName.trim()) { setError('Masukkan nama tampilan.'); return; }
    setError('');
    setSaving(true);
    try {
    let targetColId = selectedCollectionId;
    if (targetColId && !collections.some((collection) => collection.id === targetColId)) targetColId = '';
    if (isAddingNewCol && newCollectionName.trim()) {
      targetColId = await onCreateCollection(newCollectionName.trim());
    }
    await onKeepSuccess(photo, targetColId, namingRule, namingRule === 'custom' ? customName.trim() : undefined);
    onClose();
    } catch (err) { setError(err instanceof Error ? err.message : 'Foto tidak dapat disimpan. Coba lagi.'); }
    finally { setSaving(false); }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={() => { if (!saving) onClose(); }} title="Simpan ke penyimpanan aplikasi">
      <div className="space-y-5">
        {/* Photo thumbnail preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-elevated/60 border border-subtle">
          <img
            src={photo.thumbnail_url || photo.url}
            alt={photo.display_name}
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-lg object-cover border border-white/10 shrink-0"
          />
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-app-primary line-clamp-1">{photo.display_name}</p>
            <p className="text-[11px] text-app-muted line-clamp-1">{photo.original_filename}</p>
          </div>
        </div>

        {/* Collection Selector */}
        {photo.kept && <p className="text-sm text-app-muted">Sudah tersimpan. Gunakan salinan ini di koleksi lain.</p>}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
            Koleksi tujuan
          </label>

          <div className="space-y-1 max-h-44 overflow-y-auto">
            <button type="button" aria-pressed={!isAddingNewCol && !selectedCollectionId} onClick={() => { setSelectedCollectionId(''); setIsAddingNewCol(false); }} className="w-full p-3 rounded-xl border border-subtle text-left text-sm">Hanya di galeri</button>
            {collections.map((col) => {
              const isSelected = !isAddingNewCol && selectedCollectionId === col.id;
              return (
                <button
                  key={col.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => {
                    setSelectedCollectionId(col.id);
                    setIsAddingNewCol(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                    isSelected
                      ? 'border-accent bg-accent/15 text-app-primary font-semibold'
                      : 'border-subtle bg-surface hover:bg-elevated text-app-secondary'
                  }`}
                >
                  <span>{col.name}</span>
                  {isSelected && <Check className="w-4 h-4 text-accent" />}
                </button>
              );
            })}
          </div>

          {/* New collection toggle */}
          {isAddingNewCol ? (
            <div className="pt-2 flex gap-2">
              <input
                type="text"
                aria-label="Nama koleksi baru"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Nama koleksi baru"
                className="flex-1 bg-elevated border border-subtle rounded-xl px-3 py-2 text-xs text-app-primary focus:outline-none focus:border-accent"
                autoFocus
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setIsAddingNewCol(false)}
              >
                Batal
              </Button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsAddingNewCol(true)}
              className="text-xs text-accent hover:underline flex items-center gap-1 font-medium pt-1"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              + Buat koleksi baru
            </button>
          )}
        </div>

        {/* Naming Rule */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
            Format nama berkas
          </label>
          <select
            aria-label="Format nama berkas"
            value={namingRule}
            onChange={(e) => setNamingRule(e.target.value)}
            className="w-full bg-elevated border border-subtle rounded-xl px-3.5 py-2 text-xs text-app-primary focus:outline-none focus:border-accent"
          >
            <option value="original">Nama berkas asli ({photo.original_filename})</option>
            <option value="collection_num">Koleksi + nomor urut</option>
            <option value="collection_date_num">Koleksi + tanggal + nomor</option>
            <option value="custom">Nama tampilan khusus</option>
          </select>
          {namingRule === 'custom' && <input aria-label="Nama tampilan khusus" value={customName} onChange={(event) => setCustomName(event.target.value)} className="w-full p-3 rounded-xl bg-elevated border border-subtle text-sm" placeholder="Nama foto" />}
        </div>

        {/* Actions */}
        {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={saving}
            icon={<Bookmark className="w-4 h-4 fill-current" />}
          >
            {saving ? 'Menyimpan…' : 'Simpan foto'}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
