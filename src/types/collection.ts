export interface Collection {
  id: string;
  name: string;
  description?: string;
  cover_photo_id?: string;
  cover_photo_url?: string;
  photo_count: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface PhotoCollectionRelation {
  photo_id: string;
  collection_id: string;
  added_at: string;
}
