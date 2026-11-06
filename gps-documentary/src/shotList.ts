// Pure data: the shot list (storyboard). Components live in shots.tsx, keyed by `id`.
export type ShotMeta = {
  id: string;
  beat: string; // narration beat (or P0 / T1 / END) whose window this shot shares
  w: number; // relative weight inside that window
  name: string;
  visual: string; // what the viewer sees
  explains: string; // how it supports the narration
  trans?: "fade" | "cut" | "flash" | "sweep"; // transition INTO this shot
  sfx?: [name: string, at: number, vol: number][]; // [file, seconds after shot start, volume]
};

export const SHOT_LIST: ShotMeta[] = [
  // ── 1 · THE HOOK ──────────────────────────────────────────────
  { id: "s01", beat: "P0", w: 1, name: "Thumb taps Maps", trans: "cut", visual: "Night street. A hand holds a phone; a thumb taps the Maps icon.", explains: "Sets up the everyday moment.", sfx: [["blip", 1.0, 0.5]] },
  { id: "s02", beat: "B01", w: 1, name: "Blue dot lands", trans: "cut", visual: "The map loads and a blue location dot snaps into place almost instantly.", explains: "\"Within seconds.\"", sfx: [["lock", 0.9, 0.5]] },
  { id: "s03", beat: "B02", w: 1, name: "Push into the screen", visual: "Camera dives into the map toward the blue dot, streets scaling up.", explains: "Transition from the phone to the question of 'where from?'", sfx: [["whoosh", 0.1, 0.5]] },
  { id: "s04", beat: "B02", w: 1.5, name: "Break through to space", trans: "flash", visual: "From the surface the camera rockets away: curvature appears, then the whole Earth and three satellites.", explains: "\"Thousands of kilometers above your head.\"", sfx: [["whoosh_big", 0.0, 0.8]] },
  { id: "s05", beat: "B03", w: 1, name: "Satellites in orbit", visual: "Earth wide; three GPS satellites sweep along their orbits with altitude callouts.", explains: "Introduces the actors." },
  { id: "s06", beat: "B03", w: 1, name: "They don't know you exist", visual: "Broadcast cones sweep over the planet; a single dim phone dot sits unaddressed.", explains: "One-way broadcast: no one is targeting you.", sfx: [["chirp", 0.3, 0.35]] },
  { id: "s07", beat: "T1", w: 1, name: "Title card", visual: "HOW GPS KNOWS EXACTLY WHERE YOU ARE over a slow orbit shot.", explains: "Title.", sfx: [["boom", 0.2, 0.7]] },

  // ── 2 · WHAT SATELLITES SEND ──────────────────────────────────
  { id: "s08", beat: "B04", w: 1, name: "Constellation time-lapse", visual: "24-satellite constellation time-lapsed; a counter shows two laps per day.", explains: "20,200 km, two orbits a day.", sfx: [["riser", 0.0, 0.4]] },
  { id: "s09", beat: "B05", w: 1, name: "Hero satellite", visual: "Close-up of a GPS satellite: gold bus, sun-tracking solar arrays, Earth-facing antenna.", explains: "What the transmitter looks like." },
  { id: "s10", beat: "B05", w: 1, name: "It broadcasts", visual: "Wavefronts expand in a cone that lights the visible Earth.", explains: "\"Continuously, toward Earth.\"", sfx: [["chirp", 0.2, 0.5]] },
  { id: "s11", beat: "B06", w: 1, name: "What the signal carries", visual: "Data cards unfold from a signal: time sent, orbit data, clock correction; bitstream flows.", explains: "Contents of the navigation message.", sfx: [["data", 0.4, 0.4]] },
  { id: "s12", beat: "B06", w: 0.8, name: "Orbit data = where I am", visual: "A satellite on its orbit path with a 'position at time t' tag.", explains: "Receivers learn where the satellite is." },
  { id: "s13", beat: "B07", w: 1, name: "Atomic clock", visual: "Cutaway into the satellite: an atomic clock with oscillating atoms and a precise dial.", explains: "\"Atomic clocks.\"", sfx: [["tick", 0.5, 0.4]] },
  { id: "s14", beat: "B08", w: 1, name: "Listen only", visual: "Satellite → phone arrow; the return arrow is struck out.", explains: "\"Your phone never replies.\"" },
  { id: "s15", beat: "B08", w: 1, name: "Anyone can listen", visual: "Hundreds of phones inside the cone all receive the same broadcast.", explains: "\"No idea who is receiving them.\"", sfx: [["ping", 0.4, 0.3]] },

  // ── 3 · THE IMPORTANCE OF TIME ────────────────────────────────
  { id: "s16", beat: "B09", w: 1, name: "Time becomes distance", trans: "sweep", visual: "A clock face morphs into a ruler: TIME → DISTANCE.", explains: "Thesis of the chapter.", sfx: [["whoosh", 0.0, 0.45]] },
  { id: "s17", beat: "B10", w: 1, name: "Light laps the Earth", visual: "A light pulse circles the planet; counter: 7.5 laps per second.", explains: "Speed of light ≈ 300,000 km/s.", sfx: [["riser", 0.0, 0.3]] },
  { id: "s18", beat: "B11", w: 1, name: "The 21,000 km trip", visual: "Side view: satellite to phone with a ruler and a running stopwatch.", explains: "Signal takes ≈ 0.07 s.", sfx: [["chirp", 0.3, 0.5]] },
  { id: "s19", beat: "B11", w: 0.6, name: "0.070 s", visual: "Stopwatch macro stops at 0.070 s.", explains: "Seven hundredths of a second.", sfx: [["ping", 0.2, 0.5]] },
  { id: "s20", beat: "B12", w: 1, name: "Sent vs received", visual: "Two clocks: time stamped on the message vs the phone's clock; the gap highlighted.", explains: "Phone compares the stamp with its own clock." },
  { id: "s21", beat: "B12", w: 0.9, name: "d = c × Δt", visual: "Equation builds with numbers: 299,792 km/s × 0.070 s ≈ 21,000 km.", explains: "Multiply delay by speed of light.", sfx: [["blip", 0.5, 0.5]] },
  { id: "s22", beat: "B13", w: 1, name: "1 ns = 30 cm", visual: "A nanosecond bar next to a 30 cm ruler.", explains: "\"One billionth of a second ≈ thirty centimeters.\"", sfx: [["tick", 0.2, 0.4]] },
  { id: "s23", beat: "B13", w: 1.2, name: "Einstein's correction", visual: "Spacetime well: satellite clock ticks slightly faster than a ground clock.", explains: "\"Even for Einstein's relativity.\"" },
  { id: "s24", beat: "B13", w: 0.8, name: "The phone's own clock", visual: "Cheap quartz clock with a question mark: an unknown the phone must solve for.", explains: "\"The phone solves for its own clock error.\"" },

  // ── 4 · HOW THE PHONE CALCULATES POSITION ─────────────────────
  { id: "s25", beat: "B14", w: 1, name: "Trilateration", trans: "sweep", visual: "TRILATERATION title assembles from intersecting circles.", explains: "Chapter title.", sfx: [["whoosh", 0.0, 0.5]] },
  { id: "s26", beat: "B15", w: 1, name: "One sphere", visual: "A glowing sphere of radius = measured distance around satellite 1.", explains: "\"Somewhere on a giant sphere.\"", sfx: [["chirp", 0.3, 0.5]] },
  { id: "s27", beat: "B15", w: 0.8, name: "Sphere meets Earth", visual: "Zoom to where the sphere cuts the planet: a huge ring of possible places.", explains: "Still millions of possibilities." },
  { id: "s28", beat: "B16", w: 1, name: "Two spheres → circle", visual: "Second sphere appears; their overlap glows as a circle.", explains: "\"Where they overlap, a circle.\"", sfx: [["ping", 0.6, 0.5]] },
  { id: "s29", beat: "B16", w: 1, name: "Three spheres → two points", visual: "Third sphere cuts the circle in two points.", explains: "\"Just two points.\"", sfx: [["ping", 0.5, 0.5]] },
  { id: "s30", beat: "B16", w: 0.8, name: "One is out in space", visual: "Camera pulls back: one point on the ground, its mirror far out in space.", explains: "\"One of them is far out in space.\"" },
  { id: "s31", beat: "B17", w: 1, name: "A clock error inflates every sphere", visual: "All spheres swell by the same amount and miss each other.", explains: "\"Every distance wrong by the same amount.\"", sfx: [["error", 0.5, 0.35]] },
  { id: "s32", beat: "B17", w: 0.6, name: "1 ms = 300 km", visual: "Readout: a 1 millisecond clock error becomes ≈ 300 km of range error.", explains: "Why a cheap clock matters." },
  { id: "s33", beat: "B18", w: 1.2, name: "The fourth sphere", visual: "Fourth sphere added; clock-error slider sweeps until all four meet.", explains: "A fourth measurement cancels clock error.", sfx: [["riser", 0.2, 0.45]] },
  { id: "s34", beat: "B18", w: 0.8, name: "Four unknowns", visual: "Four equations; unknowns x, y, z and clock error b light up.", explains: "\"Four unknowns.\"" },
  { id: "s35", beat: "B19", w: 1, name: "Snap", visual: "Four spheres collapse onto a single glowing point; confirmation chime.", explains: "\"That point is you.\"", sfx: [["lock", 0.9, 0.8]] },
  { id: "s36", beat: "B19", w: 0.7, name: "On the map", visual: "The fix appears on the map as a blue dot with an accuracy circle.", explains: "Result on the user's screen." },

  // ── 5 · WHY GPS SOMETIMES FAILS ───────────────────────────────
  { id: "s37", beat: "B20", w: 1, name: "Into the city", trans: "sweep", visual: "A city of tall buildings; the camera drops toward street level.", explains: "\"GPS isn't magic.\"", sfx: [["whoosh", 0.0, 0.5]] },
  { id: "s38", beat: "B21", w: 1, name: "Blocked", visual: "A satellite signal hits a tower and stops; a red 'blocked' tag appears.", explains: "\"Blocked completely.\"", sfx: [["error", 0.9, 0.4]] },
  { id: "s39", beat: "B21", w: 0.7, name: "Sky plot", visual: "A sky-plot with the skyline mask: satellites behind buildings go dark.", explains: "Fewer visible satellites." },
  { id: "s40", beat: "B22", w: 1, name: "Bouncing signals", visual: "Direct path blocked; the signal reflects off a glass façade and reaches the phone.", explains: "\"Bounce off glass and concrete.\"", sfx: [["reflect", 0.8, 0.5]] },
  { id: "s41", beat: "B22", w: 1, name: "Arriving late", visual: "Timeline: direct vs reflected arrival; extra path in metres; the map dot jumps.", explains: "\"Arrive late… farther away.\"", sfx: [["tick", 0.3, 0.4]] },
  { id: "s42", beat: "B23", w: 1, name: "Bunched satellites", visual: "Satellites clustered: ranging circles cross at a shallow angle; uncertainty stretches.", explains: "\"Cross at a shallow angle.\"" },
  { id: "s43", beat: "B23", w: 0.9, name: "Spread satellites", visual: "Satellites well spread: circles cross cleanly and the error shrinks.", explains: "Good vs bad geometry." },
  { id: "s44", beat: "B24", w: 1, name: "Atmosphere slows it", visual: "Signal passes through ionosphere and troposphere, bending and slowing.", explains: "\"The atmosphere also slows the signals.\"" },
  { id: "s45", beat: "B24", w: 1, name: "Inside the phone", visual: "Exploded phone: tiny antenna, GNSS chip; L1 and L5 bands.", explains: "\"Small antennas… two frequencies.\"", sfx: [["data", 0.5, 0.35]] },
  { id: "s46", beat: "B25", w: 1, name: "GPS vs Wi-Fi and cells", visual: "Wi-Fi and cell-tower icons assist, but are labelled 'not GPS'.", explains: "Not to confuse GPS with network location." },

  // ── 6 · THE BIG REVEAL ────────────────────────────────────────
  { id: "s47", beat: "B26", w: 1, name: "Back to the phone", trans: "cut", visual: "The same night street and phone, mirroring the opening.", explains: "\"Now, pull back.\"", sfx: [["whoosh", 1.2, 0.4]] },
  { id: "s48", beat: "B27", w: 1, name: "Pull back to Earth", trans: "flash", visual: "From the phone, the camera pulls back through the sky to the full Earth.", explains: "Reveal.", sfx: [["whoosh_big", 0.0, 0.8]] },
  { id: "s49", beat: "B27", w: 1, name: "Six planes", visual: "24 satellites on six orbital planes; the planes light up one by one.", explains: "\"Orbiting in six planes.\"" },
  { id: "s50", beat: "B27", w: 0.8, name: "A blanket of signals", visual: "Footprints of many satellites overlap across the planet.", explains: "\"Wrap the planet in timing signals.\"", sfx: [["chirp", 0.3, 0.4]] },
  { id: "s51", beat: "B28", w: 1, name: "Time → distance → position", visual: "Close on the phone: three beams, range circles crossing, three labels light in turn.", explains: "\"A timing and distance-measurement system.\"", sfx: [["ping", 0.4, 0.4]] },
  { id: "s52", beat: "B29", w: 1, name: "The fix", visual: "Marker locks on the phone; fix card shows coordinates.", explains: "\"Works out where it is.\"", sfx: [["lock", 0.2, 0.7]] },
  { id: "s53", beat: "B29", w: 0.8, name: "Final pull-back", visual: "Last slow pull-back to the whole orbiting constellation.", explains: "Closing image." },
  { id: "s54", beat: "END", w: 1, name: "End card", trans: "fade", visual: "Title and sources card over a dark Earth limb.", explains: "Outro.", sfx: [["boom", 0.0, 0.4]] },
];
