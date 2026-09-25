export interface SlotPinState {
  slotIndex: number;
  photoId: string;
  pinned: boolean;
}

/**
 * PinEngine enforces core Pin specifications:
 * - Pinned slots never change during Auto Next, Manual Next, or Global Refresh.
 * - Explicit Replace on a pinned slot replaces the photo but KEEPS THE SLOT PINNED.
 * - Unpinning keeps the current photo until the next advance cycle.
 * - Changing photo count prioritizes preserving pinned slots.
 * - Pure TypeScript module testable without UI.
 */
export class PinEngine {
  /**
   * Toggles the pin state for a given slot.
   */
  public static togglePin<T extends { slotIndex: number; pinned: boolean }>(
    slots: T[],
    slotIndex: number
  ): T[] {
    return slots.map((s) => (s.slotIndex === slotIndex ? { ...s, pinned: !s.pinned } : s));
  }

  /**
   * Unpins all slots in the display.
   */
  public static unpinAll<T extends { pinned: boolean }>(slots: T[]): T[] {
    return slots.map((s) => ({ ...s, pinned: false }));
  }

  /**
   * Determines which slots need new candidate replacements on Next.
   * Returns an array of slot indices that are UNPINNED.
   */
  public static getUnpinnedSlotIndices<T extends { slotIndex: number; pinned: boolean }>(
    slots: T[]
  ): number[] {
    return slots.filter((s) => !s.pinned).map((s) => s.slotIndex);
  }

  /**
   * Applies candidates to unpinned slots only. Pinned slots are 100% preserved.
   */
  public static applyNextToSlots<T extends { slotIndex: number; pinned: boolean; photoId: string }>(
    currentSlots: T[],
    newPhotoIds: string[]
  ): T[] {
    const occupied = new Set(currentSlots.map((slot) => slot.photoId));
    const candidates = [...new Set(newPhotoIds)].filter((id) => id && !occupied.has(id));
    let candidateIndex = 0;
    return currentSlots.map((slot) => {
      if (slot.pinned) {
        // Pinned slot MUST NOT change!
        return slot;
      }
      const newId = candidates[candidateIndex++];
      if (!newId) return slot;
      return {
        ...slot,
        photoId: newId || slot.photoId,
      };
    });
  }

  /**
   * Handles explicit Replace on a single slot.
   * Rule: If slot was pinned, it REPLACES the photo but REMAINS PINNED!
   */
  public static replaceSlotPhoto<T extends { slotIndex: number; pinned: boolean; photoId: string }>(
    slots: T[],
    slotIndex: number,
    newPhotoId: string
  ): T[] {
    if (!newPhotoId || slots.some((slot) => slot.slotIndex !== slotIndex && slot.photoId === newPhotoId)) return slots;
    return slots.map((slot) => {
      if (slot.slotIndex === slotIndex) {
        return {
          ...slot,
          photoId: newPhotoId,
          // Retains current pinned status! (Pinned slot stays pinned)
          pinned: slot.pinned,
        };
      }
      return slot;
    });
  }

  /**
   * Resizes slots when user changes count (1–5) during active session.
   * Priority when reducing:
   * 1. Pinned slots
   * 2. Earliest unpinned slots
   */
  public static resizeSlots<T extends { slotIndex: number; pinned: boolean; photoId: string }>(
    currentSlots: T[],
    targetCount: number,
    getCandidateId: () => string
  ): T[] {
    if (!Number.isFinite(targetCount)) return currentSlots;
    targetCount = Math.max(1, Math.min(5, Math.floor(targetCount)));
    if (targetCount === currentSlots.length) {
      return currentSlots;
    }

    if (targetCount < currentSlots.length) {
      // Prioritize pinned slots
      const pinned = currentSlots.filter((s) => s.pinned);
      const unpinned = currentSlots.filter((s) => !s.pinned);
      const combined = [...pinned, ...unpinned].slice(0, targetCount).sort((a, b) => a.slotIndex - b.slotIndex);
      return combined.map((s, idx) => ({ ...s, slotIndex: idx }));
    }

    // Expanding count
    const result = [...currentSlots];
    for (let i = currentSlots.length; i < targetCount; i++) {
      const photoId = getCandidateId();
      if (!photoId || result.some((slot) => slot.photoId === photoId)) break;
      result.push({
        ...currentSlots[0],
        slotIndex: i,
        photoId,
        pinned: false,
      });
    }
    return result;
  }
}
