import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";

let landmarkerPromise: Promise<HandLandmarker> | null = null;

/**
 * Creates (once, memoized) the on-device Hand Landmarker model.
 * Wasm runtime and model weights are served from /public so the app has
 * zero network dependency once the page has loaded.
 */
export function getHandLandmarker(): Promise<HandLandmarker> {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const fileset = await FilesetResolver.forVisionTasks("/wasm");
      const options = {
        runningMode: "VIDEO" as const,
        numHands: 1,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
      };
      try {
        return await HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate: "GPU" },
          ...options,
        });
      } catch {
        // Some browsers/machines refuse a WebGL context here; CPU delegate is slower but reliable.
        return HandLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: "/models/hand_landmarker.task", delegate: "CPU" },
          ...options,
        });
      }
    })();
  }
  return landmarkerPromise;
}
