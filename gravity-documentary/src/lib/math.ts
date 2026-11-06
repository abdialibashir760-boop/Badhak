export const TAU = Math.PI * 2;
export const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Normalised progress of t through [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));

export const ease = {
  inOut: (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t)),
  out: (t: number) => 1 - Math.pow(1 - clamp(t), 3),
  in: (t: number) => Math.pow(clamp(t), 3),
  outQuint: (t: number) => 1 - Math.pow(1 - clamp(t), 5),
};

/** Smooth 0→1 ramp between a and b (cosine ease in-out). */
export const smooth = (t: number, a: number, b: number) => ease.inOut(seg(t, a, b));
/** Fade in at a, fade out at b (each over `f` seconds). */
export const window01 = (t: number, a: number, b: number, f = 0.5) =>
  Math.min(seg(t, a, a + f), 1 - seg(t, b - f, b));

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Solve Kepler's equation E − e·sin E = M by Newton iteration. */
export function keplerE(M: number, e: number): number {
  let E = M + e * Math.sin(M);
  for (let i = 0; i < 30; i++) {
    const d = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= d;
    if (Math.abs(d) < 1e-11) break;
  }
  return E;
}

/** Position (x, y) in the orbital plane relative to the focus; periapsis on the +x axis rotated by omega. */
export function kepler2D(a: number, e: number, M: number, omega = 0) {
  const E = keplerE(M, e);
  const b = a * Math.sqrt(1 - e * e);
  const xo = a * (Math.cos(E) - e);
  const yo = b * Math.sin(E);
  return { x: xo * Math.cos(omega) - yo * Math.sin(omega), y: xo * Math.sin(omega) + yo * Math.cos(omega) };
}

export const pad2 = (n: number) => String(Math.floor(n)).padStart(2, '0');
export const mmss = (s: number) => `${Math.floor(s / 60)}:${pad2(s % 60)}`;
