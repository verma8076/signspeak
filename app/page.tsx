"use client";

import { useSignSession } from "@/session/useSignSession";
import { CameraView } from "@/components/CameraView";
import { CalibrationPanel } from "@/components/CalibrationPanel";
import { TypingPanel } from "@/components/TypingPanel";

export default function Home() {
  const {
    videoRef,
    canvasRef,
    phase,
    cameraStatus,
    modelStatus,
    liveMetrics,
    currentLetter,
    currentLetterIndex,
    totalLetters,
    samplesForLetter,
    samplesPerLetter,
    textBuffer,
    startCamera,
    startFromFile,
    startCalibration,
    appendSpace,
    backspace,
    clearText,
    resetSession,
  } = useSignSession();

  return (
    <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-7 px-4 py-10 sm:px-8">
      <header className="fade-up flex flex-col gap-2.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-black"
            style={{ background: "var(--series-1)" }}
          >
            S
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-primary">SignSpeak</h1>
          <span className="whitespace-nowrap rounded-full border border-border px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider text-ink-muted">
            Pixel Forge AI Hackathon 2026
          </span>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-ink-secondary">
          SignSpeak learns your hand from a 60-second calibration, then reads ASL fingerspelling live off your
          webcam and types it out. Everything runs locally in your browser; no frame or landmark ever leaves
          this device.
        </p>
      </header>

      <CameraView
        videoRef={videoRef}
        canvasRef={canvasRef}
        cameraStatus={cameraStatus}
        modelStatus={modelStatus}
        handDetected={liveMetrics.handDetected}
        showNoHandBanner={phase !== "SETUP"}
      />

      {cameraStatus !== "ready" && (
        <div className="fade-up flex flex-wrap items-center gap-3">
          <button
            onClick={startCamera}
            disabled={modelStatus !== "ready" || cameraStatus === "requesting"}
            className="rounded-full px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: "var(--series-1)" }}
          >
            Enable camera
          </button>
          <label className="cursor-pointer rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink-primary">
            Use a video file instead
            <input
              type="file"
              accept="video/*"
              className="hidden"
              disabled={modelStatus !== "ready"}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void startFromFile(file);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      )}

      {cameraStatus === "ready" && phase === "SETUP" && (
        <div className="fade-up rounded-2xl border border-border bg-surface-card p-6">
          <h2 className="text-lg font-semibold text-ink-primary">Ready when you are</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-secondary">
            Hold one hand up, clearly in frame. You&apos;ll be walked through all 24 static ASL fingerspelling
            letters (J and Z need motion, so they&apos;re skipped), holding each shape steady for about a
            second, three times each.
          </p>
          <button
            onClick={startCalibration}
            className="mt-4 rounded-full px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 active:scale-[0.98]"
            style={{ background: "var(--series-1)" }}
          >
            Start calibration
          </button>
        </div>
      )}

      {phase === "CALIBRATING" && (
        <CalibrationPanel
          currentLetter={currentLetter}
          currentLetterIndex={currentLetterIndex}
          totalLetters={totalLetters}
          samplesForLetter={samplesForLetter}
          samplesPerLetter={samplesPerLetter}
          dwellProgress={liveMetrics.dwellProgress}
        />
      )}

      {phase === "TYPING" && (
        <div className="flex flex-col gap-4">
          <TypingPanel
            textBuffer={textBuffer}
            classification={liveMetrics.classification}
            dwellProgress={liveMetrics.dwellProgress}
            onSpace={appendSpace}
            onBackspace={backspace}
            onClear={clearText}
          />
          <button
            onClick={resetSession}
            className="fade-up self-start rounded-full border border-border px-5 py-2.5 text-sm font-medium text-ink-secondary transition hover:border-border-strong hover:text-ink-primary"
          >
            Recalibrate
          </button>
        </div>
      )}
    </div>
  );
}
