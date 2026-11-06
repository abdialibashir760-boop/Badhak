// Single source of truth for the narration. docs/narration.md is generated from this file.
export type Beat = { id: string; section: number; text: string };

export const SECTIONS = [
  { n: 1, title: "The hook" },
  { n: 2, title: "What satellites actually send" },
  { n: 3, title: "The importance of time" },
  { n: 4, title: "How your phone calculates position" },
  { n: 5, title: "Why GPS sometimes fails" },
  { n: 6, title: "The big reveal" },
] as const;

export const BEATS: Beat[] = [
  { id: "B01", section: 1, text: "Your phone can tell you where you are within seconds." },
  { id: "B02", section: 1, text: "But the satellites helping it do that are thousands of kilometers above your head." },
  { id: "B03", section: 1, text: "And here's the strange part: they don't need to know you exist." },

  { id: "B04", section: 2, text: "Around twenty thousand kilometers up, a constellation of GPS satellites circles the Earth, completing two orbits every day." },
  { id: "B05", section: 2, text: "Each satellite does one simple job: it broadcasts. Continuously, toward Earth, it sends out a radio signal." },
  { id: "B06", section: 2, text: "That signal carries the exact time it was sent, plus orbital data that tells receivers where the satellite is." },
  { id: "B07", section: 2, text: "To keep that time, every satellite carries atomic clocks, built for extraordinary precision." },
  { id: "B08", section: 2, text: "Your phone never replies. It only listens. The satellites have no idea who is receiving them." },

  { id: "B09", section: 3, text: "So how does a signal become a distance? Through time." },
  { id: "B10", section: 3, text: "Radio waves travel at the speed of light, almost three hundred thousand kilometers every second." },
  { id: "B11", section: 3, text: "Imagine a satellite about twenty-one thousand kilometers away. Its signal needs roughly seven hundredths of a second to arrive." },
  { id: "B12", section: 3, text: "Your phone compares the time stamped in the message with its own clock. Multiply that delay by the speed of light, and you get a distance." },
  { id: "B13", section: 3, text: "In reality, it's far more delicate. One billionth of a second of error moves the answer by about thirty centimeters. So engineers correct the satellite clocks, even for Einstein's relativity, and the phone solves for its own clock error too." },

  { id: "B14", section: 4, text: "Now comes the clever part: trilateration." },
  { id: "B15", section: 4, text: "One satellite tells your phone it is exactly this far away. So you must be somewhere on the surface of a giant sphere." },
  { id: "B16", section: 4, text: "A second satellite adds another sphere. Where they overlap, you get a circle. A third narrows the circle to just two points, and one of them is far out in space." },
  { id: "B17", section: 4, text: "But there is a catch. Your phone's clock is not atomic, so a tiny clock error makes every distance wrong by the same amount." },
  { id: "B18", section: 4, text: "A fourth satellite fixes that. Four measurements let the phone solve four unknowns: its position in three dimensions, and its clock error." },
  { id: "B19", section: 4, text: "The spheres snap together at a single point. That point is you." },

  { id: "B20", section: 5, text: "Of course, GPS isn't magic. Sometimes it gets things wrong." },
  { id: "B21", section: 5, text: "Between tall buildings, the signals can be blocked completely." },
  { id: "B22", section: 5, text: "Or they bounce off glass and concrete, and arrive late, making a satellite look farther away than it really is." },
  { id: "B23", section: 5, text: "If the satellites you can see are bunched together, the circles of possibility cross at a shallow angle, and the error grows." },
  { id: "B24", section: 5, text: "The atmosphere also slows the signals, and small phone antennas pick up faint signals imperfectly. Some newer phones listen on two frequencies to reduce that atmospheric error." },
  { id: "B25", section: 5, text: "Phones often blend in Wi-Fi and mobile network clues too, but those are separate from GPS itself." },

  { id: "B26", section: 6, text: "Now, pull back." },
  { id: "B27", section: 6, text: "Dozens of satellites, orbiting in six planes, wrap the planet in timing signals, around the clock." },
  { id: "B28", section: 6, text: "GPS is, at its heart, a timing and distance-measurement system." },
  { id: "B29", section: 6, text: "Your phone doesn't need to be watched from space. It listens to signals, measures time, and uses mathematics to work out where it is." },
];

export const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;
