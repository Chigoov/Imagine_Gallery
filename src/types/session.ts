import { PlayerSlot } from './photo';

export type SessionMode = 'auto' | 'manual';
export type ShuffleMode = 'no_repeat' | 'pure_shuffle' | 'favorites_only' | 'unseen_only';
export type LayoutMode = 'dynamic' | 'fixed' | 'random';
export type ImageFitMode = 'cover' | 'contain';
export type SessionStatus = 'active' | 'paused' | 'background_grace' | 'ended' | 'abandoned';

export interface SessionConfig {
  sourceKind: 'all_photos' | 'collection' | 'favorites' | 'liked';
  sourceId?: string;
  sourceName?: string;
  photoCount: number; // 1 to 5
  mode: SessionMode;
  intervalSeconds: number;
  layoutMode: LayoutMode;
  shuffleMode: ShuffleMode;
  fitMode: ImageFitMode;
}

export interface ActiveSessionSnapshot {
  config: SessionConfig;
  slots: { slotIndex: number; photoId: string; pinned: boolean }[];
  history: { slotIndex: number; photoId: string; pinned: boolean }[][];
  forwardHistory: { slotIndex: number; photoId: string; pinned: boolean }[][];
  shuffle: { pool: string[]; queue: string[]; mode: ShuffleMode; lastExhaustedTail: string[]; recentConsumed: string[] };
  startedAt: number;
  countdown: number;
  isPlaying: boolean;
  photosViewed: number;
  likes: number;
  favorites: number;
  kept: number;
  updatedAt: number;
}

export interface SessionRecord {
  id: string;
  status: SessionStatus;
  mode: SessionMode;
  shuffle_mode: ShuffleMode;
  layout_mode: LayoutMode;
  photo_count: number;
  interval_seconds: number;
  
  started_at: string;
  ended_at?: string | null;
  duration_seconds: number;
  
  photos_viewed: number;
  likes_count: number;
  favorites_count: number;
  kept_count: number;
}

export interface SavedComposition {
  id: string;
  name: string;
  photo_count: number;
  layout_key: string;
  background_key: string;
  slots: {
    slot_index: number;
    photo_id: string;
    photo_url: string;
    display_name: string;
    pinned: boolean;
  }[];
  created_at: string;
  updated_at: string;
}
