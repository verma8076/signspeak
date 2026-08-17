# SignSpeak

A generic sign-language model was trained on someone else's hand. SignSpeak isn't. It calibrates to
**your own** hand shape in about 60 seconds, then reads ASL fingerspelling live off your webcam and
types it out, no wearable, no cloud, no pretrained dataset that assumes everyone's hands look the same.

Built for **Pixel Forge AI Hackathon 2026**.

**Live demo:** https://signspeak-dusky.vercel.app

## What it does

1. **Calibrate.** Hold your hand up and step through all 24 static ASL fingerspelling letters (J and Z
   need motion, so they're skipped), holding each shape steady for about a second, three times each. A
   reference chart is one click away if you don't already know the alphabet. Calibration is saved
   locally, so reloading the page doesn't force you to redo it.
2. **Type.** Every hand shape after that gets classified against your own calibration samples. Hold a
   shape steady for a beat and it commits to the text buffer.

All hand tracking and classification run **on-device in the browser**. No frame or landmark is ever
uploaded anywhere.

## How it works

```
Webcam / video
      │
      ▼
MediaPipe Hand Landmarker (21 landmarks, on-device)
      │
      ▼
Landmark smoothing (EMA)
      │
      ▼
Feature extraction: translation/scale/rotation-normalized landmark
positions + per-finger curl angles (68-dim vector)
      │
      ├─ Calibration ──► k-NN classifier trained on YOUR hand shapes
      │
      ▼
Live classification: nearest-neighbor match + confidence gate
      │
      ▼
Dwell-based commit: hold a shape steady to type it
      │
      ▼
Text buffer
```

MediaPipe gives 21 hand landmarks and a confidence score per frame. Everything after that, feature
normalization, the classifier, calibration, dwell-based commit logic, is this project's own code, not
an LLM call or an API wrapper.

## Why per-user calibration, not a pretrained model

Hand shape, size, and camera angle vary a lot person to person. Rather than ship one generic model
trained on someone else's hands and hope it generalizes, SignSpeak trains a lightweight classifier on
your own calibration samples at the start of every session. That's also what makes the live accuracy
high without needing a large labeled dataset or a network call.

## Running locally

```bash
npm install
npm run dev
```

Open http://localhost:3000, allow camera access (or upload a video via "Use a video file instead"),
and follow the on-screen calibration flow.

## Testing

```bash
npm run lint     # ESLint
npm run build    # production build + type check
npm test         # unit tests for the deterministic core
```

The core algorithm, landmark normalization, feature extraction, the k-NN classifier, calibration
stability detection, and dwell-based letter commit, is unit tested with synthetic hand-landmark data,
independent of the camera/UI layer.

## Limitations

- Recognizes the 24 **static** ASL fingerspelling letters. J and Z require motion and aren't supported.
- To type the same letter twice in a row, briefly drop your hand out of frame or change shape between
  holds, otherwise a continuous hold only commits once.
- Calibration is saved to this browser's local storage, not synced anywhere. Clear it any time from the
  setup screen, or it's overwritten the next time you recalibrate.
- Works best with one hand, clearly lit, filling a reasonable portion of the frame.

## Tech stack

Next.js (App Router) · TypeScript · Tailwind CSS · MediaPipe Hand Landmarker (`@mediapipe/tasks-vision`) ·
Vitest

No backend, no external API calls, no LLM, the core product is deterministic, on-device machine
learning trained live on the person using it.

## Credits

The reference ASL alphabet chart (`public/reference/asl-alphabet-chart.png`) is a public domain
image sourced from [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Asl_alphabet_gallaudet_ann.svg).
