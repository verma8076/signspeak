import type { Landmark } from "@/types/hand";

/** A synthetic but structurally plausible 21-point hand, wrist at the origin,
 * fingers extended along +y with mild spread. Good enough to exercise the
 * geometry/normalization math without needing a real camera frame. */
export function baseHand(): Landmark[] {
  const points: Landmark[] = [];
  points[0] = { x: 0, y: 0, z: 0 }; // WRIST

  const fingerBases = [
    { root: [-0.15, 0.05], spread: -0.06 }, // thumb
    { root: [-0.08, 0.15], spread: -0.02 }, // index
    { root: [0, 0.16], spread: 0 }, // middle
    { root: [0.08, 0.15], spread: 0.02 }, // ring
    { root: [0.15, 0.13], spread: 0.05 }, // pinky
  ];

  let idx = 1;
  for (const finger of fingerBases) {
    const [rx, ry] = finger.root;
    for (let joint = 0; joint < 4; joint++) {
      const t = joint / 3;
      points[idx++] = {
        x: rx + finger.spread * t,
        y: ry + 0.22 * t,
        z: 0,
      };
    }
  }
  return points;
}

/** Applies a similarity transform (rotate, then scale, then translate) to a
 * landmark set, for invariance testing. */
export function applySimilarity(
  landmarks: Landmark[],
  opts: { tx?: number; ty?: number; scale?: number; rotateRad?: number },
): Landmark[] {
  const { tx = 0, ty = 0, scale = 1, rotateRad = 0 } = opts;
  const cos = Math.cos(rotateRad);
  const sin = Math.sin(rotateRad);
  return landmarks.map((p) => {
    const rx = p.x * cos - p.y * sin;
    const ry = p.x * sin + p.y * cos;
    return { x: rx * scale + tx, y: ry * scale + ty, z: p.z * scale };
  });
}

/** Curls a finger's tip inward toward its MCP joint, simulating a folded finger. */
export function curlFinger(landmarks: Landmark[], mcpIndex: number, pipIndex: number, dipIndex: number, tipIndex: number): Landmark[] {
  const next = landmarks.map((p) => ({ ...p }));
  const mcp = next[mcpIndex];
  next[pipIndex] = { x: mcp.x, y: mcp.y + 0.03, z: 0 };
  next[dipIndex] = { x: mcp.x, y: mcp.y + 0.02, z: 0 };
  next[tipIndex] = { x: mcp.x, y: mcp.y, z: 0 };
  return next;
}
