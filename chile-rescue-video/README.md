# Animated rescue stories (Remotion)

Animated true-story videos with an AI narrator, 30 fps. One folder per story; Apollo 13 comes in 9:16 and 16:9, in English and Turkish.

| Story | Composition | Source folder | Length |
|---|---|---|---|
| Apollo 13 (1970) | `Apollo13` (EN 9:16), `Apollo13TR` (TR 9:16), `Apollo13Wide` (EN 16:9), `Apollo13WideTR` (TR 16:9) | `src/apollo13/` | ≈ 2:38 EN / 2:34 TR |
| San José mine, Chile 2010 — Part 1 | `SanJose` | `src/san-jose/` | ≈ 2:19 |

Shared code is in `src/common/` (`Overlay` captions/chips/end card, `Figures`, `math`). The channel plan and upload
packages are in `../channel-kit/`.

## Add a story
1. `scripts/stories/<story>.py` — `ID`, `LINES` (id, spoken text, on-screen caption, pause), `sound(ctx)` effects.
2. Generate voice + timeline + captions:
   `python3 -I scripts/make_audio.py <story> <kokoro.onnx> <voices.bin>`
   → `public/<id>.mp3`, `src/<id>/timeline.ts`, `out/<id>.srt`.
   Needs `pip install kokoro-onnx soundfile numpy`, `ffmpeg`, and the Kokoro model files
   (`kokoro-v1.0.int8.onnx`, `voices-v1.0.bin`) from the `thewh1teagle/kokoro-onnx` GitHub release `model-files-v1.0`.
3. Build scenes in `src/<id>/` keyed to line ids (`S("e2")` = start of line `e2`), a `Main.tsx` that mounts
   `<Overlay …/>` and `<Audio src={staticFile("<id>.mp3")} />`, and register a `<Composition>` in `src/Root.tsx`.
4. `npx remotion render src/index.ts <Composition> out/<id>.mp4`
   (add `--browser-executable=/path/to/chromium` if Remotion can't download Chrome).

Keep line ids stable when rewording: scenes and chips reference them.

## Languages and aspect ratios (Apollo 13)
- On-screen text is in `src/apollo13/i18n.tsx` (`en`, `tr`); narration timing is per language
  (`timeline.ts`, `timeline.tr.ts`) and scenes read it through `useTL()`.
- **16:9** centres the portrait-designed art (`WIDE_K` in `src/apollo13/Main.tsx`) and uses the `LANDSCAPE` overlay layout
  (`src/common/Overlay.tsx`); backgrounds are drawn wider than 1080 so the sides fill in.
- **Turkish voice:** Kokoro has no Turkish, so `scripts/stories/apollo13_tr.py` uses Piper (`pip install piper-tts`).
  Download `vits-piper-tr_TR-fahrettin-medium.tar.bz2` from the `k2-fsa/sherpa-onnx` GitHub release `tts-models`
  into an empty folder, extract it, then:
  `python3 -I scripts/make_audio.py apollo13_tr <folder>/tr_TR-fahrettin-medium.onnx -`
  (`fettah` and `dfki` are available the same way). Output: `public/apollo13-tr.mp3`, `src/apollo13/timeline.tr.ts`.
- Render: `npx remotion render src/index.ts Apollo13WideTR out/apollo13-tr-16x9.mp4` (etc.).

## Notes
- San José is a camera-driven world scene (`World.tsx`, `camera.ts`, `state.ts`); Apollo 13 is a sequence of
  crossfaded scenes (`scenesA.tsx`, `scenesB.tsx`).
- Fact sheets and claim checks live in `../channel-kit/videos/`; check them before publishing.
