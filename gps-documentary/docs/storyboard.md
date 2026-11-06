# Storyboard — 54 shots · 4:00 · 1920×1080 · 30 fps

Times are generated from `src/timeline.ts`; they re-flow automatically when the recorded voice-over is measured (`npm run retime`).

## Chapter 1 — The hook  (0:00–0:21)

| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |
|---|---|---|---|---|---|---|
| s01 | 0:00.0 | 2.0 s | **Thumb taps Maps** | Night street. A hand holds a phone; a thumb taps the Maps icon. | Sets up the everyday moment. | blip |
| s02 | 0:02.0 | 4.5 s | **Blue dot lands** | The map loads and a blue location dot snaps into place almost instantly. | "Within seconds." | lock |
| s03 | 0:06.4 | 2.4 s | **Push into the screen** | Camera dives into the map toward the blue dot, streets scaling up. | Transition from the phone to the question of 'where from?' | whoosh |
| s04 | 0:08.8 | 3.6 s | **Break through to space** | From the surface the camera rockets away: curvature appears, then the whole Earth and three satellites. | "Thousands of kilometers above your head." | whoosh_big |
| s05 | 0:12.5 | 2.6 s | **Satellites in orbit** | Earth wide; three GPS satellites sweep along their orbits with altitude callouts. | Introduces the actors. | — |
| s06 | 0:15.1 | 2.6 s | **They don't know you exist** | Broadcast cones sweep over the planet; a single dim phone dot sits unaddressed. | One-way broadcast: no one is targeting you. | chirp |
| s07 | 0:17.7 | 3.5 s | **Title card** | HOW GPS KNOWS EXACTLY WHERE YOU ARE over a slow orbit shot. | Title. | boom |

## Chapter 2 — What satellites actually send  (0:21–0:57)

| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |
|---|---|---|---|---|---|---|
| s08 | 0:21.2 | 8.3 s | **Constellation time-lapse** | 24-satellite constellation time-lapsed; a counter shows two laps per day. | 20,200 km, two orbits a day. | riser |
| s09 | 0:29.5 | 3.6 s | **Hero satellite** | Close-up of a GPS satellite: gold bus, sun-tracking solar arrays, Earth-facing antenna. | What the transmitter looks like. | — |
| s10 | 0:33.1 | 3.6 s | **It broadcasts** | Wavefronts expand in a cone that lights the visible Earth. | "Continuously, toward Earth." | chirp |
| s11 | 0:36.7 | 4.5 s | **What the signal carries** | Data cards unfold from a signal: time sent, orbit data, clock correction; bitstream flows. | Contents of the navigation message. | data |
| s12 | 0:41.2 | 3.6 s | **Orbit data = where I am** | A satellite on its orbit path with a 'position at time t' tag. | Receivers learn where the satellite is. | — |
| s13 | 0:44.7 | 5.7 s | **Atomic clock** | Cutaway into the satellite: an atomic clock with oscillating atoms and a precise dial. | "Atomic clocks." | tick |
| s14 | 0:50.4 | 3.4 s | **Listen only** | Satellite → phone arrow; the return arrow is struck out. | "Your phone never replies." | — |
| s15 | 0:53.8 | 3.4 s | **Anyone can listen** | Hundreds of phones inside the cone all receive the same broadcast. | "No idea who is receiving them." | ping |

## Chapter 3 — The importance of time  (0:57–1:44)

| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |
|---|---|---|---|---|---|---|
| s16 | 0:57.2 | 5.0 s | **Time becomes distance** | A clock face morphs into a ruler: TIME → DISTANCE. | Thesis of the chapter. | whoosh |
| s17 | 1:02.3 | 6.5 s | **Light laps the Earth** | A light pulse circles the planet; counter: 7.5 laps per second. | Speed of light ≈ 300,000 km/s. | riser |
| s18 | 1:08.7 | 5.0 s | **The 21,000 km trip** | Side view: satellite to phone with a ruler and a running stopwatch. | Signal takes ≈ 0.07 s. | chirp |
| s19 | 1:13.8 | 3.0 s | **0.070 s** | Stopwatch macro stops at 0.070 s. | Seven hundredths of a second. | ping |
| s20 | 1:16.8 | 5.7 s | **Sent vs received** | Two clocks: time stamped on the message vs the phone's clock; the gap highlighted. | Phone compares the stamp with its own clock. | — |
| s21 | 1:22.5 | 5.1 s | **d = c × Δt** | Equation builds with numbers: 299,792 km/s × 0.070 s ≈ 21,000 km. | Multiply delay by speed of light. | blip |
| s22 | 1:27.6 | 5.5 s | **1 ns = 30 cm** | A nanosecond bar next to a 30 cm ruler. | "One billionth of a second ≈ thirty centimeters." | tick |
| s23 | 1:33.1 | 6.6 s | **Einstein's correction** | Spacetime well: satellite clock ticks slightly faster than a ground clock. | "Even for Einstein's relativity." | — |
| s24 | 1:39.7 | 4.4 s | **The phone's own clock** | Cheap quartz clock with a question mark: an unknown the phone must solve for. | "The phone solves for its own clock error." | — |

## Chapter 4 — How your phone calculates position  (1:44–2:34)

| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |
|---|---|---|---|---|---|---|
| s25 | 1:44.1 | 3.5 s | **Trilateration** | TRILATERATION title assembles from intersecting circles. | Chapter title. | whoosh |
| s26 | 1:47.5 | 5.4 s | **One sphere** | A glowing sphere of radius = measured distance around satellite 1. | "Somewhere on a giant sphere." | chirp |
| s27 | 1:52.9 | 4.3 s | **Sphere meets Earth** | Zoom to where the sphere cuts the planet: a huge ring of possible places. | Still millions of possibilities. | — |
| s28 | 1:57.2 | 4.6 s | **Two spheres → circle** | Second sphere appears; their overlap glows as a circle. | "Where they overlap, a circle." | ping |
| s29 | 2:01.8 | 4.6 s | **Three spheres → two points** | Third sphere cuts the circle in two points. | "Just two points." | ping |
| s30 | 2:06.4 | 3.7 s | **One is out in space** | Camera pulls back: one point on the ground, its mirror far out in space. | "One of them is far out in space." | — |
| s31 | 2:10.0 | 6.3 s | **A clock error inflates every sphere** | All spheres swell by the same amount and miss each other. | "Every distance wrong by the same amount." | error |
| s32 | 2:16.3 | 3.8 s | **1 ms = 300 km** | Readout: a 1 millisecond clock error becomes ≈ 300 km of range error. | Why a cheap clock matters. | — |
| s33 | 2:20.1 | 5.5 s | **The fourth sphere** | Fourth sphere added; clock-error slider sweeps until all four meet. | A fourth measurement cancels clock error. | riser |
| s34 | 2:25.7 | 3.7 s | **Four unknowns** | Four equations; unknowns x, y, z and clock error b light up. | "Four unknowns." | — |
| s35 | 2:29.4 | 3.1 s | **Snap** | Four spheres collapse onto a single glowing point; confirmation chime. | "That point is you." | lock |
| s36 | 2:32.4 | 2.2 s | **On the map** | The fix appears on the map as a blue dot with an accuracy circle. | Result on the user's screen. | — |

## Chapter 5 — Why GPS sometimes fails  (2:34–3:19)

| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |
|---|---|---|---|---|---|---|
| s37 | 2:34.6 | 5.0 s | **Into the city** | A city of tall buildings; the camera drops toward street level. | "GPS isn't magic." | whoosh |
| s38 | 2:39.7 | 2.4 s | **Blocked** | A satellite signal hits a tower and stops; a red 'blocked' tag appears. | "Blocked completely." | error |
| s39 | 2:42.0 | 1.7 s | **Sky plot** | A sky-plot with the skyline mask: satellites behind buildings go dark. | Fewer visible satellites. | — |
| s40 | 2:43.7 | 4.2 s | **Bouncing signals** | Direct path blocked; the signal reflects off a glass façade and reaches the phone. | "Bounce off glass and concrete." | reflect |
| s41 | 2:47.9 | 4.2 s | **Arriving late** | Timeline: direct vs reflected arrival; extra path in metres; the map dot jumps. | "Arrive late… farther away." | tick |
| s42 | 2:52.2 | 4.9 s | **Bunched satellites** | Satellites clustered: ranging circles cross at a shallow angle; uncertainty stretches. | "Cross at a shallow angle." | — |
| s43 | 2:57.0 | 4.4 s | **Spread satellites** | Satellites well spread: circles cross cleanly and the error shrinks. | Good vs bad geometry. | — |
| s44 | 3:01.4 | 5.6 s | **Atmosphere slows it** | Signal passes through ionosphere and troposphere, bending and slowing. | "The atmosphere also slows the signals." | — |
| s45 | 3:07.0 | 5.6 s | **Inside the phone** | Exploded phone: tiny antenna, GNSS chip; L1 and L5 bands. | "Small antennas… two frequencies." | data |
| s46 | 3:12.7 | 7.3 s | **GPS vs Wi-Fi and cells** | Wi-Fi and cell-tower icons assist, but are labelled 'not GPS'. | Not to confuse GPS with network location. | — |

## Chapter 6 — The big reveal  (3:19–4:00)

| # | Time | Dur | Shot | What you see | How it explains the narration | Sound |
|---|---|---|---|---|---|---|
| s47 | 3:19.9 | 4.8 s | **Back to the phone** | The same night street and phone, mirroring the opening. | "Now, pull back." | whoosh |
| s48 | 3:24.7 | 3.2 s | **Pull back to Earth** | From the phone, the camera pulls back through the sky to the full Earth. | Reveal. | whoosh_big |
| s49 | 3:27.8 | 3.2 s | **Six planes** | 24 satellites on six orbital planes; the planes light up one by one. | "Orbiting in six planes." | — |
| s50 | 3:31.0 | 2.5 s | **A blanket of signals** | Footprints of many satellites overlap across the planet. | "Wrap the planet in timing signals." | chirp |
| s51 | 3:33.5 | 6.0 s | **Time → distance → position** | Close on the phone: three beams, range circles crossing, three labels light in turn. | "A timing and distance-measurement system." | ping |
| s52 | 3:39.5 | 6.7 s | **The fix** | Marker locks on the phone; fix card shows coordinates. | "Works out where it is." | lock |
| s53 | 3:46.1 | 5.4 s | **Final pull-back** | Last slow pull-back to the whole orbiting constellation. | Closing image. | — |
| s54 | 3:51.5 | 8.4 s | **End card** | Title and sources card over a dark Earth limb. | Outro. | boom |

## Reusable components

| Component | File | Used for |
|---|---|---|
| Earth (dot-matrix land, day/night terminator, atmosphere, LOD) | `src/components/Earth.tsx` | every globe shot |
| Satellite model + orbit rings + mini constellation icons | `src/components/SatModel.tsx` | satellites, orbits, constellation |
| Radio signals: broadcast cones, range circles, beams, packets | `src/components/Signals.tsx` | broadcast, travel time, trilateration |
| Smartphone (3-D slab with map screen) and lock marker | `src/components/Phone3D.tsx`, `Marker.tsx` | every phone shot |
| Digital map (procedural, level of detail) | `src/components/MapView.tsx` | hook, fix, multipath |
| Distance spheres, intersection circle, two-point solver | `src/scenes/trilat.tsx` | trilateration |
| Urban environment + ray tracing (line of sight, sky plot, reflections) | `src/scenes/cityModel.ts`, `city.tsx` | failure modes |
| HUD kit (callouts, altitude ruler, stat cards) | `src/components/Hud.tsx` | all |
