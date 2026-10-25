# How a Credit Card Transaction Clears in 2 Seconds (Remotion)

5-minute explainer, 1920×1080, 30 fps, 9000 frames. Everything is drawn with React, SVG, CSS and `<canvas>`; there are no external images, fonts or media except your voice-over.

## Run it

```bash
cd card-transaction-video
npm install
npx remotion preview
```

Render the full video (several minutes of video, expect a long render):

```bash
npm run render        # -> out/card-transaction.mp4
```

Render only a section, for example scene 3:

```bash
npx remotion render src/index.ts CardTransaction out/scene3.mp4 --frames=3600-7199
```

## Voice-over

`public/voiceover.mp3` is currently a **silent 5:00 placeholder** so the project runs. Replace it with your own file (same name, ideally exactly 5:00) and it plays across all 9000 frames. The on-screen captions are a visual guide; match them to your script, or edit the text arrays in each scene file.

## Timeline

| Scene | Frames | File |
|---|---|---|
| 1 · Tap and digital zoom | 0–1350 | `components/scenes/Scene1TapZoom.tsx` |
| 2 · 4-node architecture | 1350–3600 | `components/scenes/Scene2Architecture.tsx` |
| 3 · High-speed relay race | 3600–7200 | `components/scenes/Scene3Relay.tsx` |
| 4 · Settlement and outro | 7200–9000 (end screen from 8400) | `components/scenes/Scene4Settlement.tsx`, `EndScreen.tsx` |

`src/CardTransactionMaster.tsx` mounts the four `<Sequence>`s plus the `<Audio>`; `src/Root.tsx` registers it as composition `CardTransaction`. Scene boundaries live in `src/theme.ts`; the packet timeline (run lengths, dwell times) in `src/relay.ts`; node positions and cable geometry in `src/network.ts`.

## Notes on the content

- Millisecond timers, the 1,980 ms round trip and the $452,190,000 batch are **illustrative**, and the video says so on screen.
- ISO 8583 message types 0100 (authorization request) and 0110 (authorization response), and response codes 00 / 05 / 51, are real.
- Run 6 of scene 3 lasts exactly 60 frames (2 s), which is the "real speed" payoff.
