# gps-video — "How GPS locates your phone" (10 s, 1920×1080, 30 fps)

A technology explainer built with **Remotion + SVG + a small custom 3D engine** (no WebGL, no
three.js): everything is real 3-D geometry in kilometres, projected through a perspective camera
and drawn as SVG.

```bash
cd gps-video
npm install
npm start                      # Remotion Studio
npm run render                 # → out/gps-explainer.mp4
npm run still                  # → out/poster.png
npm run typecheck
npm run build:land             # regenerate src/landData.ts from Natural Earth
```

## Timeline

| Time   | What happens                                                                              |
| ------ | ----------------------------------------------------------------------------------------- |
| 0–2 s  | Wide shot of Earth; three GPS satellites sweep along their orbits                         |
| 2–5 s  | Each satellite broadcasts expanding wavefronts; the phone appears on the surface (~4.3 s) |
| 5–8 s  | Signals reach the phone one by one while the camera dives toward it                       |
| 8–10 s | A glowing marker locks onto the point where the three range circles intersect             |

## Scientific model

- **Orbit**: radius 26,560 km (20,189 km altitude, to scale against a 6,371 km Earth), 55° inclination,
  prograde. Each satellite's orbital plane is solved so it really passes through its position.
- **Time-lapse**: the real period is 11 h 58 min; here ω = 0.03 rad/s. Wavefronts travel at 6,800 km/s
  instead of 299,792 km/s (a 20,000 km trip really takes ~67 ms). The HUD shows the real
  `Δt = distance / c`, computed from the live satellite–phone geometry.
- **Broadcast cone**: nadir-pointing, half-angle asin(R/r) ≈ 13.9° (the antenna lights the whole visible disc).
- **Trilateration**: each satellite's range sphere meets the Earth in a circle; the three circles drawn on the
  globe cross exactly at the phone (Istanbul, 41.0082° N 28.9784° E). The three beams are the straight
  satellite→phone rays.
- **Solar arrays** rotate about their long axis to face the Sun, as the real ones do.
- **Land**: Natural Earth 1:50m (public domain) rasterised to a run-length-encoded mask; dot-matrix globe with
  level-of-detail crossfades so it stays crisp from orbit down to regional scale.
- Deliberately **not to scale**: the satellites and phone are enlarged so they read on screen (the footnote says so).
  A 4th satellite is needed in practice to cancel the phone's clock error — mentioned in the last caption.

## Layout

- `src/camera.ts` — one continuous camera path (slow dolly → rapid exponential zoom → soft landing)
- `src/orbit.ts` — satellite orbits, signal timing · `src/geo.ts` — geodesy + land mask
- `src/math3d.ts` — vectors, perspective camera, near-plane clipping, Earth occlusion
- `src/draw/*` — Earth, satellites, signals, phone, marker, HUD
