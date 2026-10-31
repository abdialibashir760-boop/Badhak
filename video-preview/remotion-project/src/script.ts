export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Set to true once public/audio/vo.mp3 (the two Fish Audio parts joined) exists.
export const HAS_AUDIO = false;

export type Side = "title" | "criminal" | "detectives" | "outro";
export type Visual =
  | "house"
  | "road"
  | "glass"
  | "swap"
  | "match"
  | "wash"
  | "paint"
  | "shop"
  | "recorder"
  | "caught";

export type Tag = {
  text: string;
  color: "yellow" | "red" | "blue" | "purple";
  at: number; // 0..1 position within the scene
  y: number; // px from top
  x?: number;
};

export type Scene = {
  side: Side;
  visual: Visual;
  clock?: string;
  text: string; // narration, split into words for captions
  seconds: number; // ESTIMATE until synced with the real audio
  tags?: Tag[];
  highlight?: string[]; // words rendered gold
};

// Narration is exactly what was sent to the voice model.
export const SCENES: Scene[] = [
  {
    side: "title",
    visual: "house",
    text: "He repaired the car. Washed it. Hid the evidence. Think that makes it clean? Here is how detectives catch a hit and run driver.",
    seconds: 9,
    highlight: ["clean?", "detectives"],
  },
  {
    side: "criminal",
    visual: "road",
    clock: "11:42 PM",
    text: "11:42 PM. The driver hits a cyclist and speeds away.",
    seconds: 4,
    highlight: ["hits", "speeds"],
  },
  {
    side: "detectives",
    visual: "glass",
    text: "Detectives find glass on the road. Tiny headlight fragments.",
    seconds: 4,
    tags: [{ text: "HEADLIGHT GLASS", color: "blue", at: 0.35, y: 520 }],
    highlight: ["glass", "fragments."],
  },
  {
    side: "criminal",
    visual: "swap",
    clock: "12:30 AM",
    text: "12:30 AM. He swaps the broken headlight for a brand new one.",
    seconds: 4,
    tags: [{ text: "BRAND NEW", color: "red", at: 0.55, y: 520 }],
    highlight: ["swaps", "new"],
  },
  {
    side: "detectives",
    visual: "match",
    text: "But the glass on the road still matches. Same refractive index. Same car.",
    seconds: 5,
    tags: [
      { text: "REFRACTIVE INDEX", color: "yellow", at: 0.3, y: 470 },
      { text: "MATCH", color: "blue", at: 0.7, y: 1250 },
    ],
    highlight: ["matches.", "refractive", "index."],
  },
  {
    side: "criminal",
    visual: "wash",
    clock: "2:10 AM",
    text: "2:10 AM. He washes the car and scrubs the bumper.",
    seconds: 4,
    tags: [{ text: "SCRUBBED CLEAN", color: "yellow", at: 0.5, y: 520 }],
    highlight: ["washes", "scrubs"],
  },
  {
    side: "detectives",
    visual: "paint",
    text: "But paint transfer survives. Flecks of the bike's paint, trapped in the wheel arch.",
    seconds: 6,
    tags: [
      { text: "PAINT TRANSFER", color: "purple", at: 0.3, y: 470 },
      { text: "WHEEL ARCH", color: "blue", at: 0.6, y: 1180 },
    ],
    highlight: ["survives.", "trapped"],
  },
  {
    side: "criminal",
    visual: "shop",
    clock: "4:05 AM",
    text: "4:05 AM. He pays cash for a quick repair.",
    seconds: 3.5,
    tags: [{ text: "CASH ONLY", color: "red", at: 0.5, y: 520 }],
    highlight: ["cash", "repair."],
  },
  {
    side: "detectives",
    visual: "recorder",
    text: "But the car's event recorder kept the speed, and the braking, right before impact.",
    seconds: 6,
    tags: [
      { text: "EVENT RECORDER", color: "yellow", at: 0.25, y: 470 },
      { text: "BRAKING: LATE", color: "red", at: 0.7, y: 1250 },
    ],
    highlight: ["recorder", "speed,", "braking,"],
  },
  {
    side: "outro",
    visual: "caught",
    text: "A repaired car is still a witness. Follow for the next case file.",
    seconds: 5,
    tags: [{ text: "CAUGHT", color: "red", at: 0.1, y: 300 }],
    highlight: ["witness.", "caught"],
  },
];

export const TOTAL_SECONDS = SCENES.reduce((a, s) => a + s.seconds, 0);
export const TOTAL_FRAMES = Math.round(TOTAL_SECONDS * FPS);

export const COLORS = {
  ink: "#0b1220",
  navy: "#101a2e",
  cyan: "#4fd8ff",
  glow: "#8be9ff",
  yellow: "#ffcf2e",
  red: "#e23d3d",
  blue: "#2f7bff",
  purple: "#8a4dff",
  white: "#ffffff",
};
