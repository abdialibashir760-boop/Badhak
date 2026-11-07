# 04 · Scientific Diagram and Infographic Specifications

All 35 cards are already drawn at 1920×1080 in `diagrams/` (dark navy, cyan and amber, to match the footage). Each card shows its source in the footer. Use them in the order of the storyboard.

**Rules for every diagram**
- One idea per screen, 4–6 seconds on screen.
- Dark navy background, white text, cyan for measurements, amber for key points, red only for limits.
- Depth axes: the zone charts use a **compressed (non-linear) axis** so thin zones are readable; this is labelled on the card.
- Never imply precision the data does not have: use "≈", "reported", or the original uncertainty (± 6 m).

| File (`diagrams/…png`) | Used in | What it shows | Data and source |
|---|---|---|---|
| `title` | Title card | Series and episode title | n/a |
| `map_trench` | Hook | Schematic location of the Mariana Trench and Challenger Deep | Trench ≈ 2,550 km × 69 km (W2); schematic, not to scale |
| `trench_profile` | Hook | A narrow slot inside a wider trench | 10,935 m (N1) |
| `zones_a` / `zones_b` / `zones_c` | Descent | NOAA light zones with the 200 m, 1,000 m and hadal boundaries highlighted | N2 |
| `map_trenches` | Descent | 46 hadal habitats, ≈ 94% in subduction trenches | W3 |
| `hadal_share` | Descent | < 0.25% of seafloor area vs > 40% of depth range | W3 |
| `everest` | Descent | Everest (8,849 m) vs Challenger Deep (10,935 m) | W2 |
| `depth_counter` | Descent | 10,935 m ± 6 m | N1 |
| `pressure` | Descent | Pressure rising ≈ 1 atm per 10 m to > 1,000 atm | Physics; W2 |
| `animals_depth` | Twilight | Documented depth records of animals mentioned | W3, W4, J1, D1; NOAA zone graphic |
| `marine_snow` | Life without sun | Sinking organic particles | W3 |
| `funnel` | Life without sun | Trench shape and earthquakes funnel material | P2 |
| `glud` | Life without sun | Oxygen consumption ≈ 2× vs a 6,000 m site | P2 |
| `cellulose` | Life without sun | Cellulose broken into glucose by the amphipod's enzyme | P1, J1 |
| `saucer` | Survivors | Xenophyophore vs a saucer | D1 |
| `snailfish_range` | Survivors | Mariana snailfish range ≈ 6,200–8,100 m; capture 7,966 m | W4, P4 |
| `fish_limit` | Survivors, Pressure | Where fish have been documented vs the Challenger Deep | P3, P4; 2022 record marked reported |
| `equal_pressure` | Pressure | Equal pressure inside and out (no gas spaces) | General principle |
| `protein` | Pressure | Pressure distorts proteins; small molecules stabilise them | P3 (schematic) |
| `tmao` / `tmao_limit` | Pressure | TMAO 40 → 261 mmol/kg (0–4,850 m); 386 ± 18 at 7,000 m; limit ≈ 8,200 m | P3 |
| `deepest_quarter` | Pressure | No fish reported in 8,400–11,000 m | P3 |
| `membrane` | Pressure | Flexible, unsaturated membrane lipids | W3 (schematic) |
| `timeline` | Exploration | 1875, 1951, 1960, 1995, 2009, 2012, 2019–20, 2020 | W1 |
| `dsc_depth` | Exploration | 10,908 m, Cameron, 26 March 2012 | W1 |
| `count27` | Exploration | 27 people as of July 2022 | W1 |
| `depth_estimates` | Unknown | Reported depths 10,902–10,935 m with uncertainties | W1, N1 |
| `mapped` | Unknown | 28.7% of the seafloor mapped (April 2026) | N3 |
| `seen_area` / `rhode_island` | Unknown | < 0.001% of the deep seafloor seen ≈ the area of Rhode Island | N3 |
| `species_400` | Unknown | 400+ known hadal species | W3 |
| `filmed_8336` | Pressure | ≈ 8,300 m deepest fish filmed (reported, 2022) | Reported; verify |
| `end` | End card | Sources and credits | all |

## Animations (for the editor)

- `zones_*`: wipe the highlighted band in over 0.6 s; hold 4 s.
- `pressure`: draw the line left to right over 3 s; pulse the final dot.
- `everest`: bars rise/sink over 2 s; then show the 2,086 m difference.
- `timeline`: reveal one entry per second, left column first.
- `tmao` → `tmao_limit`: same chart; add the red limit line on the second card.
