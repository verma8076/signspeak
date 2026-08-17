import { HAND_LANDMARK, type FeatureVector, type Landmark } from "@/types/hand";
import { angleBetween, distance, rotateXY, subtract } from "@/vision/geometry";

const MIN_SCALE = 1e-4;

/**
 * Normalizes raw landmarks into a translation/scale/in-plane-rotation invariant
 * frame: wrist becomes the origin, the wrist->middle-MCP distance becomes the
 * unit of scale, and the wrist->middle-MCP vector is rotated to point along +y.
 * This is what lets the classifier recognize a letter regardless of hand
 * distance from the camera or wrist tilt.
 */
export function normalizeLandmarks(landmarks: Landmark[]): Landmark[] {
  const wrist = landmarks[HAND_LANDMARK.WRIST];
  const middleMcp = landmarks[HAND_LANDMARK.MIDDLE_MCP];

  const translated = landmarks.map((p) => subtract(p, wrist));
  const reference = subtract(middleMcp, wrist);

  const scale = Math.max(MIN_SCALE, Math.sqrt(reference.x ** 2 + reference.y ** 2));
  const scaled = translated.map((p) => ({ x: p.x / scale, y: p.y / scale, z: p.z / scale }));

  const referenceAngle = Math.atan2(reference.x, -reference.y);
  const rotated = scaled.map((p) => rotateXY(p, -referenceAngle));

  return rotated;
}

const FINGER_JOINTS = [
  [HAND_LANDMARK.THUMB_CMC, HAND_LANDMARK.THUMB_MCP, HAND_LANDMARK.THUMB_TIP],
  [HAND_LANDMARK.INDEX_MCP, HAND_LANDMARK.INDEX_PIP, HAND_LANDMARK.INDEX_TIP],
  [HAND_LANDMARK.MIDDLE_MCP, HAND_LANDMARK.MIDDLE_PIP, HAND_LANDMARK.MIDDLE_TIP],
  [HAND_LANDMARK.RING_MCP, HAND_LANDMARK.RING_PIP, HAND_LANDMARK.RING_TIP],
  [HAND_LANDMARK.PINKY_MCP, HAND_LANDMARK.PINKY_PIP, HAND_LANDMARK.PINKY_TIP],
] as const;

/** One curl value per finger (thumb, index, middle, ring, pinky), 0 = fully
 * curled, 1 = fully extended. */
export function fingerCurls(landmarks: Landmark[]): number[] {
  return FINGER_JOINTS.map(([mcp, pip, tip]) => {
    const angle = angleBetween(landmarks[mcp], landmarks[pip], landmarks[tip]);
    return Math.min(1, Math.max(0, angle / 180));
  });
}

/**
 * Assembles the full feature vector fed to the classifier: 21 normalized
 * landmark positions (63 values) plus 5 finger curl values, 68 total.
 */
export function extractFeatures(landmarks: Landmark[]): FeatureVector {
  const normalized = normalizeLandmarks(landmarks);
  const positional = normalized.flatMap((p) => [p.x, p.y, p.z]);
  const curls = fingerCurls(landmarks);
  return [...positional, ...curls];
}

export function featureDistance(a: FeatureVector, b: FeatureVector): number {
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    sum += d * d;
  }
  return Math.sqrt(sum);
}

export { distance as landmarkDistance };
