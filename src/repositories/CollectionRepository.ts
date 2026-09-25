import { db } from './db';
import { Collection } from '../types/collection';
import { Photo } from '../types/photo';
import { PhotoRepository } from './PhotoRepository';

export class CollectionRepository {
  public static async getAll(): Promise<Collection[]> {
    const collections = await db.collections.orderBy('sort_order').toArray();
    return Promise.all(collections.map(async (collection) => {
      const photos = await this.getPhotosForCollection(collection.id);
      const cover = photos.find((photo) => photo.id === collection.cover_photo_id) || photos[0];
      return { ...collection, cover_photo_id: cover?.id, cover_photo_url: cover?.thumbnail_url || cover?.url || undefined };
    }));
  }

  public static async getById(id: string): Promise<Collection | undefined> {
    return db.collections.get(id);
  }

  public static async createCollection(name: string, description?: string): Promise<Collection> {
    if (!name.trim() || name.trim().length > 255) throw new Error('Nama koleksi harus berisi 1 sampai 255 karakter.');
    const count = await db.collections.count();
    const now = new Date().toISOString();
    const collection: Collection = { id: crypto.randomUUID(), name: name.trim(), description,
      photo_count: 0, sort_order: count + 1, created_at: now, updated_at: now };
    await db.collections.add(collection);
    return collection;
  }

  public static async updateCollection(id: string, updates: Partial<Collection>): Promise<number> {
    if (updates.name !== undefined && (!updates.name.trim() || updates.name.trim().length > 255)) throw new Error('Masukkan nama koleksi yang valid.');
    const { id: _id, cover_photo_url: _url, photo_count: _count, ...metadata } = updates;
    return db.collections.update(id, { ...metadata, ...(updates.name === undefined ? {} : { name: updates.name.trim() }), updated_at: new Date().toISOString() });
  }

  /** Only virtual memberships are removed; all source files and kept photos remain intact. */
  public static async deleteCollection(id: string): Promise<void> {
    await db.transaction('rw', db.collections, db.photo_collections, async () => {
      await db.collections.delete(id);
      await db.photo_collections.where('collection_id').equals(id).delete();
    });
  }

  public static async getPhotoIdsForCollection(collectionId: string): Promise<string[]> {
    return (await db.photo_collections.where('collection_id').equals(collectionId).toArray()).map((relation) => relation.photo_id);
  }

  public static async getPhotosForCollection(collectionId: string): Promise<Photo[]> {
    const ids = await this.getPhotoIdsForCollection(collectionId);
    const photos = await db.photos.bulkGet(ids);
    return PhotoRepository.hydrate(photos.filter((photo): photo is Photo => !!photo && !photo.hidden));
  }

  public static async refreshMetadata(collectionId: string): Promise<void> {
    const relations = await db.photo_collections.where('collection_id').equals(collectionId).toArray();
    const collection = await db.collections.get(collectionId);
    if (!collection) return;
    const cover = relations.some((relation) => relation.photo_id === collection.cover_photo_id) ? collection.cover_photo_id : relations[0]?.photo_id;
    await db.collections.update(collectionId, { photo_count: relations.length, cover_photo_id: cover,
      cover_photo_url: undefined, updated_at: new Date().toISOString() });
  }

  public static async addPhotoToCollection(photoId: string, collectionId: string): Promise<void> {
    await db.transaction('rw', db.photos, db.collections, db.photo_collections, async () => {
      if (!await db.photos.get(photoId) || !await db.collections.get(collectionId)) throw new Error('Foto atau koleksi sudah tidak tersedia.');
      if (await db.photo_collections.get([photoId, collectionId])) return;
      await db.photo_collections.add({ photo_id: photoId, collection_id: collectionId, added_at: new Date().toISOString() });
      await this.refreshMetadata(collectionId);
    });
  }

  public static async removePhotoFromCollection(photoId: string, collectionId: string): Promise<void> {
    await db.transaction('rw', db.collections, db.photo_collections, async () => {
      await db.photo_collections.delete([photoId, collectionId]);
      await this.refreshMetadata(collectionId);
    });
  }
}
