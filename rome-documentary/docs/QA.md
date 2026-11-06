# QA report

## Automated checks (final MP4)
- **Format:** H.264 + AAC, 1920×1080, 30 fps, 7,628 frames, 4:14.3.
- **Black frames:** only the 0.2 s fade-in at the start. **Frozen frames:** none ≥1.2 s. **Silence ≥2.5 s:** none.
- **Loudness:** −16.1 LUFS integrated, true peak −3.6 dBFS.
- **Sync:** every shot is timed to the narration sentence(s) it illustrates from one master clock (`audio/timeline.json`); the score, sound design and voice are placed from the same clock. Spot-checked frames at 12 key sentences (hook, 753 BCE, Italy conquest, Hannibal, Zama, Rubicon, Caesar's dictatorship, Augustus, roads, Trajan, distances, modern map): picture matches line each time.

## Defects found and fixed
| Found | Fix |
|---|---|
| Rome not visible during its "highlight" (glow used a screen blend that vanishes on parchment; city hidden before conquest clock) | Warm source-over glow; Rome forced visible while highlighted |
| Year badge showed 254 BCE for Hannibal (218 BCE), 44 BCE for the Civil War (49–45), etc. | Per-shot year overrides tied to the narrated dates |
| Sicily/Sardinia turned red before the Italian peninsula was finished | Islands now follow their own conquest dates (264–238 BCE) |
| Zama elephants charged through the Roman line | Elephants stop at the line |
| Roman roads too thin to read | Heavier casing + line |
| Coin spun edge-on at mid-shot | Spin decelerates to face-on |
| "Caesar's triumph" scene was mirrored, so the arch inscription read backwards | Replaced with an un-mirrored dusk variant; affected frames re-rendered and spliced |
| 929 MB render (film grain) | Re-encoded; repository copy is CRF 27 (52 MB), CRF 23 master kept locally |

## Known limitations (be aware before publishing)
- **Illustrations are stylised vector art, not photoreal reconstructions.** No photographs or third-party images are used (the network could not reach public-domain archives).
- **Narration is synthetic speech** (Kokoro `bm_george`): clear and consistent, but not a human performance. For a premium read, record or generate `script/narration.json` with a studio voice and re-run the timeline/audio steps.
- **Music is synthesised in code** (strings, brass, choir, harp, timpani). It is original and licence-free but sounds like a virtual orchestra, not a recorded one.
- **Maps are schematic.** Hannibal's pass and the Zama site are uncertain in the sources; the 117 CE outline and routes are documentary-scale approximations; Armenia/Mesopotamia were held only briefly (116–117 CE) and the northern British frontier shown is the pre-Hadrian line.
- The Cannae and manipular-legion shots are diagrams, simplified.
- The hook uses a lively city (market, soldiers) while the narration says "a small city" — intentional contrast with Rome's later scale, but worth noting.
