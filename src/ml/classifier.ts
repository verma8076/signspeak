import type { FeatureVector } from "@/types/hand";
import type { ClassificationResult, LabeledExample, Letter } from "@/types/session";
import { featureDistance } from "./features";

export const K_NEIGHBORS = 3;

/** Nearest-neighbor distance beyond which we refuse to guess a letter at all,
 * rather than reporting a low-confidence wrong answer. Tuned against the
 * normalized feature space (roughly hand-widths of positional error). */
export const MAX_ACCEPT_DISTANCE = 2.2;

/**
 * A minimal k-nearest-neighbor classifier over calibrated hand-shape
 * examples. Trained per-user at calibration time, no pretrained dataset or
 * network call involved, every letter is classified from the signer's own
 * calibration samples so the model fits their specific hand instead of a
 * generic average.
 */
export class HandShapeClassifier {
  private examples: LabeledExample[] = [];

  train(examples: LabeledExample[]): void {
    this.examples = examples;
  }

  get isTrained(): boolean {
    return this.examples.length > 0;
  }

  get letterCount(): number {
    return new Set(this.examples.map((e) => e.letter)).size;
  }

  classify(features: FeatureVector): ClassificationResult {
    if (this.examples.length === 0) {
      return { letter: null, confidence: 0, nearestDistance: Infinity };
    }

    const ranked = this.examples
      .map((example) => ({ letter: example.letter, dist: featureDistance(features, example.features) }))
      .sort((a, b) => a.dist - b.dist);

    const nearest = ranked.slice(0, Math.min(K_NEIGHBORS, ranked.length));
    const nearestDistance = nearest[0].dist;

    if (nearestDistance > MAX_ACCEPT_DISTANCE) {
      return { letter: null, confidence: 0, nearestDistance };
    }

    const votes = new Map<Letter, number>();
    for (const n of nearest) {
      votes.set(n.letter, (votes.get(n.letter) ?? 0) + 1);
    }

    let winner: Letter = nearest[0].letter;
    let winnerVotes = 0;
    for (const [letter, count] of votes) {
      if (count > winnerVotes) {
        winner = letter;
        winnerVotes = count;
      }
    }

    const confidence = winnerVotes / nearest.length;
    return { letter: winner, confidence, nearestDistance };
  }
}
