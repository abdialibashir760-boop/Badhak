/*
 * THE EXPANSION OF THE ROMAN EMPIRE — shared scene (browser + Node).
 * Pure Canvas2D, deterministic: scene.draw(ctx, t) depends only on t (seconds, 0…10).
 * Everything is generated in code: parchment paper, coastlines (from src/geo.js polygons), rivers, mountains,
 * graticule, compass rose, the animated territory (a per-pixel arrival-time field), borders, cities and camera.
 *
 *   browser:  const scene = RomeScene.create({ makeCanvas, quality });  scene.draw(ctx, t);
 *   node:     const scene = require('./src/scene.js').create({ makeCanvas: (w,h)=>createCanvas(w,h) });
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./geo.js'));
  else root.RomeScene = factory(root.ROME_GEO);
})(typeof self !== 'undefined' ? self : this, function (GEO) {
  'use strict';

  /* ───────────────────────────── configuration ───────────────────────────── */
  const CFG = { W: 1920, H: 1080, FPS: 30, DURATION: 10 };
  const INK = '58,36,20';            // sepia ink (rgb triplet)
  const RED = '150,24,26';           // Roman red
  const SERIF = 'Georgia,"Palatino Linotype","Book Antiqua","Liberation Serif","DejaVu Serif",serif';

  const PI = Math.PI, D2R = PI / 180;
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const easeIOsine = (t) => 0.5 - 0.5 * Math.cos(PI * clamp(t));
  const easeIOcubic = (t) => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const easeOutBack = (t) => { t = clamp(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
  const mercV = (lat) => Math.log(Math.tan(PI / 4 + (clamp(lat, -85, 85) * D2R) / 2));
  const latOfV = (v) => (2 * Math.atan(Math.exp(v)) - PI / 2) / D2R;

  /* ───────────────────────────── noise ───────────────────────────── */
  function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function hash2(ix, iy, seed) {
    let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296;
  }
  function vnoise(x, y, seed) {
    const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
    const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    return lerp(lerp(hash2(ix, iy, seed), hash2(ix + 1, iy, seed), u), lerp(hash2(ix, iy + 1, seed), hash2(ix + 1, iy + 1, seed), u), v);
  }
  function fbm(x, y, seed, oct) {
    let a = 0.5, s = 0, n = 0;
    for (let i = 0; i < oct; i++) { s += a * vnoise(x, y, seed + i * 17); n += a; x *= 2.03; y *= 2.03; a *= 0.5; }
    return s / n;
  }

  /* ───────────────────────────── historical content ───────────────────────────── */
  // Conquest "waves". Each seed floods outward from its origin starting at `start` seconds, at `v` degrees/s, up to radius R.
  // Seconds are on the film's clock; YEARS below maps that clock to history (the ticker is just a view of this table).
  const SEEDS = [
    { id: 'Italia',       lon: 12.5, lat: 41.9, start: 1.85, v: 5.5, R: 5.8 },
    { id: 'Africa',       lon: 10.3, lat: 36.8, start: 3.2,  v: 4.5, R: 9.5 },
    { id: 'Hispania',     lon: 1.25, lat: 41.1, start: 3.1,  v: 3.6, R: 10.5 },
    { id: 'Macedonia',    lon: 22.9, lat: 37.9, start: 3.3,  v: 5.0, R: 8.5 },
    { id: 'Asia',         lon: 27.2, lat: 39.1, start: 3.9,  v: 4.5, R: 11 },
    { id: 'Gallia',       lon: 3.0,  lat: 43.2, start: 4.4,  v: 4.6, R: 9.5 },
    { id: 'Syria',        lon: 36.2, lat: 36.2, start: 5.0,  v: 4.6, R: 7.5 },
    { id: 'Pannonia',     lon: 16.9, lat: 48.1, start: 5.2,  v: 5.0, R: 7.0 },
    { id: 'Mauretania',   lon: 2.2,  lat: 36.6, start: 5.3,  v: 5.0, R: 8.0 },
    { id: 'Aegyptus',     lon: 29.9, lat: 31.2, start: 5.5,  v: 5.0, R: 8.5 },
    { id: 'Britannia',    lon: -0.1, lat: 51.5, start: 5.8,  v: 3.8, R: 5.0 },
    { id: 'Dacia',        lon: 23.3, lat: 45.5, start: 6.2,  v: 6.0, R: 4.5 },
    { id: 'Mesopotamia',  lon: 44.4, lat: 33.1, start: 6.0,  v: 6.0, R: 7.5 },
  ];
  // Film time → year (negative = BC). Linear between anchors.
  const YEARS = [[0, -753], [1.9, -753], [2.15, -509], [2.9, -264], [3.8, -146], [4.6, -58], [5.4, -30], [6.0, 43], [6.6, 106], [7.2, 117]];
  const yearAt = (t) => {
    if (t <= YEARS[0][0]) return YEARS[0][1];
    for (let i = 1; i < YEARS.length; i++) if (t <= YEARS[i][0]) { const [t0, y0] = YEARS[i - 1], [t1, y1] = YEARS[i]; return lerp(y0, y1, smooth(0, 1, (t - t0) / (t1 - t0)) * 0.5 + 0.5 * (t - t0) / (t1 - t0)); }
    return YEARS[YEARS.length - 1][1];
  };
  const fmtYear = (y) => { y = Math.round(y); if (y === 0) y = 1; return y < 0 ? `${-y} BC` : `${y} AD`; };
  const captionAt = (t, y) =>
    t < 1.95 ? 'Rome · traditional foundation' : y < -264 ? 'The Republic unites Italy' : y < -146 ? 'Punic Wars · Carthage and Greece fall' :
    y < -58 ? 'Spain, Asia and Gaul join the Republic' : y < -30 ? 'Caesar conquers Gaul · Egypt annexed' : y < 43 ? 'Augustus founds the Empire' :
    y < 106 ? 'Britannia invaded, 43 AD' : y < 117 ? 'Trajan takes Dacia and Mesopotamia' : 'Greatest extent under Trajan';

  // The empire at its height (≈117 AD): a coarse outline, [lon,lat]. Land only shows red where this overlaps real coastlines.
  const EMPIRE = [
    [[-1.2, 55.15], [3.0, 54.2], [4.2, 52.5], [5.8, 52.0], [6.5, 51.85], [7.2, 51.2], [7.7, 50.5], [8.5, 50.35], [9.2, 49.8], [9.7, 48.95], [10.9, 49.0], [11.9, 48.9],
      [13.0, 48.7], [14.5, 48.4], [16.4, 48.3], [17.1, 48.15], [18.7, 47.85], [19.05, 47.62], [19.0, 46.0], [19.9, 45.25], [21.35, 44.82], [22.6, 44.6], [22.9, 43.95],
      [24.5, 43.8], [27.0, 44.2], [28.0, 44.8], [28.9, 45.3], [29.9, 45.3], [31.5, 44.5], [35.0, 43.5], [39.5, 42.3], [41.0, 41.8], [42.5, 41.3], [43.8, 41.0],
      [45.0, 40.3], [46.0, 39.5], [45.2, 38.4], [44.8, 37.3], [46.0, 36.0], [46.5, 35.5], [47.5, 34.0], [48.3, 32.5], [48.8, 30.3], [47.5, 29.3], [45.5, 30.0],
      [42.0, 31.2], [39.0, 31.2], [37.5, 30.0], [36.0, 29.2], [35.0, 29.4], [34.3, 28.0], [33.6, 27.2], [35.0, 24.0], [34.0, 23.9], [32.8, 23.8], [31.5, 24.5],
      [30.5, 26.5], [29.5, 28.5], [28.5, 30.0], [25.3, 30.3], [23.0, 30.3], [20.0, 29.8], [17.0, 30.3], [13.0, 30.8], [10.3, 31.6], [9.5, 32.5], [8.0, 33.8],
      [6.5, 34.6], [5.5, 34.8], [3.0, 35.2], [0.0, 34.8], [-1.8, 34.2], [-3.0, 34.0], [-5.6, 33.6], [-7.5, 33.0], [-9.8, 33.1], [-10.5, 36.0], [-10.5, 44.0],
      [-6.5, 47.5], [-6.0, 49.5], [-5.9, 51.5], [-5.8, 52.6], [-5.4, 53.5], [-4.4, 54.0], [-3.4, 55.05]],
    [[22.2, 44.5], [21.4, 45.3], [21.4, 46.0], [22.0, 47.0], [23.0, 47.8], [24.6, 47.7], [25.8, 47.0], [26.0, 46.0], [25.6, 45.6], [25.0, 45.0], [24.5, 44.2], [23.0, 43.9]],
  ];

  // [lon, lat, name, tier, label side]  tier 0 = always labelled, 1 = from mid zoom, 2 = close-ups only
  const CITIES = [
    [12.5, 41.9, 'ROMA', 0, 'r'], [14.25, 40.85, 'Neapolis', 2, 'r'], [9.19, 45.46, 'Mediolanum', 2, 'l'], [15.29, 37.07, 'Syracusae', 2, 'r'],
    [10.32, 36.85, 'Carthago', 1, 'r'], [5.37, 43.3, 'Massilia', 2, 'l'], [1.25, 41.12, 'Tarraco', 2, 'r'], [-4.78, 37.88, 'Corduba', 2, 'b'],
    [-6.29, 36.53, 'Gades', 2, 'l'], [4.83, 45.76, 'Lugdunum', 1, 'r'], [2.35, 48.85, 'Lutetia', 2, 'l'], [-0.09, 51.51, 'Londinium', 1, 'r'],
    [-1.08, 53.96, 'Eboracum', 2, 'l'], [6.96, 50.94, 'Colonia', 2, 'r'], [16.37, 48.21, 'Vindobona', 2, 'r'], [19.04, 47.55, 'Aquincum', 2, 'r'],
    [22.94, 40.64, 'Thessalonica', 2, 'l'], [23.73, 37.98, 'Athenae', 1, 'b'], [28.98, 41.01, 'Byzantium', 1, 't'], [27.34, 37.94, 'Ephesus', 2, 'b'],
    [36.16, 36.2, 'Antiochia', 1, 'b'], [35.23, 31.78, 'Hierosolyma', 2, 'b'], [29.92, 31.2, 'Alexandria', 0, 'l'], [14.29, 32.64, 'Leptis Magna', 2, 'b'],
    [21.86, 32.82, 'Cyrene', 2, 'b'], [2.19, 36.6, 'Caesarea', 2, 'r'], [23.3, 45.52, 'Sarmizegetusa', 2, 'r'], [44.58, 33.09, 'Ctesiphon', 1, 'b'],
    [38.27, 34.55, 'Palmyra', 2, 'b'], [-5.8, 35.77, 'Tingis', 2, 'l'], [29.9, 40.77, 'Nicomedia', 2, 't'], [19.62, 44.97, 'Sirmium', 2, 'l'],
  ];

  // Region labels: [lon, lat, text, sizeDeg, rotDeg, kind]  kind: 'p' province (appears with territory), 'o' outside, 's' sea
  const LABELS = [
    [11.2, 44.1, 'ITALIA', 0.75, -28, 'p'], [-4.2, 40.2, 'HISPANIA', 1.15, 0, 'p'], [2.0, 46.6, 'GALLIA', 1.2, 0, 'p'], [-2.5, 53.1, 'BRITANNIA', 0.6, -78, 'p'],
    [21.0, 41.7, 'MACEDONIA', 0.5, 0, 'p'], [32.5, 39.0, 'ASIA', 1.15, 0, 'p'], [37.2, 34.3, 'SYRIA', 0.5, 0, 'p'], [29.5, 27.4, 'AEGYPTVS', 1.0, 0, 'p'],
    [9.5, 33.8, 'AFRICA', 0.9, 0, 'p'], [-1.0, 35.0, 'MAVRETANIA', 0.7, 0, 'p'], [17.5, 47.0, 'PANNONIA', 0.6, 0, 'p'], [24.4, 46.5, 'DACIA', 0.55, 0, 'p'],
    [26.0, 43.4, 'MOESIA', 0.6, 0, 'p'], [43.6, 34.4, 'MESOPOTAMIA', 0.5, 0, 'p'], [20.5, 31.0, 'CYRENAICA', 0.4, 0, 'p', 14], [34.0, 37.4, 'CILICIA', 0.3, 0, 'p', 24],
    [10.0, 52.2, 'GERMANIA', 1.1, 0, 'o'], [33.0, 51.0, 'SARMATIA', 1.2, 0, 'o'], [52.0, 33.5, 'PARTHIA', 1.1, 0, 'o'], [-8.2, 53.2, 'HIBERNIA', 0.55, 0, 'o'],
    [-4.2, 56.9, 'CALEDONIA', 0.55, 0, 'o'], [15.0, 25.0, 'LIBYA', 1.4, 0, 'o'], [45.0, 25.0, 'ARABIA', 1.1, 0, 'o'],
    [17.5, 34.6, 'MARE INTERNVM', 0.95, 0, 's'], [-16.0, 41.0, 'OCEANVS ATLANTICVS', 1.05, -78, 's'], [34.5, 43.2, 'PONTVS EVXINVS', 0.65, 0, 's'],
    [3.5, 55.2, 'OCEANVS GERMANICVS', 0.6, 0, 's'], [50.6, 41.4, 'MARE CASPIVM', 0.5, -75, 's'], [24.8, 38.3, 'AEGAEVM', 0.3, 0, 's', 30],
  ];

  const MOUNTAINS = [
    [[6.8, 44.2], [7.0, 45.5], [8.2, 46.2], [9.5, 46.5], [11, 46.6], [12.5, 46.8], [14.5, 46.5], [16, 46.7]],           // Alpes
    [[-1.8, 43.2], [0, 42.7], [1.5, 42.6], [3.1, 42.4]],                                                                  // Pyrenaei
    [[8.7, 44.4], [10.5, 44.2], [12.4, 43.5], [13.5, 42.4], [15.2, 41.2], [16.0, 40.0], [16.1, 38.8]],                    // Apennini
    [[-9, 31.0], [-6, 32.0], [-3, 33.2], [0, 34.2], [3, 35.2], [6, 35.4], [9, 35.5], [10.3, 35.5]],                       // Atlas
    [[18.5, 49.0], [20.3, 49.2], [22.5, 49.0], [24.5, 48.2], [25.5, 47], [26, 46], [25.3, 45.3], [23.5, 45.3], [22.5, 45.1]], // Carpates
    [[30, 37], [32, 36.7], [34.5, 37.2], [36.5, 37.8], [38.5, 38.2], [41, 38.4], [43, 37.5]],                             // Taurus
    [[38, 44.2], [40, 43.4], [42.5, 42.7], [44.5, 42.3], [46, 41.8], [47.5, 41.5]],                                       // Caucasus
    [[15, 44.5], [17, 43.7], [19, 42.8], [20.5, 42], [22, 41]],                                                           // Alpes Dinaricae
    [[44.5, 38.5], [45.5, 36.5], [47, 34.5], [48.5, 33]],                                                                  // Zagros
  ];
  const RIVERS = [
    [[7.6, 47.6], [7.75, 48.58], [8.46, 49.5], [8.27, 50.0], [7.6, 50.35], [6.96, 50.94], [6.45, 51.67], [5.85, 51.85], [4.25, 51.95]], // Rhenus
    [[8.5, 48.0], [9.9, 48.4], [11.4, 48.77], [12.1, 48.99], [13.4, 48.57], [16.37, 48.2], [17.1, 48.15], [18.8, 47.8], [19.05, 47.5], [18.95, 46.2], [19.85, 45.25], [20.45, 44.8], [22.5, 44.6], [23.0, 43.95], [25, 43.75], [26.5, 44.0], [27.9, 44.7], [28.1, 45.4], [29.6, 45.2]], // Danuvius
    [[32.8, 24.0], [32.7, 25.7], [31.2, 27.2], [31.2, 29.0], [31.25, 30.1], [30.4, 31.4]],                                  // Nilus
    [[38.0, 37.0], [39.0, 36.0], [40.2, 35.0], [41.5, 34.5], [43.6, 33.4], [44.4, 32.5], [46.0, 31.0], [47.5, 30.8]],     // Euphrates
    [[41, 37.9], [42.5, 37.4], [43.1, 36.4], [44.4, 34.5], [44.5, 33.3], [45.5, 32.5], [47, 31.0]],                       // Tigris
    [[5.9, 46.2], [4.85, 45.75], [4.8, 44.4], [4.8, 43.7]],                                                               // Rhodanus
    [[7.3, 44.7], [8.3, 45.1], [10, 45.1], [11.6, 44.95], [12.3, 44.95]],                                                  // Padus
    [[-3.5, 42.7], [-1, 41.7], [0.8, 41.0]],                                                                              // Iberus
    [[12.4, 43.0], [12.3, 42.0], [12.25, 41.75]],                                                                          // Tiberis
    [[-8.5, 40.2], [-8.0, 39.2], [-9.0, 38.7]],                                                                           // Tagus
  ];

  /* ───────────────────────────── scene factory ───────────────────────────── */
  function create(opts) {
    const makeCanvas = opts.makeCanvas;
    const W = opts.W || CFG.W, H = opts.H || CFG.H;
    const Q = opts.quality || 1;                       // resolution of the per-pixel territory pass (1 = full)

    /* ---------- projected geometry (Web-Mercator-style u,v in radians) ---------- */
    const rings = GEO.rings.map((flat) => {
      const n = flat.length / 2, p = new Float32Array(n * 2);
      let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
      for (let i = 0; i < n; i++) {
        const u = flat[i * 2] * D2R, v = mercV(flat[i * 2 + 1]); p[i * 2] = u; p[i * 2 + 1] = v;
        if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v;
      }
      return { p, n, u0, u1, v0, v1 };
    });

    /* ---------- territory fields on a Mercator grid ---------- */
    const CPD = 20;                                    // cells per degree of longitude
    const LON0 = -14, LON1 = 50, LAT0 = 22, LAT1 = 58;
    const U0 = LON0 * D2R, VMAX = mercV(LAT1);
    const GW = Math.round((LON1 - LON0) * CPD), du = ((LON1 - LON0) * D2R) / GW;
    const GH = Math.ceil((VMAX - mercV(LAT0)) / du);
    const F = new Float32Array(GW * GH * 4);           // T (arrival s), M (signed px-distance inside empire, in mercator-degrees), E (distance to province border), G (local speed)
    (function buildFields() {
      // 1) empire mask → blurred → signed distance
      const mc = makeCanvas(GW, GH), mg = mc.getContext('2d');
      mg.fillStyle = '#000'; mg.fillRect(0, 0, GW, GH); mg.fillStyle = '#fff';
      for (const poly of EMPIRE) {
        mg.beginPath();
        poly.forEach(([lo, la], i) => { const x = (lo * D2R - U0) / du, y = (VMAX - mercV(la)) / du; i ? mg.lineTo(x, y) : mg.moveTo(x, y); });
        mg.closePath(); mg.fill();
      }
      const px = mg.getImageData(0, 0, GW, GH).data;
      let a = new Float32Array(GW * GH), b = new Float32Array(GW * GH);
      for (let i = 0; i < a.length; i++) a[i] = px[i * 4] / 255;
      const R = 2;                                     // box-blur radius (3 passes ≈ gaussian σ≈2.4 cells)
      const blur = (src, dst, horiz) => {
        const len = horiz ? GW : GH, cnt = horiz ? GH : GW, stride = horiz ? 1 : GW, step = horiz ? GW : 1;
        for (let l = 0; l < cnt; l++) {
          const base = l * step; let sum = 0;
          for (let k = -R; k <= R; k++) sum += src[base + clamp(k, 0, len - 1) * stride];
          for (let k = 0; k < len; k++) {
            dst[base + k * stride] = sum / (2 * R + 1);
            sum += src[base + clamp(k + R + 1, 0, len - 1) * stride] - src[base + clamp(k - R, 0, len - 1) * stride];
          }
        }
      };
      for (let pass = 0; pass < 3; pass++) { blur(a, b, true); blur(b, a, false); }
      const sigma = 2.45, edgeScale = (sigma * 2.5066) / CPD;   // (value-0.5) → mercator-degrees from the border
      // 2) seed waves
      const warpSeed = 7;
      for (let gy = 0; gy < GH; gy++) {
        const v = VMAX - (gy + 0.5) * du, lat = latOfV(v), cosphi = Math.cos(lat * D2R);
        for (let gx = 0; gx < GW; gx++) {
          const lon = LON0 + (gx + 0.5) / CPD;
          const warp = 1 + 0.34 * (fbm(lon * 0.55, lat * 0.55, warpSeed, 4) - 0.5) * 2;
          let T = 1e3, G = 4, s1 = 1e9, s2 = 1e9, R1 = 1, R2 = 1;
          for (const s of SEEDS) {
            const dx = (lon - s.lon) * Math.cos(((lat + s.lat) / 2) * D2R), dy = lat - s.lat;
            const d = Math.hypot(dx, dy) * warp;
            const tt = d < s.R ? s.start + d / s.v : s.start + s.R / s.v + (d - s.R) * 3.4;   // beyond R the wave all but stalls
            if (tt > 40) continue;
            if (tt < T) { T = tt; G = s.v / cosphi; }
            const sc = d / s.R;
            if (sc < s1) { s2 = s1; R2 = R1; s1 = sc; R1 = s.R; } else if (sc < s2) { s2 = sc; R2 = s.R; }
          }
          const i = (gy * GW + gx) * 4;
          F[i] = T;
          F[i + 1] = (a[gy * GW + gx] - 0.5) * edgeScale * 2.0;
          F[i + 2] = s2 > 1e8 ? 99 : ((s2 - s1) / (1 / R1 + 1 / R2)) / cosphi;
          F[i + 3] = G;
        }
      }
    })();
    const sampleField = (lon, lat, k) => {      // bilinear lookup used for city timings
      const gx = (lon * D2R - U0) / du - 0.5, gy = (VMAX - mercV(lat)) / du - 0.5;
      const x0 = clamp(Math.floor(gx), 0, GW - 2), y0 = clamp(Math.floor(gy), 0, GH - 2), fx = clamp(gx - x0), fy = clamp(gy - y0);
      const at = (x, y) => F[(y * GW + x) * 4 + k];
      return lerp(lerp(at(x0, y0), at(x0 + 1, y0), fx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), fx), fy);
    };
    const cities = CITIES.map(([lon, lat, name, tier, side]) => {
      const T = sampleField(lon, lat, 0);
      return { lon, lat, name, tier, side, u: lon * D2R, v: mercV(lat), t0: name === 'ROMA' ? 0.35 : Math.min(T + 0.18, 7.5) };
    });
    const labels = LABELS.map(([lon, lat, text, size, rot, kind, minPpd]) => {
      const T = kind === 'p' ? sampleField(lon, lat, 0) : 0;
      return { u: lon * D2R, v: mercV(lat), text, size, rot: rot * D2R, kind, t0: kind === 'p' ? Math.min(T + 0.3, 7.6) : kind === 's' ? 0.2 : 0.6, minPpd: minPpd || 0 };
    });

    /* ---------- parchment (static, generated once) ---------- */
    const parchment = (function () {
      const c = makeCanvas(W, H), g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = (y * W + x) * 4, nx = x / W, ny = y / H;
        const big = fbm(x * 0.0028, y * 0.0028, 11, 5), mid = fbm(x * 0.016, y * 0.016, 23, 3), grain = hash2(x, y, 99) - 0.5;
        const blotch = smooth(0.38, 0.72, big);
        let r = lerp(238, 208, blotch), gg = lerp(222, 180, blotch), b = lerp(180, 130, blotch);
        const edge = Math.min(nx, 1 - nx, (ny < 0.5 ? ny : 1 - ny) * 1.6) + (mid - 0.5) * 0.09;
        const burn = smooth(0.0, 0.15, edge);
        const m = lerp(0.74, 1, burn);
        r = r * m + (1 - m) * 40; gg = gg * m + (1 - m) * 20; b = b * m + (1 - m) * 6;
        const k = (mid - 0.5) * 16 + grain * 9;
        d[i] = clamp(r + k, 0, 255); d[i + 1] = clamp(gg + k, 0, 255); d[i + 2] = clamp(b + k * 0.9, 0, 255); d[i + 3] = 255;
      }
      g.putImageData(img, 0, 0);
      const rnd = mulberry32(5);
      for (let n = 0; n < 2600; n++) {             // paper fibres
        const x = rnd() * W, y = rnd() * H, a = rnd() * PI * 2, l = 5 + rnd() * 26;
        g.strokeStyle = rnd() < 0.5 ? `rgba(255,248,225,${0.05 + rnd() * 0.07})` : `rgba(${INK},${0.03 + rnd() * 0.05})`;
        g.lineWidth = 0.6 + rnd() * 0.7; g.beginPath(); g.moveTo(x, y);
        g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
      }
      for (let n = 0; n < 9; n++) {                // water stains
        const x = rnd() * W, y = rnd() * H, r = 90 + rnd() * 240, gr = g.createRadialGradient(x, y, r * 0.2, x, y, r);
        gr.addColorStop(0, 'rgba(120,80,30,0)'); gr.addColorStop(0.82, `rgba(120,80,30,${0.03 + rnd() * 0.03})`); gr.addColorStop(0.93, `rgba(100,62,22,${0.07 + rnd() * 0.05})`); gr.addColorStop(1, 'rgba(100,62,22,0)');
        g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
      }
      for (let n = 0; n < 420; n++) {              // foxing specks
        const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * rnd() * 3.4;
        g.fillStyle = `rgba(110,64,22,${0.06 + rnd() * 0.16})`; g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill();
      }
      for (const [x0, y0, x1, y1] of [[W / 2, 0, W / 2, H], [0, H / 2, W, H / 2]]) {   // fold creases
        g.strokeStyle = 'rgba(70,40,15,0.13)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
        g.strokeStyle = 'rgba(255,248,230,0.18)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 + (x0 ? 0 : 2), y0 + (y0 ? 2 : 0)); g.lineTo(x1 + (x1 === x0 ? 2 : 0), y1 + (y1 === y0 ? 2 : 0)); g.stroke();
      }
      return c;
    })();
    const grainTile = (function () {                 // film grain, re-offset every frame
      const c = makeCanvas(256, 256), g = c.getContext('2d'), img = g.createImageData(256, 256), d = img.data, rnd = mulberry32(77);
      for (let i = 0; i < d.length; i += 4) { const v = 128 + (rnd() - 0.5) * 90; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      g.putImageData(img, 0, 0); return c;
    })();

    /* ---------- decorations generated once ---------- */
    const mountainMarks = [];
    {
      const rnd = mulberry32(31);
      for (const line of MOUNTAINS) for (let i = 0; i < line.length - 1; i++) {
        const [x0, y0] = line[i], [x1, y1] = line[i + 1], len = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(len / 0.34));
        for (let k = 0; k < n; k++) {
          const f = (k + rnd() * 0.6) / n, jx = (rnd() - 0.5) * 0.5, jy = (rnd() - 0.5) * 0.5;
          mountainMarks.push({ u: (lerp(x0, x1, f) + jx) * D2R, v: mercV(lerp(y0, y1, f) + jy), s: 0.7 + rnd() * 0.6 });
        }
      }
    }
    const riverPts = RIVERS.map((r) => r.map(([lo, la]) => [lo * D2R, mercV(la)]));

    /* ---------- territory pass (per-pixel) ---------- */
    const TW = Math.round(W * Q), TH = Math.round(H * Q);
    const terrCanvas = makeCanvas(TW, TH), terrCtx = terrCanvas.getContext('2d'), terrImg = terrCtx.createImageData(TW, TH);
    function renderTerritory(cam, now) {
      const out = terrImg.data; out.fill(0);
      const s = cam.s * Q;                              // px per radian in the territory buffer
      const ppd = (s * D2R) / 1;                        // px per mercator-degree
      const kx = 1 / (s * du), gx0 = ((cam.uc - (TW / 2) / s) - U0) / du;
      const gy0 = (VMAX - (cam.vc + (TH / 2) / s)) / du;
      const xa = Math.max(0, Math.ceil((1.0 - gx0) / kx)), xb = Math.min(TW - 1, Math.floor((GW - 2.01 - gx0) / kx));
      const ya = Math.max(0, Math.ceil((1.0 - gy0) / kx)), yb = Math.min(TH - 1, Math.floor((GH - 2.01 - gy0) / kx));
      const hatchK = 0.55 * Q;
      for (let y = ya; y <= yb; y++) {
        const gy = gy0 + y * kx, iy = gy | 0, fy = gy - iy;
        for (let x = xa; x <= xb; x++) {
          const gx = gx0 + x * kx, ix = gx | 0, fx = gx - ix;
          const i00 = (iy * GW + ix) * 4, i10 = i00 + 4, i01 = i00 + GW * 4, i11 = i01 + 4;
          const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
          const T = F[i00] * w00 + F[i10] * w10 + F[i01] * w01 + F[i11] * w11;
          const age = now - T;
          if (age <= 0) continue;
          const Md = (F[i00 + 1] * w00 + F[i10 + 1] * w10 + F[i01 + 1] * w01 + F[i11 + 1] * w11) * ppd;
          if (Md < -1.2) continue;
          const G = F[i00 + 3] * w00 + F[i10 + 3] * w10 + F[i01 + 3] * w01 + F[i11 + 3] * w11;
          const E = (F[i00 + 2] * w00 + F[i10 + 2] * w10 + F[i01 + 2] * w01 + F[i11 + 2] * w11) * ppd;
          const fd = age * G * ppd;                     // px behind the advancing front
          const cov = smooth(-0.9, 0.9, Md) * smooth(0, 1.6, fd);
          if (cov <= 0) continue;
          // fill: bright ember at the front, settling into a deep Roman red with a faint engraved hatch
          const glow = Math.exp(-age * 3.2);
          const hatch = 0.5 + 0.5 * Math.sin((x + y) * hatchK);
          let r = lerp(196, 252, glow), g = lerp(52, 118, glow), b = lerp(44, 72, glow);
          let al = (0.84 + 0.14 * glow - 0.07 * hatch) * cov;
          // borders: the outer limit, provincial lines, and the live front
          const edgeL = (1 - smooth(0.5, 1.9 * Q + 0.5, Math.abs(Md))) * smooth(0, 1.2, fd);
          const provL = (1 - smooth(0.35, 1.25 * Q + 0.35, E)) * 0.62 * smooth(0, 1.2, fd) * (Md > 1.5 ? 1 : 0);
          const frontL = (1 - smooth(0.7, 3.2 * Q, fd)) * (Md > 0 ? 1 : 0.4);
          const line = Math.max(edgeL * 0.95, provL, frontL * 0.8);
          if (line > 0) {
            const na = al + line * (1 - al);
            r = (r * al * (1 - line) + 120 * line) / (na || 1); g = (g * al * (1 - line) + 30 * line) / (na || 1); b = (b * al * (1 - line) + 26 * line) / (na || 1); al = na;
          }
          const o = (y * TW + x) * 4;
          out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = al * 255;
        }
      }
      terrCtx.putImageData(terrImg, 0, 0);
    }

    /* ---------- camera ---------- */
    const CAMK = {
      start: { W: 30, lon: 13.0, lat: 41.4 }, push: { W: 24, lon: 12.8, lat: 41.4 },
      mid: { W: 64, lon: 18.5, lat: 43.5 }, end: { W: 124, lon: 21.0, lat: 43.0 },
    };
    function camera(t) {
      let a, b, k;
      if (t < 2) { a = CAMK.start; b = CAMK.push; k = easeIOsine(t / 2); }
      else if (t < 7) { a = CAMK.push; b = CAMK.mid; k = easeIOsine((t - 2) / 5); }
      else { a = CAMK.mid; b = CAMK.end; k = easeIOcubic((t - 7) / 3); }       // the pull-back, strongest around 8–8.5 s
      const wdeg = Math.exp(lerp(Math.log(a.W), Math.log(b.W), k));
      const s = W / (wdeg * D2R);
      return { s, uc: lerp(a.lon, b.lon, k) * D2R, vc: lerp(mercV(a.lat), mercV(b.lat), k), wdeg, ppd: s * D2R };
    }

    /* ---------- drawing helpers ---------- */
    function traceRings(ctx, cam) {
      const s = cam.s, ox = W / 2 - cam.uc * s, oy = H / 2 + cam.vc * s;
      for (const r of rings) {
        if (r.u1 * s + ox < -60 || r.u0 * s + ox > W + 60 || oy - r.v0 * s < -60 || oy - r.v1 * s > H + 60) continue;
        const p = r.p; ctx.moveTo(p[0] * s + ox, oy - p[1] * s);
        for (let i = 1; i < r.n; i++) ctx.lineTo(p[i * 2] * s + ox, oy - p[i * 2 + 1] * s);
        ctx.closePath();
      }
    }
    const sx = (cam, u) => W / 2 + (u - cam.uc) * cam.s, sy = (cam, v) => H / 2 - (v - cam.vc) * cam.s;
    function spaced(ctx, text, x, y, sp, align) {
      const widths = [...text].map((ch) => ctx.measureText(ch).width + sp), total = widths.reduce((a, b) => a + b, 0) - sp;
      let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x;
      ctx.textAlign = 'left';
      [...text].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += widths[i]; });
      return total;
    }
    const halo = (ctx, drawFn, a) => { if (a > 0) { ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = `rgba(240,226,190,${0.85 * a})`; ctx.lineWidth = 4; drawFn('stroke'); ctx.restore(); } drawFn('fill'); };

    function drawGraticule(ctx, cam) {
      ctx.save(); ctx.lineWidth = 1;
      const left = (cam.uc - W / 2 / cam.s) / D2R, right = (cam.uc + W / 2 / cam.s) / D2R;
      const top = latOfV(cam.vc + H / 2 / cam.s), bot = latOfV(cam.vc - H / 2 / cam.s);
      for (let lon = Math.floor(left / 5) * 5; lon <= right; lon += 5) {
        ctx.strokeStyle = `rgba(${INK},${lon % 10 === 0 ? 0.17 : 0.09})`; const x = sx(cam, lon * D2R);
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let lat = Math.floor(Math.max(bot, -80) / 5) * 5; lat <= Math.min(top, 80); lat += 5) {
        ctx.strokeStyle = `rgba(${INK},${lat % 10 === 0 ? 0.17 : 0.09})`; const y = sy(cam, mercV(lat));
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }
      ctx.restore();
    }
    function drawRivers(ctx, cam, a) {
      ctx.save(); ctx.strokeStyle = `rgba(48,86,100,${0.62 * a})`; ctx.lineWidth = clamp(cam.ppd * 0.045, 1, 2.2); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      for (const r of riverPts) {
        ctx.beginPath(); ctx.moveTo(sx(cam, r[0][0]), sy(cam, r[0][1]));
        for (let i = 1; i < r.length - 1; i++) {
          const x = sx(cam, r[i][0]), y = sy(cam, r[i][1]);
          ctx.quadraticCurveTo(x, y, (x + sx(cam, r[i + 1][0])) / 2, (y + sy(cam, r[i + 1][1])) / 2);
        }
        ctx.lineTo(sx(cam, r[r.length - 1][0]), sy(cam, r[r.length - 1][1])); ctx.stroke();
      }
      ctx.restore();
    }
    function drawMountains(ctx, cam, a) {
      const sz = clamp(cam.ppd * 0.16, 2.4, 8);
      ctx.save(); ctx.lineWidth = 1; ctx.lineJoin = 'round';
      for (const m of mountainMarks) {
        const x = sx(cam, m.u), y = sy(cam, m.v);
        if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
        const k = sz * m.s;
        ctx.fillStyle = `rgba(${INK},${0.32 * a})`; ctx.beginPath(); ctx.moveTo(x, y - k); ctx.lineTo(x + k, y + k * 0.6); ctx.lineTo(x + k * 0.1, y + k * 0.6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(${INK},${0.7 * a})`; ctx.beginPath(); ctx.moveTo(x - k, y + k * 0.6); ctx.lineTo(x, y - k); ctx.lineTo(x + k, y + k * 0.6); ctx.stroke();
      }
      ctx.restore();
    }
    function drawCompass(ctx, cam) {
      const cx = sx(cam, -17.5 * D2R), cy = sy(cam, mercV(30.0)), r = cam.ppd * 5.2;
      if (r < 24 || cx < -r || cx > W + r || cy < -r || cy > H + r) return;
      ctx.save(); ctx.translate(cx, cy);
      const fade = smooth(30, 60, r); ctx.globalAlpha = fade;
      ctx.strokeStyle = `rgba(${INK},0.8)`; ctx.lineWidth = 1.2;
      for (const k of [1, 0.84, 0.62]) { ctx.beginPath(); ctx.arc(0, 0, r * k, 0, PI * 2); ctx.stroke(); }
      for (let i = 0; i < 32; i++) {                 // tick ring
        const a = (i / 32) * PI * 2, l = i % 4 === 0 ? 0.84 : 0.9; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * l, Math.sin(a) * r * l); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke();
      }
      const pts = [[0, 1.0, 0.11], [45, 0.72, 0.08], [22.5, 0.5, 0.05], [67.5, 0.5, 0.05]];
      for (let i = 0; i < 16; i++) {
        const ang = i * 22.5, kind = ang % 90 === 0 ? pts[0] : ang % 45 === 0 ? pts[1] : pts[2];
        const a = (ang - 90) * D2R, len = r * 0.84 * kind[1], w = r * kind[2];
        const tipx = Math.cos(a) * len, tipy = Math.sin(a) * len, nx = -Math.sin(a) * w, ny = Math.cos(a) * w, bx = Math.cos(a) * w * 0.9, by = Math.sin(a) * w * 0.9;
        ctx.fillStyle = ang === 0 ? `rgba(${RED},0.9)` : `rgba(${INK},0.78)`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx + nx, by + ny); ctx.lineTo(tipx, tipy); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(244,232,200,0.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx - nx, by - ny); ctx.lineTo(tipx, tipy); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(${INK},0.8)`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx + nx, by + ny); ctx.lineTo(tipx, tipy); ctx.lineTo(bx - nx, by - ny); ctx.closePath(); ctx.stroke();
      }
      ctx.fillStyle = `rgba(${INK},0.9)`; ctx.font = `italic ${Math.round(clamp(r * 0.13, 9, 15))}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('SEPTENTRIO', 0, -r * 1.12); ctx.fillText('MERIDIES', 0, r * 1.12); ctx.fillText('ORIENS', r * 1.3, 0); ctx.fillText('OCCIDENS', -r * 1.3, 0);
      ctx.restore();
    }
    function drawScaleBar(ctx, cam) {
      const lat = 40, pxPerKm = cam.s / ((6371 / 1) * Math.cos(lat * D2R));
      const km = [100, 200, 250, 500, 1000, 2000].find((k) => k * pxPerKm >= 130) || 2000, len = km * pxPerKm, x = W - 70 - km * pxPerKm, y = H - 98;
      ctx.save(); ctx.lineWidth = 1.2; ctx.strokeStyle = `rgba(${INK},0.9)`;
      for (let i = 0; i < 4; i++) { ctx.fillStyle = i % 2 ? 'rgba(244,232,200,0.95)' : `rgba(${INK},0.9)`; ctx.fillRect(x + (len / 4) * i, y, len / 4, 6); ctx.strokeRect(x + (len / 4) * i, y, len / 4, 6); }
      ctx.fillStyle = `rgba(${INK},0.95)`; ctx.font = `italic 13px ${SERIF}`; ctx.textBaseline = 'bottom'; ctx.textAlign = 'center';
      ctx.fillText(`${km} km`, x + len, y - 4); ctx.textAlign = 'left'; ctx.fillText('0', x - 3, y - 4);
      ctx.restore();
    }
    function drawFrameAndTicks(ctx, cam) {
      const m = 30;
      ctx.save();
      ctx.strokeStyle = `rgba(${INK},0.9)`; ctx.lineWidth = 2.5; ctx.strokeRect(m, m, W - 2 * m, H - 2 * m);
      ctx.lineWidth = 1; ctx.strokeRect(m + 7, m + 7, W - 2 * m - 14, H - 2 * m - 14);
      const left = (cam.uc - W / 2 / cam.s) / D2R, right = (cam.uc + W / 2 / cam.s) / D2R;
      const step = cam.ppd > 14 ? 1 : 2; ctx.fillStyle = `rgba(${INK},0.9)`; ctx.font = `italic 12px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let lon = Math.ceil(left / step) * step; lon <= right; lon += step) {
        const x = sx(cam, lon * D2R); if (x < m + 12 || x > W - m - 12) continue;
        const major = lon % 5 === 0, l = major ? 11 : 5;
        for (const [y0, dir] of [[m + 7, 1], [H - m - 7, -1]]) { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + dir * l); ctx.stroke(); }
        if (lon % 10 === 0) ctx.fillText(`${Math.abs(lon)}°${lon < 0 ? 'W' : 'E'}`, x, H - m - 24);
      }
      const top = latOfV(cam.vc + H / 2 / cam.s), bot = latOfV(cam.vc - H / 2 / cam.s); ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      for (let lat = Math.ceil(bot / step) * step; lat <= top; lat += step) {
        const y = sy(cam, mercV(lat)); if (y < m + 12 || y > H - m - 12) continue;
        const major = lat % 5 === 0, l = major ? 11 : 5;
        for (const [x0, dir] of [[m + 7, 1], [W - m - 7, -1]]) { ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + dir * l, y); ctx.stroke(); }
        if (lat % 10 === 0) ctx.fillText(`${lat}°N`, m + 22, y);
      }
      for (const [cx, cy] of [[m, m], [W - m, m], [m, H - m], [W - m, H - m]]) {     // corner studs
        ctx.fillStyle = `rgba(${INK},0.9)`; ctx.beginPath(); ctx.arc(cx, cy, 5, 0, PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(244,232,200,1)'; ctx.beginPath(); ctx.arc(cx, cy, 2.2, 0, PI * 2); ctx.fill();
      }
      ctx.restore();
    }
    function panel(ctx, x, y, w, h, a) {
      ctx.save(); ctx.globalAlpha = a; ctx.shadowColor = 'rgba(30,16,4,0.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 5;
      const gr = ctx.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, 'rgba(243,231,198,0.93)'); gr.addColorStop(1, 'rgba(228,208,160,0.93)');
      ctx.fillStyle = gr; ctx.fillRect(x, y, w, h); ctx.shadowColor = 'transparent';
      ctx.strokeStyle = `rgba(${INK},0.85)`; ctx.lineWidth = 2; ctx.strokeRect(x, y, w, h); ctx.lineWidth = 1; ctx.strokeRect(x + 5, y + 5, w - 10, h - 10);
      ctx.restore();
    }

    /* ---------- the frame ---------- */
    function draw(ctx, t) {
      const cam = camera(t);
      ctx.save();
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
      ctx.drawImage(parchment, 0, 0);

      /* sea & land washes */
      ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(200,214,204)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd'); ctx.fillStyle = 'rgba(248,238,208,0.5)'; ctx.fillRect(0, 0, W, H); ctx.restore();
      /* classic coastal water-lines */
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); traceRings(ctx, cam); ctx.clip('evenodd');
      ctx.beginPath(); traceRings(ctx, cam); ctx.lineJoin = 'round';
      for (const [w, a] of [[34, 0.045], [22, 0.06], [13, 0.08], [6, 0.11]]) { ctx.lineWidth = w; ctx.strokeStyle = `rgba(52,84,92,${a})`; ctx.stroke(); }
      ctx.restore();

      drawGraticule(ctx, cam);
      const detail = smooth(8, 16, cam.ppd);
      drawRivers(ctx, cam, 0.5 + 0.5 * detail); drawMountains(ctx, cam, 0.55 + 0.45 * detail);

      /* Rome spotlight glow (0–2.5 s) */
      const rome = cities[0], rx = sx(cam, rome.u), ry = sy(cam, rome.v);
      const hero = 1 - smooth(1.8, 3.4, t);
      if (hero > 0) {
        ctx.save(); const pulse = 0.5 + 0.5 * Math.sin(t * 5.2), r0 = 120 + 25 * pulse, gr = ctx.createRadialGradient(rx, ry, 0, rx, ry, r0 * 2.4);
        gr.addColorStop(0, `rgba(255,214,140,${0.55 * hero})`); gr.addColorStop(0.35, `rgba(214,70,40,${0.22 * hero})`); gr.addColorStop(1, 'rgba(214,70,40,0)');
        ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore();
      }

      /* territory */
      if (t > SEEDS[0].start) {
        renderTerritory(cam, t);
        ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd'); ctx.imageSmoothingEnabled = true; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(terrCanvas, 0, 0, W, H); ctx.restore();
      }
      /* coastline ink (two strokes: soft shadow + crisp line) */
      ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.lineJoin = 'round';
      ctx.lineWidth = 3.2; ctx.strokeStyle = `rgba(${INK},0.18)`; ctx.stroke();
      ctx.lineWidth = 1.25; ctx.strokeStyle = `rgba(${INK},0.88)`; ctx.stroke(); ctx.restore();

      /* labels */
      ctx.save(); ctx.textBaseline = 'middle';
      for (const L of labels) {
        const a = clamp((t - L.t0) / 0.5); if (a <= 0) continue;
        const x = sx(cam, L.u), y = sy(cam, L.v); if (x < -200 || x > W + 200 || y < -80 || y > H + 80) continue;
        if (cam.ppd < L.minPpd) continue;
        const px = clamp(L.size * cam.ppd * 0.55, 10, 32);
        const sp = px * (L.kind === 's' ? 0.34 : 0.26);
        const ink = L.kind === 'p' ? `rgba(70,10,12,${0.78 * a})` : L.kind === 's' ? `rgba(40,76,92,${0.62 * a})` : `rgba(${INK},${0.42 * a})`;
        ctx.save(); ctx.translate(x, y); ctx.rotate(L.rot); ctx.font = `${L.kind === 's' ? 'italic ' : ''}${L.kind === 'p' ? '600 ' : ''}${px}px ${SERIF}`; ctx.fillStyle = ink;
        halo(ctx, (mode) => { if (mode === 'stroke') { const total = [...L.text].reduce((s0, ch) => s0 + ctx.measureText(ch).width + sp, -sp); ctx.lineWidth = 3; let cx = -total / 2; ctx.textAlign = 'left'; [...L.text].forEach((ch) => { ctx.strokeText(ch, cx, 0); cx += ctx.measureText(ch).width + sp; }); } else spaced(ctx, L.text, 0, 0, sp, 'center'); }, L.kind === 's' ? 0 : a * (L.kind === 'o' ? 0.5 : 0.8));
        ctx.restore();
      }
      ctx.restore();

      /* cities */
      ctx.save();
      for (const c of cities) {
        const age = t - c.t0; if (age < 0) continue;
        const x = sx(cam, c.u), y = sy(cam, c.v); if (x < 40 || x > W - 40 || y < 40 || y > H - 40) continue;
        const pop = easeOutBack(age / 0.45), isRome = c.tier === 0 && c.name === 'ROMA';
        const zoomK = clamp(Math.sqrt(cam.ppd / 28), 0.8, 1.5);
        const r = (isRome ? 6.5 : c.tier === 0 ? 5 : 3.8) * pop * zoomK;
        const ring = clamp(age / 0.8);
        if (ring < 1) { ctx.strokeStyle = `rgba(${isRome ? '255,200,120' : '190,40,32'},${0.75 * (1 - ring)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 5 + 26 * easeIOsine(ring) * zoomK, 0, PI * 2); ctx.stroke(); }
        if (isRome && t < 3.6) {                                    // sonar rings while Rome is highlighted
          for (let k = 0; k < 3; k++) { const ph = ((t * 0.9 + k / 3) % 1), rr = 8 + ph * 120; ctx.strokeStyle = `rgba(220,60,40,${0.65 * (1 - ph) * hero})`; ctx.lineWidth = 2.5 * (1 - ph) + 0.5; ctx.beginPath(); ctx.arc(x, y, rr, 0, PI * 2); ctx.stroke(); }
        }
        ctx.fillStyle = 'rgba(246,236,208,0.96)'; ctx.strokeStyle = `rgba(${INK},0.95)`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = isRome ? 'rgb(190,30,26)' : `rgba(${RED},0.95)`; ctx.beginPath(); ctx.arc(x, y, r * 0.52, 0, PI * 2); ctx.fill();
        /* label */
        const vis = c.tier === 0 ? 1 : c.tier === 1 ? smooth(11, 17, cam.ppd) : smooth(21, 28, cam.ppd);
        const la = vis * clamp((age - 0.12) / 0.4); if (la <= 0.02) continue;
        const size = isRome ? clamp(cam.ppd * 0.55, 16, 30) : clamp(11 + (cam.ppd - 15) * 0.05, 11, 14.5), gap = r + 6;
        ctx.font = `${isRome ? '700 ' : 'italic '}${size}px ${SERIF}`; ctx.textBaseline = 'middle';
        let tx = x, ty = y; ctx.textAlign = 'center';
        if (c.side === 'r') { tx += gap; ctx.textAlign = 'left'; } else if (c.side === 'l') { tx -= gap; ctx.textAlign = 'right'; } else if (c.side === 't') ty -= gap + 4; else ty += gap + 4;
        ctx.lineJoin = 'round'; ctx.lineWidth = 4; ctx.strokeStyle = `rgba(242,230,196,${0.88 * la})`;
        if (isRome) { ctx.textAlign = 'right'; tx = x - gap - 2; ctx.save(); ctx.fillStyle = `rgba(110,14,16,${la})`; ctx.strokeText(c.name, tx, ty); const wsp = ctx.measureText(c.name).width; ctx.fillText(c.name, tx, ty); ctx.restore(); ctx.font = `italic ${Math.round(size * 0.55)}px ${SERIF}`; ctx.fillStyle = `rgba(${INK},${0.9 * la})`; if (t < 2.4) { ctx.globalAlpha = 1 - smooth(1.9, 2.4, t); ctx.fillText('753 BC', tx, ty + size * 0.75); ctx.globalAlpha = 1; } void wsp; }
        else { ctx.strokeText(c.name, tx, ty); ctx.fillStyle = `rgba(${INK},${0.95 * la})`; ctx.fillText(c.name, tx, ty); }
      }
      ctx.restore();

      drawCompass(ctx, cam);

      /* light: Rome spotlight vignette + permanent vignette */
      if (hero > 0) {
        const gr = ctx.createRadialGradient(rx, ry, H * 0.18, rx, ry, H * 0.95); gr.addColorStop(0, 'rgba(25,12,4,0)'); gr.addColorStop(1, `rgba(25,12,4,${0.62 * hero})`);
        ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
      }
      { const gr = ctx.createRadialGradient(W / 2, H / 2, H * 0.42, W / 2, H / 2, H * 1.05); gr.addColorStop(0, 'rgba(30,14,2,0)'); gr.addColorStop(1, 'rgba(30,14,2,0.3)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }

      drawFrameAndTicks(ctx, cam);
      drawScaleBar(ctx, cam);

      /* titles */
      const ty = (t - 0.25) / 0.7, ta = clamp(ty);
      if (ta > 0) {
        panel(ctx, 64, 64, 478, 62, ta);
        ctx.save(); ctx.globalAlpha = ta; ctx.fillStyle = `rgba(${INK},0.95)`; ctx.textBaseline = 'middle'; ctx.font = `600 19px ${SERIF}`;
        spaced(ctx, 'THE EXPANSION OF ROME', 86, 88, 3.4, 'left'); ctx.font = `italic 14px ${SERIF}`; ctx.fillStyle = `rgba(${RED},1)`; spaced(ctx, 'Imperium Romanum · 753 BC – 117 AD', 87, 111, 0.6, 'left'); ctx.restore();
      }
      const yr = yearAt(t), yrA = clamp((t - 0.45) / 0.5) * (1 - smooth(8.2, 8.7, t));
      if (yrA > 0) {
        panel(ctx, 64, H - 232, 368, 112, yrA);
        ctx.save(); ctx.globalAlpha = yrA; ctx.textBaseline = 'alphabetic';
        ctx.fillStyle = `rgba(${RED},1)`; ctx.font = `700 52px ${SERIF}`; ctx.textAlign = 'left'; ctx.fillText(fmtYear(yr), 88, H - 170);
        ctx.fillStyle = `rgba(${INK},0.95)`; ctx.font = `italic 16.5px ${SERIF}`; ctx.fillText(captionAt(t, yr), 88, H - 140); ctx.restore();
      }
      const fa = smooth(8.4, 9.3, t);
      if (fa > 0) {
        const pw = 760, px0 = (W - pw) / 2, py0 = H - 214 + (1 - fa) * 24;
        panel(ctx, px0, py0, pw, 128, fa);
        ctx.save(); ctx.globalAlpha = fa; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = `rgba(${RED},1)`; ctx.font = `700 40px ${SERIF}`; spaced(ctx, 'THE ROMAN EMPIRE', W / 2, py0 + 55, 6, 'center');
        ctx.fillStyle = `rgba(${INK},0.95)`; ctx.font = `italic 18px ${SERIF}`; spaced(ctx, 'At its greatest extent · 117 AD · about 5 million km²', W / 2, py0 + 88, 0.8, 'center');
        ctx.strokeStyle = `rgba(${INK},0.5)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(px0 + 150, py0 + 68); ctx.lineTo(px0 + pw - 150, py0 + 68); ctx.stroke();
        ctx.font = `14px ${SERIF}`; ctx.fillStyle = `rgba(${INK},0.8)`; spaced(ctx, 'FROM THE WALL IN BRITANNIA TO THE EUPHRATES', W / 2, py0 + 109, 2.6, 'center'); ctx.restore();
      }

      /* film grain + fade-in */
      ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = 0.12;
      const f = Math.round(t * CFG.FPS); ctx.translate((f * 53) % 256, (f * 97) % 256);
      ctx.fillStyle = ctx.createPattern(grainTile, 'repeat'); ctx.fillRect(-256, -256, W + 512, H + 512); ctx.restore();
      if (t < 0.5) { ctx.fillStyle = `rgba(0,0,0,${1 - smooth(0, 0.5, t)})`; ctx.fillRect(0, 0, W, H); }
      ctx.restore();
    }

    return { draw, camera, W, H };
  }

  return { CFG, create, _internals: { SEEDS, EMPIRE, yearAt } };
});
