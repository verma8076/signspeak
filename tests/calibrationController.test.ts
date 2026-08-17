import { describe, expect, it } from "vitest";
import { CalibrationController } from "@/session/calibrationController";

describe("CalibrationController", () => {
  it("does not capture immediately", () => {
    const controller = new CalibrationController();
    expect(controller.shouldCapture([0, 0, 0], 0)).toBe(false);
  });

  it("captures once a shape has been held steady past the dwell window", () => {
    const controller = new CalibrationController(0.15, 700);
    controller.shouldCapture([0, 0, 0], 0);
    expect(controller.shouldCapture([0, 0.001, 0], 750)).toBe(true);
  });

  it("resets the stability window when the shape moves too much", () => {
    const controller = new CalibrationController(0.15, 700);
    controller.shouldCapture([0, 0, 0], 0);
    controller.shouldCapture([5, 5, 5], 400); // big jump resets the window
    expect(controller.shouldCapture([5, 5, 5], 900)).toBe(false);
    expect(controller.shouldCapture([5, 5, 5], 1150)).toBe(true);
  });

  it("resets when there is no hand in frame", () => {
    const controller = new CalibrationController(0.15, 700);
    controller.shouldCapture([0, 0, 0], 0);
    controller.shouldCapture(null, 300);
    expect(controller.shouldCapture([0, 0, 0], 400)).toBe(false);
  });

  it("progress climbs toward 1 as the dwell window elapses", () => {
    const controller = new CalibrationController(0.15, 1000);
    controller.shouldCapture([0, 0, 0], 0);
    expect(controller.progress(500)).toBeCloseTo(0.5, 1);
  });
});
