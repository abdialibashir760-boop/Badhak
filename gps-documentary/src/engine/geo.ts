import { LAND_H, LAND_RLE, LAND_STEP, LAND_W } from "./landData";
import type { V3 } from "./math3d";

export const DEG = Math.PI / 180;
/** Mean Earth radius, km. */
export const R_EARTH = 6371;
/** GPS orbital radius = 6371 km + ~20,200 km altitude (semi-major axis 26,560 km). */
export const R_ORBIT = 26560;
/** Speed of light, km/s. */
export const C_KM_S = 299792.458;
/** GPS orbital inclination. */
export const INCLINATION = 55 * DEG;

/** The phone: Istanbul. */
export const PHONE = { lat: 41.0082, lon: 28.9784 };

export function latLonToVec(lat: number, lon: number, r = 1): V3 {
  const φ = lat * DEG;
  const λ = lon * DEG;
  return [r * Math.cos(φ) * Math.cos(λ), r * Math.cos(φ) * Math.sin(λ), r * Math.sin(φ)];
}

export function vecToLatLon(v: V3): { lat: number; lon: number } {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return { lat: Math.asin(v[2] / l) / DEG, lon: Math.atan2(v[1], v[0]) / DEG };
}

/** Point reached from (lat,lon) travelling `distDeg` of arc along `bearingDeg` (clockwise from north). */
export function destination(lat: number, lon: number, bearingDeg: number, distDeg: number) {
  const φ1 = lat * DEG;
  const λ1 = lon * DEG;
  const θ = bearingDeg * DEG;
  const δ = distDeg * DEG;
  const φ2 = Math.asin(Math.sin(φ1) * Math.cos(δ) + Math.cos(φ1) * Math.sin(δ) * Math.cos(θ));
  const λ2 = λ1 + Math.atan2(Math.sin(θ) * Math.sin(δ) * Math.cos(φ1), Math.cos(δ) - Math.sin(φ1) * Math.sin(φ2));
  return { lat: φ2 / DEG, lon: ((((λ2 / DEG + 180) % 360) + 360) % 360) - 180 };
}

// ---------------------------------------------------------------- land mask (Natural Earth 1:50m)

let mask: Uint8Array | null = null;
function decodeMask(): Uint8Array {
  const m = new Uint8Array(LAND_W * LAND_H);
  let pos = 0;
  let val = 0;
  for (const tok of LAND_RLE.split(",")) {
    const n = parseInt(tok, 36);
    if (val === 1) m.fill(1, pos, pos + n);
    pos += n;
    val ^= 1;
  }
  return m;
}

export function isLand(lat: number, lon: number): boolean {
  if (!mask) mask = decodeMask();
  const col = ((Math.floor((lon + 180) / LAND_STEP) % LAND_W) + LAND_W) % LAND_W;
  const row = Math.min(LAND_H - 1, Math.max(0, Math.floor((90 - lat) / LAND_STEP)));
  return mask[row * LAND_W + col] === 1;
}
