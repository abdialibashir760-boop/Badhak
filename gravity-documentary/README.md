# What Gravity Actually Is – And Why Einstein Changed Everything

A 4:00, 1920×1080, 30 fps science documentary built entirely in code: **Remotion + React + SVG + CSS + math** (46 shots, ~50 reusable pieces, a synthesised score).

```
npm i
npm start                    # Remotion Studio (composition "Documentary", plus "Thumbnail")
npm run render               # → out/gravity-documentary.mp4 (H.264)
npm run thumbnail            # → out/thumbnail.png
npm run audio                # re-synthesise music / ambience / SFX → public/audio/*.mp3
npm run docs                 # regenerate docs/narration.md + docs/storyboard.md
node scripts/stills.mjs 0.6  # one QC still per shot → out/stills/
```

## Status: one open item — the voice-over
The visual film, captions, music, ambience and sound effects are complete and rendered. **The spoken narration is not in the file yet**: the ElevenLabs connector in this workspace rejects every generation with *"Your subscription has a failed or incomplete payment"*, the Fish Audio account is on the free plan (1,990 credits, 500 bytes/call — the script is ~3,000 bytes), and the sandbox proxy blocks downloading Fish/HuggingFace audio. So no voice was generated and none was faked.

The script (`docs/beats.json`, 501 words, 15 beats) and the whole post-voice pipeline are ready:

1. Generate each beat in one voice (the intended voice was ElevenLabs "Philip – The Voice of Quiet Authority"; any calm documentary voice works) and save as `public/audio/narration/b01.mp3 … b15.mp3`.
2. `npm run audio && node scripts/sync-narration.mjs` — measures every file, lays beats into their sections, speeds a section up (≤ ×1.12) only if needed, rewrites `src/generated/narration.json` (so captions follow the real voice), and mixes voice over the bed with sidechain ducking at −16 LUFS → `public/audio/mix.mp3`.
3. `npm run render`.

(Pipeline tested with stand-in tone files: output length and timing correct.)

## Layout
```
docs/    beats.json (script) · narration.md · storyboard.md · SEO.md · QC.md · audio-cues.json
src/lib/ reusable science-animation library  (see below)
src/shots/ hook · newton · einstein · orbits · time · finale   (46 shot components)
src/shots.ts    ordered shot registry (time, title, description)  ← single source of truth
src/timeline.ts beat timings + captions (estimated now; real after narration sync)
scripts/ synth_audio.py · sync-narration.mjs · gen-docs.mjs · stills.mjs
public/audio/ music · ambience · sfx stems and the mix
```

## Reusable science library (`src/lib`)
| Module | What it gives you |
|---|---|
| `math` | easing, window/fade helpers, seeded RNG, **Kepler solver** (`keplerE`, `kepler2D`) |
| `camera` | perspective camera (`makeView`, `toView`, `project`) with near-plane clipping |
| `Space` | `Space` backdrop, `Starfield` (parallax/twinkle), `Galaxy` (log-spiral), `Vignette` |
| `Planet` | shaded `Planet` (earth, moon, mercury…neptune, Saturn rings, ball, apple) and animated `Sun` |
| `Surface` | **spacetime grid**: potential wells (`wellHeight`, retarded curvature), depth-sorted bodies, lines on the surface |
| `Diagram` | `Arrow`, `Tag`, `Card`, `Graph` (animated curve), `Stamp` |
| `Clock` | analog clock driven by an elapsed-seconds value |
| `physics` | free fall with bounce, leapfrog orbit & 2-D potential integrators, real planetary data, `massStep` |
| `Type` | `ChapterCard`, `Label`, `Statement` |

## Audio (all synthesised, no samples)
`scripts/synth_audio.py` builds a D-minor score that grows with the story, a deep-space ambience bed, and cue-timed SFX (chapter risers/booms, cut whooshes, bounces, ticks, GPS pings) from `src/shots.ts`. Stems and the mix are written to `public/audio/`.
