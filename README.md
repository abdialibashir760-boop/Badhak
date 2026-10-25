# ZİHNİ OYUNU — "Why Your Mind Turns Every Conversation Into a Test"

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
