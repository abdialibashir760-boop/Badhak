# SOCIAL BATTERY AT A PARTY.

9:16 minimalist black-and-white vector animation (1080×1920, 60 fps, 36 s = 2,160 frames).
A stick figure with a floating battery gauge gets drained by small talk, "we should catch up sometime!" and a group photo,
ejects in a rocket chair, and recharges in a quiet room.

## Install
```bash
npm install       # installs Puppeteer (downloads its own Chromium)
# FFmpeg must be on your PATH:  macOS `brew install ffmpeg` · Ubuntu `sudo apt install ffmpeg` · Windows `winget install ffmpeg`
```

## Preview (real time, in the browser)
```bash
npm run dev       # → http://localhost:5173
```
Controls: **space** play/pause · **←/→** step one frame (shift = 1 s) · **[ ]** slower/faster · **1–5** jump to a scene · seek bar ·
**🔊 sound** button plays the same synthesised sound effects that get muxed into the MP4 · `?t=17` freezes at 17 s.

## Export the MP4
```bash
npm run export          # → social_battery.mp4   (1080x1920, 60 fps, H.264 + AAC stereo-safe mono SFX)   ~2–4 min
npm run export:test     # first 4 s only → test.mp4
npm run export:silent   # no audio track
node render.js --crf 14 --preset slow --out final.mp4
node render.js --frames 840-1319        # render just one scene (frame numbers)
```
`render.js` opens `index.html?render=1` in headless Chromium, calls `window.renderFrame(n)` for every frame (time = n / 60, so the
export is frame-exact and deterministic), pipes PNGs into FFmpeg and adds the sound track. Use `PUPPETEER_EXECUTABLE_PATH=/path/to/chrome`
to reuse an existing browser instead of the downloaded Chromium.

## Timeline
| Scene | Time | Frames | What happens |
|---|---|---|---|
| 1 Arrival | 0–6 s | 0–360 | confident walk in, battery 100 % |
| 2 Small talk | 6–14 s | 360–840 | "SO WHAT DO YOU DO FOR WORK?" bumps him → shockwave, 2 blocks shatter → 60 %, slower, slouch |
| 3 Catch up | 14–22 s | 840–1320 | oversized "WE SHOULD TOTALLY CATCH UP Sometime!" → block (40 %) then another (20 %), amber flicker, labored knees-bent drag |
| 4 Red alert | 22–30 s | 1320–1800 | tiny "GROUP PHOTO!" → last block explodes, 0 % red flash + alarm rings, camera pulls out, ejector chair rockets him off the top |
| 5 Recharge | 30–36 s | 1800–2160 | quiet room, soft landing, duvet, glowing cable plugs in, one block breathes 0 → 5 %, fade to black |

All beats are the `T` object at the top of `src/scene.js` — change a time there and the animation *and* the sound effects follow.

## How it works (`src/scene.js`)
* **Walking engine** – procedural 2-bone IK for legs and arms. Gait phase is integrated from *distance travelled*, so planted feet never slide at any speed.
  Fatigue keys (step length, foot lift, hip sink, torso lean, head droop, arm swing) are in `SPEED` / `GAIT`.
* **Battery HUD** – floats 120 px above the head on an under-damped spring (precomputed @240 Hz, so it lags and overshoots deterministically).
  5 blocks drain right-to-left (`SHATTER`); white ≥ 60 %, flickering amber 40–20 %, flashing red + pulsing aura at 0 %, mint when recharging.
* **Particles** – shattered blocks are pixel debris with gravity, spin and fade, evaluated analytically (no state).
* **Easing** – CSS-style cubic beziers: `easeOutQuad`, `easeInOutCubic`, `easeInCubic`, `easeOutBack`…
* **Camera** – follows the walker, shakes on impacts, pulls out on red alert, chases the rocket, then settles back on the empty floor.
* **Sound** – `src/sfx.js` synthesises whooshes, bonks, glass shatter, alarm, boing, rocket, charging hum and footfalls synced to the gait.
