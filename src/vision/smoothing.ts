import type { Landmark } from "@/types/hand";

/** Exponential moving average smoother for scalar signals. */
class EmaSmoother {
  private value: number | null = null;

  constructor(private readonly alpha: number) {}

  next(sample: number): number {
    this.value = this.value === null ? sample : this.alpha * sample + (1 - this.alpha) * this.value;
    return this.value;
  }

  reset(): void {
    this.value = null;
  }
}

/** Smooths every (x, y, z) hand landmark independently to reduce jitter. */
export class HandLandmarkSmoother {
  private smoothers = new Map<number, { x: EmaSmoother; y: EmaSmoother; z: EmaSmoother }>();

  constructor(private readonly alpha: number = 0.4) {}

  smooth(landmarks: Landmark[]): Landmark[] {
    return landmarks.map((p, index) => {
      let s = this.smoothers.get(index);
      if (!s) {
        s = { x: new EmaSmoother(this.alpha), y: new EmaSmoother(this.alpha), z: new EmaSmoother(this.alpha) };
        this.smoothers.set(index, s);
      }
      return { x: s.x.next(p.x), y: s.y.next(p.y), z: s.z.next(p.z) };
    });
  }

  reset(): void {
    this.smoothers.clear();
  }
}
