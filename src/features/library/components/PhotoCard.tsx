import React, { useEffect, useState } from 'react';
import { Heart, Star, Bookmark, EyeOff, RotateCcw, Trash2, ImageOff, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { Photo } from '../../../types/photo';

interface PhotoCardProps {
  photo: Photo;
  onPhotoClick: (photo: Photo) => void;
  onToggleLike: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onEditTags: (photo: Photo) => void;
  onKeepPhoto: (photo: Photo) => void;
  onToggleHide: (id: string) => void;
  onRemoveDriveLink: (photo: Photo) => void;
}

export const PhotoCard: React.FC<PhotoCardProps> = ({
  photo,
  onPhotoClick,
  onToggleLike,
  onToggleFavorite,
  onEditTags,
  onKeepPhoto,
  onToggleHide,
  onRemoveDriveLink,
}) => {
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [photo.thumbnail_url, photo.url]);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Buka ${photo.display_name}`}
      onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); onPhotoClick(photo); } }}
      onClick={() => { if (!imageError) onPhotoClick(photo); }}
      className="photo-card group relative aspect-square rounded-2xl overflow-hidden bg-elevated border border-subtle hover:border-strong cursor-pointer transition-all duration-200 shadow-glass"
    >
      <img
        src={photo.thumbnail_url || photo.url}
        alt={photo.display_name}
        referrerPolicy="no-referrer"
        onError={() => setImageError(true)}
        className={clsx(
          'w-full h-full object-cover transition-transform duration-300 group-hover:scale-105',
          photo.hidden && 'filter grayscale opacity-50'
        )}
        loading="lazy"
      />
      {imageError && <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-3 text-center bg-elevated text-app-muted">
        <ImageOff className="w-6 h-6" />
        <span className="text-[11px]">{photo.remote_url ? 'Foto Drive tidak dapat dimuat. Periksa akses tautan publiknya.' : 'Foto tidak dapat dimuat.'}</span>
      </div>}

      {/* Badges on Top */}
      <div className="absolute top-2 inset-x-2 flex items-center justify-between pointer-events-none">
        <div className="flex flex-wrap items-center gap-1">
          {photo.favorite && (
            <span className="p-1 rounded-md bg-fav/90 text-player shadow text-xs">
              <Star className="w-3 h-3 fill-current" />
            </span>
          )}
          {photo.liked && (
            <span className="p-1 rounded-md bg-heart/90 text-white shadow text-xs">
              <Heart className="w-3 h-3 fill-current" />
            </span>
          )}
          {photo.kept && (
            <span className="p-1 rounded-md bg-emerald-500/90 text-player shadow text-xs">
              <Bookmark className="w-3 h-3 fill-current" />
            </span>
          )}
        </div>

        {photo.hidden && (
          <span className="px-1.5 py-0.5 rounded bg-red-500/80 text-white text-[10px] font-semibold">
            Disembunyikan
          </span>
        )}
      </div>

      {/* Hover action overlay */}
      <div
        className="photo-card-actions absolute inset-0 bg-gradient-to-t from-player via-player/30 to-transparent opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-140 flex flex-col justify-end p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-xs font-semibold text-app-primary line-clamp-1 mb-2">
          {photo.display_name}
        </p>
        {photo.tags?.length ? <p className="text-[10px] text-app-muted line-clamp-1 mb-2">{photo.tags.join(' · ')}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-1">
          <div className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => onToggleLike(photo.id)}
              className={clsx(
                'p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg transition-colors',
                photo.liked ? 'text-heart bg-heart/20' : 'text-white/80 hover:text-white bg-black/40'
              )}
              title="Sukai"
            >
              <Heart className={clsx('w-3.5 h-3.5', photo.liked && 'fill-current')} />
            </button>

            <button
              onClick={() => onToggleFavorite(photo.id)}
              className={clsx(
                'p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg transition-colors',
                photo.favorite ? 'text-fav bg-fav/20' : 'text-white/80 hover:text-white bg-black/40'
              )}
              title="Favorit"
            >
              <Star className={clsx('w-3.5 h-3.5', photo.favorite && 'fill-current')} />
            </button>

            <button
              onClick={() => onEditTags(photo)}
              className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-white/80 hover:text-accent bg-black/40"
              title="Ubah tag"
              aria-label={`Ubah tag ${photo.display_name}`}
            >
              <Tag className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => onKeepPhoto(photo)}
              className={clsx(
                'p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg transition-colors',
                photo.kept ? 'text-emerald-400 bg-emerald-500/20' : 'text-white/80 hover:text-white bg-black/40'
              )}
              title="Simpan salinan"
            >
              <Bookmark className={clsx('w-3.5 h-3.5', photo.kept && 'fill-current')} />
            </button>
          </div>

          <button
            onClick={() => onToggleHide(photo.id)}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-white/80 hover:text-red-400 bg-black/40 hover:bg-black/60 transition-colors"
            title={photo.hidden ? 'Pulihkan foto' : 'Sembunyikan dari acak'}
          >
            {photo.hidden ? <RotateCcw className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>
          {photo.remote_url && <button
            onClick={(event) => { event.stopPropagation(); onRemoveDriveLink(photo); }}
            className="p-2 min-w-11 min-h-11 flex items-center justify-center rounded-lg text-red-300 hover:text-red-200 bg-black/40 hover:bg-black/60 transition-colors"
            title="Hapus tautan Drive dari galeri ini"
            aria-label={`Hapus tautan ${photo.display_name} dari galeri`}
          ><Trash2 className="w-3.5 h-3.5" /></button>}
        </div>
      </div>
    </div>
  );
};
