# Remotion Automation Rules
- Video target: 1080x1920 (9:16 vertical), 30 fps, typically 15–30 seconds.
- Motion:
  - No linear animations. Always use `spring()` or `interpolate()` with easing curves.
  - Stagger elements by 3–5 frames so nothing appears all at once.
  - Keep visible components inside vertical safe zones (top 15% and bottom 20% clear for YouTube UI).
- Verification loop:
  - After coding `src/Composition.tsx`, test with `npx remotion still src/index.ts Main preview.png --frame=60`
  - Render final MP4 with `npx remotion render src/index.ts Main out/video.mp4`
