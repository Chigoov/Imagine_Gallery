import React, { useState, useEffect, useCallback, useRef } from 'react';
import { clsx } from 'clsx';
import { ArrowLeft, Shield, Sparkles } from 'lucide-react';
import { Photo, PlayerSlot as IPlayerSlot } from '../../types/photo';
import { SessionConfig, ImageFitMode } from '../../types/session';
import { PhotoSlot } from './components/PhotoSlot';
import { PlayerControlBar } from './components/PlayerControlBar';
import { FocusModeModal } from './components/FocusModeModal';
import { SaveCompositionModal } from './components/SaveCompositionModal';
import { SessionSummaryModal } from './components/SessionSummaryModal';
import { KeepPhotoSheet } from '../collections/components/KeepPhotoSheet';
import { Collection } from '../../types/collection';

interface PlayerScreenProps {
  config: SessionConfig;
  slots: IPlayerSlot[];
  isPlaying: boolean;
  countdown: number;
  sessionDuration: number;
  photosViewedCount: number;
  likesCount: number;
  favoritesCount: number;
  keptCount: number;
  canGoPrevious: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onTogglePlay: () => void;
  onTogglePin: (slotIndex: number) => void;
  onReplaceOne: (slotIndex: number) => void;
  onChangePhotoCount: (count: number) => void;
  onToggleLike: (photoId: string) => void;
  onToggleFavorite: (photoId: string) => void;
  onKeepPhoto: (photo: Photo, collectionId: string, namingRule: string, customName?: string) => void | Promise<void>;
  collections: Collection[];
  onCreateCollection: (name: string) => string | Promise<string>;
  onSaveComposition: (name: string) => void;
  onEndSession: () => void | Promise<void>;
  onToggleHide: (photoId: string) => void;
  onFocusChange?: (focused: boolean) => void;
  onExitWithoutSave: () => void;
  onViewCalendar: () => void;
  onStartNewSession: () => void;
  onGoHome: () => void;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = ({
  config,
  slots,
  isPlaying,
  countdown,
  sessionDuration,
  photosViewedCount,
  likesCount,
  favoritesCount,
  keptCount,
  canGoPrevious,
  onNext,
  onPrevious,
  onTogglePlay,
  onTogglePin,
  onReplaceOne,
  onChangePhotoCount,
  onToggleLike,
  onToggleFavorite,
  onKeepPhoto,
  collections,
  onCreateCollection,
  onSaveComposition,
  onEndSession,
  onToggleHide,
  onFocusChange,
  onExitWithoutSave,
  onViewCalendar,
  onStartNewSession,
  onGoHome,
}) => {
  const [focusedPhotoId, setFocusedPhotoId] = useState<string | null>(null);
  const [photoToKeep, setPhotoToKeep] = useState<Photo | null>(null);
  const focusedSlot = slots.find((slot) => slot.photo?.id === focusedPhotoId);
  const focusedPhoto = focusedSlot?.photo || null;
  const [isActionsOpen, setActionsOpen] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const [endError, setEndError] = useState('');
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isControlsVisible, setIsControlsVisible] = useState<boolean>(true);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

  const overlayOpen = !!focusedPhoto || !!photoToKeep || isSaveModalOpen || isSummaryModalOpen || isActionsOpen || isEnding;
  useEffect(() => { onFocusChange?.(overlayOpen); }, [overlayOpen, onFocusChange]);
  useEffect(() => {
    const update = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', update);
    return () => document.removeEventListener('fullscreenchange', update);
  }, []);

  // Touch Swipe tracking for Mobile
  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);

  // Inactivity fade timer (auto-hides floating controls after 3 seconds)
  const resetInactivityTimer = useCallback(() => {
    setIsControlsVisible(true);
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    inactivityTimerRef.current = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
  }, []);

  useEffect(() => {
    resetInactivityTimer();
    const handleActivity = () => resetInactivityTimer();
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('touchstart', handleActivity);
    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, [resetInactivityTimer]);

  // Keyboard Shortcuts (Space, Left, Right, 1-5, P, L, F, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey || overlayOpen || document.querySelector('dialog[open]') || (e.target as HTMLElement).closest('input, textarea, select, button, [contenteditable=true]')) {
        return;
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          onTogglePlay();
          resetInactivityTimer();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNext();
          resetInactivityTimer();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrevious) onPrevious();
          resetInactivityTimer();
          break;
        case 'Digit1':
          onChangePhotoCount(1);
          break;
        case 'Digit2':
          onChangePhotoCount(2);
          break;
        case 'Digit3':
          onChangePhotoCount(3);
          break;
        case 'Digit4':
          onChangePhotoCount(4);
          break;
        case 'Digit5':
          onChangePhotoCount(5);
          break;
        case 'KeyP':
          if (slots[0]) onTogglePin(0);
          break;
        case 'KeyF':
          handleToggleFullscreen();
          break;
        case 'Escape':
          if (focusedPhoto) {
            setFocusedPhotoId(null);
          } else if (isFullscreen) {
            handleToggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onTogglePlay, onNext, onPrevious, canGoPrevious, onChangePhotoCount, slots, onTogglePin, focusedPhoto, isFullscreen, resetInactivityTimer, overlayOpen]);

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  };

  const handleOpenFocus = (photo: Photo) => setFocusedPhotoId(photo.id);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (overlayOpen || (e.target as HTMLElement).closest('button, dialog')) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (overlayOpen || (e.target as HTMLElement).closest('button, dialog')) return;
    const diffX = e.changedTouches[0].clientX - touchStartXRef.current;
    const diffY = e.changedTouches[0].clientY - touchStartYRef.current;

    // Detect horizontal swipe if larger than vertical movement
    if (Math.abs(diffX) > 60 && Math.abs(diffX) > Math.abs(diffY) * 1.5) {
      if (diffX < 0) {
        // Swipe Left -> Next
        onNext();
      } else if (diffX > 0 && canGoPrevious) {
        // Swipe Right -> Previous
        onPrevious();
      }
      resetInactivityTimer();
    }
  };

  const handleEndSessionClick = async () => {
    if (isEnding || isSummaryModalOpen) return;
    setIsEnding(true);
    setEndError('');
    try {
      await onEndSession();
      setIsSummaryModalOpen(true);
    } catch {
      setEndError('Sesi tidak dapat disimpan. Coba akhiri sesi sekali lagi.');
    } finally {
      setIsEnding(false);
    }
  };

  // Render responsive layout based on photo count (1 to 5)
  const renderSlotsLayout = () => {
    const count = config.photoCount;
    const activeSlots = slots.slice(0, count);

    switch (count) {
      case 1:
        return (
          <div className="w-full h-full p-2 sm:p-4">
            <PhotoSlot
              slotIndex={0}
              photo={activeSlots[0]?.photo || null}
              pinned={activeSlots[0]?.pinned || false}
              fitMode={config.fitMode}
              onTogglePin={onTogglePin}
              onReplaceOne={onReplaceOne}
              onToggleLike={onToggleLike}
              onToggleFavorite={onToggleFavorite}
              onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
              onFocusPhoto={handleOpenFocus}
              isControlsVisible={isControlsVisible}
            />
          </div>
        );

      case 2:
        // Desktop: horizontal split, Mobile: vertical split
        return (
          <div className="w-full h-full p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-2 sm:gap-3">
            {activeSlots.map((slot, idx) => (
              <PhotoSlot
                key={idx}
                slotIndex={idx}
                photo={slot.photo}
                pinned={slot.pinned}
                fitMode={config.fitMode}
                onTogglePin={onTogglePin}
                onReplaceOne={onReplaceOne}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
                onFocusPhoto={handleOpenFocus}
                isControlsVisible={isControlsVisible}
              />
            ))}
          </div>
        );

      case 3:
        // Desktop: 1 large hero left (60%) + 2 stacked right (40%)
        // Mobile: 1 large hero top (60%) + 2 split bottom (40%)
        return (
          <div className="w-full h-full p-2 sm:p-4 grid grid-cols-1 md:grid-cols-[3fr_2fr] grid-rows-[3fr_2fr] md:grid-rows-1 gap-2 sm:gap-3">
            {/* Hero slot */}
            <div className="min-w-0 min-h-0">
              {activeSlots[0] && (
                <PhotoSlot
                  slotIndex={0}
                  photo={activeSlots[0].photo}
                  pinned={activeSlots[0].pinned}
                  fitMode={config.fitMode}
                  onTogglePin={onTogglePin}
                  onReplaceOne={onReplaceOne}
                  onToggleLike={onToggleLike}
                  onToggleFavorite={onToggleFavorite}
                  onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
                  onFocusPhoto={handleOpenFocus}
                  isControlsVisible={isControlsVisible}
                />
              )}
            </div>

            {/* Stacked pair */}
            <div className="min-w-0 min-h-0 grid grid-cols-2 md:grid-cols-1 md:grid-rows-2 gap-2 sm:gap-3">
              {activeSlots.slice(1, 3).map((slot, i) => (
                <div key={i + 1} className="min-w-0 min-h-0">
                  <PhotoSlot
                    slotIndex={i + 1}
                    photo={slot.photo}
                    pinned={slot.pinned}
                    fitMode={config.fitMode}
                    onTogglePin={onTogglePin}
                    onReplaceOne={onReplaceOne}
                    onToggleLike={onToggleLike}
                    onToggleFavorite={onToggleFavorite}
                    onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
                    onFocusPhoto={handleOpenFocus}
                    isControlsVisible={isControlsVisible}
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        // 2x2 Grid balanced
        return (
          <div className="w-full h-full p-2 sm:p-4 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
            {activeSlots.map((slot, idx) => (
              <PhotoSlot
                key={idx}
                slotIndex={idx}
                photo={slot.photo}
                pinned={slot.pinned}
                fitMode={config.fitMode}
                onTogglePin={onTogglePin}
                onReplaceOne={onReplaceOne}
                onToggleLike={onToggleLike}
                onToggleFavorite={onToggleFavorite}
                onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
                onFocusPhoto={handleOpenFocus}
                isControlsVisible={isControlsVisible}
              />
            ))}
          </div>
        );

      case 5:
        // 5 photos: Desktop: 1 large hero left (50%) + 4 compact grid right (50%)
        // Mobile: 1 large hero top (50%) + 4 compact grid bottom (50%)
        return (
          <div className="w-full h-full p-2 sm:p-4 grid grid-cols-1 md:grid-cols-2 grid-rows-2 md:grid-rows-1 gap-2 sm:gap-3">
            {/* Hero slot */}
            <div className="min-w-0 min-h-0">
              {activeSlots[0] && (
                <PhotoSlot
                  slotIndex={0}
                  photo={activeSlots[0].photo}
                  pinned={activeSlots[0].pinned}
                  fitMode={config.fitMode}
                  onTogglePin={onTogglePin}
                  onReplaceOne={onReplaceOne}
                  onToggleLike={onToggleLike}
                  onToggleFavorite={onToggleFavorite}
                  onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
                  onFocusPhoto={handleOpenFocus}
                  isControlsVisible={isControlsVisible}
                />
              )}
            </div>

            {/* 4 compact slots */}
            <div className="min-w-0 min-h-0 grid grid-cols-2 grid-rows-2 gap-2 sm:gap-3">
              {activeSlots.slice(1, 5).map((slot, i) => (
                <PhotoSlot
                  key={i + 1}
                  slotIndex={i + 1}
                  photo={slot.photo}
                  pinned={slot.pinned}
                  fitMode={config.fitMode}
                  onTogglePin={onTogglePin}
                  onReplaceOne={onReplaceOne}
                  onToggleLike={onToggleLike}
                  onToggleFavorite={onToggleFavorite}
                  onKeepPhoto={setPhotoToKeep}
              onToggleHide={onToggleHide}
              onActionsOpenChange={setActionsOpen}
                  onFocusPhoto={handleOpenFocus}
                  isControlsVisible={isControlsVisible}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="relative w-full h-[100dvh] bg-player overflow-hidden flex flex-col justify-between select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Header Floating Status (minimal auto-hide) */}
      <div
        className={clsx(
          'absolute top-3 inset-x-4 sm:inset-x-6 z-30 flex items-center justify-between pointer-events-none transition-opacity duration-control',
          isControlsVisible ? 'opacity-100' : 'opacity-0'
        )}
      >
        <button
          onClick={onExitWithoutSave}
          className="pointer-events-auto p-2 rounded-xl soft-glass text-app-secondary hover:text-app-primary shadow-glass transition-colors flex items-center gap-1.5 text-xs"
          title="Kembali ke beranda (sesi tetap berjalan)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Beranda</span>
        </button>

        <div className="soft-glass min-w-0 max-w-[50%] px-2 py-1.5 rounded-full border border-white/10 text-xs text-app-secondary flex items-center gap-2 shadow-glass">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-medium text-app-primary truncate">{config.sourceName || 'Sesi foto'}</span>
          <span className="text-white/20">•</span>
          <span className="text-[11px] text-accent font-semibold">{config.photoCount} foto</span>
        </div>

        <button
          onClick={handleEndSessionClick}
          className="pointer-events-auto px-3 py-1.5 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 hover:bg-red-500/25 text-xs font-semibold shadow-glass transition-colors"
        >
          Akhiri sesi
        </button>
      </div>

      {/* Main Multi-Photo Visual Canvas */}
      {endError && <p role="alert" className="absolute top-16 inset-x-4 z-40 p-3 bg-red-950 text-red-200 rounded-xl">{endError}</p>}
      <main className="flex-1 min-h-0 w-full overflow-hidden pt-14 pb-28 sm:pb-24">
        {renderSlotsLayout()}
      </main>

      {/* Bottom Floating Control Bar */}
      <PlayerControlBar
        mode={config.mode}
        isPlaying={isPlaying}
        onTogglePlay={onTogglePlay}
        onNext={onNext}
        onPrevious={onPrevious}
        canGoPrevious={canGoPrevious}
        photoCount={config.photoCount}
        onChangePhotoCount={onChangePhotoCount}
        countdown={countdown}
        totalSessionDuration={sessionDuration}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onSaveComposition={() => setIsSaveModalOpen(true)}
        onEndSession={handleEndSessionClick}
        isVisible={isControlsVisible}
      />

      {/* Focus Mode Overlay */}
      <FocusModeModal
        photo={focusedPhoto}
        isOpen={!!focusedPhoto}
        onClose={() => setFocusedPhotoId(null)}
        isPinned={focusedSlot?.pinned || false}
        onTogglePin={() => { if (focusedSlot) onTogglePin(focusedSlot.slotIndex); }}
        onToggleLike={onToggleLike}
        onToggleFavorite={onToggleFavorite}
        onKeepPhoto={setPhotoToKeep}
      />

      <KeepPhotoSheet
        isOpen={!!photoToKeep}
        onClose={() => setPhotoToKeep(null)}
        photo={photoToKeep}
        collections={collections}
        onKeepSuccess={onKeepPhoto}
        onCreateCollection={onCreateCollection}
      />

      {/* Save Composition Modal */}
      <SaveCompositionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        photoCount={config.photoCount}
        onSave={onSaveComposition}
      />

      {/* Session Summary Modal */}
      <SessionSummaryModal
        isOpen={isSummaryModalOpen}
        onClose={() => {
          setIsSummaryModalOpen(false);
          onGoHome();
        }}
        durationSeconds={sessionDuration}
        photosViewed={photosViewedCount}
        likesCount={likesCount}
        favoritesCount={favoritesCount}
        keptCount={keptCount}
        onViewCalendar={() => {
          setIsSummaryModalOpen(false);
          onViewCalendar();
        }}
        onStartNewSession={() => {
          setIsSummaryModalOpen(false);
          onStartNewSession();
        }}
        onGoHome={() => {
          setIsSummaryModalOpen(false);
          onGoHome();
        }}
      />
    </div>
  );
};
