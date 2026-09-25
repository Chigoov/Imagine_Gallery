import { db, PhotoFile } from './db';
import { Photo } from '../types/photo';
import { parsePublicDrivePhotoLink } from '../domain/photo/driveLinks';
import { CollectionRepository } from './CollectionRepository';

const sourceFiles = new Map<string, File>();
const objectUrls = new Map<string, { original?: string; thumbnail?: string }>();
const imageTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/avif']);
const imageExtensions = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
const identityKey = (name: string, size: number | undefined, path: string, modified?: number) => JSON.stringify([name, size, path, modified]);

async function makeThumbnail(file: File): Promise<{ thumbnail: Blob; width: number; height: number }> {
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Pratinjau foto tidak tersedia di browser ini.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const thumbnail = await new Promise<Blob>((resolve, reject) => canvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Pratinjau foto tidak dapat dibuat.')), 'image/jpeg', 0.8
    ));
    return { thumbnail, width: bitmap.width, height: bitmap.height };
  } finally {
    bitmap.close();
  }
}

function forgetUrls(id: string) {
  const urls = objectUrls.get(id);
  if (urls?.original) URL.revokeObjectURL(urls.original);
  if (urls?.thumbnail) URL.revokeObjectURL(urls.thumbnail);
  objectUrls.delete(id);
}

export class PhotoRepository {
  public static releaseObjectUrls(): void {
    for (const id of objectUrls.keys()) forgetUrls(id);
    sourceFiles.clear();
  }

  public static async hydrate(photos: Photo[]): Promise<Photo[]> {
    const files = await db.photo_files.bulkGet(photos.map((photo) => photo.id));
    return photos.map((photo, index) => {
      const stored = files[index];
      const original = stored?.blob || sourceFiles.get(photo.id);
      const urls = objectUrls.get(photo.id) || {};
      if (original && !urls.original) urls.original = URL.createObjectURL(original);
      if (stored?.thumbnail && !urls.thumbnail) urls.thumbnail = URL.createObjectURL(stored.thumbnail);
      objectUrls.set(photo.id, urls);
      const remoteUrl = photo.remote_url || '';
      return { ...photo, kept: !!stored?.blob, missing: !original && !remoteUrl,
        url: urls.original || (original ? '' : remoteUrl), thumbnail_url: urls.thumbnail || remoteUrl || undefined };
    });
  }

  public static async getAll(): Promise<Photo[]> {
    return this.hydrate(await db.photos.toArray());
  }

  public static async getById(id: string): Promise<Photo | undefined> {
    const photo = await db.photos.get(id);
    return photo ? (await this.hydrate([photo]))[0] : undefined;
  }

  public static async getByFilter(filter: 'all' | 'liked' | 'favorites' | 'kept' | 'hidden'): Promise<Photo[]> {
    const photos = await this.getAll();
    return photos.filter((photo) => filter === 'hidden' ? photo.hidden : !photo.hidden && (
      filter === 'all' || (filter === 'liked' && photo.liked) || (filter === 'favorites' && photo.favorite) || (filter === 'kept' && photo.kept)
    ));
  }

  /** File inputs are temporary references; re-selecting the same files reconnects existing metadata. */
  public static async importFiles(files: FileList | File[]): Promise<Photo[]> {
    const selected = Array.from(files).filter((file) => file.size > 0 && (imageTypes.has(file.type) || (!file.type && imageExtensions.test(file.name))));
    if (!selected.length) throw new Error('Pilih foto berformat JPEG, PNG, WebP, GIF, BMP, atau AVIF.');
    const byIdentity = new Map<string, Photo | null>();
    for (const photo of await db.photos.toArray()) {
      if (photo.remote_url) continue;
      const key = identityKey(photo.original_filename, photo.file_size, photo.relative_path || '', photo.last_modified);
      byIdentity.set(key, byIdentity.has(key) ? null : photo);
    }
    const prepared = new Map<string, { photo: Photo; file: File; data: PhotoFile }>();
    for (const file of selected) {
      const path = file.webkitRelativePath || '';
      const key = identityKey(file.name, file.size, path, file.lastModified);
      const prior = byIdentity.get(key) || byIdentity.get(identityKey(file.name, file.size, path));
      const id = prior?.id || crypto.randomUUID();
      if (prepared.has(id)) continue;
      const preview = await makeThumbnail(file);
      const now = new Date().toISOString();
      const mimeType = file.type || ({ jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', bmp: 'image/bmp', avif: 'image/avif' }[file.name.split('.').pop()?.toLowerCase() || ''] || 'application/octet-stream');
      const photo: Photo = {
        id, source_id: 'source-local-input', original_filename: file.name, display_name: file.name,
        mime_type: mimeType, file_size: file.size, liked: false, favorite: false, hidden: false, kept: false,
        view_count: 0, created_at: now, ...prior,
        relative_path: path, last_modified: file.lastModified,
        width: preview.width, height: preview.height,
        orientation: preview.width === preview.height ? 'square' : preview.width > preview.height ? 'landscape' : 'portrait',
        url: '', thumbnail_url: undefined, missing: false, updated_at: now,
      };
      prepared.set(id, { photo, file, data: { photo_id: id, thumbnail: preview.thumbnail } });
      if (!prior) byIdentity.set(key, photo);
    }
    await db.transaction('rw', db.photos, db.photo_files, db.photo_sources, async () => {
      const now = new Date().toISOString();
      await db.photo_sources.put({ id: 'source-local-input', source_type: 'local_file', display_name: 'Selected local photos',
        permission_state: 'granted', available: true, created_at: now, updated_at: now });
      for (const { photo, data } of prepared.values()) {
        const stored = await db.photo_files.get(photo.id);
        await db.photo_files.put({ ...stored, ...data });
        await db.photos.put({ ...photo, kept: !!stored?.blob });
      }
    });
    for (const { photo, file } of prepared.values()) {
      forgetUrls(photo.id);
      sourceFiles.set(photo.id, file);
    }
    return this.hydrate([...prepared.values()].map(({ photo }) => photo));
  }

  public static async importPublicDriveLinks(content: string): Promise<Photo[]> {
    const lines = content.split(/[\r\n,]+/).map((line) => line.trim()).filter(Boolean);
    if (!lines.length) throw new Error('Tempel satu atau beberapa tautan foto Google Drive.');
    const parsed = lines.map(parsePublicDrivePhotoLink);
    const links = [...new Map(parsed.map((link) => [link.fileId, link])).values()];
    const now = new Date().toISOString();
    const sourceId = 'source-public-drive';
    const photos = await Promise.all(links.map(async ({ fileId, imageUrl }) => {
      const id = `drive-${fileId}`;
      const existing = await db.photos.get(id);
      return {
        id, source_id: sourceId, original_filename: existing?.original_filename || `Drive photo ${fileId.slice(-8)}`,
        display_name: existing?.display_name || `Drive photo ${fileId.slice(-8)}`,
        url: '', remote_url: imageUrl, mime_type: 'image/unknown', orientation: existing?.orientation || 'unknown' as const,
        liked: existing?.liked || false, favorite: existing?.favorite || false, hidden: existing?.hidden || false,
        kept: !!(await db.photo_files.get(id))?.blob, missing: false,
        view_count: existing?.view_count || 0, created_at: existing?.created_at || now, updated_at: now,
      } satisfies Photo;
    }));
    await db.transaction('rw', db.photos, db.photo_sources, async () => {
      await db.photo_sources.put({ id: sourceId, source_type: 'cloud_storage', display_name: 'Public Google Drive links',
        permission_state: 'granted', available: true, created_at: now, updated_at: now });
      await db.photos.bulkPut(photos.map((photo) => ({ ...photo, url: '' })));
    });
    return this.hydrate(photos);
  }

  public static async addPhoto(photo: Photo): Promise<string> {
    return db.photos.add({ ...photo, url: '', thumbnail_url: undefined });
  }

  public static async addPhotos(photos: Photo[]): Promise<string> {
    return db.photos.bulkAdd(photos.map((photo) => ({ ...photo, url: '', thumbnail_url: undefined })));
  }

  public static async updatePhoto(id: string, updates: Partial<Photo>): Promise<number> {
    const { url: _url, thumbnail_url: _thumbnail, ...metadata } = updates;
    return db.photos.update(id, { ...metadata, updated_at: new Date().toISOString() });
  }

  public static async setTags(id: string, value: string): Promise<Photo> {
    const tags = [...new Map(value.split(',').map((tag) => tag.trim()).filter(Boolean).map((tag) => [tag.toLocaleLowerCase(), tag])).values()];
    if (tags.length > 12 || tags.some((tag) => tag.length > 32 || /[\u0000-\u001f]/.test(tag))) {
      throw new Error('Gunakan maksimal 12 tag, masing-masing sampai 32 karakter.');
    }
    if (!await db.photos.update(id, { tags, updated_at: new Date().toISOString() })) throw new Error('Foto sudah tidak tersedia.');
    return (await this.getById(id))!;
  }

  private static async toggle(id: string, field: 'liked' | 'favorite' | 'hidden'): Promise<boolean> {
    return db.transaction('rw', db.photos, async () => {
      const photo = await db.photos.get(id);
      if (!photo) throw new Error('Foto sudah tidak tersedia.');
      const next = !photo[field];
      const updated_at = new Date().toISOString();
      if (field === 'liked') await db.photos.update(id, { liked: next, updated_at });
      else if (field === 'favorite') await db.photos.update(id, { favorite: next, updated_at });
      else await db.photos.update(id, { hidden: next, updated_at });
      return next;
    });
  }

  public static toggleLike(id: string): Promise<boolean> { return this.toggle(id, 'liked'); }
  public static toggleFavorite(id: string): Promise<boolean> { return this.toggle(id, 'favorite'); }
  public static toggleHide(id: string): Promise<boolean> { return this.toggle(id, 'hidden'); }

  public static async keepPhoto(id: string, collectionId = '', namingRule = 'original', customName = ''): Promise<Photo> {
    if (!['original', 'collection_num', 'collection_date_num', 'custom'].includes(namingRule)) throw new Error('Invalid naming rule.');
    await db.transaction('rw', db.photos, db.photo_files, db.collections, db.photo_collections, async () => {
      const photo = await db.photos.get(id);
      if (!photo) throw new Error('Foto sudah tidak tersedia.');
      const stored = await db.photo_files.get(id);
      const original = stored?.blob || sourceFiles.get(id);
      if (!original) throw new Error('Pilih ulang berkas asli sebelum menyimpan foto.');
      const collection = collectionId ? await db.collections.get(collectionId) : undefined;
      if (collectionId && !collection) throw new Error('Koleksi tujuan sudah tidak tersedia.');
      let displayName = photo.display_name;
      if (!stored?.blob) {
        if (namingRule === 'custom') {
          displayName = customName.trim();
          if (!displayName || displayName.length > 255 || /[\\/\u0000-\u001f]/.test(displayName)) throw new Error('Masukkan nama tampilan yang valid.');
        } else if (namingRule === 'original') {
          displayName = photo.original_filename;
        } else {
          if (!collection) throw new Error('Pilih koleksi untuk format nama ini.');
          const now = new Date();
          const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
          const prefix = `${collection.name}${namingRule === 'collection_date_num' ? `_${date}` : ''}_`;
          let number = (await db.photo_collections.where('collection_id').equals(collectionId).count()) + 1;
          while (await db.photos.where('display_name').equals(`${prefix}${String(number).padStart(3, '0')}`).count()) number++;
          displayName = `${prefix}${String(number).padStart(3, '0')}`;
        }
        const extension = photo.mime_type === 'image/jpeg' ? 'jpg' : photo.mime_type.slice(6).replace(/[^a-z0-9]/g, '') || 'img';
        const internalName = `${crypto.randomUUID()}.${extension}`;
        await db.photo_files.put({ ...stored, photo_id: id, blob: original.slice(0, original.size, original.type), internal_name: internalName });
        await db.photos.update(id, { kept: true, internal_name: internalName, display_name: displayName, missing: false, updated_at: new Date().toISOString() });
      }
      if (collectionId) await CollectionRepository.addPhotoToCollection(id, collectionId);
    });
    return (await this.getById(id))!;
  }

  public static async setKept(id: string, kept: boolean): Promise<void> {
    if (!kept) throw new Error('Penghapusan salinan tersimpan perlu dikonfirmasi secara terpisah.');
    await this.keepPhoto(id);
  }

  public static async incrementViewCount(id: string): Promise<void> {
    await db.transaction('rw', db.photos, async () => {
      const photo = await db.photos.get(id);
      if (photo) await db.photos.update(id, { view_count: (photo.view_count || 0) + 1, last_viewed_at: new Date().toISOString() });
    });
  }

  /** Removes an unkept app reference only. Original files are never modified. */
  public static async deletePhotoReference(id: string): Promise<void> {
    await db.transaction('rw', db.photos, db.photo_files, db.collections, db.photo_collections, db.saved_compositions, async () => {
      if ((await db.photo_files.get(id))?.blob) throw new Error('Salinan tersimpan harus dihapus melalui tindakan yang dikonfirmasi.');
      const relations = await db.photo_collections.where('photo_id').equals(id).toArray();
      await db.photos.delete(id);
      await db.photo_files.delete(id);
      await db.photo_collections.where('photo_id').equals(id).delete();
      for (const relation of relations) await CollectionRepository.refreshMetadata(relation.collection_id);
      await db.saved_compositions.filter((composition) => composition.slots.some((slot) => slot.photo_id === id)).modify((composition) => {
        composition.slots = composition.slots.filter((slot) => slot.photo_id !== id).map((slot, index) => ({ ...slot, slot_index: index }));
        composition.photo_count = composition.slots.length;
      });
      await db.saved_compositions.filter((composition) => composition.photo_count === 0).delete();
    });
    forgetUrls(id);
    sourceFiles.delete(id);
  }
}
