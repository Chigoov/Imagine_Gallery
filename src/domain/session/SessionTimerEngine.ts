import { SessionStatus } from '../../types/session';

export interface SessionTimerCallbacks {
  onTick?: (activeSeconds: number, countdownSeconds: number) => void;
  onAutoAdvance?: () => void;
  onSessionTimeout?: (finalDurationSeconds: number) => void;
}

/** Fantasy Time continues during slideshow pause and focus; background time is capped at grace. */
export class SessionTimerEngine {
  private status: SessionStatus = 'ended';
  private sessionDurationSeconds = 0;
  private intervalSeconds: number;
  private countdownSeconds: number;
  private isSlideshowPlaying = true;
  private isFocusMode = false;
  private backgroundGraceSeconds: number;
  private backgroundStartTime: number | null = null;
  private lastTickTime = 0;

  constructor(
    intervalSeconds = 7,
    backgroundGraceSeconds = 120,
    private callbacks: SessionTimerCallbacks = {}
  ) {
    this.intervalSeconds = Number.isFinite(intervalSeconds) && intervalSeconds > 0 ? intervalSeconds : 7;
    this.countdownSeconds = this.intervalSeconds;
    this.backgroundGraceSeconds = Number.isFinite(backgroundGraceSeconds) ? Math.max(0, backgroundGraceSeconds) : 120;
  }

  public startSession(now = Date.now()): void {
    this.status = 'active';
    this.sessionDurationSeconds = 0;
    this.countdownSeconds = this.intervalSeconds;
    this.isSlideshowPlaying = true;
    this.isFocusMode = false;
    this.backgroundStartTime = null;
    this.lastTickTime = now;
  }

  public endSession(now = Date.now()): number {
    if (this.status === 'active') this.sessionDurationSeconds += Math.max(0, now - this.lastTickTime) / 1000;
    if (this.status === 'background_grace' && this.backgroundStartTime !== null) {
      this.sessionDurationSeconds += Math.min(this.backgroundGraceSeconds, Math.max(0, now - this.backgroundStartTime) / 1000);
    }
    this.status = 'ended';
    this.backgroundStartTime = null;
    return this.getSessionDuration();
  }

  public getStatus(): SessionStatus { return this.status; }
  public getSessionDuration(): number { return Math.floor(this.sessionDurationSeconds); }
  public getCountdown(): number { return Math.ceil(this.countdownSeconds); }
  public isPlaying(): boolean { return this.isSlideshowPlaying; }

  public togglePlaySlideshow(): boolean {
    this.isSlideshowPlaying = !this.isSlideshowPlaying;
    return this.isSlideshowPlaying;
  }

  public enterFocusMode(): void { this.isFocusMode = true; }
  public exitFocusMode(): void { this.isFocusMode = false; }
  public resetCountdown(): void { this.countdownSeconds = this.intervalSeconds; }

  /** Deterministic one-second advance for tests; browser callers use tick(actualTimestamp). */
  public tickOneSecond(): void { this.tick(this.lastTickTime + 1000); }

  public tick(now = Date.now()): void {
    if (!Number.isFinite(now)) return;
    if (this.status === 'background_grace') {
      if (this.backgroundStartTime !== null && now - this.backgroundStartTime >= this.backgroundGraceSeconds * 1000) {
        this.sessionDurationSeconds += this.backgroundGraceSeconds;
        this.status = 'ended';
        this.backgroundStartTime = null;
        this.callbacks.onSessionTimeout?.(this.getSessionDuration());
      }
      this.lastTickTime = Math.max(this.lastTickTime, now);
      return;
    }
    if (this.status !== 'active') return;
    const elapsed = Math.max(0, now - this.lastTickTime) / 1000;
    this.lastTickTime = Math.max(this.lastTickTime, now);
    this.sessionDurationSeconds += elapsed;
    if (this.isSlideshowPlaying && !this.isFocusMode) {
      this.countdownSeconds -= elapsed;
      if (this.countdownSeconds <= 0) {
        // ponytail: one transition after a delayed tick; do not flash through missed slides.
        this.countdownSeconds = this.intervalSeconds;
        this.callbacks.onAutoAdvance?.();
      }
    }
    this.callbacks.onTick?.(this.getSessionDuration(), this.getCountdown());
  }

  public enterBackground(now = Date.now()): void {
    if (this.status !== 'active' || !Number.isFinite(now)) return;
    this.tick(now);
    this.status = 'background_grace';
    this.backgroundStartTime = now;
    this.lastTickTime = now;
    this.tick(now);
  }

  public resumeFromBackground(now = Date.now()): boolean {
    if (this.status !== 'background_grace' || this.backgroundStartTime === null || !Number.isFinite(now)) return false;
    const elapsed = Math.max(0, now - this.backgroundStartTime) / 1000;
    this.tick(now);
    if (this.getStatus() === 'ended') return false;
    this.sessionDurationSeconds += elapsed;
    this.status = 'active';
    this.backgroundStartTime = null;
    this.lastTickTime = now;
    this.callbacks.onTick?.(this.getSessionDuration(), this.getCountdown());
    return true;
  }
}
