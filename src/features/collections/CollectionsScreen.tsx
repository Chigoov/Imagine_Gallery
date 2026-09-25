import React, { useState } from 'react';
import { FolderHeart, Plus, Play, Sparkles } from 'lucide-react';
import { Collection } from '../../types/collection';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

interface CollectionsScreenProps {
  collections: Collection[];
  onSelectCollection: (col: Collection) => void;
  onStartSession: (col: Collection) => void;
  onCreateCollection: (name: string, description?: string) => void;
}

export const CollectionsScreen: React.FC<CollectionsScreenProps> = ({
  collections,
  onSelectCollection,
  onStartSession,
  onCreateCollection,
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      onCreateCollection(newName.trim(), newDesc.trim() || undefined);
      setNewName('');
      setNewDesc('');
      setIsCreateModalOpen(false);
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app-primary">
            Koleksi foto
          </h1>
          <p className="text-sm text-app-muted mt-1">
            Kelompok foto virtual • Foto asli tetap aman
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsCreateModalOpen(true)}
          className="self-start sm:self-auto"
        >
          Buat koleksi
        </Button>
      </div>

      {/* Collections Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        {collections.map((col) => (
          <div
            key={col.id}
            role="button"
            tabIndex={0}
            onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onSelectCollection(col); } }}
            onClick={() => onSelectCollection(col)}
            className="group relative h-56 rounded-2xl overflow-hidden border border-subtle hover:border-strong cursor-pointer transition-all duration-200 shadow-glass flex flex-col justify-between p-5 bg-surface"
          >
            {/* Background cover */}
            <img
              src={col.cover_photo_url || undefined}
              referrerPolicy="no-referrer"
              hidden={!col.cover_photo_url}
              loading="lazy"
              alt={col.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 filter brightness-70 group-hover:brightness-85 pointer-events-none"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-player via-player/40 to-transparent pointer-events-none" />

            {/* Top Quick Actions */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-full bg-player/80 backdrop-blur-md border border-white/10 text-xs font-semibold text-accent">
                {col.photo_count} foto
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStartSession(col);
                }}
                className="p-2 rounded-xl bg-accent text-player hover:bg-accent-hover shadow-md font-bold transition-transform active:scale-95"
                title="Mulai sesi dengan koleksi ini"
              >
                <Play className="w-4 h-4 fill-current" />
              </button>
            </div>

            {/* Bottom info */}
            <div className="relative z-10 space-y-1">
              <h3 className="text-lg font-bold text-app-primary group-hover:text-accent transition-colors line-clamp-1">
                {col.name}
              </h3>
              {col.description && (
                <p className="text-xs text-app-secondary line-clamp-2 opacity-80">
                  {col.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Dialog pembuatan koleksi */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Buat koleksi baru"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Nama koleksi
            </label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Contoh: Pemandangan malam"
              className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2.5 text-sm text-app-primary focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Deskripsi (opsional)
            </label>
            <textarea
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Tulis deskripsi atau tema singkat..."
              rows={3}
              className="w-full mt-1.5 bg-elevated border border-subtle rounded-xl px-4 py-2 text-sm text-app-primary focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={() => setIsCreateModalOpen(false)}>
              Batal
            </Button>
            <Button variant="primary" type="submit">
              Buat koleksi
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
