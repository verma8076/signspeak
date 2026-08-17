"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DrawingUtils, HandLandmarker } from "@mediapipe/tasks-vision";
import { getHandLandmarker } from "@/vision/handLandmarker";
import { HandLandmarkSmoother } from "@/vision/smoothing";
import { extractFeatures } from "@/ml/features";
import { HandShapeClassifier } from "@/ml/classifier";
import { CalibrationController } from "./calibrationController";
import { LetterCommitter } from "./letterCommitter";
import { clearCalibration, loadCalibration, saveCalibration } from "./calibrationStorage";
import {
  SUPPORTED_LETTERS,
  SAMPLES_PER_LETTER,
  type CalibrationSample,
  type ClassificationResult,
  type Letter,
  type SessionPhase,
} from "@/types/session";
import type { Handedness } from "@/types/hand";

export type CameraStatus = "idle" | "requesting" | "ready" | "denied" | "error";
export type ModelStatus = "loading" | "ready" | "error";

export interface LiveMetrics {
  handDetected: boolean;
  classification: ClassificationResult;
  dwellProgress: number;
}

const INITIAL_METRICS: LiveMetrics = {
  handDetected: false,
  classification: { letter: null, confidence: 0, nearestDistance: Infinity },
  dwellProgress: 0,
};

/**
 * Owns the full SignSpeak pipeline: camera -> hand landmarker -> smoothing ->
 * feature extraction -> per-user calibration -> k-NN classification -> typed
 * text. All processing stays on-device; no frame or landmark ever leaves the
 * browser.
 */
export function useSignSession() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingUtilsRef = useRef<DrawingUtils | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const smootherRef = useRef(new HandLandmarkSmoother(0.4));
  const classifierRef = useRef(new HandShapeClassifier());
  const calibrationControllerRef = useRef(new CalibrationController());
  const letterCommitterRef = useRef(new LetterCommitter());

  const phaseRef = useRef<SessionPhase>("SETUP");
  const calibrationSamplesRef = useRef<CalibrationSample[]>([]);
  const letterIndexRef = useRef(0);
  const samplesForLetterRef = useRef(0);

  const [phase, setPhaseState] = useState<SessionPhase>("SETUP");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>("idle");
  const [sourceMode, setSourceMode] = useState<"camera" | "file">("camera");
  const [modelStatus, setModelStatus] = useState<ModelStatus>("loading");
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics>(INITIAL_METRICS);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [samplesForLetter, setSamplesForLetter] = useState(0);
  const [textBuffer, setTextBuffer] = useState("");
  const [hasSavedCalibration, setHasSavedCalibration] = useState(false);

  const setPhase = useCallback((p: SessionPhase) => {
    phaseRef.current = p;
    setPhaseState(p);
  }, []);

  useEffect(() => {
    // localStorage doesn't exist during SSR, so this can't be a useState lazy
    // initializer without risking a hydration mismatch; reading it once after mount is deliberate.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setHasSavedCalibration(loadCalibration() !== null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getHandLandmarker()
      .then((lm) => {
        if (cancelled) return;
        landmarkerRef.current = lm;
        setModelStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setModelStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const loopRef = useRef<() => void>(() => {});
  const tick = useCallback(() => {
    loopRef.current();
  }, []);

  const loop = useCallback(() => {
    rafRef.current = requestAnimationFrame(tick);

    const video = videoRef.current;
    const landmarker = landmarkerRef.current;
    const canvas = canvasRef.current;
    if (!video || !landmarker || !canvas || video.readyState < 2) return;

    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    if (!drawingUtilsRef.current) drawingUtilsRef.current = new DrawingUtils(ctx);

    const result = landmarker.detectForVideo(video, performance.now());

    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const rawLandmarks = result.landmarks[0];
    if (!rawLandmarks) {
      ctx.restore();
      setLiveMetrics(INITIAL_METRICS);
      calibrationControllerRef.current.reset();
      letterCommitterRef.current.reset();
      return;
    }

    drawingUtilsRef.current.drawConnectors(rawLandmarks, HandLandmarker.HAND_CONNECTIONS, {
      color: "#3987e5",
      lineWidth: 3,
    });
    drawingUtilsRef.current.drawLandmarks(rawLandmarks, { color: "#ffffff", radius: 3, fillColor: "#3987e5" });
    ctx.restore();

    const smoothed = smootherRef.current.smooth(rawLandmarks);
    const features = extractFeatures(smoothed);
    const nowMs = performance.now();
    const handedness: Handedness = result.handedness[0]?.[0]?.categoryName === "Left" ? "Left" : "Right";

    if (phaseRef.current === "CALIBRATING") {
      const letter = SUPPORTED_LETTERS[letterIndexRef.current];
      const progress = calibrationControllerRef.current.progress(nowMs);
      setLiveMetrics({
        handDetected: true,
        classification: { letter, confidence: progress, nearestDistance: 0 },
        dwellProgress: progress,
      });

      if (letter && calibrationControllerRef.current.shouldCapture(features, nowMs)) {
        calibrationSamplesRef.current = [...calibrationSamplesRef.current, { letter, features, handedness }];
        const collected = samplesForLetterRef.current + 1;
        samplesForLetterRef.current = collected;
        setSamplesForLetter(collected);

        if (collected >= SAMPLES_PER_LETTER) {
          samplesForLetterRef.current = 0;
          setSamplesForLetter(0);
          const nextIndex = letterIndexRef.current + 1;
          letterIndexRef.current = nextIndex;
          setCurrentLetterIndex(nextIndex);
          calibrationControllerRef.current.reset();

          if (nextIndex >= SUPPORTED_LETTERS.length) {
            classifierRef.current.train(calibrationSamplesRef.current);
            saveCalibration(calibrationSamplesRef.current);
            setHasSavedCalibration(true);
            setPhase("TYPING");
          }
        }
      }
      return;
    }

    if (phaseRef.current === "TYPING") {
      const classification = classifierRef.current.classify(features);
      const dwellProgress = letterCommitterRef.current.progress(nowMs);
      setLiveMetrics({ handDetected: true, classification, dwellProgress });

      const committed = letterCommitterRef.current.update(classification.letter, classification.confidence, nowMs);
      if (committed) {
        setTextBuffer((prev) => prev + committed);
      }
    }
  }, [setPhase, tick]);

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const startCamera = useCallback(async () => {
    setCameraStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.loop = false;
        await videoRef.current.play();
      }
      setSourceMode("camera");
      setCameraStatus("ready");
      if (rafRef.current === null) {
        rafRef.current = requestAnimationFrame(tick);
      }
    } catch (err) {
      setCameraStatus(err instanceof DOMException && err.name === "NotAllowedError" ? "denied" : "error");
    }
  }, [tick]);

  /** Fallback path if a webcam isn't available: run the exact same pipeline over an uploaded video file. */
  const startFromFile = useCallback(
    async (file: File) => {
      setCameraStatus("requesting");
      try {
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);

        const url = URL.createObjectURL(file);
        objectUrlRef.current = url;

        const video = videoRef.current;
        if (!video) throw new Error("Video element not mounted");
        video.srcObject = null;
        video.src = url;
        video.loop = true;
        video.muted = true;
        await video.play();

        setSourceMode("file");
        setCameraStatus("ready");
        if (rafRef.current === null) {
          rafRef.current = requestAnimationFrame(tick);
        }
      } catch {
        setCameraStatus("error");
      }
    },
    [tick],
  );

  const startCalibration = useCallback(() => {
    calibrationSamplesRef.current = [];
    letterIndexRef.current = 0;
    samplesForLetterRef.current = 0;
    calibrationControllerRef.current.reset();
    setCurrentLetterIndex(0);
    setSamplesForLetter(0);
    setPhase("CALIBRATING");
  }, [setPhase]);

  /** Skips calibration entirely and trains the classifier from a previous session's saved samples. */
  const useSavedCalibration = useCallback(() => {
    const saved = loadCalibration();
    if (!saved) return;
    calibrationSamplesRef.current = saved;
    classifierRef.current.train(saved);
    setPhase("TYPING");
  }, [setPhase]);

  const forgetSavedCalibration = useCallback(() => {
    clearCalibration();
    setHasSavedCalibration(false);
  }, []);

  const appendSpace = useCallback(() => setTextBuffer((prev) => prev + " "), []);
  const backspace = useCallback(() => setTextBuffer((prev) => prev.slice(0, -1)), []);
  const clearText = useCallback(() => setTextBuffer(""), []);

  const resetSession = useCallback(() => {
    calibrationSamplesRef.current = [];
    letterIndexRef.current = 0;
    samplesForLetterRef.current = 0;
    classifierRef.current = new HandShapeClassifier();
    calibrationControllerRef.current.reset();
    letterCommitterRef.current.reset();
    setCurrentLetterIndex(0);
    setSamplesForLetter(0);
    setTextBuffer("");
    setLiveMetrics(INITIAL_METRICS);
    setPhase("SETUP");
  }, [setPhase]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const currentLetter: Letter | undefined = SUPPORTED_LETTERS[currentLetterIndex];

  return {
    videoRef,
    canvasRef,
    phase,
    cameraStatus,
    sourceMode,
    modelStatus,
    liveMetrics,
    currentLetter,
    currentLetterIndex,
    totalLetters: SUPPORTED_LETTERS.length,
    samplesForLetter,
    samplesPerLetter: SAMPLES_PER_LETTER,
    textBuffer,
    hasSavedCalibration,
    startCamera,
    startFromFile,
    startCalibration,
    useSavedCalibration,
    forgetSavedCalibration,
    appendSpace,
    backspace,
    clearText,
    resetSession,
  };
}
