import { describe, expect, it } from "vitest";
import { DWELL_MS, LetterCommitter, MIN_CONFIDENCE } from "@/session/letterCommitter";

describe("LetterCommitter", () => {
  it("does not commit before the dwell time has elapsed", () => {
    const committer = new LetterCommitter();
    expect(committer.update("A", 1, 0)).toBeNull();
    expect(committer.update("A", 1, DWELL_MS - 50)).toBeNull();
  });

  it("commits once the letter has been held for the dwell time", () => {
    const committer = new LetterCommitter();
    committer.update("A", 1, 0);
    expect(committer.update("A", 1, DWELL_MS + 10)).toBe("A");
  });

  it("does not re-commit the same letter while still held", () => {
    const committer = new LetterCommitter();
    committer.update("A", 1, 0);
    expect(committer.update("A", 1, DWELL_MS + 10)).toBe("A");
    expect(committer.update("A", 1, DWELL_MS + 500)).toBeNull();
  });

  it("allows the same letter again after confidence drops and returns", () => {
    const committer = new LetterCommitter();
    committer.update("A", 1, 0);
    expect(committer.update("A", 1, DWELL_MS + 10)).toBe("A");

    committer.update(null, 0, DWELL_MS + 200); // hand dropped out of frame

    committer.update("A", 1, DWELL_MS + 300);
    expect(committer.update("A", 1, DWELL_MS + 300 + DWELL_MS + 10)).toBe("A");
  });

  it("resets the hold when the classified letter changes", () => {
    const committer = new LetterCommitter();
    committer.update("A", 1, 0);
    committer.update("B", 1, DWELL_MS - 10);
    expect(committer.update("B", 1, DWELL_MS - 10 + DWELL_MS - 1)).toBeNull();
    expect(committer.update("B", 1, DWELL_MS - 10 + DWELL_MS + 10)).toBe("B");
  });

  it("ignores low-confidence classifications", () => {
    const committer = new LetterCommitter();
    committer.update("A", MIN_CONFIDENCE - 0.1, 0);
    expect(committer.update("A", MIN_CONFIDENCE - 0.1, DWELL_MS + 10)).toBeNull();
  });

  it("reset() clears any in-progress hold", () => {
    const committer = new LetterCommitter();
    committer.update("A", 1, 0);
    committer.reset();
    expect(committer.update("A", 1, 10)).toBeNull();
  });
});
