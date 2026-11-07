# Image-Generation Prompts

**Purpose.** These generate *atmosphere and symbol only*. Specific phones, people, buildings and logos come from real photographs (`02-storyboard.md`, "Verified Commons files"). Nothing here is to be presented as archival or as a real device.

**Standard settings (any photoreal model):** 16:9, generate at ≥2560×1440 and downscale to 1920×1080 · cinematic, 35 mm anamorphic look, shallow depth of field, subtle film grain · palette: ink black, warm gold, ivory, dark red accents.

**Global negative prompt (append to every prompt):**
`text, letters, numbers, watermark, logo, brand name, trademark, readable screen content, recognizable real person, celebrity, deformed hands, extra fingers, distorted phone, fake interface, cartoon, oversaturated, neon`

**On-screen disclosure.** Any generated image of a historical setting (G-02) carries a small "Illustration" tag in the lower-right. Symbolic images (G-07, G-08) need no tag but should never be placed under a line that states a fact about a real event.

---

### G-01 — Factory at dusk (hook, §1.2)
`Photorealistic wide exterior of a vast Nordic electronics manufacturing complex at blue-hour dusk, long low buildings with rows of lit windows, steam rising from rooftop vents, wet asphalt reflecting amber light, tall pines in the background, a few small figures in hi-vis jackets crossing a yard, cinematic composition with strong leading lines, deep shadows, restrained gold and teal palette, ultra-detailed, 35 mm anamorphic.`
*Motion plan:* slow push-in 105→115%, lights flicker on. *Used under:* "four hundred thirty-seven million handsets".

### G-02 — Pulp mill by rapids, 1860s illustration (§2.1)
`Painterly photorealistic illustration of a 19th-century Nordic pulp mill beside fast river rapids, timber buildings with a waterwheel, stacked logs, mist over the water, early-morning amber light, workers in period clothing seen from far away, muted sepia and gold tones, soft film grain, historically plausible but clearly an illustration.`
*Tag:* "Illustration". *Note:* do not caption it with a location; the script says only "a pulp mill in Finland".

### G-03 — Nordic harbour skyline (§3.2)
`Photorealistic Nordic coastal city skyline at blue hour, calm harbour with reflections, a mix of stone buildings and modern office towers, a few lit windows, thin cloud, cinematic wide shot, gold light on the water, no readable signage.`
*Note:* generic. Do not label it "Helsinki" — a generated skyline will not match the real one.

### G-04 — Ordinary lives, basic phones (§3.5)
`Photorealistic street scene in a busy market city in the early 2000s, people in everyday clothes talking on and glancing at small plain unbranded candy-bar mobile phones with physical keypads, golden afternoon light, shallow depth of field, handheld camera feel, warm and human, no screens visible, no brands.`
*Constraint:* phones must be generic/unbranded and held at an angle so no interface is visible. If it looks like any specific real model, regenerate or skip.

### G-05 — The developer's desk (§5.2)
`Photorealistic close shot of a software developer's desk late at night, two monitors glowing with blurred abstract code shapes (not readable), a cold coffee, a rack of small test handsets seen only as dark blurred silhouettes, a window with city lights, cinematic low-key lighting, gold desk lamp and blue monitor glow.`
*Constraint:* silhouettes only for devices.

### G-06 — The quiet corridor (§6.5, §9.4)
`Photorealistic dim corporate corridor at night, polished floor reflecting a single lit office at the far end, other doors dark, glass partitions, cool shadows with one warm gold light, symmetrical composition, stillness, tension.`

### G-07 — The burning platform (§7.2, §9.5)
`Cinematic night seascape: a distant offshore oil platform glowing with controlled orange fire against a dark stormy sea, embers drifting upward, long exposure feel, deep black sky, gold and dark red light on the waves, symbolic and stylised, no people, no text, not a depiction of any specific real accident.`
*Sensitivity:* the memo's metaphor refers to a real North Sea disaster (Piper Alpha, 1988 — as reported by Engadget/Light Reading). Keep the image abstract and respectful; do not recreate the real event.

### G-08 — The empire loses its lights (§9.6 and the "giant corporate empire losing its position" brief)
Generate **three keyframes** with the same composition so they can be cross-dissolved:
1. `Colossal corporate headquarters skyline at night, a monumental stepped tower complex resembling a golden palace, every floor brightly lit in warm gold, reflection pool in the foreground, symmetrical, awe-inspiring, cinematic wide shot, dark red sky glow at the horizon, no logos, no text.`
2. Same prompt + `about half of the windows have gone dark, upper floors dim, a few lights flickering, cooler tone.`
3. Same prompt + `almost entirely dark, only a handful of windows lit, mist at the base, a single gold light at ground level, melancholy.`
*Motion:* 12 s cross-dissolve 1→2→3 with a slow pull-back. This is the "symbolic empire" visual; it is an invented building, not Nokia's.

---

## Thumbnail & end-card backgrounds (see `06-packaging.md`)
- **T-A:** `Dramatic close-up of an old rectangular mobile phone silhouette cracking down the middle, light spilling through the crack in gold, deep black background, dark red vignette, shallow depth of field, no brand marks, no text.` *(Use as a background only; add the real Nokia photo cut-out and text in your editor.)*
- **T-B:** `A gold chess king alone on a dark board, dark red pieces advancing from the shadows, dramatic side lighting, shallow depth of field.`
- **T-C:** `A glowing gold crown sitting on an empty stage in an empty theatre, dust in a single spotlight beam, dark red curtains.`
- **End card:** `Minimal black background with fine gold geometric lines, subtle film grain, room for a title in the centre.`

## Checking each output (checklist)
- [ ] No legible text, logos or brand marks anywhere in frame
- [ ] No device that could be mistaken for a real model (regenerate if it does)
- [ ] No resemblance to a real person
- [ ] Hands and objects look physically plausible
- [ ] Palette sits inside the identity colours (`04-charts-and-timeline.md`)
