import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NavTab, DesktopSidebar } from '../components/layout/DesktopSidebar';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { TopHeader } from '../components/layout/TopHeader';
import { ToastProvider, useToast } from '../components/ui/Toast';
import { Photo, PlayerSlot } from '../types/photo';
import { Collection } from '../types/collection';
import { CalendarEntry, StatsSummary } from '../types/calendar';
import { SessionConfig, SavedComposition, ActiveSessionSnapshot } from '../types/session';
import { AppSettings } from '../types/settings';

// Domain Engines
import { ShuffleEngine } from '../domain/shuffle/ShuffleEngine';
import { PinEngine } from '../domain/player/PinEngine';
import { CalendarAggregator } from '../domain/calendar/CalendarAggregator';

// Repositories
import { db, PhotoFile } from '../repositories/db';
import { PhotoRepository } from '../repositories/PhotoRepository';
import { CollectionRepository } from '../repositories/CollectionRepository';
import { CalendarRepository } from '../repositories/CalendarRepository';
import { SessionRepository } from '../repositories/SessionRepository';

// Screens
import { HomeScreen } from '../features/home/HomeScreen';
import { StartSessionModal } from '../features/session/StartSessionModal';
import { PlayerScreen } from '../features/player/PlayerScreen';
import { LibraryScreen } from '../features/library/LibraryScreen';
import { CollectionsScreen } from '../features/collections/CollectionsScreen';
import { CollectionDetailScreen } from '../features/collections/CollectionDetailScreen';
import { CalendarScreen } from '../features/calendar/CalendarScreen';
import { SettingsScreen } from '../features/settings/SettingsScreen';
import { AppLockModal } from '../features/lock/AppLockModal';

const DEFAULT_SETTINGS: AppSettings = {
  default_photo_count: 4,
  default_interval: 7,
  default_shuffle_mode: 'no_repeat',
  default_fit_mode: 'cover',
  background_timeout_seconds: 120,
  history_depth: 50,
  app_lock_enabled: false,
  pin_hash: '',
  privacy_screen_enabled: true,
  app_usage_tracking: false,
  theme: 'dark',
};

const blobToDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Isi foto tidak dapat dibaca.'));
  reader.onerror = () => reject(new Error('Foto tidak dapat ditambahkan ke cadangan.'));
  reader.readAsDataURL(blob);
});

async function imageBlobFromDataUrl(value: unknown): Promise<Blob | undefined> {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^data:image\/(?:jpeg|png|webp|gif|bmp|avif);base64,[A-Za-z0-9+/]*={0,2}$/i.test(value)) {
    throw new Error('Berkas cadangan berisi gambar yang formatnya tidak valid.');
  }
  const blob = await (await fetch(value)).blob();
  if (!blob.size || !/^image\/(?:jpeg|png|webp|gif|bmp|avif)$/i.test(blob.type)) throw new Error('Berkas cadangan berisi gambar yang tidak dapat dibaca.');
  return blob;
}

function AppContent() {
  const { showToast } = useToast();

  // Core Data State
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [collectionPhotoIds, setCollectionPhotoIds] = useState<Record<string, string[]>>({});
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [savedCompositions, setSavedCompositions] = useState<SavedComposition[]>([]);

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('pb_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Navigation State
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);

  // App Lock State
  const [isAppLocked, setIsAppLocked] = useState<boolean>(settings.app_lock_enabled);
  const [isPinSetupOpen, setIsPinSetupOpen] = useState<boolean>(false);

  // Session / Player State
  const [isSessionActive, setIsSessionActive] = useState<boolean>(false);
  const [isStartModalOpen, setIsStartModalOpen] = useState<boolean>(false);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig>({
    sourceKind: 'all_photos',
    photoCount: 4,
    mode: 'auto',
    intervalSeconds: 7,
    layoutMode: 'dynamic',
    shuffleMode: 'no_repeat',
    fitMode: 'cover',
  });

  const [playerSlots, setPlayerSlots] = useState<PlayerSlot[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isPlayerOverlayOpen, setIsPlayerOverlayOpen] = useState(false);
  const [countdown, setCountdown] = useState<number>(7);
  const [sessionDurationSeconds, setSessionDurationSeconds] = useState<number>(0);
  const sessionStartedAtRef = useRef<number | null>(null);
  const sessionBackgroundStartedAtRef = useRef<number | null>(null);
  const [photosViewedCount, setPhotosViewedCount] = useState<number>(4);
  const [sessionLikesCount, setSessionLikesCount] = useState<number>(0);
  const [sessionFavoritesCount, setSessionFavoritesCount] = useState<number>(0);
  const [sessionKeptCount, setSessionKeptCount] = useState<number>(0);
  const [resumableSnapshot, setResumableSnapshot] = useState<ActiveSessionSnapshot | null>(null);
  const snapshotSaveErrorShown = useRef(false);

  // Domain Shuffle Engine instance (persists across ticks)
  const shuffleEngineRef = useRef<ShuffleEngine>(new ShuffleEngine([], 'no_repeat'));

  // History stack for Player Previous navigation (stores past slot displays)
  const [historyStack, setHistoryStack] = useState<PlayerSlot[][]>([]);
  const [forwardHistoryStack, setForwardHistoryStack] = useState<PlayerSlot[][]>([]);

  // Load data from IndexedDB on startup
  useEffect(() => {
    async function loadData() {
      try {
        const storedPhotos = await PhotoRepository.getAll();
        setPhotos(storedPhotos);

        const storedCollections = await CollectionRepository.getAll();
        setCollections(storedCollections);
        const relations = await db.photo_collections.toArray();
        setCollectionPhotoIds(relations.reduce<Record<string, string[]>>((groups, relation) => {
          (groups[relation.collection_id] ??= []).push(relation.photo_id);
          return groups;
        }, {}));

        const storedCalendar = await CalendarRepository.getAll();
        setCalendarEntries(storedCalendar);

        const storedComps = await SessionRepository.getAllCompositions();
        setSavedCompositions(storedComps);
        const snapshot = await SessionRepository.getActiveSnapshot();
        if (snapshot && Date.now() - snapshot.updatedAt <= Math.max(0, settings.background_timeout_seconds) * 1000) {
          setResumableSnapshot(snapshot);
        } else if (snapshot) {
          await SessionRepository.clearActiveSnapshot();
        }
      } catch {
        showToast('Data lokal tidak dapat dimuat. Muat ulang lalu coba lagi.', 'error');
      }
    }
    loadData();
  }, [showToast, settings.background_timeout_seconds]);

  // Save settings on update
  useEffect(() => {
    try {
      localStorage.setItem('pb_settings', JSON.stringify(settings));
    } catch {
      showToast('Pengaturan tidak dapat disimpan di perangkat ini.', 'error');
    }
  }, [settings, showToast]);

  // Use elapsed wall time so a delayed browser timer does not undercount a session.
  useEffect(() => {
    if (!isSessionActive) return;
    const interval = setInterval(() => {
      if (sessionStartedAtRef.current !== null) {
        setSessionDurationSeconds(Math.floor((Date.now() - sessionStartedAtRef.current) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isSessionActive]);

  useEffect(() => {
    if (!isSessionActive || sessionStartedAtRef.current === null) return;
    const timeout = setTimeout(() => {
      const serializeSlots = (slots: PlayerSlot[]) => slots.flatMap((slot) =>
        slot.photo ? [{ slotIndex: slot.slotIndex, photoId: slot.photo.id, pinned: slot.pinned }] : []);
      const snapshot: ActiveSessionSnapshot = {
        config: sessionConfig,
        slots: serializeSlots(playerSlots),
        history: historyStack.map(serializeSlots),
        forwardHistory: forwardHistoryStack.map(serializeSlots),
        shuffle: shuffleEngineRef.current.snapshot(),
        startedAt: sessionStartedAtRef.current!, countdown, isPlaying,
        photosViewed: photosViewedCount, likes: sessionLikesCount,
        favorites: sessionFavoritesCount, kept: sessionKeptCount, updatedAt: Date.now(),
      };
      void SessionRepository.saveActiveSnapshot(snapshot).then(() => { snapshotSaveErrorShown.current = false; }).catch(() => {
        if (!snapshotSaveErrorShown.current) showToast('Pemulihan sesi tidak dapat disimpan.', 'error');
        snapshotSaveErrorShown.current = true;
      });
    }, 250);
    return () => clearTimeout(timeout);
  }, [isSessionActive, sessionConfig, playerSlots, historyStack, forwardHistoryStack, countdown, isPlaying,
    photosViewedCount, sessionLikesCount, sessionFavoritesCount, sessionKeptCount, sessionDurationSeconds, showToast]);

  // Auto Mode Countdown ticker
  useEffect(() => {
    if (!isSessionActive || !isPlaying || isPlayerOverlayOpen || sessionConfig.mode !== 'auto') return;

    const ticker = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleNextDisplay();
          return sessionConfig.intervalSeconds;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(ticker);
  }, [isSessionActive, isPlaying, isPlayerOverlayOpen, sessionConfig.mode, sessionConfig.intervalSeconds, playerSlots]);

  // Helper to pick candidates from pool
  const getEligiblePool = useCallback((sourceKind: string, sourceId?: string) => {
    const collectionIds = sourceKind === 'collection'
      ? new Set(collectionPhotoIds[sourceId || ''] || [])
      : null;
    return photos.filter((p) => {
      if (p.hidden || p.missing) return false;
      if (collectionIds && !collectionIds.has(p.id)) return false;
      if (sourceKind === 'favorites' && !p.favorite) return false;
      if (sourceKind === 'liked' && !p.liked) return false;
      return true;
    });
  }, [photos, collectionPhotoIds]);

  // START SESSION HANDLER
  const handleStartSession = (config: SessionConfig) => {
    const pool = getEligiblePool(config.sourceKind, config.sourceId);
    if (pool.length === 0) {
      showToast('Tidak ada foto yang bisa digunakan dari sumber ini.', 'error');
      return;
    }

    // Configure ShuffleEngine
    const poolIds = pool.map((p) => p.id);
    shuffleEngineRef.current.setPool(poolIds);
    shuffleEngineRef.current.setMode(config.shuffleMode);

    // Initial slots using ShuffleEngine
    const candidateIds = shuffleEngineRef.current.getNextCandidates(config.photoCount, new Set());
    const photosById = new Map(pool.map((photo) => [photo.id, photo]));
    const initialSlots: PlayerSlot[] = candidateIds.map((id, idx) => ({
      slotIndex: idx,
      photo: photosById.get(id) || null,
      pinned: false,
    })).filter((slot) => slot.photo);

    setSessionConfig({ ...config, photoCount: initialSlots.length });
    setPlayerSlots(initialSlots);
    setHistoryStack([]);
    setForwardHistoryStack([]);
    setIsPlaying(config.mode === 'auto');
    setCountdown(config.intervalSeconds);
    setSessionDurationSeconds(0);
    sessionStartedAtRef.current = Date.now();
    sessionBackgroundStartedAtRef.current = null;
    setPhotosViewedCount(initialSlots.length);
    setSessionLikesCount(0);
    setSessionFavoritesCount(0);
    setSessionKeptCount(0);
    setResumableSnapshot(null);
    setIsSessionActive(true);
    setIsStartModalOpen(false);
    setCurrentTab('player');
    showToast(`Sesi dimulai dengan ${config.photoCount} foto.`, 'info');
  };

  const handleResumeSession = () => {
    const snapshot = resumableSnapshot;
    if (!snapshot || Date.now() - snapshot.updatedAt > Math.max(0, settings.background_timeout_seconds) * 1000) {
      setResumableSnapshot(null);
      void SessionRepository.clearActiveSnapshot();
      showToast('Sesi sebelumnya sudah melewati batas waktu pemulihan.', 'error');
      return;
    }
    const pool = getEligiblePool(snapshot.config.sourceKind, snapshot.config.sourceId);
    if (!pool.length) {
      showToast('Pilih ulang foto sesi ini sebelum melanjutkan.', 'error');
      return;
    }
    const byId = new Map(pool.map((photo) => [photo.id, photo]));
    const restoreSlots = (slots: ActiveSessionSnapshot['slots']) => slots.flatMap((slot) => {
      const photo = byId.get(slot.photoId);
      return photo ? [{ slotIndex: slot.slotIndex, photo, pinned: slot.pinned }] : [];
    });
    const activeSlots = restoreSlots(snapshot.slots);
    if (!activeSlots.length) {
      showToast('Pilih ulang foto sesi sebelum melanjutkan.', 'error');
      return;
    }
    shuffleEngineRef.current.setPool(snapshot.shuffle.pool.filter((id) => byId.has(id)));
    shuffleEngineRef.current.setMode(snapshot.config.shuffleMode);
    shuffleEngineRef.current.restore(snapshot.shuffle);
    setSessionConfig(snapshot.config);
    setPlayerSlots(activeSlots);
    setHistoryStack(snapshot.history.map(restoreSlots));
    setForwardHistoryStack(snapshot.forwardHistory.map(restoreSlots));
    setCountdown(Math.max(1, Math.min(snapshot.config.intervalSeconds, snapshot.countdown)));
    setIsPlaying(snapshot.isPlaying && snapshot.config.mode === 'auto');
    setSessionDurationSeconds(Math.floor((Date.now() - snapshot.startedAt) / 1000));
    setPhotosViewedCount(snapshot.photosViewed);
    setSessionLikesCount(snapshot.likes);
    setSessionFavoritesCount(snapshot.favorites);
    setSessionKeptCount(snapshot.kept);
    sessionStartedAtRef.current = snapshot.startedAt;
    sessionBackgroundStartedAtRef.current = null;
    setResumableSnapshot(null);
    setIsSessionActive(true);
    setCurrentTab('player');
    showToast('Sesi sebelumnya dipulihkan.', 'success');
  };

  // ADVANCE DISPLAY (NEXT) with STRICT PIN RULES
  // Rule: Slot marked pinned remains unchanged!
  const handleNextDisplay = useCallback(() => {
    if (forwardHistoryStack.length) {
      const currentPhotos = new Map(photos.map((photo) => [photo.id, photo]));
      const nextHistoryState = forwardHistoryStack[forwardHistoryStack.length - 1]
        .map((slot) => ({ ...slot, photo: slot.photo ? currentPhotos.get(slot.photo.id) || null : null }))
        .filter((slot) => slot.photo);
      setHistoryStack((prev) => [...prev.slice(-49), [...playerSlots]]);
      setForwardHistoryStack((prev) => prev.slice(0, -1));
      setPlayerSlots(nextHistoryState);
      setCountdown(sessionConfig.intervalSeconds);
      return;
    }
    const pool = getEligiblePool(sessionConfig.sourceKind, sessionConfig.sourceId);
    if (pool.length === 0 || playerSlots.length === 0) return;

    // Collect currently visible and pinned IDs
    const visiblePinnedIds = new Set(
      playerSlots.filter((s) => s.pinned && s.photo).map((s) => s.photo!.id)
    );

    // Get unpinned slot count
    const unpinnedIndices = PinEngine.getUnpinnedSlotIndices(playerSlots);
    const candidateIds = shuffleEngineRef.current.getNextCandidates(
      unpinnedIndices.length,
      visiblePinnedIds
    );

    const photosById = new Map(pool.map((photo) => [photo.id, photo]));
    let candIdx = 0;
    const nextSlots = playerSlots.map((slot) => {
      // PIN RULE: Pinned slot stays in same position and NEVER changes on Next!
      if (slot.pinned && slot.photo) {
        return slot;
      }

      const nextId = candidateIds[candIdx++];
      const nextPhoto = photosById.get(nextId);
      if (!nextPhoto) return slot;

      return {
        ...slot,
        photo: nextPhoto,
      };
    });

    if (!nextSlots.some((slot, index) => slot.photo?.id !== playerSlots[index]?.photo?.id)) return;
    setHistoryStack((prev) => [...prev.slice(-49), [...playerSlots]]);

    setPlayerSlots(nextSlots);
    setForwardHistoryStack([]);
    setPhotosViewedCount((prev) => prev + nextSlots.filter((slot, index) => !slot.pinned && slot.photo !== playerSlots[index].photo).length);
    setCountdown(sessionConfig.intervalSeconds);
  }, [playerSlots, sessionConfig, getEligiblePool, forwardHistoryStack, photos]);

  // PREVIOUS DISPLAY NAVIGATION
  const handlePreviousDisplay = () => {
    if (historyStack.length === 0) return;
    const lastState = historyStack[historyStack.length - 1];
    setHistoryStack((prev) => prev.slice(0, -1));
    setForwardHistoryStack((prev) => [...prev.slice(-49), [...playerSlots]]);
    const currentPhotos = new Map(photos.map((photo) => [photo.id, photo]));
    setPlayerSlots(lastState.map((slot) => ({
      ...slot,
      photo: slot.photo ? currentPhotos.get(slot.photo.id) || null : null,
    })).filter((slot) => slot.photo));
    setCountdown(sessionConfig.intervalSeconds);
    showToast('Tampilan sebelumnya dipulihkan.', 'info');
  };

  // PIN TOGGLE HANDLER
  const handleTogglePin = (slotIndex: number) => {
    setForwardHistoryStack([]);
    setPlayerSlots((prev) =>
      PinEngine.togglePin(prev, slotIndex).map((s) => {
        if (s.slotIndex === slotIndex) {
          showToast(s.pinned ? 'Foto disematkan 📌' : 'Sematan foto dilepas.', 'info');
        }
        return s;
      })
    );
  };

  // REPLACE ONE PHOTO HANDLER
  // Rule: Modifies one slot only, excludes visible, respects pinned status!
  const handleReplaceOne = (slotIndex: number) => {
    const pool = getEligiblePool(sessionConfig.sourceKind, sessionConfig.sourceId);
    const targetSlot = playerSlots.find((s) => s.slotIndex === slotIndex);
    if (!targetSlot || !targetSlot.photo) return;

    const visibleIds = new Set(
      playerSlots.filter((s) => s.slotIndex !== slotIndex && s.photo).map((s) => s.photo!.id)
    );

    const replacementId = shuffleEngineRef.current.replaceOneCandidate(
      targetSlot.photo.id,
      visibleIds
    );

    if (!replacementId) return;
    const replacementPhoto = pool.find((p) => p.id === replacementId);
    if (!replacementPhoto) return;

    // Save history snapshot before replace
    setHistoryStack((prev) => [...prev.slice(-49), [...playerSlots]]);
    setForwardHistoryStack([]);

    // Apply replace with PinEngine: keeps slot pinned if it was pinned!
    setPlayerSlots((prev) =>
      prev.map((slot) => {
        if (slot.slotIndex === slotIndex) {
          return {
            ...slot,
            photo: replacementPhoto,
          };
        }
        return slot;
      })
    );

    setPhotosViewedCount((prev) => prev + 1);
    showToast('Foto diganti.', 'info');
  };

  // CHANGE PHOTO COUNT IN-SESSION (1 TO 5)
  const handleChangePhotoCount = (newCount: number) => {
    if (!Number.isInteger(newCount) || newCount < 1 || newCount > 5) return;
    const count = newCount;
    const pool = getEligiblePool(sessionConfig.sourceKind, sessionConfig.sourceId);
    if (count > pool.length) {
      showToast(`Hanya ${pool.length} foto yang tersedia dari sumber ini.`, 'error');
      return;
    }

    if (count > playerSlots.length) {
      // Expand: keep existing slots (prioritizing pinned) and append new candidates
      const visibleIds = new Set(playerSlots.filter((s) => s.photo).map((s) => s.photo!.id));
      const candidates = shuffleEngineRef.current.getNextCandidates(
        count - playerSlots.length,
        visibleIds
      );

      const expanded = [...playerSlots];
      candidates.forEach((cid, i) => {
        const photo = pool.find((p) => p.id === cid);
        if (!photo) return;
        expanded.push({
          slotIndex: playerSlots.length + i,
          photo,
          pinned: false,
        });
      });
      setPlayerSlots(expanded);
    } else {
      // Shrink: Prioritize pinned slots
      const pinned = playerSlots.filter((s) => s.pinned);
      const unpinned = playerSlots.filter((s) => !s.pinned);
      const combined = [...pinned, ...unpinned].slice(0, newCount);
      setPlayerSlots(combined.map((s, idx) => ({ ...s, slotIndex: idx })));
    }

    setForwardHistoryStack([]);
    setSessionConfig((prev) => ({ ...prev, photoCount: count }));
    showToast(`Tata letak diubah menjadi ${count} foto.`, 'info');
  };

  // PHOTO ACTIONS (LIKE, FAVORITE, KEEP, HIDE)
  const handleToggleLike = async (photoId: string) => {
    try {
      const liked = await PhotoRepository.toggleLike(photoId);
      const photo = await PhotoRepository.getById(photoId);
      if (!photo) return;
      setPhotos((prev) => prev.map((p) => p.id === photoId ? photo : p));
      setPlayerSlots((prev) => prev.map((slot) => slot.photo?.id === photoId ? { ...slot, photo } : slot));
      if (liked) setSessionLikesCount((count) => count + 1);
      showToast(liked ? 'Ditambahkan ke foto yang disukai ♥' : 'Dihapus dari foto yang disukai.', 'info');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Perubahan tidak dapat disimpan.', 'error'); }
  };

  const handleToggleFavorite = async (photoId: string) => {
    try {
      const favorite = await PhotoRepository.toggleFavorite(photoId);
      const photo = await PhotoRepository.getById(photoId);
      if (!photo) return;
      setPhotos((prev) => prev.map((p) => p.id === photoId ? photo : p));
      setPlayerSlots((prev) => prev.map((slot) => slot.photo?.id === photoId ? { ...slot, photo } : slot));
      if (favorite) setSessionFavoritesCount((count) => count + 1);
      showToast(favorite ? 'Ditambahkan ke favorit ★' : 'Dihapus dari favorit.', 'info');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Favorit tidak dapat disimpan.', 'error'); }
  };

  const handleSetPhotoTags = async (photoId: string, tags: string) => {
    try {
      const photo = await PhotoRepository.setTags(photoId, tags);
      setPhotos((prev) => prev.map((item) => item.id === photoId ? photo : item));
      setPlayerSlots((prev) => prev.map((slot) => slot.photo?.id === photoId ? { ...slot, photo } : slot));
      showToast(photo.tags?.length ? 'Tag foto diperbarui.' : 'Tag foto dihapus.', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Tag foto tidak dapat disimpan.', 'error'); }
  };

  const handleKeepPhoto = async (photo: Photo, collectionId: string, namingRule: string, customName?: string) => {
    if (photo.remote_url) {
      showToast('Untuk menyimpan foto ini, unduh dari Drive lalu tambahkan berkasnya dari perangkat.', 'error');
      return;
    }
    try {
      const saved = await PhotoRepository.keepPhoto(photo.id, collectionId, namingRule, customName);
      setPhotos((prev) => prev.map((p) => p.id === saved.id ? saved : p));
      setPlayerSlots((prev) => prev.map((slot) => slot.photo?.id === saved.id ? { ...slot, photo: saved } : slot));
      if (collectionId) {
        setCollectionPhotoIds((prev) => ({ ...prev, [collectionId]: Array.from(new Set([...(prev[collectionId] || []), saved.id])) }));
      }
      setCollections(await CollectionRepository.getAll());
      setSessionKeptCount((count) => count + 1);
      showToast('Salinan foto disimpan di aplikasi.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Foto tidak dapat disimpan.', 'error');
      throw error;
    }
  };

  const handleToggleHide = async (photoId: string) => {
    let nextHidden = false;
    try {
      nextHidden = await PhotoRepository.toggleHide(photoId);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Foto tidak dapat disembunyikan.', 'error');
      return;
    }
    setPhotos((prev) =>
      prev.map((p) => {
        if (p.id === photoId) {
          showToast(
            nextHidden
              ? 'Foto disembunyikan (berkas asli tetap aman). Lihat tab Disembunyikan di Galeri.'
              : 'Foto dipulihkan ke galeri.',
            'info'
          );
          return { ...p, hidden: nextHidden };
        }
        return p;
      })
    );

    if (nextHidden) {
      shuffleEngineRef.current.removePhoto(photoId);
      setHistoryStack((prev) => prev.filter((state) => !state.some((slot) => slot.photo?.id === photoId)));
      setForwardHistoryStack((prev) => prev.filter((state) => !state.some((slot) => slot.photo?.id === photoId)));
      const slotIndex = playerSlots.findIndex((slot) => slot.photo?.id === photoId);
      if (slotIndex >= 0) handleReplaceOne(slotIndex);
    } else {
      shuffleEngineRef.current.setPool(getEligiblePool(sessionConfig.sourceKind, sessionConfig.sourceId).map((photo) => photo.id).concat(photoId));
    }
  };

  // SAVE COMPOSITION
  const handleSaveComposition = async (name: string) => {
    const savedSlots = playerSlots.filter((slot) => slot.photo);
    if (!savedSlots.length || savedSlots.some((slot) => slot.photo?.hidden || slot.photo?.missing)) {
      showToast('Hapus foto yang tidak tersedia sebelum menyimpan susunan ini.', 'error');
      return;
    }
    const now = new Date().toISOString();
    const comp: SavedComposition = {
      id: crypto.randomUUID(),
      name,
      photo_count: savedSlots.length,
      layout_key: `layout_${savedSlots.length}`,
      background_key: 'near_black',
      slots: savedSlots.map((s) => ({
        slot_index: s.slotIndex,
        photo_id: s.photo?.id || '',
        photo_url: s.photo?.url || '',
        display_name: s.photo?.display_name || '',
        pinned: s.pinned,
      })),
      created_at: now,
      updated_at: now,
    };
    try {
      await SessionRepository.saveComposition(comp);
      setSavedCompositions((prev) => [comp, ...prev]);
      showToast('Susunan berhasil disimpan.', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Susunan tidak dapat disimpan.', 'error'); }
  };

  // END SESSION & UPDATE CALENDAR
  const endingSessionRef = useRef(false);
  const handleEndSession = async (endedAtMs = Date.now()) => {
    if (!isSessionActive || endingSessionRef.current) return;
    endingSessionRef.current = true;
    const startedAtMs = sessionStartedAtRef.current ?? endedAtMs;
    const duration = Math.max(0, Math.floor((endedAtMs - startedAtMs) / 1000));
    const endedAt = new Date(endedAtMs).toISOString();
    const startedAt = new Date(startedAtMs).toISOString();
    const sessionId = crypto.randomUUID();
    const session = {
      id: sessionId,
      status: 'ended' as const,
      mode: sessionConfig.mode,
      shuffle_mode: sessionConfig.shuffleMode,
      layout_mode: sessionConfig.layoutMode,
      photo_count: playerSlots.length,
      interval_seconds: sessionConfig.intervalSeconds,
      started_at: startedAt,
      ended_at: endedAt,
      duration_seconds: duration,
      photos_viewed: photosViewedCount,
      likes_count: sessionLikesCount,
      favorites_count: sessionFavoritesCount,
      kept_count: sessionKeptCount,
    };
    const newEntry: CalendarEntry = {
      id: `session-${sessionId}`,
      session_id: sessionId,
      entry_date: CalendarAggregator.localDateKey(new Date(endedAtMs)),
      manual: false,
      count_value: 1,
      started_at: startedAt,
      ended_at: endedAt,
      duration_seconds: duration,
      notes: `${sessionConfig.sourceName || 'Session'} • ${playerSlots.length} photos`,
    };
    try {
      await SessionRepository.finishSession(session, newEntry);
      setCalendarEntries((prev) => [newEntry, ...prev]);
      setSessionDurationSeconds(duration);
      setIsSessionActive(false);
      sessionStartedAtRef.current = null;
      showToast('Sesi disimpan ke kalender.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Sesi tidak dapat disimpan.', 'error');
      throw error;
    } finally { endingSessionRef.current = false; }
  };

  useEffect(() => {
    if (!isSessionActive) return;
    const onVisibilityChange = () => {
      if (document.hidden) {
        sessionBackgroundStartedAtRef.current ??= Date.now();
        return;
      }
      const backgroundAt = sessionBackgroundStartedAtRef.current;
      sessionBackgroundStartedAtRef.current = null;
      if (backgroundAt === null) return;
      const graceMs = Math.max(0, settings.background_timeout_seconds) * 1000;
      if (Date.now() - backgroundAt > graceMs) void handleEndSession(backgroundAt + graceMs);
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    onVisibilityChange();
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [isSessionActive, settings.background_timeout_seconds, handleEndSession]);

  // ADD MANUAL CALENDAR ENTRY
  const handleAddManualCalendarEntry = async (entry: {
    entry_date: string;
    count_value: number;
    duration_seconds: number;
    notes?: string;
  }) => {
    if (!CalendarAggregator.isValidDate(entry.entry_date) || !Number.isSafeInteger(entry.count_value) || entry.count_value < 1 || entry.count_value > 10000 || !Number.isFinite(entry.duration_seconds) || entry.duration_seconds < 0) {
      showToast('Masukkan tanggal, jumlah, dan durasi yang valid.', 'error');
      return;
    }
    const record: CalendarEntry = {
      id: crypto.randomUUID(),
      entry_date: entry.entry_date,
      manual: true,
      count_value: entry.count_value,
      duration_seconds: entry.duration_seconds,
      notes: entry.notes,
    };
    try {
      await CalendarRepository.addEntry(record);
      setCalendarEntries((prev) => [record, ...prev]);
      showToast('Catatan manual ditambahkan ke kalender.', 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Catatan kalender tidak dapat disimpan.', 'error'); }
  };

  const handleDeleteCalendarEntry = async (id: string) => {
    try {
      await CalendarRepository.deleteEntry(id);
      setCalendarEntries((prev) => prev.filter((e) => e.id !== id));
      showToast('Catatan kalender dihapus.', 'info');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Catatan kalender tidak dapat dihapus.', 'error'); }
  };

  // ADD FILES FROM LOCAL
  const handleAddFiles = async (files: FileList | File[]) => {
    try {
      const imported = await PhotoRepository.importFiles(files);
      setPhotos((prev) => {
        const byId = new Map(prev.map((photo) => [photo.id, photo]));
        for (const photo of imported) byId.set(photo.id, photo);
        return [...byId.values()];
      });
      showToast(`${imported.length} foto ditambahkan atau ditautkan kembali.`, 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Foto tidak dapat ditambahkan.', 'error'); }
  };

  const handleAddDriveLinks = async (links: string) => {
    try {
      const imported = await PhotoRepository.importPublicDriveLinks(links);
      setPhotos((prev) => {
        const byId = new Map(prev.map((photo) => [photo.id, photo]));
        for (const photo of imported) byId.set(photo.id, photo);
        return [...byId.values()];
      });
      showToast(`${imported.length} tautan foto Drive publik ditambahkan.`, 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Tautan Drive tidak dapat ditambahkan.', 'error');
      throw error;
    }
  };

  const handleRemoveDriveLink = async (photo: Photo) => {
    if (!photo.remote_url || !window.confirm(`Hapus “${photo.display_name}” dari aplikasi? Berkas Google Drive tidak akan diubah.`)) return;
    try {
      await PhotoRepository.deletePhotoReference(photo.id);
      shuffleEngineRef.current.removePhoto(photo.id);
      setPhotos((prev) => prev.filter((item) => item.id !== photo.id));
      const relations = await db.photo_collections.toArray();
      setCollectionPhotoIds(relations.reduce<Record<string, string[]>>((groups, relation) => {
        (groups[relation.collection_id] ??= []).push(relation.photo_id);
        return groups;
      }, {}));
      setCollections(await CollectionRepository.getAll());
      setHistoryStack((prev) => prev.filter((state) => !state.some((slot) => slot.photo?.id === photo.id)));
      setForwardHistoryStack((prev) => prev.filter((state) => !state.some((slot) => slot.photo?.id === photo.id)));
      const slotIndex = playerSlots.findIndex((slot) => slot.photo?.id === photo.id);
      if (slotIndex >= 0 && isSessionActive) {
        const candidates = shuffleEngineRef.current.getNextCandidates(1, new Set(playerSlots.flatMap((slot) => slot.photo && slot.photo.id !== photo.id ? [slot.photo.id] : [])));
        const eligible = getEligiblePool(sessionConfig.sourceKind, sessionConfig.sourceId).filter((item) => item.id !== photo.id);
        const replacement = eligible.find((item) => item.id === candidates[0]);
        setPlayerSlots((prev) => prev.map((slot) => slot.slotIndex === slotIndex ? { ...slot, photo: replacement || null, pinned: false } : slot));
      } else {
        setPlayerSlots((prev) => prev.map((slot) => slot.photo?.id === photo.id ? { ...slot, photo: null } : slot));
      }
      showToast('Tautan Drive dihapus dari aplikasi. Berkas Drive tidak diubah.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Tautan Drive tidak dapat dihapus.', 'error');
    }
  };

  // CREATE COLLECTION
  const handleCreateCollection = async (name: string, desc?: string) => {
    try {
      const collection = await CollectionRepository.createCollection(name, desc);
      setCollections((prev) => [...prev, collection]);
      setCollectionPhotoIds((prev) => ({ ...prev, [collection.id]: [] }));
      showToast(`Koleksi "${collection.name}" dibuat.`, 'success');
      return collection.id;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Koleksi tidak dapat dibuat.', 'error');
      throw error;
    }
  };

  const handleDeleteCollection = async (id: string) => {
    try {
      await CollectionRepository.deleteCollection(id);
      setCollections((prev) => prev.filter((collection) => collection.id !== id));
      setCollectionPhotoIds((prev) => { const next = { ...prev }; delete next[id]; return next; });
      showToast('Koleksi dihapus. Foto tetap ada di galeri.', 'info');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Koleksi tidak dapat dihapus.', 'error'); }
  };

  const handleRenameCollection = async (id: string, newName: string) => {
    try {
      await CollectionRepository.updateCollection(id, { name: newName });
      setCollections((prev) => prev.map((collection) => collection.id === id ? { ...collection, name: newName } : collection));
      setSelectedCollection((prev) => prev && prev.id === id ? { ...prev, name: newName } : prev);
      showToast(`Nama koleksi diubah menjadi "${newName}".`, 'success');
    } catch (error) { showToast(error instanceof Error ? error.message : 'Nama koleksi tidak dapat diubah.', 'error'); }
  };

  // COMPUTE OBSERVATIONAL STATS USING CALENDAR AGGREGATOR
  const statsSummary: StatsSummary = CalendarAggregator.computeStats(calendarEntries);
  const shownSessionDuration = isSessionActive ? sessionDurationSeconds
    : resumableSnapshot ? Math.floor((Date.now() - resumableSnapshot.startedAt) / 1000) : 0;

  // BACKUP EXPORT & RESTORE
  const handleExportBackup = async () => {
    try {
      const sessions = await db.sessions.toArray();
      const photoFiles = await db.photo_files.toArray();
      const { pin_hash: _pinHash, ...backupSettings } = settings;
      const backupData = {
      schema_version: 3,
      exported_at: new Date().toISOString(),
      photos: photos.map(({ url: _url, thumbnail_url: _thumbnail, ...photo }) => ({ ...photo, url: '', missing: true })),
      photo_files: await Promise.all(photoFiles.map(async (file) => ({
        photo_id: file.photo_id,
        thumbnail: file.thumbnail ? await blobToDataUrl(file.thumbnail) : undefined,
        blob: file.blob ? await blobToDataUrl(file.blob) : undefined,
      }))),
      collections: collections.map(({ cover_photo_url: _url, ...collection }) => collection),
      photo_collections: Object.entries(collectionPhotoIds).flatMap(([collection_id, ids]) =>
        ids.map((photo_id) => ({ collection_id, photo_id, added_at: new Date().toISOString() }))),
      calendar: calendarEntries,
      sessions,
      compositions: savedCompositions.map((composition) => ({ ...composition, slots: composition.slots.map((slot) => ({ ...slot, photo_url: '' })) })),
      settings: { ...backupSettings, app_lock_enabled: false },
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `private_board_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast('Cadangan JSON diekspor.', 'success');
    } catch {
      showToast('Cadangan tidak dapat diekspor.', 'error');
    }
  };

  const handleImportBackup = async (content: string) => {
    const parsed = JSON.parse(content);
    if (![1, 2, 3].includes(parsed.schema_version) || !Array.isArray(parsed.photos) ||
        !Array.isArray(parsed.collections) || !Array.isArray(parsed.calendar) ||
        !Array.isArray(parsed.compositions)) throw new Error('Berkas cadangan tidak valid atau tidak didukung.');
    const photosToSave = parsed.photos.map((photo: Photo) => ({
      ...photo, tags: Array.isArray(photo.tags) ? photo.tags : [], url: '', thumbnail_url: undefined, missing: !photo.remote_url, kept: false,
    }));
    const collectionsToSave = parsed.collections.map((collection: Collection) => ({ ...collection, cover_photo_url: undefined }));
    const calendarToSave = parsed.calendar as CalendarEntry[];
    const compositionsToSave = parsed.compositions.map((composition: SavedComposition) => ({
      ...composition, slots: composition.slots.map((slot) => ({ ...slot, photo_url: '' })),
    }));
    if (photosToSave.some((photo: Photo) => !photo.id || !photo.original_filename || !photo.display_name ||
        !Array.isArray(photo.tags) || photo.tags.length > 12 || photo.tags.some((tag) => typeof tag !== 'string' || tag.length > 32 || /[\u0000-\u001f]/.test(tag))) ||
        collectionsToSave.some((collection: Collection) => !collection.id || !collection.name) ||
        calendarToSave.some((entry) => !entry.id || !/^\d{4}-\d{2}-\d{2}$/.test(entry.entry_date) || entry.count_value < 0 || entry.duration_seconds < 0)) {
      throw new Error('Berkas cadangan berisi data yang tidak valid.');
    }
    const photoIds = new Set(photosToSave.map((photo: Photo) => photo.id));
    const collectionIds = new Set(collectionsToSave.map((collection: Collection) => collection.id));
    const rawRelations = Array.isArray(parsed.photo_collections) ? parsed.photo_collections : [];
    if (rawRelations.some((relation: { photo_id?: string; collection_id?: string }) => !photoIds.has(relation.photo_id || '') || !collectionIds.has(relation.collection_id || ''))) {
      throw new Error('Berkas cadangan memiliki hubungan foto dan koleksi yang tidak valid.');
    }
    const relations = rawRelations as { photo_id: string; collection_id: string; added_at: string }[];
    const rawPhotoFiles = Array.isArray(parsed.photo_files) ? parsed.photo_files : [];
    const photoFilesToSave: PhotoFile[] = await Promise.all(rawPhotoFiles.map(async (file: { photo_id?: string; thumbnail?: unknown; blob?: unknown }) => {
      if (typeof file.photo_id !== 'string' || !photoIds.has(file.photo_id)) throw new Error('Berkas cadangan mengandung data foto yang tidak cocok.');
      return {
        photo_id: file.photo_id,
        thumbnail: await imageBlobFromDataUrl(file.thumbnail),
        blob: await imageBlobFromDataUrl(file.blob),
      };
    }));
    if (new Set(photoFilesToSave.map((file) => file.photo_id)).size !== photoFilesToSave.length) throw new Error('Berkas cadangan memiliki foto ganda.');
    const sessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
    await db.transaction('rw', [db.photos, db.photo_files, db.collections, db.photo_collections, db.calendar_entries, db.sessions, db.saved_compositions], async () => {
      await db.photos.bulkPut(photosToSave);
      await db.photo_files.bulkPut(photoFilesToSave);
      await db.collections.bulkPut(collectionsToSave);
      await db.photo_collections.bulkPut(relations);
      await db.calendar_entries.bulkPut(calendarToSave);
      await db.sessions.bulkPut(sessions);
      await db.saved_compositions.bulkPut(compositionsToSave);
    });
    const [loadedPhotos, loadedCollections, loadedEntries, loadedCompositions] = await Promise.all([
      PhotoRepository.getAll(), CollectionRepository.getAll(), CalendarRepository.getAll(), SessionRepository.getAllCompositions(),
    ]);
    setPhotos(loadedPhotos);
    setCollections(loadedCollections);
    setCollectionPhotoIds(relations.reduce<Record<string, string[]>>((groups, relation: { collection_id: string; photo_id: string }) => {
      (groups[relation.collection_id] ??= []).push(relation.photo_id);
      return groups;
    }, {}));
    setCalendarEntries(loadedEntries);
    setSavedCompositions(loadedCompositions);
    if (parsed.settings && typeof parsed.settings === 'object') {
      const { pin_hash: _restoredPinHash, ...restoredSettings } = parsed.settings as AppSettings;
      setSettings({ ...DEFAULT_SETTINGS, ...restoredSettings, app_lock_enabled: false, pin_hash: '' });
    }
    showToast('Cadangan dipulihkan. Salinan tersimpan ikut dipulihkan; foto lain perlu dipilih ulang.', 'success');
  };

  const handleResetApp = async () => {
    if (window.confirm('Hapus data aplikasi ini, termasuk salinan foto yang disimpan? Berkas foto asli tetap aman.')) {
      localStorage.removeItem('pb_settings');
      try {
        PhotoRepository.releaseObjectUrls();
        await db.photo_sources.clear();
        await db.transaction('rw', [db.photos, db.photo_files, db.collections, db.photo_collections, db.calendar_entries, db.sessions, db.saved_compositions, db.settings], async () => {
          await Promise.all([db.photos.clear(), db.photo_files.clear(), db.collections.clear(), db.photo_collections.clear(), db.calendar_entries.clear(), db.sessions.clear(), db.saved_compositions.clear(), db.settings.clear()]);
        });
        setPhotos([]); setCollections([]); setCollectionPhotoIds({}); setCalendarEntries([]); setSavedCompositions([]);
        setSettings(DEFAULT_SETTINGS); setIsSessionActive(false); setIsStartModalOpen(false); setPlayerSlots([]); setHistoryStack([]); setForwardHistoryStack([]);
        setSelectedCollection(null); sessionStartedAtRef.current = null; sessionBackgroundStartedAtRef.current = null;
        setIsAppLocked(false); setCurrentTab('home');
        showToast('Data aplikasi dihapus. Berkas asli tidak diubah.', 'info');
      } catch {
        showToast('Sebagian data aplikasi tidak dapat dihapus.', 'error');
      }
    }
  };

  // Keep PlayerScreen mounted through its end-of-session summary.
  if (currentTab === 'player') {
    return (
      <>
        <PlayerScreen
          config={sessionConfig}
          slots={playerSlots}
          isPlaying={isPlaying}
          countdown={countdown}
          sessionDuration={sessionDurationSeconds}
          photosViewedCount={photosViewedCount}
          likesCount={sessionLikesCount}
          favoritesCount={sessionFavoritesCount}
          keptCount={sessionKeptCount}
          canGoPrevious={historyStack.length > 0}
          onNext={handleNextDisplay}
          onPrevious={handlePreviousDisplay}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          onTogglePin={handleTogglePin}
          onReplaceOne={handleReplaceOne}
          onChangePhotoCount={handleChangePhotoCount}
          onToggleLike={handleToggleLike}
          onToggleFavorite={handleToggleFavorite}
          onKeepPhoto={handleKeepPhoto}
          collections={collections}
          onCreateCollection={handleCreateCollection}
          onToggleHide={handleToggleHide}
          onFocusChange={setIsPlayerOverlayOpen}
          onSaveComposition={handleSaveComposition}
          onEndSession={handleEndSession}
          onExitWithoutSave={() => setCurrentTab('home')}
          onViewCalendar={() => setCurrentTab('calendar')}
          onStartNewSession={() => setIsStartModalOpen(true)}
          onGoHome={() => setCurrentTab('home')}
        />
        <StartSessionModal
          isOpen={isStartModalOpen}
          onClose={() => setIsStartModalOpen(false)}
          collections={collections}
          totalPhotosCount={photos.filter((p) => !p.hidden).length}
          favoritesCount={photos.filter((p) => p.favorite && !p.hidden).length}
          likedCount={photos.filter((p) => p.liked && !p.hidden).length}
          defaultSettings={settings}
          onStartSession={handleStartSession}
        />
        <AppLockModal
          isOpen={isAppLocked || isPinSetupOpen}
          onUnlock={() => {
            setIsAppLocked(false);
            setIsPinSetupOpen(false);
          }}
          savedPin={settings.pin_hash || ''}
          setupMode={isPinSetupOpen}
          onSetPin={(newPin) => {
            setSettings((prev) => ({ ...prev, pin_hash: newPin, app_lock_enabled: true }));
            showToast('PIN kunci aplikasi berhasil diatur.', 'success');
          }}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-screen bg-app text-app-primary">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        currentTab={currentTab}
        onNavigate={(tab) => {
          setSelectedCollection(null);
          setCurrentTab(tab);
        }}
        isSessionActive={isSessionActive}
        onLockClick={() => setIsAppLocked(true)}
        isAppLocked={isAppLocked}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Header */}
        <TopHeader
          title={selectedCollection ? selectedCollection.name : undefined}
          onNavigate={(tab) => {
            setSelectedCollection(null);
            setCurrentTab(tab);
          }}
          onLockClick={() => setIsAppLocked(true)}
          isAppLocked={isAppLocked}
        />

        {/* Tab Routing */}
        <main className="flex-1 overflow-y-auto">
          {selectedCollection ? (
            <CollectionDetailScreen
              collection={selectedCollection}
              photos={photos.filter((p) => !p.hidden && collectionPhotoIds[selectedCollection.id]?.includes(p.id))}
              collections={collections}
              onBack={() => setSelectedCollection(null)}
              onStartSession={(col) => {
                handleStartSession({
                  sourceKind: 'collection',
                  sourceId: col.id,
                  sourceName: col.name,
                  photoCount: settings.default_photo_count,
                  mode: 'auto',
                  intervalSeconds: settings.default_interval,
                  layoutMode: 'dynamic',
                  shuffleMode: settings.default_shuffle_mode,
                  fitMode: settings.default_fit_mode,
                });
              }}
              onPhotoClick={() => {}}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onSetPhotoTags={handleSetPhotoTags}
              onKeepPhoto={handleKeepPhoto}
              onCreateCollection={handleCreateCollection}
              onToggleHide={handleToggleHide}
              onRemoveDriveLink={handleRemoveDriveLink}
              onDeleteCollection={handleDeleteCollection}
              onRenameCollection={handleRenameCollection}
            />
          ) : currentTab === 'home' ? (
            <HomeScreen
              stats={statsSummary}
              recentCollections={collections}
              isSessionActive={isSessionActive || !!resumableSnapshot}
              activeSessionDuration={shownSessionDuration}
              onStartSessionClick={() => setIsStartModalOpen(true)}
              onResumeSessionClick={handleResumeSession}
              onSelectCollection={(col) => setSelectedCollection(col)}
              onNavigate={(tab) => setCurrentTab(tab)}
              onAddPhotosClick={() => setCurrentTab('library')}
            />
          ) : currentTab === 'library' ? (
            <LibraryScreen
              photos={photos}
              collections={collections}
              initialFilter="all"
              onPhotoClick={() => {}}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onSetPhotoTags={handleSetPhotoTags}
              onKeepPhoto={handleKeepPhoto}
              onToggleHide={handleToggleHide}
              onAddFiles={handleAddFiles}
              onAddDriveLinks={handleAddDriveLinks}
              onRemoveDriveLink={handleRemoveDriveLink}
              onCreateCollection={handleCreateCollection}
            />
          ) : currentTab === 'favorites' ? (
            <LibraryScreen
              photos={photos}
              collections={collections}
              initialFilter="favorites"
              onPhotoClick={() => {}}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onSetPhotoTags={handleSetPhotoTags}
              onKeepPhoto={handleKeepPhoto}
              onToggleHide={handleToggleHide}
              onAddFiles={handleAddFiles}
              onAddDriveLinks={handleAddDriveLinks}
              onRemoveDriveLink={handleRemoveDriveLink}
              onCreateCollection={handleCreateCollection}
            />
          ) : currentTab === 'liked' ? (
            <LibraryScreen
              photos={photos}
              collections={collections}
              initialFilter="liked"
              onPhotoClick={() => {}}
              onToggleLike={handleToggleLike}
              onToggleFavorite={handleToggleFavorite}
              onSetPhotoTags={handleSetPhotoTags}
              onKeepPhoto={handleKeepPhoto}
              onToggleHide={handleToggleHide}
              onAddFiles={handleAddFiles}
              onAddDriveLinks={handleAddDriveLinks}
              onRemoveDriveLink={handleRemoveDriveLink}
              onCreateCollection={handleCreateCollection}
            />
          ) : currentTab === 'collections' ? (
            <CollectionsScreen
              collections={collections}
              onSelectCollection={(col) => setSelectedCollection(col)}
              onStartSession={(col) => {
                handleStartSession({
                  sourceKind: 'collection',
                  sourceId: col.id,
                  sourceName: col.name,
                  photoCount: settings.default_photo_count,
                  mode: 'auto',
                  intervalSeconds: settings.default_interval,
                  layoutMode: 'dynamic',
                  shuffleMode: settings.default_shuffle_mode,
                  fitMode: settings.default_fit_mode,
                });
              }}
              onCreateCollection={handleCreateCollection}
            />
          ) : currentTab === 'calendar' ? (
            <CalendarScreen
              entries={calendarEntries}
              stats={statsSummary}
              onAddManualEntry={handleAddManualCalendarEntry}
              onDeleteEntry={handleDeleteCalendarEntry}
            />
          ) : currentTab === 'settings' ? (
            <SettingsScreen
              settings={settings}
              onUpdateSettings={(newSet) => {
                if (newSet.app_lock_enabled === true && !settings.app_lock_enabled) {
                  if (settings.pin_hash) setIsAppLocked(true);
                  else setIsPinSetupOpen(true);
                } else if (newSet.app_lock_enabled === false) {
                  setIsAppLocked(false);
                  setIsPinSetupOpen(false);
                }
                setSettings((prev) => ({ ...prev, ...newSet }));
              }}
              onExportBackup={handleExportBackup}
              onImportBackup={handleImportBackup}
              onResetApp={handleResetApp}
              onOpenPinSetup={() => setIsPinSetupOpen(true)}
            />
          ) : (
            <HomeScreen
              stats={statsSummary}
              recentCollections={collections}
              isSessionActive={isSessionActive || !!resumableSnapshot}
              activeSessionDuration={shownSessionDuration}
              onStartSessionClick={() => setIsStartModalOpen(true)}
              onResumeSessionClick={handleResumeSession}
              onSelectCollection={(col) => setSelectedCollection(col)}
              onNavigate={(tab) => setCurrentTab(tab)}
              onAddPhotosClick={() => setCurrentTab('library')}
            />
          )}
        </main>

        {/* Mobile Bottom Navigation */}
        <MobileBottomNav
          currentTab={currentTab}
          onNavigate={(tab) => {
            setSelectedCollection(null);
            if (tab === 'player' && !isSessionActive) {
              setIsStartModalOpen(true);
            } else {
              setCurrentTab(tab);
            }
          }}
          isSessionActive={isSessionActive}
        />
      </div>

      {/* Start Session Modal */}
      <StartSessionModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        collections={collections}
        totalPhotosCount={photos.filter((p) => !p.hidden).length}
        favoritesCount={photos.filter((p) => p.favorite && !p.hidden).length}
        likedCount={photos.filter((p) => p.liked && !p.hidden).length}
        defaultSettings={settings}
        onStartSession={handleStartSession}
      />

      {/* App Lock Screen Modal */}
      <AppLockModal
        isOpen={isAppLocked || isPinSetupOpen}
        onUnlock={() => {
          setIsAppLocked(false);
          setIsPinSetupOpen(false);
        }}
        savedPin={settings.pin_hash || ''}
        setupMode={isPinSetupOpen}
        onSetPin={(newPin) => {
          setSettings((prev) => ({ ...prev, pin_hash: newPin, app_lock_enabled: true }));
          showToast('PIN kunci aplikasi berhasil diatur.', 'success');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
}
