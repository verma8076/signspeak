import { describe, expect, it } from "vitest";
import { extractFeatures, featureDistance, fingerCurls, normalizeLandmarks } from "@/ml/features";
import { HAND_LANDMARK } from "@/types/hand";
import { applySimilarity, baseHand, curlFinger } from "./helpers";

describe("normalizeLandmarks", () => {
  it("is invariant to translation, uniform scale, and in-plane rotation", () => {
    const hand = baseHand();
    const transformed = applySimilarity(hand, { tx: 5, ty: -3, scale: 2.4, rotateRad: 0.7 });

    const a = normalizeLandmarks(hand);
    const b = normalizeLandmarks(transformed);

    for (let i = 0; i < a.length; i++) {
      expect(b[i].x).toBeCloseTo(a[i].x, 3);
      expect(b[i].y).toBeCloseTo(a[i].y, 3);
    }
  });

  it("places the wrist at the origin", () => {
    const hand = baseHand();
    const normalized = normalizeLandmarks(hand);
    expect(normalized[HAND_LANDMARK.WRIST].x).toBeCloseTo(0, 6);
    expect(normalized[HAND_LANDMARK.WRIST].y).toBeCloseTo(0, 6);
  });
});

describe("fingerCurls", () => {
  it("reports a value near 1 for a fully extended finger", () => {
    const hand = baseHand();
    const curls = fingerCurls(hand);
    // The synthetic base hand has every finger drawn as a straight line.
    for (const curl of curls) {
      expect(curl).toBeGreaterThan(0.9);
    }
  });

  it("reports a lower value once a finger is curled", () => {
    const hand = baseHand();
    const curled = curlFinger(
      hand,
      HAND_LANDMARK.INDEX_MCP,
      HAND_LANDMARK.INDEX_PIP,
      HAND_LANDMARK.INDEX_DIP,
      HAND_LANDMARK.INDEX_TIP,
    );

    const straightCurls = fingerCurls(hand);
    const curledCurls = fingerCurls(curled);

    expect(curledCurls[1]).toBeLessThan(straightCurls[1]);
  });
});

describe("extractFeatures / featureDistance", () => {
  it("produces a fixed-length vector", () => {
    const features = extractFeatures(baseHand());
    expect(features).toHaveLength(21 * 3 + 5);
  });

  it("gives near-zero distance for the same shape under a similarity transform", () => {
    const hand = baseHand();
    const transformed = applySimilarity(hand, { tx: 1, ty: 2, scale: 0.6, rotateRad: -0.4 });

    const d = featureDistance(extractFeatures(hand), extractFeatures(transformed));
    expect(d).toBeLessThan(0.05);
  });

  it("gives a meaningfully larger distance between an open hand and a curled finger", () => {
    const hand = baseHand();
    const curled = curlFinger(
      hand,
      HAND_LANDMARK.INDEX_MCP,
      HAND_LANDMARK.INDEX_PIP,
      HAND_LANDMARK.INDEX_DIP,
      HAND_LANDMARK.INDEX_TIP,
    );

    const same = featureDistance(extractFeatures(hand), extractFeatures(hand));
    const different = featureDistance(extractFeatures(hand), extractFeatures(curled));

    expect(different).toBeGreaterThan(same + 0.1);
  });
});
