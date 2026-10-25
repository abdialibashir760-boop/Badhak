/** Heart-rate model shared by the Body scene visuals and the heartbeat sound effect. */
const BPM0 = 64;
const BPM1 = 128;
const FPS = 30;

/** Cumulative beats elapsed by `frame` (scene-local) over a scene of `dur` frames. */
export const beatsAt = (frame: number, dur: number) => {
  const f = Math.max(0, frame);
  const bpm = BPM0 + ((BPM1 - BPM0) * f) / (2 * dur);
  return (f * bpm) / (60 * FPS);
};

/** Local frames at which each beat lands. */
export const beatFrames = (dur: number): number[] => {
  const out: number[] = [];
  let next = 0;
  for (let f = 0; f < dur; f++) {
    if (beatsAt(f, dur) >= next) {
      out.push(f);
      next = Math.floor(beatsAt(f, dur)) + 1;
    }
  }
  return out;
};
