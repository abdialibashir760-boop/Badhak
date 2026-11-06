# Technical source notes

Every number on screen or in the narration, where it comes from, and where the animation simplifies.

## Facts used

| Claim in the film | Value used | Source |
|---|---|---|
| Orbit height | ≈ 20,200 km (orbit radius 26,560 km) | GPS.gov *Space Segment*; IS-GPS-200 (nominal semi-major axis 26,560 km) |
| Orbital period / laps per day | 11 h 58 min (half a sidereal day) → two orbits a day | GPS.gov *Space Segment* |
| Orbital planes / inclination | six planes, 55° inclination | GPS.gov *Space Segment* |
| Constellation size | nominal 24 slots; 31 operational satellites ("dozens") | GPS.gov *Space Segment* (the count changes over time) |
| What is broadcast | time of transmission, orbital data (ephemeris/almanac) and clock-correction terms in the navigation message; 50 bit/s | IS-GPS-200 (navigation message, §20) |
| Each satellite has its own code | unique PRN code per satellite, 1.023 Mchip/s C/A code | IS-GPS-200 |
| Signal frequencies | L1 = 1575.42 MHz = 154 × 10.23 MHz; L5 = 1176.45 MHz | IS-GPS-200, IS-GPS-705 |
| Atomic clocks | rubidium and cesium clocks on board | GPS.gov / US Space Force GPS fact sheets |
| Receiver is passive | GPS is one-way broadcast; receivers only listen | GPS.gov *Space Segment / User Segment* |
| Speed of light | 299,792.458 km/s (exact by SI definition) | BIPM SI Brochure |
| Light laps the Earth | 299,792 / 40,075 km ≈ 7.5 laps per second | arithmetic (equatorial circumference 40,075 km) |
| 1 ns ↔ distance | c × 1 ns = 29.98 cm ≈ 30 cm | arithmetic |
| 1 µs ↔ 300 m, 1 ms ↔ 300 km | c × 1 µs = 299.8 m; c × 1 ms = 299.8 km | arithmetic |
| Signal travel time | 67 ms straight overhead (20,200 km) to ≈ 86 ms at the horizon (25,785 km); the film's ≈ 21,000 km / 0.07 s example is mid-range | arithmetic; the on-screen readout uses the film's own geometry (≈ 20,800–21,900 km, 69–73 ms) |
| Relativity | satellite clocks run ≈ +45 µs/day (weaker gravity) and −7 µs/day (speed): net ≈ +38 µs/day; compensated before launch | Ashby, *Relativity in the Global Positioning System*, Living Reviews in Relativity 6 (2003) |
| Why four satellites | unknowns: x, y, z and receiver clock bias b → four pseudorange equations | Kaplan & Hegarty, *Understanding GPS/GNSS* (3rd ed.); Misra & Enge, *GPS: Signals, Measurements, and Performance* |
| Position accuracy | smartphones typically within a 4.9 m (16 ft) radius under open sky | GPS.gov *GPS Accuracy* |
| Geometry (DOP) | error grows as ranging circles cross at a shallow angle | Kaplan & Hegarty, ch. 7 |
| Multipath / blockage | reflected paths are longer → delayed pseudorange; dense cities reduce visible satellites | Kaplan & Hegarty, ch. 7 |
| Atmospheric delay | ionosphere ≈ 60–1,000 km up, troposphere to ≈ 12 km; both slow/bend the signal; dual-frequency (L1 + L5) receivers cancel most of the ionospheric part | Kaplan & Hegarty; GSA *GNSS User Technology Report* |
| Altitude ruler | space station ≈ 400 km, GPS 20,200 km, geostationary 35,786 km | NASA / GPS.gov |
| Wi-Fi / mobile "assist" | phones blend network clues with GNSS; these are separate systems from GPS | Apple and Android location documentation (A-GPS) |
| Coastlines | Natural Earth 1:50 m land, public domain | naturalearthdata.com (via the `world-atlas` package) |

## What the animation simplifies (artistic licence, stated on screen where it matters)

- **Time is slowed.** Orbits are time-lapsed ≈ 200×, and the broadcast wavefronts travel at 6,800 km/s instead of 299,792 km/s so you can see them. The numbers in the HUD (e.g. "71.7 ms") are the true travel times for the film's geometry.
- **Objects are enlarged.** Satellites and the phone are drawn thousands of times larger than life; orbit radius and Earth size are to scale.
- **Spheres.** What the phone measures are *pseudoranges* (true range + c·b). The film draws them as spheres, then shows the clock-error sweep that makes the four spheres meet.
- **The second of the two points.** With three satellites above the horizon the second solution lies on the opposite side of the satellites' plane. In the film's geometry it is ≈ 16,000 km above the surface (the narration's "far out in space"). The clock-error visualisation is exaggerated (a 105 km range inflation) so the displacement is visible.
- **Three satellites** are enough for a fix only if the receiver's altitude and clock were known; the film says, correctly, that a fourth removes the clock unknown.
- **Constellation phasing** (four satellites per plane, evenly spaced) is schematic; real satellites occupy specific slots.
- **City** is procedural (not a real place); line-of-sight, sky plot and single-bounce reflections are computed with real ray tracing (image method). The "+10 m / 33 ns" example is the result for that layout.
- **Phone location** is Istanbul (41.0082° N, 28.9784° E); the satellites are placed to be visible from there.
- **Earth does not rotate** during the time-lapse, to keep the satellite motion readable.
