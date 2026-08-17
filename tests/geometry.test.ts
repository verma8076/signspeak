import { describe, expect, it } from "vitest";
import { angleBetween, distance, rotateXY } from "@/vision/geometry";

describe("angleBetween", () => {
  it("returns 180 degrees for a straight line", () => {
    const a = { x: -1, y: 0, z: 0 };
    const b = { x: 0, y: 0, z: 0 };
    const c = { x: 1, y: 0, z: 0 };
    expect(angleBetween(a, b, c)).toBeCloseTo(180, 5);
  });

  it("returns 90 degrees for a right angle", () => {
    const a = { x: 1, y: 0, z: 0 };
    const b = { x: 0, y: 0, z: 0 };
    const c = { x: 0, y: 1, z: 0 };
    expect(angleBetween(a, b, c)).toBeCloseTo(90, 5);
  });

  it("returns close to 0 degrees when the vertex points fold back on themselves", () => {
    const a = { x: 1, y: 0, z: 0 };
    const b = { x: 0, y: 0, z: 0 };
    const c = { x: 1, y: 0.001, z: 0 };
    expect(angleBetween(a, b, c)).toBeLessThan(1);
  });
});

describe("distance", () => {
  it("computes euclidean distance", () => {
    expect(distance({ x: 0, y: 0, z: 0 }, { x: 3, y: 4, z: 0 })).toBeCloseTo(5, 5);
  });
});

describe("rotateXY", () => {
  it("rotates a point 90 degrees about the origin", () => {
    const p = { x: 1, y: 0, z: 0.5 };
    const rotated = rotateXY(p, Math.PI / 2);
    expect(rotated.x).toBeCloseTo(0, 5);
    expect(rotated.y).toBeCloseTo(1, 5);
    expect(rotated.z).toBeCloseTo(0.5, 5); // z is untouched
  });
});
