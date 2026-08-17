import type { Letter } from "@/types/session";

export const DWELL_MS = 550;
export const MIN_CONFIDENCE = 0.66;

/**
 * Turns a stream of per-frame classifications into committed letters. A
 * letter is only typed once it's been the stable top prediction for
 * `DWELL_MS`, and only once per continuous hold, so keeping your hand still
 * doesn't spam the same letter forever. Dropping confidence (hand moved,
 * lost tracking) resets the hold, which is also what lets you type the same
 * letter twice in a row.
 */
export class LetterCommitter {
  private candidate: Letter | null = null;
  private candidateSinceMs: number | null = null;
  private committedThisHold = false;

  /** Returns the letter to commit this frame, or null if nothing should commit yet. */
  update(letter: Letter | null, confidence: number, nowMs: number): Letter | null {
    if (letter === null || confidence < MIN_CONFIDENCE) {
      this.candidate = null;
      this.candidateSinceMs = null;
      this.committedThisHold = false;
      return null;
    }

    if (letter !== this.candidate) {
      this.candidate = letter;
      this.candidateSinceMs = nowMs;
      this.committedThisHold = false;
      return null;
    }

    if (this.committedThisHold || this.candidateSinceMs === null) {
      return null;
    }

    if (nowMs - this.candidateSinceMs >= DWELL_MS) {
      this.committedThisHold = true;
      return letter;
    }

    return null;
  }

  /** Progress toward the next commit, 0..1, for a UI dwell indicator. */
  progress(nowMs: number): number {
    if (this.candidateSinceMs === null || this.committedThisHold) return 0;
    return Math.min(1, (nowMs - this.candidateSinceMs) / DWELL_MS);
  }

  get pendingLetter(): Letter | null {
    return this.committedThisHold ? null : this.candidate;
  }

  reset(): void {
    this.candidate = null;
    this.candidateSinceMs = null;
    this.committedThisHold = false;
  }
}
