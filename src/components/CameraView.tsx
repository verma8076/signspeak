"use client";

import type { RefObject } from "react";
import type { CameraStatus, ModelStatus } from "@/session/useSignSession";

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  cameraStatus: CameraStatus;
  modelStatus: ModelStatus;
  handDetected: boolean;
  showNoHandBanner: boolean;
}

export function CameraView({
  videoRef,
  canvasRef,
  cameraStatus,
  modelStatus,
  handDetected,
  showNoHandBanner,
}: CameraViewProps) {
  return (
    <div className="fade-up relative aspect-video w-full overflow-hidden rounded-2xl border border-border bg-black shadow-2xl shadow-black/40">
      <video ref={videoRef} className="absolute inset-0 h-full w-full -scale-x-100 object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full -scale-x-100" />

      {cameraStatus !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/75 backdrop-blur-sm text-center text-sm text-ink-secondary">
          <div className="flex flex-col items-center gap-3">
            {modelStatus === "loading" && (
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-series-1 border-t-transparent" />
            )}
            <span>
              {modelStatus === "loading" && "Loading hand model…"}
              {modelStatus === "error" && "Couldn't load the hand model. Refresh and try again."}
              {modelStatus === "ready" && cameraStatus === "idle" && 'Click "Enable camera" to begin.'}
              {modelStatus === "ready" && cameraStatus === "requesting" && "Requesting camera access…"}
              {modelStatus === "ready" && cameraStatus === "denied" &&
                "Camera access denied. Allow camera permission and reload."}
              {modelStatus === "ready" && cameraStatus === "error" && "Couldn't access the camera."}
            </span>
          </div>
        </div>
      )}

      {cameraStatus === "ready" && showNoHandBanner && !handDetected && (
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 py-2.5 text-center text-sm font-medium text-black"
          style={{ background: "var(--status-warning)" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 9v4M12 17h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
          </svg>
          Hold one hand up, clearly in frame
        </div>
      )}
    </div>
  );
}
