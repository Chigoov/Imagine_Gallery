import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Heart, Star, Bookmark, EyeOff, Image as ImageIcon, Tag } from 'lucide-react';
import { Photo } from '../../types/photo';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { PhotoCard } from './components/PhotoCard';
import { AddSourceModal } from './components/AddSourceModal';
import { KeepPhotoSheet } from '../collections/components/KeepPhotoSheet';
import { Collection } from '../../types/collection';

export type LibraryFilter = 'all' | 'liked' | 'favorites' | 'kept' | 'hidden';

interface LibraryScreenProps {
  photos: Photo[];
  collections: Collection[];
  initialFilter?: LibraryFilter;
  onPhotoClick: (photo: Photo) => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onSetPhotoTags: (id: string, tags: string) => void | Promise<void>;
  onKeepPhoto: (photo: Photo, collectionId: string, rule: string, customName?: string) => void | Promise<void>;
  onToggleHide: (id: string) => void;
  onRemoveDriveLink: (photo: Photo) => void;
  onAddFiles: (files: FileList | File[]) => void;
  onAddDriveLinks: (links: string) => Promise<void>;
  onCreateCollection: (name: string) => string | Promise<string>;
}

export const LibraryScreen: React.FC<LibraryScreenProps> = ({
  photos,
  collections,
  initialFilter = 'all',
  onPhotoClick,
  onToggleLike,
  onToggleFavorite,
  onSetPhotoTags,
  onKeepPhoto,
  onToggleHide,
  onRemoveDriveLink,
  onAddFiles,
  onAddDriveLinks,
  onCreateCollection,
}) => {
  const [filter, setFilter] = useState<LibraryFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [photoToKeep, setPhotoToKeep] = useState<Photo | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);
  useEffect(() => { setVisibleCount(100); }, [filter, searchQuery, selectedTag]);

  const availableTags = useMemo(() => [...new Set(photos.filter((photo) => filter === 'hidden' ? photo.hidden : !photo.hidden).flatMap((photo) => photo.tags || []))].sort((a, b) => a.localeCompare(b, 'id')), [photos, filter]);
  useEffect(() => { if (selectedTag && !availableTags.includes(selectedTag)) setSelectedTag(null); }, [availableTags, selectedTag]);

  // Compute filtered list
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      // Filter tab condition
      if (filter === 'liked' && !p.liked) return false;
      if (filter === 'favorites' && !p.favorite) return false;
      if (filter === 'kept' && !p.kept) return false;
      if (filter === 'hidden' && !p.hidden) return false;
      if (filter !== 'hidden' && p.hidden) return false; // don't show hidden photos on normal tabs
      if (selectedTag && !p.tags?.includes(selectedTag)) return false;

      // Search query condition
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = p.display_name.toLowerCase().includes(query);
        const matchFile = p.original_filename.toLowerCase().includes(query);
        const matchTag = p.tags?.some((tag) => tag.toLocaleLowerCase().includes(query));
        return matchTitle || matchFile || matchTag;
      }

      return true;
    });
  }, [photos, filter, searchQuery, selectedTag]);

  const handleEditTags = (photo: Photo) => {
    const value = window.prompt('Masukkan tag, pisahkan dengan koma (maksimal 12).', photo.tags?.join(', ') || '');
    if (value !== null) void onSetPhotoTags(photo.id, value);
  };

  return (
    <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in pb-24 md:pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-app-primary">
            Galeri pribadi
          </h1>
          <p className="text-sm text-app-muted mt-1">
            {photos.length} foto di galeri • {filteredPhotos.length} ditampilkan
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto"
        >
          Tambah foto
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Segmented Filter Pills */}
        <div className="overflow-x-auto pb-1 sm:pb-0">
          <SegmentedControl
            options={[
              { value: 'all', label: 'Semua foto' },
              { value: 'liked', label: <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5 text-heart" /> Disukai</span> },
              { value: 'favorites', label: <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5 text-fav" /> Favorit</span> },
              { value: 'kept', label: <span className="flex items-center gap-1"><Bookmark className="w-3.5 h-3.5 text-emerald-400" /> Tersimpan</span> },
              { value: 'hidden', label: <span className="flex items-center gap-1"><EyeOff className="w-3.5 h-3.5 text-red-400" /> Disembunyikan</span> },
            ]}
            value={filter}
            onChange={(val) => setFilter(val as LibraryFilter)}
          />
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-app-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            aria-label="Cari foto"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama, berkas, atau tag..."
            className="w-full bg-elevated border border-subtle rounded-xl pl-9 pr-4 py-2 text-xs text-app-primary placeholder:text-app-muted focus:outline-none focus:border-accent"
          />
        </div>
      </div>

      {availableTags.length > 0 && <div className="flex flex-wrap items-center gap-2" aria-label="Filter berdasarkan tag">
        <Tag className="w-4 h-4 text-app-muted" />
        {availableTags.map((tag) => <button key={tag} type="button" aria-pressed={selectedTag === tag} onClick={() => setSelectedTag(selectedTag === tag ? null : tag)} className={`rounded-full border px-3 py-1 text-xs transition-colors ${selectedTag === tag ? 'border-accent bg-accent/15 text-accent' : 'border-subtle bg-surface text-app-muted hover:text-app-primary'}`}>{tag}</button>)}
      </div>}

      {/* Photo Grid */}
      {filteredPhotos.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* ponytail: bound mounted cards; explicit paging avoids a new virtual-grid dependency. */}
          {filteredPhotos.slice(0, visibleCount).map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onPhotoClick={onPhotoClick}
              onToggleLike={onToggleLike}
              onToggleFavorite={onToggleFavorite}
              onEditTags={handleEditTags}
              onKeepPhoto={(p) => setPhotoToKeep(p)}
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
          <p className="text-sm font-semibold text-app-primary">Foto tidak ditemukan</p>
          <p className="text-xs text-app-muted max-w-sm mx-auto">
            {filter === 'hidden'
              ? 'Belum ada foto yang disembunyikan. Foto yang disembunyikan dari Pemutar akan muncul di sini.'
              : 'Ubah kata pencarian atau tambahkan foto dari perangkat maupun tautan Drive publik.'}
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2"
          >
            Tambah foto
          </Button>
        </div>
      )}

      {filteredPhotos.length > visibleCount && <Button variant="secondary" onClick={() => setVisibleCount((count) => count + 100)}>Tampilkan 100 foto lagi (tersisa {filteredPhotos.length - visibleCount})</Button>}

      {/* Add Photos Modal */}
      <AddSourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddFiles={onAddFiles}
        onAddDriveLinks={onAddDriveLinks}
      />

      {/* Keep Photo Sheet */}
      <KeepPhotoSheet
        isOpen={!!photoToKeep}
        onClose={() => setPhotoToKeep(null)}
        photo={photoToKeep}
        collections={collections}
        onKeepSuccess={onKeepPhoto}
        onCreateCollection={onCreateCollection}
      />
    </div>
  );
};
