# SignSpeak — demo video

**Final video: `docs/demo-video.mp4`, ~32 seconds.** Built as title cards (the lines below) intercut
with real screen-captured footage of the live app running against real ASL fingerspelling footage, not
staged or narrated live.

The calibration source footage (`docs/asl-alphabet-real.mp4`) is built from individual "Letter X
(American Sign Language)" clips by YouTube channel [@subtitlecaption](https://www.youtube.com/@subtitlecaption),
each licensed Creative Commons Attribution (reuse allowed), stitched into an A-through-Y sequence and
cropped to isolate a single hand. Attribution: subtitlecaption, via YouTube, CC BY.

The script below is what the title cards say and what the original plan called for if a live narrated
take had been recorded instead. Kept for reference.

---

## [0:00–0:12] — The hook, straight in, no intro slide

*(Screen: split or quick-cut. Show a generic pretrained hand-tracking demo — or just describe it over
your own screen — failing to recognize a hand shape it wasn't trained on. Then cut to SignSpeak.)*

> "Every sign-language recognition demo you've seen was trained on someone else's hand. Mine isn't."

## [0:12–0:30] — The problem, named specifically

*(Screen: SignSpeak homepage, before enabling camera)*

> "Hand shape, size, finger length, all of that varies a lot person to person. A model trained on one
> dataset doesn't generalize well to a hand it's never seen. Most sign-language demos ignore that.
> SignSpeak doesn't."

## [0:30–1:10] — Calibration, the actual differentiator, shown live

*(Click "Enable camera." Start calibration. Show 3–4 letters actually being captured — ring filling,
letter advancing. Don't show all 24, cut between a few.)*

> "This is a 60-second calibration. I hold each ASL letter shape, and instead of relying on a generic
> pretrained model, SignSpeak trains a classifier on *my* hand, right now, in the browser. No dataset,
> no cloud, nothing leaves this device."

*(If useful: quickly show the reference chart toggle — "and if you don't know the alphabet, there's a
reference built in.")*

## [1:10–1:50] — It working, live, the payoff shot

*(Calibration finishes, TYPING phase begins. Sign a real word slowly — something short and clear, e.g.
"H-I" or your own name. Let viewers watch the dwell ring fill and the letters land in the text buffer.)*

> "Now it's calibrated to me. Every letter I hold gets classified against my own samples, not a
> stranger's. Watch it type as I sign."

*(Let 3–5 letters actually commit on screen. This is the single most important shot in the video —
don't rush past it.)*

## [1:50–2:10] — Technical depth, fast, no fluff

> "MediaPipe gives me 21 hand landmarks per frame, that's it. Everything after that, the feature math,
> the classifier, the calibration, the dwell-based typing, is code I wrote myself. No LLM call, no API
> wrapper. It's deterministic, it's tested, and it's fully open source."

## [2:10–2:25] — Close

*(End on the typed text on screen, ideally a full word or short phrase.)*

> "Generic models assume everyone's hands look the same. SignSpeak doesn't. It learns yours."

---

## Before you hit record

- [ ] Full screen browser, no tabs/dev tools visible
- [ ] Good lighting on your hand, plain background if possible
- [ ] Actually know the ASL letters you're going to sign in the payoff shot, practice the word once or
      twice so the real take isn't fumbling
- [ ] One full dry run before the real take
- [ ] Keep it under 3:00 (Devpost's stated ceiling), aim for ~2:30
- [ ] If you're not narrating live, either use captions or record voiceover after and layer it in, silent
      screen capture with no explanation reads worse than either option

## Important — this can't be faked with stock footage

Unlike a squat-form app, the letters here have to actually be correct ASL. If the calibration doesn't
land on you signing real letters, the demo doesn't work and the whole "it learns your hand" claim falls
apart on camera. You need to actually calibrate for real before recording.
