import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, Heart, Star, Bookmark, EyeOff, Image as ImageIcon, Tag, AlertCircle, RotateCcw, Info, ChevronDown, ChevronUp, Pin, FolderHeart } from 'lucide-react';
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
  onReconnectPhoto?: (photoId: string, file: File) => void;
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
  onReconnectPhoto,
  onAddDriveLinks,
  onCreateCollection,
}) => {
  const [filter, setFilter] = useState<LibraryFilter>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [photoToKeep, setPhotoToKeep] = useState<Photo | null>(null);
  const [visibleCount, setVisibleCount] = useState(100);
  const [showGuide, setShowGuide] = useState(false);
  useEffect(() => { setFilter(initialFilter); }, [initialFilter]);
  useEffect(() => { setVisibleCount(100); }, [filter, searchQuery, selectedTag]);

  const missingCount = useMemo(() => photos.filter((p) => p.missing).length, [photos]);

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
            {missingCount > 0 && (
              <span className="text-amber-400 font-medium ml-2">
                ({missingCount} perlu dipilih ulang)
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="ghost"
            size="sm"
            icon={<Info className="w-4 h-4 text-accent" />}
            onClick={() => setShowGuide(!showGuide)}
            className="text-app-secondary hover:text-app-primary"
          >
            {showGuide ? 'Tutup panduan' : 'Panduan status & istilah'}
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
          >
            Tambah foto
          </Button>
        </div>
      </div>

      {/* MISSING PHOTOS RECONNECT BANNER */}
      {missingCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-fade-in">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-accent shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-app-primary">
                {missingCount} foto perlu dipilih ulang dari perangkat
              </p>
              <p className="text-xs text-app-secondary mt-0.5 leading-relaxed">
                Saat aplikasi dibuka kembali, browser memerlukan pemilihan ulang berkas lokal untuk menghubungkan kembali akses foto asli. Metadata, suka, dan koleksi Anda tetap aman.
              </p>
            </div>
          </div>

          <label className="cursor-pointer inline-flex items-center justify-center font-medium transition-all duration-140 rounded-xl bg-accent hover:bg-accent-hover text-player text-xs px-4 py-2.5 gap-2 shrink-0 shadow-sm font-semibold">
            <RotateCcw className="w-4 h-4" />
            <span>Pilih ulang berkas</span>
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  onAddFiles(e.target.files);
                }
              }}
            />
          </label>
        </div>
      )}

      {/* STORAGE & TERMS GUIDE PANEL */}
      {showGuide && (
        <div className="p-5 sm:p-6 rounded-2xl bg-surface/90 border border-subtle shadow-glass space-y-5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-accent" />
              <h2 className="text-sm sm:text-base font-semibold text-app-primary">
                Panduan Penyimpanan & Istilah Pengelompokan
              </h2>
            </div>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs text-app-muted hover:text-app-primary p-1"
            >
              Tutup
            </button>
          </div>

          {/* Storage Explanation */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Penyimpanan Foto & Perilaku Buka Ulang
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-elevated/60 border border-subtle">
                <span className="text-xs font-semibold text-app-primary flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  Tersedia
                </span>
                <p className="text-xs text-app-secondary mt-1.5 leading-relaxed">
                  Foto aktif dan siap diputar. Selama sesi aktif atau tautan Drive publik tersambung, foto dapat ditampilkan penuh.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-elevated/60 border border-subtle">
                <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5" />
                  Perlu dipilih ulang
                </span>
                <p className="text-xs text-app-secondary mt-1.5 leading-relaxed">
                  Pratinjau tersimpan di perangkat. Saat aplikasi ditutup/dimuat ulang, browser melepas izin berkas lokal; pilih kembali berkas foto untuk menghubungkannya.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-elevated/60 border border-subtle">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  Salinan tersimpan
                </span>
                <p className="text-xs text-app-secondary mt-1.5 leading-relaxed">
                  Salinan berkas foto disimpan secara utuh ke database aplikasi. Selalu tersedia kapan saja tanpa perlu memilih ulang berkas.
                </p>
              </div>
            </div>
            <p className="text-xs text-app-muted italic">
              * Aplikasi tidak pernah mengubah berkas foto asli di perangkat Anda dan tidak menyalin foto secara otomatis tanpa tindakan Anda.
            </p>
          </div>

          {/* Grouping Terms Explanation */}
          <div className="space-y-3 pt-2 border-t border-subtle">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-app-muted">
              Arti Istilah Pengelompokan Foto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-elevated/40 border border-subtle">
                <span className="text-xs font-semibold text-heart flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 fill-current" />
                  Disukai
                </span>
                <p className="text-xs text-app-secondary mt-1 leading-relaxed">
                  Tanda apresiasi cepat untuk menyaring foto favorit santai dan memulai sesi khusus foto yang disukai.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-elevated/40 border border-subtle">
                <span className="text-xs font-semibold text-fav flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  Favorit
                </span>
                <p className="text-xs text-app-secondary mt-1 leading-relaxed">
                  Tanda prioritas tinggi untuk akses cepat dari beranda dan sesi khusus kumpulan foto terbaik.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-elevated/40 border border-subtle">
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 fill-current" />
                  Tersimpan
                </span>
                <p className="text-xs text-app-secondary mt-1 leading-relaxed">
                  Foto yang telah disalin ke penyimpanan internal aplikasi agar selalu siap buka di sesi mendatang.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-elevated/40 border border-subtle">
                <span className="text-xs font-semibold text-accent flex items-center gap-1.5">
                  <FolderHeart className="w-3.5 h-3.5" />
                  Koleksi
                </span>
                <p className="text-xs text-app-secondary mt-1 leading-relaxed">
                  Album bertema khusus buatan Anda untuk mengelompokkan beberapa foto agar dapat diputar bersama.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-elevated/40 border border-subtle sm:col-span-2 md:col-span-2">
                <span className="text-xs font-semibold text-pin flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 fill-current" />
                  Sematkan (PIN)
                </span>
                <p className="text-xs text-app-secondary mt-1 leading-relaxed">
                  Mengunci foto pada slot layar pemutar selama sesi berlangsung. Foto yang disematkan tidak akan berganti saat foto lain berganti otomatis, manual, maupun acak ulang.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

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
              onAddFiles={onAddFiles}
              onReconnectPhoto={onReconnectPhoto}
            />
          ))}
        </div>
      ) : photos.length === 0 ? (
        <div className="p-10 sm:p-12 text-center border border-dashed border-subtle rounded-2xl space-y-3.5 bg-surface/40">
          <div className="w-12 h-12 rounded-xl bg-elevated text-accent mx-auto flex items-center justify-center">
            <ImageIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-app-primary">Galeri masih kosong</p>
            <p className="text-xs text-app-secondary max-w-md mx-auto mt-1 leading-relaxed">
              Belum ada foto yang ditambahkan ke galeri. Mulai dengan memilih foto dari perangkat Anda atau memasukkan tautan Google Drive publik.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddModalOpen(true)}
            className="mt-1 shadow-md shadow-accent/20"
          >
            Tambah foto
          </Button>
        </div>
      ) : (
        <div className="p-10 sm:p-12 text-center border border-dashed border-subtle rounded-2xl space-y-3.5 bg-surface/40">
          <div className="w-12 h-12 rounded-xl bg-elevated text-app-muted mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <p className="text-base font-bold text-app-primary">
              {searchQuery.trim() || selectedTag ? 'Foto tidak ditemukan' : filter === 'favorites' ? 'Belum ada foto favorit' : filter === 'liked' ? 'Belum ada foto yang disukai' : filter === 'kept' ? 'Belum ada salinan tersimpan' : filter === 'hidden' ? 'Tidak ada foto yang disembunyikan' : 'Foto tidak ditemukan'}
            </p>
            <p className="text-xs text-app-secondary max-w-md mx-auto mt-1 leading-relaxed">
              {searchQuery.trim()
                ? `Tidak ada foto yang cocok dengan pencarian “${searchQuery}”. Periksa ejaan atau bersihkan kata kunci.`
                : selectedTag
                ? `Tidak ada foto dengan tag “${selectedTag}”.`
                : filter === 'favorites'
                ? 'Tandai foto terbaik Anda dengan bintang (★) agar muncul di tab Favorit.'
                : filter === 'liked'
                ? 'Beri tanda hati (♥) pada foto di galeri untuk menyaring foto yang Anda sukai di sini.'
                : filter === 'kept'
                ? 'Gunakan tombol Simpan pada kartu foto atau saat pemutar berjalan untuk menyimpan salinan utuh ke aplikasi.'
                : filter === 'hidden'
                ? 'Foto yang Anda sembunyikan dari pemutar akan muncul di sini dan dapat dipulihkan kapan saja.'
                : 'Ubah filter atau tambahkan foto baru ke galeri.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            {searchQuery.trim() && (
              <Button variant="secondary" size="sm" onClick={() => setSearchQuery('')}>
                Hapus pencarian
              </Button>
            )}
            {selectedTag && (
              <Button variant="secondary" size="sm" onClick={() => setSelectedTag(null)}>
                Hapus filter tag
              </Button>
            )}
            {filter !== 'all' && (
              <Button variant="secondary" size="sm" onClick={() => setFilter('all')}>
                Tampilkan semua foto
              </Button>
            )}
          </div>
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
