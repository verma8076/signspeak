import { describe, expect, it } from "vitest";
import { randomPracticeTarget } from "@/session/useSignSession";
import { SUPPORTED_LETTERS } from "@/types/session";

describe("randomPracticeTarget", () => {
  it("always returns a supported letter", () => {
    for (let i = 0; i < 50; i++) {
      const target = randomPracticeTarget(null);
      expect(SUPPORTED_LETTERS).toContain(target);
    }
  });

  it("never immediately repeats the excluded letter", () => {
    for (let i = 0; i < 100; i++) {
      const exclude = SUPPORTED_LETTERS[i % SUPPORTED_LETTERS.length];
      const target = randomPracticeTarget(exclude);
      expect(target).not.toBe(exclude);
    }
  });

  it("can return any letter when nothing is excluded, given enough draws", () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      seen.add(randomPracticeTarget(null));
    }
    // With 500 draws over 24 letters, every letter should show up at least once.
    expect(seen.size).toBe(SUPPORTED_LETTERS.length);
  });
});
