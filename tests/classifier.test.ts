import { describe, expect, it } from "vitest";
import { HandShapeClassifier, MAX_ACCEPT_DISTANCE } from "@/ml/classifier";
import { extractFeatures } from "@/ml/features";
import { HAND_LANDMARK } from "@/types/hand";
import { baseHand, curlFinger } from "./helpers";

function example(letter: "A" | "B", features: number[]) {
  return { letter, features };
}

describe("HandShapeClassifier", () => {
  it("is untrained with no examples", () => {
    const classifier = new HandShapeClassifier();
    expect(classifier.isTrained).toBe(false);
    expect(classifier.classify(extractFeatures(baseHand())).letter).toBeNull();
  });

  it("classifies a shape close to a calibrated example as that letter", () => {
    const openHand = baseHand();
    const curledHand = curlFinger(
      baseHand(),
      HAND_LANDMARK.INDEX_MCP,
      HAND_LANDMARK.INDEX_PIP,
      HAND_LANDMARK.INDEX_DIP,
      HAND_LANDMARK.INDEX_TIP,
    );

    const classifier = new HandShapeClassifier();
    classifier.train([
      example("B", extractFeatures(openHand)),
      example("B", extractFeatures(openHand)),
      example("A", extractFeatures(curledHand)),
      example("A", extractFeatures(curledHand)),
    ]);

    expect(classifier.classify(extractFeatures(openHand)).letter).toBe("B");
    expect(classifier.classify(extractFeatures(curledHand)).letter).toBe("A");
  });

  it("refuses to guess when nothing calibrated is close enough", () => {
    const openHand = baseHand();
    const classifier = new HandShapeClassifier();
    classifier.train([example("B", extractFeatures(openHand))]);

    const wildlyDifferent = extractFeatures(openHand).map((v, i) => (i < 3 ? v + 50 : v));
    const result = classifier.classify(wildlyDifferent);

    expect(result.letter).toBeNull();
    expect(result.nearestDistance).toBeGreaterThan(MAX_ACCEPT_DISTANCE);
  });

  it("reports letterCount across distinct calibrated letters", () => {
    const classifier = new HandShapeClassifier();
    classifier.train([
      example("A", extractFeatures(baseHand())),
      example("A", extractFeatures(baseHand())),
      example("B", extractFeatures(baseHand())),
    ]);
    expect(classifier.letterCount).toBe(2);
  });
});
