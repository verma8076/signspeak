import type { CalibrationSample } from "@/types/session";

const STORAGE_KEY = "signspeak.calibration.v1";

/**
 * Calibration samples are saved to localStorage so reloading the page (or
 * coming back later) doesn't force a full recalibration. Everything still
 * stays on this device: nothing here is a network call.
 */
export function saveCalibration(samples: CalibrationSample[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — calibration just won't persist.
  }
}

export function loadCalibration(): CalibrationSample[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed as CalibrationSample[];
  } catch {
    return null;
  }
}

export function clearCalibration(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do if storage isn't available.
  }
}
