// All timing comes from the recorded narration (narration.wav, 42.84 s).
// Each clause below was located from the silences in the audio.
export const FPS = 30;
export const DURATION_S = 42.84;
export const TOTAL_FRAMES = Math.ceil(DURATION_S * FPS);

export type Seg = { t0: number; t1: number; text: string };

export const SEGS: Seg[] = [
  { t0: 0.28, t1: 4.22, text: "You trust a metal box hanging on steel cables, nine floors up." },
  { t0: 4.93, t1: 6.5, text: "So why doesn't it ever fall?" },
  { t0: 7.63, t1: 8.27, text: "Look at the top." },
  { t0: 8.93, t1: 10.15, text: "The cabin isn't alone." },
  { t0: 10.67, t1: 11.84, text: "It has a secret partner." },
  { t0: 12.57, t1: 14.01, text: "The cables loop over a wheel." },
  { t0: 14.71, t1: 15.74, text: "The cabin goes down," },
  { t0: 16.2, t1: 17.27, text: "the counterweight goes up." },
  { t0: 18.03, t1: 18.99, text: "They balance each other," },
  { t0: 19.36, t1: 20.24, text: "like a seesaw." },
  { t0: 20.92, t1: 21.58, text: "That's the trick." },
  { t0: 22.18, t1: 24.48, text: "The counterweight cancels most of the weight." },
  { t0: 25.09, t1: 26.84, text: "The motor only moves the difference," },
  { t0: 27.19, t1: 28.62, text: "so it uses far less power." },
  { t0: 29.68, t1: 30.8, text: "And if everything fails?" },
  { t0: 31.61, t1: 34.48, text: "A speed sensor feels the cabin falling too fast," },
  { t0: 34.85, t1: 36.88, text: "and steel clamps lock onto the rails." },
  { t0: 37.88, t1: 39.64, text: "So next time you step in," },
  { t0: 40.03, t1: 42.45, text: "remember: you're riding on a perfectly balanced seesaw." },
];

// Scene boundaries (mid-pause between paragraphs) for the progress bar.
export const SCENE_BOUNDS = [0, 7.0, 12.2, 20.6, 29.1, 37.4, DURATION_S];

export const EMPHASIS = new Set(["fall?", "secret", "partner", "counterweight", "seesaw", "trick", "difference", "fails?", "clamps", "balanced", "cancels", "power"]);

export type Word = { w: string; t0: number; t1: number; hot: boolean };

export const WORDS: Word[] = SEGS.flatMap((s) => {
  const ws = s.text.split(" ");
  const weights = ws.map((w) => w.length + 2);
  const total = weights.reduce((a, b) => a + b, 0);
  let acc = 0;
  return ws.map((w, i) => {
    const a = s.t0 + (acc / total) * (s.t1 - s.t0);
    acc += weights[i];
    const b = s.t0 + (acc / total) * (s.t1 - s.t0);
    const clean = w.replace(/[.,:]/g, "");
    return { w: clean, t0: a, t1: b, hot: EMPHASIS.has(clean.toLowerCase()) };
  });
});
