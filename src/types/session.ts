import type { FeatureVector, Handedness } from "./hand";

/** The 24 static ASL fingerspelling letters this app supports. J and Z require
 * motion (not a static hand shape) so they're excluded from a single-frame classifier. */
export const SUPPORTED_LETTERS = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y",
] as const;

export type Letter = (typeof SUPPORTED_LETTERS)[number];

export const SAMPLES_PER_LETTER = 3;

export interface CalibrationSample {
  letter: Letter;
  features: FeatureVector;
  handedness: Handedness;
}

export interface LabeledExample {
  letter: Letter;
  features: FeatureVector;
}

export interface ClassificationResult {
  letter: Letter | null;
  confidence: number;
  nearestDistance: number;
}

export type SessionPhase = "SETUP" | "CALIBRATING" | "TYPING";
