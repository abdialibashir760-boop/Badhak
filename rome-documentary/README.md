# How Rome Became the Most Powerful Empire in the Ancient World

A 4-minute, 1920×1080, 30 fps historical documentary built entirely in code with **Remotion + React + SVG + CSS + Canvas**.
60 shots, original synthesised score and sound design, synthetic narration timed sentence-by-sentence.

| Deliverable | Where |
|---|---|
| Final video (H.264 MP4 + AAC) | `out/rome-documentary.mp4` |
| Narration script (timestamped, 526 words) | `docs/SCRIPT.md` · source text `script/narration.json` |
| Scene-by-scene storyboard (60 shots) | `docs/STORYBOARD.md` |
| Source code | `src/` (Remotion project), `tools/` (pipeline) |
| Map animation components | `src/map/engine.ts`, `src/map/mapStates.ts`, `src/components/MapShot.tsx`, `src/data/history.ts` |
| Illustration / military-formation / building components | `src/art/prims.tsx`, `src/art/scenes1.tsx`, `src/art/scenes2.tsx` |
| Timelines, camera rig, transitions, lower-thirds | `src/components/Overlays.tsx`, `src/Documentary.tsx` |
| Audio assets | `audio/stems/{music,sound_design,narration}.mp3`, `audio/voice/*.wav` (per-sentence narration), `public/audio/mix.mp3` |
| Thumbnail | `out/thumbnail.png` |
| SEO title, description, chapters, tags | `docs/SEO.md`, `docs/CHAPTERS.txt` |
| Historical source notes | `docs/SOURCES.md` |
| QA report | `docs/QA.md` |

## How it is built
1. **Narration** (`script/narration.json`) → `tools/tts.py` synthesises each sentence with Kokoro (offline, Apache-2.0) → `audio/voice/sentences.json` is the master clock.
2. **Shot list** (`src/data/shots.ts`, pure data) → `tools/build-timeline.mts` times every shot to the sentence(s) it illustrates → `src/data/timeline.generated.ts` + `audio/timeline.json`.
3. **Audio** — `tools/make_audio.py` composes the score and sound design from the same timeline and mixes it under the voice with ducking (-16 LUFS).
4. **Video** — Remotion renders `Documentary`: map shots use a Canvas map engine (parchment, coastlines, a per-pixel conquest-time field, routes, roads, trade lanes, frontiers, modern-map crossfade); art shots are SVG scenes with a camera rig; cards are SVG.

## Commands
```bash
npm install
python3 -m pip install kokoro-onnx soundfile numpy     # + download kokoro-v1.0.int8.onnx / voices-v1.0.bin into audio/models (see tools/tts.py)
python3 tools/tts.py                # narration  (~5 min on CPU)
npm run timeline                    # shot timing
python3 tools/make_audio.py         # score + sound design + mix (~3 min)
npm run studio                      # live preview in Remotion Studio
npm run render                      # -> out/rome-documentary.mp4
npm run thumbnail                   # -> out/thumbnail.png
node tools/stills.mjs out/review    # a still from every shot (for review)
```
