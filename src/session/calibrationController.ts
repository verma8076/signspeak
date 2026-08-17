import type { FeatureVector } from "@/types/hand";
import { featureDistance } from "@/ml/features";

const STABILITY_THRESHOLD = 0.15;
const DWELL_MS = 700;

/**
 * Detects when a hand shape has been held steady long enough to trust as a
 * calibration sample, rather than capturing mid-motion frames while the user
 * is still forming the letter shape.
 */
export class CalibrationController {
  private stableSinceMs: number | null = null;
  private lastFeatures: FeatureVector | null = null;

  constructor(
    private readonly stabilityThreshold = STABILITY_THRESHOLD,
    private readonly dwellMs = DWELL_MS,
  ) {}

  /** Call once per frame. Returns true exactly when a sample should be captured. */
  shouldCapture(features: FeatureVector | null, nowMs: number): boolean {
    if (!features) {
      this.reset();
      return false;
    }

    if (this.lastFeatures) {
      const jitter = featureDistance(features, this.lastFeatures);
      if (jitter > this.stabilityThreshold) {
        this.stableSinceMs = nowMs;
      }
    }
    if (this.stableSinceMs === null) {
      this.stableSinceMs = nowMs;
    }
    this.lastFeatures = features;

    if (nowMs - this.stableSinceMs >= this.dwellMs) {
      this.stableSinceMs = nowMs;
      return true;
    }
    return false;
  }

  /** Progress toward the next capture, 0..1, for a UI hold indicator. */
  progress(nowMs: number): number {
    if (this.stableSinceMs === null) return 0;
    return Math.min(1, (nowMs - this.stableSinceMs) / this.dwellMs);
  }

  reset(): void {
    this.stableSinceMs = null;
    this.lastFeatures = null;
  }
}
