# Editing Timeline — Motion & Sound Design

Timecodes follow `01-script.md` at 150 wpm (runtime ≈ 9:43). **When your audio arrives:** (1) drop it on the timeline, (2) place a marker at the start of each numbered narration block, (3) slide each shot group in `02-storyboard.md` to its marker, (4) keep graphics frame-locked to the words they name.

## Project setup
- 1920×1080, 24 fps (cinematic) or 30 fps if you plan a Remotion render like the other projects in this repo.
- Colour: ink black base, gold highlights, ivory text, dark red for decline. Apply a single LUT: lifted blacks, slightly desaturated mids, gold in highlights.
- Grain: 8–12% film grain on all photographic material; none on graphics.
- Safe areas: 5% margin; lower-third tags (FACT / INTERPRETATION) sit at 6% from the left, 9% from the bottom.

## Motion language
| Element | Treatment |
|---|---|
| Stills (device photos) | Black background, soft vignette, slow 2D push-in (100→108% over the shot), subtle parallax from a fake shadow layer. Never rotate the device in 3D |
| Stock footage | 24 fps conform, 90% gold-tinted grade, 3–6 s per shot, cut on action |
| Generated images | 2.5D parallax from a depth map, 105→115% push; keep to 8–12 s |
| Charts | Ease-out cubic, 0.5–1.0 s per element, numbers use tabular figures, source line fades in last |
| Transitions | Default is a hard cut. Use a 6-frame cross-dissolve between *sections*, and a "dip to black" 12 frames only before §1.5 and §9.2 (silence beat). No whooshes, no spins |
| Titles | Serif, word-by-word reveal for quotes; a 2 px gold underline draws under dates |
| FACT / INTERPRETATION tags | Small caps, 14 px tracking +8%. FACT: gold on black. INTERPRETATION: ivory on dark red |

## Sound design
- **Bed:** low, sparse score — sustained strings and piano with a muted pulse; −24 LUFS short-term under VO, rises to −18 LUFS in gaps. (If you want a bespoke score, the repo's `gravity-documentary/scripts/synth_audio.py` shows a way to synthesise one; otherwise use licensed music.)
- **VO:** dry, light compression, −16 LUFS integrated for YouTube; de-ess, high-pass at 80 Hz.
- **SFX palette (use sparingly):**
  - Soft **tick** on every timeline card (0.15 s)
  - Deep **sub-bass hit** on "cancelled" stamp (5.4), the "Not Nokia" slice (8.3) and the final lights-out (9.6)
  - Subtle **electrical crackle** when the crack-line animates (4.5, 5.6)
  - **Room tone** (distant HVAC) under the corridor shots (6.5, 9.4)
  - **Silence**: cut all music for 1.0 s at 8:57 ("So what does the story teach?")
- **Period audio:** the monophonic ringtone of a Nokia phone is recognisable and tempting — **don't use** Nokia's tune recordings unless you can clear them. Use a generic monophonic beep instead.

## Master timeline (by track)
**V1 base / A1 VO**

| Timecode | Section | V1 | V2 (graphics) | Music | SFX |
|---|---|---|---|---|---|
| 0:00 | Hook | 1.2 factory [G-01] under 1.1 | Chart G tiles | Bed in at −28 LUFS, slow swell | Tick × 3 |
| 0:15 | | 1.3 timeline cards | Date cards | Tension up | Tick |
| 0:24 | | 1.4 axis-relabel concept | — | Hold | Soft glitch (0.2 s) |
| 0:36 | | 1.5 Title card | Series title | Drop to −32 LUFS | Sub-bass hit |
| 0:43 | Empire | 2.1 river / mill | Date card | New cue | — |
| 1:05 | | 2.3 Ollila portrait | Lower-third | — | — |
| 1:22 | | 2.5 Nokia 1011 | — | Rise | Tick |
| 1:32 | | 2.6 profit chart | Bars | — | — |
| 1:46 | Golden years | 3.1 Chart A dots | Dots | Major-key lift | Ticks |
| 2:02 | | 3.3 Nokia 1100 | Callouts | — | — |
| 2:36 | | 3.7 Chart G | Tiles | Peak of arc | Count-up shimmer |
| 2:47 | New competitor | 4.1 iPhone photo | Date card | **Key drop** to minor | Low pulse |
| 2:56 | | 4.2 split screen | Callouts | — | — |
| 3:30 | | 4.5 two bars + crack | Crack-line | Dissonant note | Crackle |
| 3:43 | Platform problem | 5.1 Chart C | Range bar | Pulse faster | Ticks |
| 4:15 | | 5.4 Nokia 5800 + stamp | Stamp | — | **Sub-bass hit** |
| 4:51 | | 5.7 Chart B | Bars | Rise | Tick |
| 5:01 | Inside | 6.1 glass HQ (stock) | — | New cue, sparse | — |
| 5:33 | | 6.3 org chart | Arrows | Hold | — |
| 6:00 | | 6.5 corridor | — | Room tone | — |
| 6:06 | Wrong turn | 7.1 Elop | Lower-third | Low drone | — |
| 6:16 | | 7.2 G-07 + memo | Quote | Fire crackle bed | Embers |
| 6:46 | | 7.4 arrows | Arrows | — | Tick |
| 7:11 | | 7.6 Chart D | Bars | Falling motif | — |
| 7:27 | | 7.7 split card | Both views | Neutral, two-note | — |
| 7:38 | Sale | 8.1 Chart E | Bars | Cold cue | — |
| 7:47 | | 8.2 Chart F | Stacked bar | — | Ticks |
| 8:09 | | 8.3 slice diagram | Slice | — | **Sub-bass hit** |
| 8:24 | | 8.4 impairment | Number dims | Fade down | — |
| 8:36 | Lesson | 9.1 timeline tail + tower | Cards | Light, hopeful | Ticks |
| 8:57 | | 9.2 black | — | **Music out** | Silence 1.0 s |
| 8:59 | | 9.3 chess | — | Piano only | — |
| 9:08 | | 9.4 corridor | — | — | Room tone |
| 9:16 | | 9.5 ember | — | Strings return | — |
| 9:24 | | 9.6 lights out + end card | Title | Full swell then fade | **Sub-bass hit** on final window |

## Pacing rules
- Hold every chart for ≥2.5 s after the last number lands.
- No shot is on screen longer than 14 s without motion or a graphic change.
- Keep ≤1 sound effect per 3 s in dense passages; remove the SFX first if the mix feels crowded.
- Place a 0.4 s pause in the VO before each "Interpretation" label if you can direct the reading.

## Export
- H.264 or ProRes mezzanine → YouTube upload at 1920×1080, 16:9, AAC 320 kbps, 24/30 fps constant.
- Burn-in-free: provide captions as `.srt` from the final VO (auto-generate, then correct names: *Symbian, MeeGo, Ollila, Elop, Vuori, Huy, Doz, Canalys*).
- Keep a text-free version of every chart overlay for translations.

## When your audio arrives
Send the audio file. I'll:
1. Transcribe and align it to the script to get exact word times.
2. Rewrite `02-storyboard.md` and this timeline with real timestamps.
3. Flag any lines the narrator changed so the fact tags stay accurate.
