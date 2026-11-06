# How GPS Knows Exactly Where You Are — 4-minute documentary (Remotion)

1920×1080 · 30 fps · 240 s · **54 shots** · all visuals are programmatic (React + SVG + CSS, with a small custom 3-D projection engine; no WebGL, no stock footage).

```bash
npm install
npm start                      # Remotion Studio
bash scripts/render_chunks.sh  # full film: 8 muted chunks → out/video_silent.mp4
npm run thumbnail              # out/thumbnail.png
npm run docs                   # regenerate docs/* from src/
npm run audio                  # regenerate the score + sound effects (≈ 5 min)
npm run typecheck
```

## Deliverables

| | |
|---|---|
| Film | `gps-documentary.mp4` (H.264 / AAC, 54 MB; a higher-quality 142 MB encode is made by the mux command below with `-crf 20`) |
| Narration script | `docs/narration.md` (505 words) |
| Storyboard | `docs/storyboard.md` (54 shots, times, visuals, how each explains the narration) |
| SEO title, description, chapters, tags | `docs/seo.md` |
| Technical source notes + simplifications | `docs/sources.md` |
| Thumbnail | `thumbnail.png` |
| Sound effects | `public/audio/sfx/*.wav` (12, procedurally generated) · score `public/audio/music.mp3` |

## Adding your voice-over

The picture is timed from the narration beats in `src/narration.ts` (≈ 150 wpm until real audio exists), so it is already close to the pace of a normal read.

1. Record one clip per beat (`B01` … `B29`, see `docs/narration.md`) into a folder: wav / mp3 / m4a.
2. `node scripts/retime.mjs path/to/clips` measures every clip, writes `src/beats.override.json` (every shot re-flows to your real timing), mixes `public/narration/narration.wav`, and turns `CONFIG.narration` on (the score then ducks automatically).
3. `npm run docs && bash scripts/render_chunks.sh`, then mux (see below).

Recorded one long take instead? Split it at the pauses (any editor, or `ffmpeg -af silencedetect`) into the 29 beats.

## Mixing the final file

The chunked render is silent (resilient to crashes). Audio is rendered on its own and muxed:

```bash
npx remotion render src/index.ts GpsDocumentary out/audio.mp3 --codec=mp3
npx remotion ffmpeg -i out/video_silent.mp4 -i out/audio.mp3 -c:v copy -c:a aac -b:a 192k -shortest out/gps-documentary.mp4
```

## Layout

- `src/narration.ts` — script (single source of truth) · `src/shotList.ts` — shot list (pure data) · `src/timeline.ts` — timing
- `src/shots.tsx` — shot id → component · `src/Documentary.tsx` — compositor: transitions, captions, chapter tags, audio
- `src/engine/` — vectors, camera, geodesy, orbits, land mask · `src/components/` — Earth, satellites, signals, phone, map, HUD
- `src/scenes/` — `hook`, `globe`, `diagrams1/2`, `trilat`, `city` (+ `cityModel` ray tracing), `thumbnail`
