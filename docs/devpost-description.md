# SignSpeak — Devpost submission text

**Track:** Pixel Forge AI Hackathon 2026

---

## Inspiration

Every sign-language recognition demo I'd seen was trained on somebody else's hand. Some dataset, some
stranger's fingers, some fixed idea of what a "B" or an "L" is supposed to look like. But hands aren't
uniform. Mine isn't the same shape as yours. Skin tone, finger length, how tight someone makes a fist,
all of it varies, and a model trained once on one dataset just doesn't generalize as well as people
assume it does. I wanted to flip that. Instead of asking "does this match a stranger's idea of the
letter B," I wanted the question to be "does this match how I make a B."

## What it does

Hold your hand up to a webcam, or upload a video, and SignSpeak walks you through the 24 static ASL
fingerspelling letters (J and Z need motion, so they're skipped) in about a minute. That becomes your
personal calibration. After that, every hand shape you hold gets classified against your own samples,
not somebody else's, and once you hold a letter steady for a beat it commits to a running line of typed
text. No dataset ships with the app. No pretrained model decides what your hands are supposed to look
like. It learns from you, live, in the browser, and it's saved locally so you don't have to redo it
every time you come back.

## How we built it

MediaPipe's Hand Landmarker gives 21 hand landmarks per frame, on-device, nothing leaves the browser.
Everything past that point is code I wrote myself. I normalize the landmarks so the same hand shape
reads the same regardless of distance from the camera or wrist tilt, translate to the wrist, scale by
the wrist-to-knuckle distance, rotate to a fixed reference angle. On top of the normalized positions I
compute a curl value for each finger, so the feature vector captures both where the joints are and how
bent each finger actually is. That's the 68-number fingerprint of a hand shape.

Calibration trains a lightweight k-nearest-neighbor classifier on your own samples, three per letter,
captured automatically once a shape holds steady. Live classification runs the same feature extraction
and finds your nearest calibrated match, with a distance cutoff so it refuses to guess instead of
committing to a wrong letter when nothing calibrated is close enough. A small state machine handles the
actual typing: hold a shape steady past a dwell threshold and it commits once, so a long hold doesn't
spam the same letter forever, and dropping your hand out of frame resets it, which is also how you type
the same letter twice in a row.

The whole thing is Next.js, TypeScript, Tailwind, deployed on Vercel. 28 unit tests cover the
deterministic core, the geometry math, the normalization invariances, the classifier, the calibration
stability detection, the dwell-commit logic, completely independent of the camera and UI layer.

Live site: https://signspeak-dusky.vercel.app
Code: https://github.com/verma8076/signspeak

## Challenges we ran into

Getting real ASL footage to test against was harder than the actual engineering. I needed something to
run the calibration flow against besides my own hand, and it turns out there's almost no free,
correctly-licensed video of someone signing the alphabet in order. I checked stock footage sites,
Wikimedia, educational archives, most of what exists is either the wrong content entirely or has
licensing that doesn't actually hold up when you read the fine print. I ended up finding a set of
individual, Creative Commons-licensed letter clips and stitching them into a proper A-through-Y
sequence myself, then had to debug why my first pass at that came out noisy: the source clips had
several real hands tiled across the frame, and MediaPipe was inconsistently locking onto a different
one shot to shot, which fed the classifier inconsistent samples for what was supposed to be the same
letter. Cropping down to a single consistent hand fixed it.

## Accomplishments we're proud of

Getting personal calibration to actually work end to end against real ASL content, not synthetic test
data, calibration completing cleanly, the classifier training, and real letters committing during live
typing. No backend, no external API, no LLM anywhere in the core, just deterministic geometry and a
classifier trained live on whoever's using it.

## What we learned

A model trained once and shipped can't account for how much real human hands vary. Calibrating to the
specific person in front of the camera, instead of hoping a generic model generalizes, is a small idea
but it's the difference between a demo that works for the one person who tested it and one that
actually holds up for someone new.

## What's next

More movements past the static alphabet, J and Z need motion, so does full fingerspelling flow at
natural speed. A confidence-aware suggestion layer that nudges you toward the closest calibrated letter
when a shape is ambiguous instead of just refusing to guess. And extending personal calibration past
fingerspelling into full ASL signs, which is a much bigger vocabulary but the same core idea: calibrate
to the person, not the dataset.
