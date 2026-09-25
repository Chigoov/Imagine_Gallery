import { db } from './db';
import { PhotoSource } from '../types/photo';

export class PhotoSourceRepository {
  public static async getAll(): Promise<PhotoSource[]> {
    return await db.photo_sources.toArray();
  }

  public static async getById(id: string): Promise<PhotoSource | undefined> {
    return await db.photo_sources.get(id);
  }

  public static async addSource(source: PhotoSource): Promise<string> {
    return await db.photo_sources.add(source);
  }

  public static async updateSource(id: string, updates: Partial<PhotoSource>): Promise<number> {
    return await db.photo_sources.update(id, {
      ...updates,
      updated_at: new Date().toISOString(),
    });
  }

  public static async deleteSource(id: string): Promise<void> {
    await db.photo_sources.delete(id);
  }
}
