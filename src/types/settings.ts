export interface AppSettings {
  default_photo_count: number;
  default_interval: number;
  default_shuffle_mode: 'no_repeat' | 'pure_shuffle' | 'favorites_only' | 'unseen_only';
  default_fit_mode: 'cover' | 'contain';
  background_timeout_seconds: number;
  history_depth: number;
  app_lock_enabled: boolean;
  pin_hash?: string;
  privacy_screen_enabled: boolean;
  app_usage_tracking: boolean;
  theme: 'dark';
}
