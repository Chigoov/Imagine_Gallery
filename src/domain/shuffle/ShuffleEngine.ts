import { ShuffleMode } from '../../types/session';

export interface IShuffleEngine {
  setPool(photoIds: string[]): void;
  removePhoto(photoId: string): void;
  getNextCandidates(count: number, activeVisibleIds: Set<string>): string[];
  replaceOneCandidate(currentSlotId: string, activeVisibleIds: Set<string>): string | null;
  getQueueLength(): number;
  reset(): void;
}

export interface ShuffleSnapshot {
  pool: string[];
  queue: string[];
  mode: ShuffleMode;
  lastExhaustedTail: string[];
  recentConsumed: string[];
}

/**
 * ShuffleEngine implements the core specification:
 * - Default: No Repeat (pool -> shuffle -> queue -> consume -> cycle complete -> reshuffle)
 * - Active Display Exclusion: Never pick photo IDs currently visible or pinned in other slots
 * - End-of-Cycle Cooldown: Avoid immediately re-displaying items seen at the end of the previous cycle
 * - Zero external framework dependencies for isolated testing
 */
export class ShuffleEngine implements IShuffleEngine {
  private pool: string[] = [];
  private queue: string[] = [];
  private mode: ShuffleMode = 'no_repeat';
  private lastExhaustedTail: string[] = [];
  private recentConsumed: string[] = [];

  constructor(pool: string[] = [], mode: ShuffleMode = 'no_repeat') {
    this.mode = mode;
    this.setPool(pool);
  }

  public setMode(mode: ShuffleMode): void {
    this.mode = mode;
    this.reset();
  }

  public setPool(photoIds: string[]): void {
    // Deduplicate pool
    this.pool = Array.from(new Set(photoIds.filter((id) => typeof id === 'string' && id.length > 0)));
    this.reset();
  }

  public removePhoto(photoId: string): void {
    this.pool = this.pool.filter((id) => id !== photoId);
    this.queue = this.queue.filter((id) => id !== photoId);
    this.lastExhaustedTail = this.lastExhaustedTail.filter((id) => id !== photoId);
    this.recentConsumed = this.recentConsumed.filter((id) => id !== photoId);
  }

  public reset(): void {
    this.queue = this.generateShuffledQueue(this.pool);
    this.recentConsumed = [];
    this.lastExhaustedTail = [];
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public snapshot(): ShuffleSnapshot {
    return { pool: [...this.pool], queue: [...this.queue], mode: this.mode,
      lastExhaustedTail: [...this.lastExhaustedTail], recentConsumed: [...this.recentConsumed] };
  }

  public restore(snapshot: ShuffleSnapshot): void {
    const valid = new Set(this.pool);
    const queued = new Set<string>();
    this.mode = snapshot.mode;
    this.queue = snapshot.queue.filter((id) => {
      if (!valid.has(id) || queued.has(id)) return false;
      queued.add(id);
      return true;
    });
    this.lastExhaustedTail = snapshot.lastExhaustedTail.filter((id) => valid.has(id));
    this.recentConsumed = snapshot.recentConsumed.filter((id) => valid.has(id));
  }

  public getPoolSize(): number {
    return this.pool.length;
  }

  /**
   * Pulls `count` candidates for unpinned slots.
   * Ensures none of the returned IDs are already visible in `activeVisibleIds`.
   */
  public getNextCandidates(count: number, activeVisibleIds: Set<string>): string[] {
    if (this.pool.length === 0 || !Number.isFinite(count) || count < 1) return [];
    count = Math.min(Math.floor(count), this.pool.length);

    if (this.mode === 'pure_shuffle') {
      return this.getPureShuffleCandidates(count, activeVisibleIds);
    }

    // Default: No Repeat
    const result: string[] = [];
    const chosenInThisBatch = new Set<string>();

    for (let i = 0; i < count; i++) {
      const candidate = this.consumeNextValidCandidate(activeVisibleIds, chosenInThisBatch);
      if (candidate) {
        result.push(candidate);
        chosenInThisBatch.add(candidate);
      } else break;
    }

    return result;
  }

  /**
   * Replaces exactly ONE slot.
   * Finds the next valid candidate from the queue not in activeVisibleIds.
   */
  public replaceOneCandidate(currentSlotId: string, activeVisibleIds: Set<string>): string | null {
    const exclusion = new Set(activeVisibleIds);
    exclusion.add(currentSlotId);

    const candidates = this.getNextCandidates(1, exclusion);
    return candidates[0] || null;
  }

  private consumeNextValidCandidate(
    activeVisibleIds: Set<string>,
    chosenInThisBatch: Set<string>
  ): string | null {
    const eligible = (id: string) => !activeVisibleIds.has(id) && !chosenInThisBatch.has(id);
    // Consume from the end so ordinary draws do not shift a 20,000-item queue.
    const findCandidate = () => {
      for (let i = this.queue.length - 1; i >= 0; i--) {
        if (eligible(this.queue[i])) return i;
      }
      return -1;
    };
    let index = findCandidate();
    if (index < 0) {
      if (!this.pool.some(eligible)) return null;
      this.lastExhaustedTail = [...this.recentConsumed];
      this.reshuffle();
      index = findCandidate();
    }
    const [candidate] = this.queue.splice(index, 1);
    this.recentConsumed.push(candidate);
    if (this.recentConsumed.length > 4) this.recentConsumed.shift();
    return candidate;
  }

  private reshuffle(): void {
    let newQueue = this.generateShuffledQueue(this.pool);

    // End-of-cycle cooldown: If pool is large enough, avoid having the tail of the last cycle
    // appear in the very beginning of the new cycle
    if (this.lastExhaustedTail.length > 0 && newQueue.length > this.lastExhaustedTail.length + 2) {
      const tailSet = new Set(this.lastExhaustedTail);
      const nonTailItems = newQueue.filter((id) => !tailSet.has(id));
      const tailItems = newQueue.filter((id) => tailSet.has(id));
      newQueue = [...tailItems, ...nonTailItems];
    }

    this.queue = newQueue;
    this.lastExhaustedTail = [];
  }

  private generateShuffledQueue(source: string[]): string[] {
    const arr = [...source];
    // Fisher-Yates shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private getPureShuffleCandidates(count: number, activeVisibleIds: Set<string>): string[] {
    const available = this.pool.filter((id) => !activeVisibleIds.has(id));
    return this.generateShuffledQueue(available).slice(0, count);
  }
}
