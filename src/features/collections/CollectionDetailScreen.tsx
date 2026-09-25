import React from 'react';
import { ArrowLeft, Play, Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import { Collection } from '../../types/collection';
import { Photo } from '../../types/photo';
import { Button } from '../../components/ui/Button';
import { PhotoCard } from '../library/components/PhotoCard';
import { KeepPhotoSheet } from './components/KeepPhotoSheet';

interface CollectionDetailScreenProps {
  collection: Collection;
  photos: Photo[];
  onBack: () => void;
  onStartSession: (col: Collection) => void;
  onPhotoClick: (photo: Photo) => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetPhotoTags: (id: string, tags: string) => void | Promise<void>;
  onKeepPhoto: (photo: Photo, collectionId: string, namingRule: string, customName?: string) => void | Promise<void>;
  collections: Collection[];
  onCreateCollection: (name: string) => string | Promise<string>;
  onToggleHide: (id: string) => void;
  onRemoveDriveLink: (photo: Photo) => void;
  onDeleteCollection: (id: string) => void;
  onRenameCollection?: (id: string, newName: string) => void;
}

export const CollectionDetailScreen: React.FC<CollectionDetailScreenProps> = ({
  collection,
  photos,
  onBack,
  onStartSession,
  onPhotoClick,
  onToggleLike,
  onToggleFavorite,
  onSetPhotoTags,
  onKeepPhoto,
  collections,
  onCreateCollection,
  onToggleHide,
  onRemoveDriveLink,
  onDeleteCollection,
  onRenameCollection,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState(collection.name);
  const [photoToKeep, setPhotoToKeep] = React.useState<Photo | null>(null);

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editName.trim() && editName.trim() !== collection.name) {
      onRenameCollection?.(collection.id, editName.trim());
    }
    setIsEditing(false);
  };

  const handleEditTags = (photo: Photo) => {
    const value = window.prompt('Masukkan tag, pisahkan dengan koma (maksimal 12).', photo.tags?.join(', ') || '');
    if (value !== null) void onSetPhotoTags(photo.id, value);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 md:pb-12">
      {/* Header with back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 rounded-xl bg-surface border border-subtle text-app-secondary hover:text-app-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs text-app-muted uppercase tracking-wider">Koleksi</span>
      </div>

      {/* Hero Collection Card */}
      <div className="relative rounded-2xl overflow-hidden border border-subtle bg-surface p-6 sm:p-8 shadow-glass flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl flex-1">
          <span className="text-xs font-semibold text-accent uppercase tracking-wider">
            {photos.length} foto di koleksi
          </span>

          {isEditing ? (
            <form onSubmit={handleSaveRename} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-elevated border border-accent rounded-xl px-3 py-1.5 text-xl sm:text-2xl font-bold text-app-primary focus:outline-none"
                autoFocus
              />
              <Button size="sm" variant="primary" type="submit">
                Simpan
              </Button>
              <Button size="sm" variant="ghost" type="button" onClick={() => setIsEditing(false)}>
                Batal
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-app-primary">{collection.name}</h1>
              <button
                onClick={() => {
                  setEditName(collection.name);
                  setIsEditing(true);
                }}
                className="p-1.5 rounded-lg text-app-muted hover:text-app-primary hover:bg-elevated transition-colors"
                title="Ubah nama koleksi"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          )}

          {collection.description && (
            <p className="text-sm text-app-secondary opacity-90">{collection.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            icon={<Play className="w-5 h-5 fill-current" />}
            onClick={() => onStartSession(collection)}
            className="flex-1 sm:flex-initial"
          >
            Mulai sesi
          </Button>

          <button
            onClick={() => {
              if (window.confirm(`Hapus koleksi "${collection.name}"? Foto tetap ada di galeri.`)) {
                onDeleteCollection(collection.id);
                onBack();
              }
            }}
            className="p-3 rounded-xl bg-surface hover:bg-red-500/20 border border-subtle hover:border-red-500/30 text-app-muted hover:text-red-400 transition-colors"
            title="Hapus koleksi"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Photos in this collection */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {photos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onPhotoClick={onPhotoClick}
              onToggleLike={onToggleLike}
              onToggleFavorite={onToggleFavorite}
              onEditTags={handleEditTags}
              onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onRemoveDriveLink={onRemoveDriveLink}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center border border-dashed border-subtle rounded-2xl space-y-3">
          <div className="w-12 h-12 rounded-xl bg-elevated text-app-muted mx-auto flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-app-primary">Koleksi ini masih kosong</p>
          <p className="text-xs text-app-muted">
            Tambahkan foto dari Galeri atau gunakan tombol Simpan saat pemutar berjalan.
          </p>
        </div>
      )}
      <KeepPhotoSheet isOpen={!!photoToKeep} onClose={() => setPhotoToKeep(null)} photo={photoToKeep}
        collections={collections} onKeepSuccess={onKeepPhoto} onCreateCollection={onCreateCollection} />
    </div>
  );
};
