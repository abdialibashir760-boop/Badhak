export type LL = [number, number];

export const RAIL_W: LL[] = [[13.4, 52.52], [16.37, 48.21], [19.04, 47.5], [20.46, 44.8], [21.9, 43.32], [23.32, 42.7], [24.75, 42.15], [26.56, 41.67], [28.97, 41.01]];
export const RAIL_E: LL[] = [[28.97, 41.01], [30.52, 39.77], [32.48, 37.87], [34.87, 37.43], [35.32, 37.0], [36.58, 37.03], [37.16, 36.2], [38.0, 36.82], [40.07, 36.85], [41.2, 37.07], [43.13, 36.34], [44.37, 33.31]];
export const RAIL: LL[] = [...RAIL_W, ...RAIL_E.slice(1)];

export const CITY = {
  berlin: [13.4, 52.52] as LL, istanbul: [28.97, 41.01] as LL, ankara: [32.86, 39.93] as LL, baghdad: [44.37, 33.31] as LL,
  london: [-0.12, 51.5] as LL, essen: [7.01, 51.46] as LL, kursk: [36.2, 51.7] as LL, normandy: [-0.5, 49.3] as LL, ardennes: [5.8, 50.0] as LL,
  stalingrad: [44.5, 48.7] as LL, baku: [49.87, 40.4] as LL, kirkuk: [44.39, 35.47] as LL, sofia: [23.32, 42.7] as LL, yenice: [35.0, 36.99] as LL,
  adana: [35.32, 37.0] as LL, mersin: [34.64, 36.8] as LL, moscow: [37.6, 55.75] as LL, kars: [43.1, 40.6] as LL, ardahan: [42.7, 41.1] as LL,
  sachsenhausen: [13.26, 52.77] as LL, guleman: [39.8, 38.4] as LL, fethiye: [29.1, 36.65] as LL, bursa: [29.06, 40.18] as LL,
};
