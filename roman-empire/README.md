# THE EXPANSION OF THE ROMAN EMPIRE — parchment-map documentary animation

A 10-second, 1920×1080, 30 fps motion-graphics piece. **Nothing is a static image**: the parchment paper, coastlines,
rivers, mountains, graticule, compass rose, territory, borders, cities, labels and camera are all generated in code
with Canvas 2D. `scene.draw(ctx, t)` is a pure function of time, so the browser preview and the MP4 export are
frame-identical.

| time | what happens |
|---|---|
| 0–2 s | Rome is highlighted — spotlight, sonar rings, "753 BC" — while the camera pushes in on Italy |
| 2–7 s | Territory floods out from Rome as 13 timed conquest waves (Italy → Carthage/Hispania/Greece → Asia/Gaul → Syria/Pannonia/Egypt/Mauretania → Britannia/Dacia/Mesopotamia). Fronts glow, provincial and outer borders are inked in, cities pop in as the front reaches them, and the year ticker follows real history (509 BC … 117 AD) |
| 7–10 s | Camera pulls back (strongest around 8 s) from the Mediterranean to all of Europe, North Africa and the Near East, revealing the scale; the closing title appears |

## Run it
```bash
npm install            # node-canvas (prebuilt binaries); ffmpeg must be on PATH for video export
npm run preview        # http://localhost:5173   (or just open index.html — no build step)
npm run render         # -> output.mp4  (~3 min; re-encode with ffmpeg -crf 22 for a smaller file)
npm run render:test    # first 3 s -> test.mp4
npm run stills         # PNG stills at key moments -> ./stills
```
Preview keys: **space** pause · **←/→** frame (shift = 1 s) · **0–9** jump · **[ ]** speed · `?t=8.5` freeze · `?q=1` full-res territory pass.

## How the territory works
`src/scene.js` builds an arrival-time field on a Mercator grid: every conquest seed (`SEEDS`) floods outward from its origin
at its own speed, domain-warped with fractal noise so fronts are organic. A blurred polygon of the empire at 117 AD (`EMPIRE`)
gives the outer limit; the seed Voronoi gives provincial borders. Each frame, every pixel samples those fields and is
shaded by how long ago the front passed (ember glow → deep red, with a hatched "engraving" texture), then clipped to the
real coastline and multiplied onto the parchment.

Coastlines come from Natural Earth 1:50m (public domain, via `world-atlas`), simplified into `src/geo.js` by
`npm run build:geo`. Outline, conquest timings and city positions are deliberately approximate — a documentary sketch, not a GIS.

Edit `src/scene.js` (`SEEDS`, `YEARS`, `CAMK`, `CITIES`, `LABELS`) and refresh.
