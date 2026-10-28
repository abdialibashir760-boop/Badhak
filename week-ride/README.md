# WHAT A WEEK FEELS LIKE. — vertical canvas animation

A stick figure cycles across a week-shaped terrain: a heavy grind up Mon→Thu, arms in the air over the crest
and down the plunge Fri→Sun, then straight into a sheer wall and the red neon **MON**.
1080×1920 (9:16), 60 fps, 14 s, looped (black at both ends so it repeats seamlessly).

## Install
```bash
npm install            # needs Node 18+ ; installs `canvas` (prebuilt binaries, no compiler needed on common systems)
# ffmpeg must be on your PATH:  macOS `brew install ffmpeg` · Ubuntu `sudo apt install ffmpeg` · Windows `winget install ffmpeg`
```

## Preview in the browser (live, tweakable)
```bash
npm run preview        # then open http://localhost:5173
```
(or just double-click `index.html` — it has no dependencies)
Keys: **space** pause · **←/→** step a frame (shift = 1 s) · **0–9** jump · **[ ]** slow-mo / fast · `?t=8.5` freezes at 8.5 s.
Edit `src/scene.js` and refresh.

## Render to MP4
```bash
npm run render                  # -> output.mp4  (1080x1920, 60 fps, H.264, yuv420p; ~1 min)
npm run render:test             # first 3 s only -> test.mp4
npm run stills                  # PNG stills at key moments -> ./stills
node render.js --crf 14 --preset slow --out final.mp4
```
The renderer draws each frame with the *same* `src/scene.js` as the preview (a pure function of time), so the
export is frame-exact and deterministic.

## Where to tweak (all in `src/scene.js`)
| What | Where |
|---|---|
| colours, title, fonts, bike size, ground height on screen | `CFG` at the top |
| hill height / plunge depth / wall position | `CFG.HILL`, `CFG.DROP`, `CFG.WALL_X` |
| pacing of the whole ride (when each day passes) | `KEYS` — `{ t, x, v }` keyframes, Hermite-interpolated |
| sign positions and labels | `SIGNS` |
| pedal cadence / "heavy" stroke | `precompute()` → `cadence`, `heavy` |
| rider lean, arms-up moment, impact whiplash | `drawFrame()` → `leanWorld`, `fling`, `kick`, `recoil` |
| easing curves | `bezier(x1,y1,x2,y2)` helpers (`easeInOut`, `easeOut`, `easeSnap`) |

## Notes
* Legs use two-bone IK so the feet follow the rotating pedals and the knees bend automatically; arms are IK-pinned to the
  handlebars until the crest, then flung up. Limb aiming is done in world space so poses stay correct on slopes.
* Font: JetBrains Mono → SF Mono → Menlo → Consolas → DejaVu Sans Mono → any monospace. For a specific font in the MP4,
  drop a `.ttf` into `./fonts` (e.g. `JetBrainsMono-Bold.ttf`) and `render.js` registers it.
* If `canvas` fails to install on your machine, the browser preview still works; tell me and I'll add a Puppeteer-based exporter.
