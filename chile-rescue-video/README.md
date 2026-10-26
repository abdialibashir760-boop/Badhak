# San José mine rescue — Part 1 (Remotion)

2:18, 1080×1440 (3:4), 30 fps explainer on the 2010 Chilean mine collapse. A new vector cutaway animation
with a narrated script that follows the same story beats as the reference clip, written in original wording.

## Pipeline
1. `scripts/make_audio.py` — Kokoro TTS (voice `am_michael`) per line, sound bed (drone, collapse rumble,
   pipe knocks, drill hum), writes `public/voiceover.mp3`, `src/timeline.ts` (line timings) and `out/captions.srt`.
   Needs `pip install kokoro-onnx soundfile numpy`, `ffmpeg`, and the model files `kokoro-v1.0.int8.onnx` + `voices-v1.0.bin`
   (GitHub release `thewh1teagle/kokoro-onnx` → `model-files-v1.0`):
   `python3 -I scripts/make_audio.py <kokoro.onnx> <voices.bin>`
2. Everything on screen is driven by that timeline: `src/camera.ts` (camera keyed to narration lines),
   `src/state.ts` (what exists when), `src/World.tsx` (cutaway scene), `src/Overlay.tsx` (captions, chips, end card).
3. `npm run render` → `out/san-jose-part1.mp4`. Use `--browser-executable` if Remotion cannot download Chrome.

Edit the script text in `scripts/make_audio.py` and re-run step 1; animation follows the new timings. Camera moves and
event timing reference line ids (`h1`…`b14`), so keep ids when rewording.
