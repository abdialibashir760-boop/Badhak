import { TAU } from './math';

/** Free fall from rest with bounces (restitution e). Heights in metres, time in seconds. */
export function bounce(t: number, h0: number, g = 9.81, e = 0.45) {
  let tt = t;
  let h = h0;
  let v0 = 0;
  let tf = Math.sqrt((2 * h) / g);
  if (tt < tf) return { y: h - 0.5 * g * tt * tt, v: -g * tt, hit: false };
  tt -= tf;
  v0 = g * tf * e;
  for (let i = 0; i < 8; i++) {
    const air = (2 * v0) / g;
    if (tt < air) return { y: v0 * tt - 0.5 * g * tt * tt, v: v0 - g * tt, hit: true };
    tt -= air;
    v0 *= e;
  }
  return { y: 0, v: 0, hit: true };
}

/** Time of first impact. */
export const fallTime = (h0: number, g = 9.81) => Math.sqrt((2 * h0) / g);

/** Integrate a test particle in a central 1/r² field (symplectic leapfrog). Returns sampled path. */
export function integrateOrbit(opts: { gm: number; r0: number; v0: number; ang0?: number; steps: number; dt: number; soft?: number }) {
  const { gm, r0, v0, ang0 = 0, steps, dt, soft = 0 } = opts;
  let x = Math.cos(ang0) * r0, y = Math.sin(ang0) * r0;
  let vx = -Math.sin(ang0) * v0, vy = Math.cos(ang0) * v0;
  const pts: { x: number; y: number }[] = [{ x, y }];
  const acc = (px: number, py: number) => {
    const d2 = px * px + py * py + soft * soft;
    const d = Math.sqrt(d2);
    return { ax: (-gm * px) / (d2 * d), ay: (-gm * py) / (d2 * d) };
  };
  let a = acc(x, y);
  for (let i = 0; i < steps; i++) {
    vx += 0.5 * dt * a.ax; vy += 0.5 * dt * a.ay;
    x += dt * vx; y += dt * vy;
    a = acc(x, y);
    vx += 0.5 * dt * a.ax; vy += 0.5 * dt * a.ay;
    pts.push({ x, y });
  }
  return pts;
}

/** Real solar-system data (semi-major axis AU, eccentricity, period years, mean orbital speed km/s, colour). */
export const PLANETS = [
  { name: 'Mercury', kind: 'mercury', a: 0.387, e: 0.2056, T: 0.2408, v: 47.4, rad: 0.38 },
  { name: 'Venus', kind: 'venus', a: 0.723, e: 0.0068, T: 0.6152, v: 35.0, rad: 0.95 },
  { name: 'Earth', kind: 'earth', a: 1.0, e: 0.0167, T: 1.0, v: 29.8, rad: 1.0 },
  { name: 'Mars', kind: 'mars', a: 1.524, e: 0.0934, T: 1.8808, v: 24.1, rad: 0.53 },
  { name: 'Jupiter', kind: 'jupiter', a: 5.203, e: 0.0489, T: 11.862, v: 13.1, rad: 11.2 },
  { name: 'Saturn', kind: 'saturn', a: 9.537, e: 0.0565, T: 29.457, v: 9.7, rad: 9.4 },
  { name: 'Uranus', kind: 'uranus', a: 19.19, e: 0.0457, T: 84.02, v: 6.8, rad: 4.0 },
  { name: 'Neptune', kind: 'neptune', a: 30.07, e: 0.0113, T: 164.8, v: 5.4, rad: 3.9 },
] as const;

export { TAU };

/** Damped second-order step response (ζ = 0.55): curvature "switching on" and settling with a little ringing. */
export function massStep(u: number): number {
  if (u <= 0) return 0;
  const zeta = 0.55, w = 4.2;
  const a = zeta * w, wd = w * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-a * u) * (Math.cos(wd * u) + (a / wd) * Math.sin(wd * u));
}

/**
 * Test particle in the plane under a softened potential Φ = −GM/√(r²+s²) centred at (cx, cz).
 * Returns the sampled path; `soft` matches the well's softening so paths follow the drawn surface.
 */
export function integrate2D(o: { gm: number; s: number; cx?: number; cz?: number; x: number; z: number; vx: number; vz: number; steps: number; dt: number; every?: number }) {
  const { gm, s, cx = 0, cz = 0, steps, dt, every = 1 } = o;
  let { x, z, vx, vz } = o;
  const acc = (px: number, pz: number) => {
    const dx = px - cx, dz = pz - cz;
    const d2 = dx * dx + dz * dz + s * s;
    const k = -gm / (d2 * Math.sqrt(d2));
    return [k * dx, k * dz] as const;
  };
  const pts = [{ x, z }];
  let [ax, az] = acc(x, z);
  for (let i = 1; i <= steps; i++) {
    vx += 0.5 * dt * ax; vz += 0.5 * dt * az;
    x += dt * vx; z += dt * vz;
    [ax, az] = acc(x, z);
    vx += 0.5 * dt * ax; vz += 0.5 * dt * az;
    if (i % every === 0) pts.push({ x, z });
  }
  return pts;
}
