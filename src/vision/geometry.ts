import type { Landmark } from "@/types/hand";

export function subtract(a: Landmark, b: Landmark): Landmark {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

export function magnitude(v: Landmark): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

export function distance(a: Landmark, b: Landmark): number {
  return magnitude(subtract(a, b));
}

/** Interior angle at vertex `b`, in degrees, formed by points a-b-c. */
export function angleBetween(a: Landmark, b: Landmark, c: Landmark): number {
  const ba = subtract(a, b);
  const bc = subtract(c, b);
  const baMag = magnitude(ba);
  const bcMag = magnitude(bc);
  if (baMag === 0 || bcMag === 0) return 180;
  const dot = ba.x * bc.x + ba.y * bc.y + ba.z * bc.z;
  const cos = Math.min(1, Math.max(-1, dot / (baMag * bcMag)));
  return (Math.acos(cos) * 180) / Math.PI;
}

/** Rotates a point around the origin in the XY plane by `radians`. */
export function rotateXY(p: Landmark, radians: number): Landmark {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
    z: p.z,
  };
}
