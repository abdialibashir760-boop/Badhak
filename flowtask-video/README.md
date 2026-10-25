# FlowTask AI — 15-second YouTube Short (Remotion)

1080×1920 (9:16), 30 fps, 450 frames. Built only with React + inline styles; no external images or fonts.

## Run it

```bash
cd flowtask-video
npm install
npx remotion preview      # opens Remotion Studio in your browser (alias: npm start)
```

Render to a file:

```bash
npm run render            # -> out/flowtask-ai.mp4
npm run still             # -> out/poster.png (frame 320)
```

## Structure

```
src/index.ts            registerRoot
src/Root.tsx            <Composition id="FlowTaskAI" 1080x1920 @30fps, 450 frames>
src/MyVideo.tsx         the four <Sequence> scenes
src/theme.ts            colors, font stack, scene frame ranges
src/scenes/Hook.tsx            0-90     falling, scattering task cards
src/scenes/Magic.tsx           90-240   kanban board, cursor, "Fix Bugs 🐛" moves to Done
src/scenes/ValueDrop.tsx       240-360  ring 0→100 % with particle pop
src/scenes/CallToAction.tsx    360-450  logo, pulsating button, "Link in description."
src/components/         Background, AnimatedWords, SceneFade
```

Timings are constants at the top of each scene file (for example `DRAG_START` and `DROP` in `Magic.tsx`), so they are easy to tweak.

Note: the 🐛 and ✨ emoji need an emoji font. Browsers on macOS, Windows and Android have one. On a bare Linux machine install `fonts-noto-color-emoji` before rendering.
