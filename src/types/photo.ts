export type PhotoOrientation = 'portrait' | 'landscape' | 'square' | 'unknown';

export type SourceType = 'local_folder' | 'local_file' | 'app_storage' | 'cloud_storage' | 'mobile_gallery';

export interface PhotoSource {
  id: string;
  source_type: SourceType;
  display_name: string;
  root_path?: string;
  permission_state: 'granted' | 'prompt' | 'denied';
  available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  source_id?: string;
  relative_path?: string;
  last_modified?: number;
  internal_name?: string;
  original_filename: string;
  display_name: string;
  url: string; // Runtime URL: a temporary local object URL or current public preview URL.
  remote_url?: string; // Durable public file URL; never contains an account token.
  thumbnail_url?: string;
  mime_type: string;
  file_size?: number;
  width?: number;
  height?: number;
  orientation: PhotoOrientation;
  
  liked: boolean;
  favorite: boolean;
  tags?: string[];
  hidden: boolean;
  kept: boolean;
  missing?: boolean;
  
  view_count: number;
  last_viewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type SlotVisualState = 'normal' | 'hover' | 'pinned' | 'liked' | 'favorited' | 'focus' | 'replace' | 'loading' | 'missing';

export interface PlayerSlot {
  slotIndex: number;
  photo: Photo | null;
  pinned: boolean;
}
