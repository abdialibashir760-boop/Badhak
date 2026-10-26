# ZİHNİ OYUNU — programmatic animated films (Remotion + React + TypeScript)

Two films live in this repo and share one preview studio and render pipeline:

1. **"Why Your Mind Turns Every Conversation Into a Test"** (composition `ZihniOyunu`) — see below.
2. **"What If You Woke Up in the Stone Age?"** (composition `StoneAge`, 3:40) — see [Film 2](#film-2--what-if-you-woke-up-in-the-stone-age).

## Film 1 — Why Your Mind Turns Every Conversation Into a Test

A ~90 s psychology explainer built entirely from code: Remotion + React + TypeScript, procedural SVG stick figures,
deterministic frame-based animation, a browser preview studio, and a real MP4 render pipeline. No paid APIs, no keys.

## Run

```bash
npm install
npm run audio        # (re)generate the synthesised music + SFX in public/audio (already committed-ready)
npm run studio       # preview studio at http://127.0.0.1:5173
npm run remotion     # optional: the stock Remotion Studio
```

## Render the MP4

```bash
npm run render                 # built-in defaults  -> out/zihni-oyunu.mp4
npm run render:props           # your edited project (Studio > Render > "Download props.json" -> out/props.json)
```
Or click **Render MP4 now** in the studio (Render tab) — it runs the same `remotion render` with your current props
and offers the file for download. Remotion needs a headless Chromium: if it cannot download one (offline/proxied
machines) set `REMOTION_BROWSER=/path/to/chrome-headless-shell` before `npm run studio` / `npm run render`.
Measured: 2715 frames at 1920×1080 render in ≈6.5 min on 4 cores (H.264 + AAC, 42 MB).

## Edit

| What | Where |
|---|---|
| Narration, durations, lead/tail silence | `src/config/defaults.ts` or live in the studio (persisted in localStorage) |
| Emphasis in subtitles | wrap words in `*asterisks*` |
| Scenes (choreography) | `src/scenes/SceneNN*.tsx` — authored in normalised time `p` and narration keywords (`tm.at('verdict', 0.2)`), so they stretch with edited timing/text |
| Character, poses, faces | `src/components/StickFigure.tsx`, `src/lib/pose.ts` |
| Motion-graphics parts | `src/components/` (Stage/Camera/Parallax, Glyphs, Overlays, Transitions) |
| Transitions between scenes | `src/video/transitions.ts` |
| SFX placement | `src/config/sfx.ts` |

**Narration audio:** import a WAV/MP3 in *Audio & effects*. It is copied to `public/uploads` (so it renders), can be offset,
and *Fit scene durations to audio* re-times the scenes proportionally to the words in each. Subtitles are timed from the
script text (weighted by word length and punctuation), so with a real recording you may nudge lead/tail per scene.

## Checks
```bash
npm run typecheck && npm run lint && npm test      # unit tests (timing/subtitle engine)
node tests/e2e.cjs                                 # browser test of the studio (needs `npm run studio` running)
```

---

## Film 2 — What If You Woke Up in the Stone Age?

A 3:40 animated documentary-comedy starring **your uploaded character** (`assets/character-source.jpg`).
Seven scenes follow the storyboard timings. Narration: [NARRATION.md](NARRATION.md). Historical notes: [HISTORY.md](HISTORY.md).

```bash
npm run studio                 # then open http://127.0.0.1:5173/?film=stone   (or pick the film in the header)
npm run render:stone           # -> out/stone-age.mp4   (≈20 min on 4 cores)
npm run render:stone:props     # uses out/stone-props.json downloaded from the studio's Render tab
```

### How your character is used
* `scripts/cutout.py` (OpenCV GrabCut) cuts the figure out of the subway background → `public/stone/character.png`, the **untouched artwork** used for the wake-up hero shot.
* `scripts/headsprite.py` extracts your head + beanie as `public/stone/head.png` and erases the painted face so expressions can be redrawn.
* `src/stone/figures/Hero.tsx` rigs the character: **your head artwork**, black limbs at the artwork's line weight, a hand-drawn cloak in the artwork's colours, expressions drawn as vector overlays (eyes, brows, mouth, sweat) in the artwork's style. Extra poses/expressions are therefore *additions in the artwork's style*, not new character designs.
* To swap in different art: replace `assets/character-source.jpg`, adjust the seed rectangle in `cutout.py` / `headsprite.py`, run both scripts.

### Editing
| What | Where |
|---|---|
| Scene timings, narration, `[pause:1.5]` beats | `src/stone/config.ts` or live in the studio |
| Scene choreography (keyed to narration words, e.g. `tm.at('supermarket')`) | `src/stone/scenes/S1…S7*.tsx` |
| Scenery, props, animals, fire | `src/stone/art/` |
| Characters | `src/stone/figures/` (`Hero`, `Local`, `skeleton.ts` poses) |
| Sound placement | `src/stone/sfx.ts` (sounds synthesised by `npm run audio:stone`) |
| "Survival odds" counter | `src/stone/Hud.tsx` |

### Voice-over
The film uses the supplied recording (`assets/voice/stone-voiceover-source.mp3`). `node scripts/make-stone-voice.mjs` finds its 40 sentences, drops any spoken preamble, lays them on the storyboard timeline with the film's designed pauses (`[pause:x]` in `src/stone/config.ts`; spare scene time widens the gaps) and **measures every sentence** into `src/stone/voice-timing.json`. Subtitles, kinetic text, gags and sound effects are keyed to those measured times (`tm.at('supermarket')` etc.), so picture and voice stay in sync.

To use a different recording: regenerate it from [NARRATION.md](NARRATION.md) (same 40 sentences, in order), then
```bash
node scripts/make-stone-voice.mjs path/to/new-recording.mp3     # needs ffmpeg
```
A fully offline robotic placeholder voice is still available via `node scripts/make-stone-narration.mjs` (espeak-ng + MBROLA).

### Turkish version (`StoneAgeTR`)
Same film with Turkish voice-over, subtitles and on-screen text (title, location tag, shout, growl, odds counter, final question). Script: [NARRATION.tr.md](NARRATION.tr.md). Language lives in `src/stone/i18n.ts` (strings + the Turkish word each visual/sound cue hangs on) and `src/stone/config.ts` (per-language narration).
```bash
npm run studio                 # ?film=stone-tr
npm run render:stone-tr        # -> out/tas-devri.mp4
node scripts/make-stone-voice.mjs assets/voice/stone-voiceover-tr-source.mp3 tr   # rebuild voice + timing from the recording
```

### Checks
```bash
npm test                       # unit tests (timing, pause tokens, narration keywords, assets, sfx)
node tests/e2e-stone.cjs       # browser test of the studio with the Stone Age film (studio must be running)
```
