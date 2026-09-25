import { PinEngine } from './PinEngine';
import { ShuffleEngine } from '../shuffle/ShuffleEngine';

export interface DisplaySlotState {
  slotIndex: number;
  photoId: string;
  pinned: boolean;
}

export interface DisplaySnapshot {
  slots: DisplaySlotState[];
  timestamp: number;
}

/**
 * PlayerStateEngine manages:
 * - 1 to 5 photo slot displays
 * - History stack up to bounded limit (default 50)
 * - Single-slot replace dispatching
 * - Unpin/Pin mutations
 * - Coordinated Next and Previous operations
 */
export class PlayerStateEngine {
  private slots: DisplaySlotState[] = [];
  private history: DisplaySnapshot[] = [];
  private future: DisplaySnapshot[] = [];
  private maxHistoryDepth: number = 50;
  private shuffleEngine: ShuffleEngine;

  constructor(
    initialPool: string[],
    initialSlotCount: number = 4,
    maxHistory: number = 50
  ) {
    this.maxHistoryDepth = Number.isFinite(maxHistory) ? Math.max(0, Math.floor(maxHistory)) : 50;
    this.shuffleEngine = new ShuffleEngine(initialPool, 'no_repeat');
    this.initializeSlots(initialSlotCount);
  }

  public getSlots(): DisplaySlotState[] {
    return this.slots.map((slot) => ({ ...slot }));
  }

  public getHistoryLength(): number {
    return this.history.length;
  }

  public canGoPrevious(): boolean {
    return this.history.length > 0;
  }

  public initializeSlots(count: number): void {
    const validCount = Number.isFinite(count) ? Math.max(1, Math.min(5, Math.floor(count))) : 1;
    const activeSet = new Set<string>();
    const candidates = this.shuffleEngine.getNextCandidates(validCount, activeSet);

    this.slots = [];
    for (let i = 0; i < candidates.length; i++) {
      this.slots.push({
        slotIndex: i,
        photoId: candidates[i] || '',
        pinned: false,
      });
    }
    this.history = [];
    this.future = [];
  }

  /**
   * Advances unpinned slots to next candidates.
   * Pinned slots are strictly preserved!
   */
  public next(): void {
    const forward = this.future.pop();
    if (forward) {
      this.pushHistorySnapshot();
      this.slots = forward.slots.map((slot) => ({ ...slot }));
      return;
    }

    // Collect currently pinned photo IDs so candidates don't collide
    const activeVisibleIds = new Set<string>(
      this.slots.map((s) => s.photoId)
    );

    const unpinnedIndices = PinEngine.getUnpinnedSlotIndices(this.slots);
    const newCandidates = this.shuffleEngine.getNextCandidates(
      unpinnedIndices.length,
      activeVisibleIds
    );

    if (newCandidates.length === 0) return;
    this.pushHistorySnapshot();
    this.slots = PinEngine.applyNextToSlots(this.slots, newCandidates);
  }

  /**
   * Reverts to the previous display state from history stack.
   */
  public previous(): boolean {
    if (this.history.length === 0) return false;

    const previousSnapshot = this.history.pop();
    if (!previousSnapshot) return false;

    this.future.push({ slots: this.getSlots(), timestamp: Date.now() });
    this.slots = previousSnapshot.slots.map((s) => ({ ...s }));
    return true;
  }

  /**
   * Replaces ONE slot only.
   * If slot is pinned, it stays pinned with the new photo!
   */
  public replaceOne(slotIndex: number): string | null {
    const targetSlot = this.slots.find((s) => s.slotIndex === slotIndex);
    if (!targetSlot) return null;

    // Exclude other visible slots
    const visibleIds = new Set<string>(
      this.slots.filter((s) => s.slotIndex !== slotIndex).map((s) => s.photoId)
    );

    const newPhotoId = this.shuffleEngine.replaceOneCandidate(targetSlot.photoId, visibleIds);
    if (!newPhotoId) return null;

    this.pushHistorySnapshot();
    this.future = [];
    this.slots = PinEngine.replaceSlotPhoto(this.slots, slotIndex, newPhotoId);
    return newPhotoId;
  }

  public togglePin(slotIndex: number): void {
    this.future = [];
    this.slots = PinEngine.togglePin(this.slots, slotIndex);
  }

  public unpinAll(): void {
    this.future = [];
    this.slots = PinEngine.unpinAll(this.slots);
  }

  public removePhotoFromPool(photoId: string): void {
    this.shuffleEngine.removePhoto(photoId);
    // Privacy takes precedence over history: Previous must never reveal a hidden photo.
    for (const snapshot of [...this.history, ...this.future]) {
      snapshot.slots = snapshot.slots.filter((slot) => slot.photoId !== photoId)
        .map((slot, slotIndex) => ({ ...slot, slotIndex }));
    }
    const visibleIds = new Set(this.slots.map((slot) => slot.photoId));
    this.slots = this.slots.flatMap((slot) => {
      if (slot.photoId !== photoId) return [slot];
      const replacement = this.shuffleEngine.getNextCandidates(1, visibleIds)[0];
      return replacement ? [{ ...slot, photoId: replacement, pinned: false }] : [];
    }).map((slot, slotIndex) => ({ ...slot, slotIndex }));
  }

  public resize(newCount: number): void {
    if (!Number.isFinite(newCount)) return;
    const validCount = Math.max(1, Math.min(5, Math.floor(newCount)));
    if (validCount === this.slots.length) return;
    const visibleIds = new Set(this.slots.map((slot) => slot.photoId));
    const candidates = this.shuffleEngine.getNextCandidates(validCount - this.slots.length, visibleIds);
    const resized = PinEngine.resizeSlots(this.slots, validCount, () => candidates.shift() || '');
    if (resized.length === this.slots.length) return;
    this.pushHistorySnapshot();
    this.future = [];
    this.slots = resized;
  }

  private pushHistorySnapshot(): void {
    const snapshot: DisplaySnapshot = {
      slots: this.slots.map((s) => ({ ...s })),
      timestamp: Date.now(),
    };
    this.history.push(snapshot);
    if (this.history.length > this.maxHistoryDepth) {
      this.history.shift();
    }
  }
}
