// @ts-nocheck — Canvas2D map renderer (procedural parchment, coastlines, per-pixel territory field, overlays). Pure function of state.
import { LAND_RINGS, MODERN_BORDERS } from './geo.generated';
import { SEEDS, ZONES, EMPIRE, CARTHAGE, ROADS, TRADE, FRONTIER, CITIES, LABELS, MOUNTAINS, RIVERS, MODERN_LABELS } from '../data/history';

const INK = '58,36,20', RED = '150,24,26';
const SERIF = '"Cormorant Garamond",Georgia,"Liberation Serif",serif';
const CAPS = '"Cinzel","Cormorant Garamond",Georgia,serif';
const SANS = '"Inter","Liberation Sans",Arial,sans-serif';
const PI = Math.PI, D2R = PI / 180;
const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeIO = (t) => 0.5 - 0.5 * Math.cos(PI * clamp(t));
const easeOutBack = (t) => { t = clamp(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const mercV = (lat) => Math.log(Math.tan(PI / 4 + (clamp(lat, -85, 85) * D2R) / 2));
const latOfV = (v) => (2 * Math.atan(Math.exp(v)) - PI / 2) / D2R;

function mulberry32(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function hash2(ix, iy, seed) { let h = (Math.imul(ix, 374761393) + Math.imul(iy, 668265263) + Math.imul(seed, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function vnoise(x, y, seed) { const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy); return lerp(lerp(hash2(ix, iy, seed), hash2(ix + 1, iy, seed), u), lerp(hash2(ix, iy + 1, seed), hash2(ix + 1, iy + 1, seed), u), v); }
function fbm(x, y, seed, oct) { let a = 0.5, s = 0, n = 0; for (let i = 0; i < oct; i++) { s += a * vnoise(x, y, seed + i * 17); n += a; x *= 2.03; y *= 2.03; a *= 0.5; } return s / n; }
const pointInRing = (flat, lon, lat) => { let inside = false; for (let i = 0, j = flat.length / 2 - 1; i < flat.length / 2; j = i++) { const xi = flat[i * 2], yi = flat[i * 2 + 1], xj = flat[j * 2], yj = flat[j * 2 + 1]; if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside; } return inside; };

export function createMapEngine({ W = 1920, H = 1080, quality = 0.5, makeCanvas }) {
  /* ---------- projected geometry ---------- */
  const rings = LAND_RINGS.map((flat) => {
    const n = flat.length / 2, p = new Float32Array(n * 2); let u0 = 1e9, u1 = -1e9, v0 = 1e9, v1 = -1e9;
    for (let i = 0; i < n; i++) { const u = flat[i * 2] * D2R, v = mercV(flat[i * 2 + 1]); p[i * 2] = u; p[i * 2 + 1] = v; if (u < u0) u0 = u; if (u > u1) u1 = u; if (v < v0) v0 = v; if (v > v1) v1 = v; }
    return { p, n, u0, u1, v0, v1, flat };
  });
  const borders = MODERN_BORDERS.map((flat) => { const n = flat.length / 2, p = new Float32Array(n * 2); for (let i = 0; i < n; i++) { p[i * 2] = flat[i * 2] * D2R; p[i * 2 + 1] = mercV(flat[i * 2 + 1]); } return { p, n }; });

  /* ---------- territory fields on a Mercator grid ---------- */
  const CPD = 20, LON0 = -14, LON1 = 50, LAT0 = 22, LAT1 = 58;
  const U0 = LON0 * D2R, VMAX = mercV(LAT1);
  const GW = Math.round((LON1 - LON0) * CPD), du = ((LON1 - LON0) * D2R) / GW, GH = Math.ceil((VMAX - mercV(LAT0)) / du);
  const F = new Float32Array(GW * GH * 4);   // T (arrival τ), M (signed px-distance inside empire), E (distance to province border), G (local speed)
  (function buildFields() {
    const mc = makeCanvas(GW, GH), mg = mc.getContext('2d');
    const toXY = ([lo, la]) => [(lo * D2R - U0) / du, (VMAX - mercV(la)) / du];
    mg.fillStyle = '#000'; mg.fillRect(0, 0, GW, GH); mg.fillStyle = '#fff';
    for (const poly of EMPIRE) { mg.beginPath(); poly.forEach((pt, i) => { const [x, y] = toXY(pt); i ? mg.lineTo(x, y) : mg.moveTo(x, y); }); mg.closePath(); mg.fill(); }
    const px = mg.getImageData(0, 0, GW, GH).data;
    // island zones: paint each island's coastline ring with its zone id (R channel)
    const zc = makeCanvas(GW, GH), zg = zc.getContext('2d'); zg.fillStyle = '#000'; zg.fillRect(0, 0, GW, GH);
    ZONES.forEach((z, zi) => {
      const ring = rings.find((r) => pointInRing(r.flat, z.pt[0], z.pt[1])); if (!ring) return;
      zg.fillStyle = `rgb(${zi + 1},0,0)`; zg.beginPath();
      for (let i = 0; i < ring.n; i++) { const [x, y] = toXY([ring.flat[i * 2], ring.flat[i * 2 + 1]]); i ? zg.lineTo(x, y) : zg.moveTo(x, y); } zg.closePath(); zg.fill();
    });
    const zp = zg.getImageData(0, 0, GW, GH).data;
    let a = new Float32Array(GW * GH), b = new Float32Array(GW * GH);
    for (let i = 0; i < a.length; i++) a[i] = px[i * 4] / 255;
    const R = 2;
    const blur = (src, dst, horiz) => {
      const len = horiz ? GW : GH, cnt = horiz ? GH : GW, stride = horiz ? 1 : GW, step = horiz ? GW : 1;
      for (let l = 0; l < cnt; l++) { const base = l * step; let sum = 0; for (let k = -R; k <= R; k++) sum += src[base + clamp(k, 0, len - 1) * stride];
        for (let k = 0; k < len; k++) { dst[base + k * stride] = sum / (2 * R + 1); sum += src[base + clamp(k + R + 1, 0, len - 1) * stride] - src[base + clamp(k - R, 0, len - 1) * stride]; } }
    };
    for (let pass = 0; pass < 3; pass++) { blur(a, b, true); blur(b, a, false); }
    const edgeScale = (2.45 * 2.5066) / CPD;
    for (let gy = 0; gy < GH; gy++) {
      const v = VMAX - (gy + 0.5) * du, lat = latOfV(v), cosphi = Math.cos(lat * D2R);
      for (let gx = 0; gx < GW; gx++) {
        const lon = LON0 + (gx + 0.5) / CPD, warp = 1 + 0.34 * (fbm(lon * 0.55, lat * 0.55, 7, 4) - 0.5) * 2;
        let T = 1e3, G = 4, s1 = 1e9, s2 = 1e9, R1 = 1, R2 = 1;
        const zid = zp[(gy * GW + gx) * 4];
        for (const s of SEEDS) {
          const dx = (lon - s.lon) * Math.cos(((lat + s.lat) / 2) * D2R), dy = lat - s.lat, d = Math.hypot(dx, dy) * warp;
          const tt = d < s.R ? s.start + d / s.v : s.start + s.R / s.v + (d - s.R) * 3.4;
          if (tt > 40) continue;
          if (tt < T && !zid) { T = tt; G = s.v / cosphi; }
          const sc = d / s.R; if (sc < s1) { s2 = s1; R2 = R1; s1 = sc; R1 = s.R; } else if (sc < s2) { s2 = sc; R2 = s.R; }
        }
        if (zid) { const z = ZONES[zid - 1], dd = Math.hypot((lon - z.pt[0]) * cosphi, lat - z.pt[1]) * warp; T = z.start + dd / z.v; G = z.v / cosphi; }
        const i = (gy * GW + gx) * 4;
        F[i] = T; F[i + 1] = (a[gy * GW + gx] - 0.5) * edgeScale * 2.0; F[i + 2] = s2 > 1e8 ? 99 : ((s2 - s1) / (1 / R1 + 1 / R2)) / cosphi; F[i + 3] = G;
      }
    }
  })();
  const sampleField = (lon, lat, k) => {
    const gx = (lon * D2R - U0) / du - 0.5, gy = (VMAX - mercV(lat)) / du - 0.5;
    const x0 = clamp(Math.floor(gx), 0, GW - 2), y0 = clamp(Math.floor(gy), 0, GH - 2), fx = clamp(gx - x0), fy = clamp(gy - y0), at = (x, y) => F[(y * GW + x) * 4 + k];
    return lerp(lerp(at(x0, y0), at(x0 + 1, y0), fx), lerp(at(x0, y0 + 1), at(x0 + 1, y0 + 1), fx), fy);
  };
  const cities = CITIES.map(([lon, lat, name, tier, side]) => ({ lon, lat, name, tier, side, u: lon * D2R, v: mercV(lat), t0: name === 'ROMA' ? 0.2 : Math.min(sampleField(lon, lat, 0) + 0.18, 7.5) }));
  const labels = LABELS.map(([lon, lat, text, size, rot, kind, minPpd]) => ({ u: lon * D2R, v: mercV(lat), text, size, rot: rot * D2R, kind, t0: kind === 'p' ? Math.min(sampleField(lon, lat, 0) + 0.3, 7.6) : 0, minPpd: minPpd || 0 }));
  const proj = (arr) => arr.map(([lo, la]) => [lo * D2R, mercV(la)]);
  const roadsP = ROADS.map((r) => ({ name: r.name, pts: proj(r.pts) })), tradeP = TRADE.map((r) => ({ ...r, pts: proj(r.pts) })), frontierP = FRONTIER.map(proj), riversP = RIVERS.map(proj);
  const mountainMarks = [];
  { const rnd = mulberry32(31); for (const line of MOUNTAINS) for (let i = 0; i < line.length - 1; i++) { const [x0, y0] = line[i], [x1, y1] = line[i + 1], n = Math.max(1, Math.round(Math.hypot(x1 - x0, y1 - y0) / 0.34));
    for (let k = 0; k < n; k++) { const f = (k + rnd() * 0.6) / n; mountainMarks.push({ u: (lerp(x0, x1, f) + (rnd() - 0.5) * 0.5) * D2R, v: mercV(lerp(y0, y1, f) + (rnd() - 0.5) * 0.5), s: 0.7 + rnd() * 0.6 }); } } }

  /* ---------- parchment ---------- */
  const parchment = (() => {
    const c = makeCanvas(W, H), g = c.getContext('2d'), img = g.createImageData(W, H), d = img.data;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, nx = x / W, ny = y / H, big = fbm(x * 0.0028, y * 0.0028, 11, 4), mid = fbm(x * 0.016, y * 0.016, 23, 2), grain = hash2(x, y, 99) - 0.5, blotch = smooth(0.38, 0.72, big);
      let r = lerp(238, 208, blotch), gg = lerp(222, 180, blotch), b = lerp(180, 130, blotch);
      const burn = smooth(0, 0.15, Math.min(nx, 1 - nx, (ny < 0.5 ? ny : 1 - ny) * 1.6) + (mid - 0.5) * 0.09), m = lerp(0.74, 1, burn);
      r = r * m + (1 - m) * 40; gg = gg * m + (1 - m) * 20; b = b * m + (1 - m) * 6;
      const k = (mid - 0.5) * 16 + grain * 9; d[i] = clamp(r + k, 0, 255); d[i + 1] = clamp(gg + k, 0, 255); d[i + 2] = clamp(b + k * 0.9, 0, 255); d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    const rnd = mulberry32(5);
    for (let n = 0; n < 2200; n++) { const x = rnd() * W, y = rnd() * H, a = rnd() * PI * 2, l = 5 + rnd() * 26; g.strokeStyle = rnd() < 0.5 ? `rgba(255,248,225,${0.05 + rnd() * 0.07})` : `rgba(${INK},${0.03 + rnd() * 0.05})`; g.lineWidth = 0.6 + rnd() * 0.7; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a + 0.6) * l * 0.5, y + Math.sin(a + 0.6) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    for (let n = 0; n < 9; n++) { const x = rnd() * W, y = rnd() * H, r = 90 + rnd() * 240, gr = g.createRadialGradient(x, y, r * 0.2, x, y, r); gr.addColorStop(0, 'rgba(120,80,30,0)'); gr.addColorStop(0.82, `rgba(120,80,30,${0.03 + rnd() * 0.03})`); gr.addColorStop(0.93, `rgba(100,62,22,${0.07 + rnd() * 0.05})`); gr.addColorStop(1, 'rgba(100,62,22,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
    for (let n = 0; n < 380; n++) { const x = rnd() * W, y = rnd() * H, r = 0.6 + rnd() * rnd() * 3.4; g.fillStyle = `rgba(110,64,22,${0.06 + rnd() * 0.16})`; g.beginPath(); g.arc(x, y, r, 0, PI * 2); g.fill(); }
    return c;
  })();

  /* ---------- territory pass ---------- */
  const TW = Math.round(W * quality), TH = Math.round(H * quality);
  const terrCanvas = makeCanvas(TW, TH), terrCtx = terrCanvas.getContext('2d'), terrImg = terrCtx.createImageData(TW, TH);
  function renderTerritory(cam, now) {
    const out = terrImg.data; out.fill(0);
    const s = cam.s * quality, ppd = s * D2R, kx = 1 / (s * du), gx0 = (cam.uc - TW / 2 / s - U0) / du, gy0 = (VMAX - (cam.vc + TH / 2 / s)) / du;
    const xa = Math.max(0, Math.ceil((1.0 - gx0) / kx)), xb = Math.min(TW - 1, Math.floor((GW - 2.01 - gx0) / kx)), ya = Math.max(0, Math.ceil((1.0 - gy0) / kx)), yb = Math.min(TH - 1, Math.floor((GH - 2.01 - gy0) / kx));
    const hatchK = 0.55 * quality;
    for (let y = ya; y <= yb; y++) {
      const gy = gy0 + y * kx, iy = gy | 0, fy = gy - iy;
      for (let x = xa; x <= xb; x++) {
        const gx = gx0 + x * kx, ix = gx | 0, fx = gx - ix, i00 = (iy * GW + ix) * 4, i10 = i00 + 4, i01 = i00 + GW * 4, i11 = i01 + 4;
        const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy;
        const T = F[i00] * w00 + F[i10] * w10 + F[i01] * w01 + F[i11] * w11, age = now - T; if (age <= 0) continue;
        const Md = (F[i00 + 1] * w00 + F[i10 + 1] * w10 + F[i01 + 1] * w01 + F[i11 + 1] * w11) * ppd; if (Md < -1.2) continue;
        const G = F[i00 + 3] * w00 + F[i10 + 3] * w10 + F[i01 + 3] * w01 + F[i11 + 3] * w11, E = (F[i00 + 2] * w00 + F[i10 + 2] * w10 + F[i01 + 2] * w01 + F[i11 + 2] * w11) * ppd;
        const fd = age * G * ppd, cov = smooth(-0.9, 0.9, Md) * smooth(0, 1.6, fd); if (cov <= 0) continue;
        const glow = Math.exp(-age * 3.2), hatch = 0.5 + 0.5 * Math.sin((x + y) * hatchK);
        let r = lerp(196, 252, glow), g = lerp(52, 118, glow), b = lerp(44, 72, glow), al = (0.84 + 0.14 * glow - 0.07 * hatch) * cov;
        const edgeL = (1 - smooth(0.5, 1.9 * quality + 0.5, Math.abs(Md))) * smooth(0, 1.2, fd), provL = (1 - smooth(0.35, 1.25 * quality + 0.35, E)) * 0.62 * smooth(0, 1.2, fd) * (Md > 1.5 ? 1 : 0), frontL = (1 - smooth(0.7, 3.2 * quality, fd)) * (Md > 0 ? 1 : 0.4);
        const line = Math.max(edgeL * 0.95, provL, frontL * 0.8);
        if (line > 0) { const na = al + line * (1 - al); r = (r * al * (1 - line) + 120 * line) / (na || 1); g = (g * al * (1 - line) + 30 * line) / (na || 1); b = (b * al * (1 - line) + 26 * line) / (na || 1); al = na; }
        const o = (y * TW + x) * 4; out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = al * 255;
      }
    }
    terrCtx.putImageData(terrImg, 0, 0);
  }

  /* ---------- helpers ---------- */
  const camOf = (c) => { const s = W / (c.W * D2R); return { s, uc: c.lon * D2R, vc: mercV(c.lat), ppd: s * D2R, wdeg: c.W }; };
  function traceRings(ctx, cam) {
    const s = cam.s, ox = W / 2 - cam.uc * s, oy = H / 2 + cam.vc * s;
    for (const r of rings) { if (r.u1 * s + ox < -60 || r.u0 * s + ox > W + 60 || oy - r.v0 * s < -60 || oy - r.v1 * s > H + 60) continue; const p = r.p; ctx.moveTo(p[0] * s + ox, oy - p[1] * s); for (let i = 1; i < r.n; i++) ctx.lineTo(p[i * 2] * s + ox, oy - p[i * 2 + 1] * s); ctx.closePath(); }
  }
  const sx = (cam, u) => W / 2 + (u - cam.uc) * cam.s, sy = (cam, v) => H / 2 - (v - cam.vc) * cam.s;
  function spaced(ctx, text, x, y, sp, align) { const ws = [...text].map((ch) => ctx.measureText(ch).width + sp), total = ws.reduce((a, b) => a + b, 0) - sp; let cx = align === 'center' ? x - total / 2 : align === 'right' ? x - total : x; ctx.textAlign = 'left'; [...text].forEach((ch, i) => { ctx.fillText(ch, cx, y); cx += ws[i]; }); return total; }
  function tracePoly(ctx, cam, poly) { poly.forEach(([lo, la], i) => { const x = sx(cam, lo * D2R), y = sy(cam, mercV(la)); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); }
  function polyline(ctx, cam, pts) { const P = pts.map(([u, v]) => [sx(cam, u), sy(cam, v)]); ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length - 1; i++) ctx.quadraticCurveTo(P[i][0], P[i][1], (P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2); ctx.lineTo(P[P.length - 1][0], P[P.length - 1][1]); return P; }
  /** point + heading at fraction p along a screen polyline */
  function along(P, p) { const seg = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); tot += l; } let d = clamp(p) * tot; for (let i = 0; i < seg.length; i++) { if (d <= seg[i] || i === seg.length - 1) { const f = seg[i] ? d / seg[i] : 0; return { x: lerp(P[i][0], P[i + 1][0], f), y: lerp(P[i][1], P[i + 1][1], f), a: Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]), tot }; } d -= seg[i]; } return { x: P[0][0], y: P[0][1], a: 0, tot }; }
  /** partial polyline up to fraction p (screen space), drawn with the smooth path */
  function partial(ctx, P, p) { const seg = []; let tot = 0; for (let i = 1; i < P.length; i++) { const l = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg.push(l); tot += l; } let d = clamp(p) * tot; ctx.moveTo(P[0][0], P[0][1]); for (let i = 0; i < seg.length; i++) { if (d >= seg[i]) { ctx.lineTo(P[i + 1][0], P[i + 1][1]); d -= seg[i]; } else { const f = d / seg[i]; ctx.lineTo(lerp(P[i][0], P[i + 1][0], f), lerp(P[i][1], P[i + 1][1], f)); break; } } }

  const glyph = {
    army(ctx, x, y, a, k, col) { ctx.save(); ctx.translate(x, y); ctx.rotate(a); for (let i = 0; i < 6; i++) { const ox = -i * 5 * k, oy = ((i % 2) - 0.5) * 6 * k; ctx.fillStyle = `rgb(${col})`; ctx.strokeStyle = 'rgba(30,14,4,0.9)'; ctx.lineWidth = 1; ctx.fillRect(ox - 4 * k, oy - 3 * k, 8 * k, 6 * k); ctx.strokeRect(ox - 4 * k, oy - 3 * k, 8 * k, 6 * k); } ctx.strokeStyle = 'rgba(30,14,4,0.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(2 * k, 0); ctx.lineTo(2 * k, -13 * k); ctx.stroke(); ctx.fillStyle = 'rgb(214,170,60)'; ctx.fillRect(2 * k, -13 * k, 6 * k, 4 * k); ctx.restore(); },
    elephant(ctx, x, y, a, k, col) { ctx.save(); ctx.translate(x, y); if (Math.cos(a) < 0) ctx.scale(-1, 1); ctx.fillStyle = `rgb(${col})`; ctx.strokeStyle = 'rgba(20,10,4,0.95)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.ellipse(0, 0, 11 * k, 7 * k, 0, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.arc(11 * k, -3 * k, 5 * k, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.beginPath(); ctx.moveTo(15 * k, -2 * k); ctx.quadraticCurveTo(19 * k, 3 * k, 15 * k, 8 * k); ctx.lineWidth = 2.4 * k; ctx.stroke(); ctx.lineWidth = 3 * k; for (const lx of [-7, -2, 4, 8]) { ctx.beginPath(); ctx.moveTo(lx * k, 5 * k); ctx.lineTo(lx * k, 11 * k); ctx.stroke(); } ctx.restore(); },
    ship(ctx, x, y, a, k, col, t) { ctx.save(); ctx.translate(x, y + Math.sin(t * 3 + x) * 1.5); if (Math.cos(a) < 0) ctx.scale(-1, 1); ctx.fillStyle = `rgb(${col})`; ctx.strokeStyle = 'rgba(30,14,4,0.95)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(-12 * k, -2 * k); ctx.quadraticCurveTo(0, 8 * k, 12 * k, -4 * k); ctx.lineTo(10 * k, -2 * k); ctx.quadraticCurveTo(0, 3 * k, -10 * k, -3 * k); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.fillStyle = 'rgba(240,228,196,0.95)'; ctx.beginPath(); ctx.moveTo(0, -3 * k); ctx.lineTo(0, -15 * k); ctx.lineTo(7 * k, -4 * k); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore(); },
  };

  /* ---------- the map frame ---------- */
  function render(ctx, S) {
    const cam = camOf(S.cam), tau = S.tau ?? 7.5, now = S.time ?? 0, L = S.layers || {};
    ctx.save(); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.drawImage(parchment, 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = 'rgb(200,214,204)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd'); ctx.fillStyle = 'rgba(248,238,208,0.5)'; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, H); traceRings(ctx, cam); ctx.clip('evenodd'); ctx.beginPath(); traceRings(ctx, cam); ctx.lineJoin = 'round';
    for (const [w, a] of [[34, 0.045], [22, 0.06], [13, 0.08], [6, 0.11]]) { ctx.lineWidth = w; ctx.strokeStyle = `rgba(52,84,92,${a})`; ctx.stroke(); } ctx.restore();
    // graticule
    ctx.save(); ctx.lineWidth = 1; const left = (cam.uc - W / 2 / cam.s) / D2R, right = (cam.uc + W / 2 / cam.s) / D2R, top = latOfV(cam.vc + H / 2 / cam.s), bot = latOfV(cam.vc - H / 2 / cam.s);
    const gstep = cam.wdeg > 70 ? 10 : 5;
    for (let lon = Math.floor(left / gstep) * gstep; lon <= right; lon += gstep) { ctx.strokeStyle = `rgba(${INK},${lon % 10 === 0 ? 0.17 : 0.09})`; const x = sx(cam, lon * D2R); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let lat = Math.floor(Math.max(bot, -80) / gstep) * gstep; lat <= Math.min(top, 80); lat += gstep) { ctx.strokeStyle = `rgba(${INK},${lat % 10 === 0 ? 0.17 : 0.09})`; const y = sy(cam, mercV(lat)); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.restore();
    const detail = smooth(8, 16, cam.ppd);
    // rivers
    ctx.save(); ctx.strokeStyle = `rgba(48,86,100,${0.5 + 0.5 * detail})`; ctx.lineWidth = clamp(cam.ppd * 0.045, 1, 2.2); ctx.lineCap = 'round'; for (const r of riversP) { ctx.beginPath(); polyline(ctx, cam, r); ctx.stroke(); } ctx.restore();
    // mountains
    { const sz = clamp(cam.ppd * 0.16, 2.4, 8), a = 0.55 + 0.45 * detail; ctx.save(); ctx.lineWidth = 1; ctx.lineJoin = 'round';
      for (const m of mountainMarks) { const x = sx(cam, m.u), y = sy(cam, m.v); if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue; const k = sz * m.s;
        ctx.fillStyle = `rgba(${INK},${0.32 * a})`; ctx.beginPath(); ctx.moveTo(x, y - k); ctx.lineTo(x + k, y + k * 0.6); ctx.lineTo(x + k * 0.1, y + k * 0.6); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(${INK},${0.7 * a})`; ctx.beginPath(); ctx.moveTo(x - k, y + k * 0.6); ctx.lineTo(x, y - k); ctx.lineTo(x + k, y + k * 0.6); ctx.stroke(); } ctx.restore(); }
    // custom regions (e.g. Etruria / Latium), clipped to land
    if (L.regions && L.regions.length) { ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd');
      for (const r of L.regions) { const a = r.a ?? 1; ctx.beginPath(); tracePoly(ctx, cam, r.poly); ctx.fillStyle = `rgba(${r.color},${0.55 * a})`; ctx.fill(); ctx.setLineDash([8, 5]); ctx.lineDashOffset = -now * 12; ctx.strokeStyle = `rgba(${r.color},${0.95 * a})`; ctx.lineWidth = 2.2; ctx.stroke(); ctx.setLineDash([]); } ctx.restore(); }
    // Rome glow
    const rome = cities[0], rx = sx(cam, rome.u), ry = sy(cam, rome.v);
    if (L.romeGlow > 0) { const hero = L.romeGlow; ctx.save(); const pulse = 0.5 + 0.5 * Math.sin(now * 5.2), r0 = 120 + 25 * pulse, gr = ctx.createRadialGradient(rx, ry, 0, rx, ry, r0 * 2.4); gr.addColorStop(0, `rgba(255,120,60,${0.62 * hero})`); gr.addColorStop(0.35, `rgba(200,50,30,${0.3 * hero})`); gr.addColorStop(1, 'rgba(200,50,30,0)'); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); ctx.restore(); }
    // territory
    if (L.territory !== false && tau > SEEDS[0].start) { renderTerritory(cam, tau); ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd'); ctx.imageSmoothingEnabled = true; ctx.globalCompositeOperation = 'multiply'; ctx.drawImage(terrCanvas, 0, 0, W, H); ctx.restore(); }
    // Carthaginian sphere
    if (L.carthage > 0) { ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd'); for (const poly of CARTHAGE) { ctx.beginPath(); tracePoly(ctx, cam, poly); ctx.fillStyle = `rgba(88,52,120,${0.6 * L.carthage})`; ctx.globalCompositeOperation = 'multiply'; ctx.fill(); ctx.globalCompositeOperation = 'source-over'; ctx.setLineDash([9, 5]); ctx.lineDashOffset = -now * 10; ctx.strokeStyle = `rgba(60,28,92,${0.95 * L.carthage})`; ctx.lineWidth = 2.4; ctx.stroke(); ctx.setLineDash([]); } ctx.restore(); }
    // coastline ink
    ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.lineJoin = 'round'; ctx.lineWidth = 3.2; ctx.strokeStyle = `rgba(${INK},0.18)`; ctx.stroke(); ctx.lineWidth = 1.25; ctx.strokeStyle = `rgba(${INK},0.88)`; ctx.stroke(); ctx.restore();
    // roads
    if (L.roads > 0) { ctx.save(); ctx.lineCap = 'round'; const n = roadsP.length;
      roadsP.forEach((r, i) => { const p = clamp(L.roads * (n * 0.5 + 1) / n * 1.6 - (i / n) * 0.9); if (p <= 0) return; const P = r.pts.map(([u, v]) => [sx(cam, u), sy(cam, v)]); ctx.beginPath(); partial(ctx, P, p);
        ctx.strokeStyle = 'rgba(30,14,4,0.55)'; ctx.lineWidth = clamp(cam.ppd * 0.2, 4, 8); ctx.stroke(); ctx.strokeStyle = 'rgba(244,206,110,1)'; ctx.lineWidth = clamp(cam.ppd * 0.11, 2.4, 4.6); ctx.stroke(); }); ctx.restore(); }
    // trade lanes
    if (L.trade > 0) { ctx.save(); ctx.lineCap = 'round'; tradeP.forEach((r, i) => { const p = clamp(L.trade * 1.5 - (i / tradeP.length) * 0.5); if (p <= 0) return; const P = r.pts.map(([u, v]) => [sx(cam, u), sy(cam, v)]); ctx.beginPath(); partial(ctx, P, p); ctx.setLineDash(r.sea ? [3, 7] : [10, 6]); ctx.lineDashOffset = -now * 18; ctx.strokeStyle = r.sea ? 'rgba(24,70,104,0.95)' : 'rgba(110,56,12,0.95)'; ctx.lineWidth = clamp(cam.ppd * 0.07, 1.8, 3.4); ctx.stroke(); ctx.setLineDash([]);
        const h = along(P, p); if (p < 1 || true) glyph.ship && r.sea && glyph.ship(ctx, h.x, h.y, h.a, clamp(cam.ppd / 22, 0.7, 1.3), '120,70,30', now); }); ctx.restore(); }
    // frontier (limes) with forts
    if (L.frontier > 0) { ctx.save(); frontierP.forEach((seg, si) => { const P = seg.map(([u, v]) => [sx(cam, u), sy(cam, v)]); const p = clamp(L.frontier * 1.4 - si * 0.12); if (p <= 0) return; ctx.beginPath(); partial(ctx, P, p); ctx.setLineDash([14, 6]); ctx.strokeStyle = 'rgba(40,16,8,0.95)'; ctx.lineWidth = clamp(cam.ppd * 0.1, 2.2, 4.4); ctx.stroke(); ctx.setLineDash([]);
        const tot = along(P, 0).tot, n = Math.floor((tot * p) / 46); for (let i = 1; i <= n; i++) { const q = along(P, (i * 46) / tot); ctx.fillStyle = 'rgb(214,170,60)'; ctx.strokeStyle = 'rgba(30,14,4,0.95)'; ctx.lineWidth = 1.2; ctx.fillRect(q.x - 3.5, q.y - 6, 7, 9); ctx.strokeRect(q.x - 3.5, q.y - 6, 7, 9); } }); ctx.restore(); }
    // routes with moving armies / ships / elephants
    for (const R of L.routes || []) { const pts = proj(R.pts), P = pts.map(([u, v]) => [sx(cam, u), sy(cam, v)]), p = clamp(R.p); if (p <= 0) continue; ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); partial(ctx, P, p); ctx.strokeStyle = 'rgba(20,8,2,0.5)'; ctx.lineWidth = (R.width || 4) + 3; ctx.stroke(); ctx.beginPath(); partial(ctx, P, p); ctx.strokeStyle = `rgb(${R.color})`; ctx.lineWidth = R.width || 4; if (R.dash) { ctx.setLineDash([12, 7]); ctx.lineDashOffset = -now * 30; } ctx.stroke(); ctx.setLineDash([]);
      const h = along(P, p), k = clamp(cam.ppd / 18, 0.9, 1.7); const fn = glyph[R.marker || 'army']; if (R.marker !== 'none') fn(ctx, h.x, h.y, h.a, k, R.color, now);
      if (R.marker === 'elephant') { const h2 = along(P, Math.max(0, p - 18 / h.tot)); glyph.elephant(ctx, h2.x, h2.y, h2.a, k * 0.9, R.color); }
      ctx.restore(); }
    // markers (battle / pin)
    for (const M of L.markers || []) { const a = M.a ?? 1; if (a <= 0) continue; const x = sx(cam, M.lon * D2R), y = sy(cam, mercV(M.lat)), pop = easeOutBack(a), r = 11 * pop; ctx.save();
      if (M.kind === 'battle') { const ring = clamp(a); ctx.strokeStyle = `rgba(190,30,20,${0.8 * (1 - ring)})`; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(x, y, 10 + 40 * ring, 0, PI * 2); ctx.stroke(); ctx.fillStyle = 'rgba(244,232,200,0.97)'; ctx.strokeStyle = 'rgba(120,14,14,1)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(x - r * 0.55, y - r * 0.55); ctx.lineTo(x + r * 0.55, y + r * 0.55); ctx.moveTo(x + r * 0.55, y - r * 0.55); ctx.lineTo(x - r * 0.55, y + r * 0.55); ctx.stroke(); }
      else { ctx.fillStyle = 'rgba(244,232,200,0.97)'; ctx.strokeStyle = `rgba(${INK},1)`; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(x, y, 6 * pop, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = `rgba(${M.color || RED},1)`; ctx.beginPath(); ctx.arc(x, y, 3 * pop, 0, PI * 2); ctx.fill(); }
      if (M.label) { ctx.globalAlpha = clamp((a - 0.3) / 0.5); ctx.font = `600 ${M.size || 17}px ${SERIF}`; ctx.textAlign = M.align || 'left'; ctx.textBaseline = 'middle'; const lx = x + (M.align === 'right' ? -18 : M.align === 'center' ? 0 : 18), ly = y + (M.dy || 0); ctx.lineJoin = 'round'; ctx.lineWidth = 5; ctx.strokeStyle = 'rgba(242,230,196,0.92)'; ctx.strokeText(M.label, lx, ly); ctx.fillStyle = `rgba(${M.color || '90,12,14'},1)`; ctx.fillText(M.label, lx, ly); }
      ctx.restore(); }
    // province / sea labels
    if (L.labels !== false) { ctx.save(); ctx.textBaseline = 'middle';
      for (const lb of labels) { const a = lb.kind === 'p' ? clamp((tau - lb.t0) / 0.5) : lb.kind === 's' ? 1 : (L.outsideLabels === false ? 0 : 0.8); if (a <= 0) continue; if (cam.ppd < lb.minPpd) continue; const x = sx(cam, lb.u), y = sy(cam, lb.v); if (x < -200 || x > W + 200 || y < -80 || y > H + 80) continue;
        const px = clamp(lb.size * cam.ppd * 0.55, 10, 32), sp = px * (lb.kind === 's' ? 0.34 : 0.26); const ink = lb.kind === 'p' ? `rgba(70,10,12,${0.78 * a})` : lb.kind === 's' ? `rgba(40,76,92,${0.62 * a})` : `rgba(${INK},${0.42 * a})`;
        ctx.save(); ctx.translate(x, y); ctx.rotate(lb.rot); ctx.font = `${lb.kind === 's' ? 'italic ' : ''}${lb.kind === 'p' ? '600 ' : ''}${px}px ${CAPS}`; ctx.fillStyle = ink;
        if (lb.kind !== 's') { const total = [...lb.text].reduce((s0, ch) => s0 + ctx.measureText(ch).width + sp, -sp); ctx.save(); ctx.lineJoin = 'round'; ctx.strokeStyle = `rgba(240,226,190,${0.85 * a * (lb.kind === 'o' ? 0.5 : 0.8)})`; ctx.lineWidth = 3; let cx = -total / 2; ctx.textAlign = 'left'; [...lb.text].forEach((ch) => { ctx.strokeText(ch, cx, 0); cx += ctx.measureText(ch).width + sp; }); ctx.restore(); }
        spaced(ctx, lb.text, 0, 0, sp, 'center'); ctx.restore(); } ctx.restore(); }
    // cities
    if (L.cities !== false) { ctx.save(); const tierShift = L.tierShift || 0;
      for (const c of cities) { const isR = c.name === 'ROMA', age = tau - c.t0, force = L.forceCities || (isR && L.romeGlow > 0); if (age < 0 && !force) continue; const x = sx(cam, c.u), y = sy(cam, c.v); if (x < 40 || x > W - 40 || y < 40 || y > H - 40) continue;
        const pop = easeOutBack(Math.max(age, 0) / 0.45), isRome = c.name === 'ROMA', zk = clamp(Math.sqrt(cam.ppd / 28), 0.8, 1.5), r = (isRome ? 6.5 : c.tier === 0 ? 5 : 3.8) * pop * zk, ring = clamp(age / 0.8);
        if (ring < 1 && age >= 0) { ctx.strokeStyle = `rgba(${isRome ? '255,200,120' : '190,40,32'},${0.75 * (1 - ring)})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, 5 + 26 * easeIO(ring) * zk, 0, PI * 2); ctx.stroke(); }
        if (isRome && L.romeGlow > 0) for (let k = 0; k < 3; k++) { const ph = (now * 0.9 + k / 3) % 1; ctx.strokeStyle = `rgba(220,60,40,${0.65 * (1 - ph) * L.romeGlow})`; ctx.lineWidth = 2.5 * (1 - ph) + 0.5; ctx.beginPath(); ctx.arc(x, y, 8 + ph * 120, 0, PI * 2); ctx.stroke(); }
        ctx.fillStyle = 'rgba(246,236,208,0.96)'; ctx.strokeStyle = `rgba(${INK},0.95)`; ctx.lineWidth = 1.4; ctx.beginPath(); ctx.arc(x, y, r, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = isRome ? 'rgb(190,30,26)' : `rgba(${RED},0.95)`; ctx.beginPath(); ctx.arc(x, y, r * 0.52, 0, PI * 2); ctx.fill();
        const vis = c.tier === 0 ? 1 : c.tier === 1 ? smooth(11, 17, cam.ppd) : smooth(21, 28, cam.ppd), la = Math.min(1, vis * clamp((Math.max(age, 0) - 0.12) / 0.4) + (force ? vis : 0)); if (la <= 0.02) continue;
        const size = isRome ? clamp(cam.ppd * 0.55, 18, 32) : clamp(13 + (cam.ppd - 15) * 0.05, 13, 17), gap = r + 6; ctx.font = `${isRome ? '700 ' : '600 italic '}${size}px ${isRome ? CAPS : SERIF}`; ctx.textBaseline = 'middle';
        let tx = x, ty = y; ctx.textAlign = 'center'; const side = c.side; if (side === 'r') { tx += gap; ctx.textAlign = 'left'; } else if (side === 'l') { tx -= gap; ctx.textAlign = 'right'; } else if (side === 't') ty -= gap + 4; else ty += gap + 4;
        ctx.lineJoin = 'round'; ctx.lineWidth = 4.5; ctx.strokeStyle = `rgba(242,230,196,${0.9 * la})`; if (isRome) { ctx.textAlign = 'right'; tx = x - gap - 2; }
        ctx.strokeText(c.name, tx, ty); ctx.fillStyle = isRome ? `rgba(110,14,16,${la})` : `rgba(${INK},${0.95 * la})`; ctx.fillText(c.name, tx, ty); }
      ctx.restore(); }
    // spotlight dim (Rome)
    if (L.dim > 0) { const gr = ctx.createRadialGradient(rx, ry, H * 0.16, rx, ry, H * 0.95); gr.addColorStop(0, 'rgba(25,12,4,0)'); gr.addColorStop(1, `rgba(25,12,4,${0.62 * L.dim})`); ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H); }
    // compass rose
    { const cx = sx(cam, -17.5 * D2R), cy = sy(cam, mercV(30.0)), r = cam.ppd * 5.2; if (L.compass !== false && r > 24 && cx > -r && cx < W + r && cy > -r && cy < H + r) { ctx.save(); ctx.translate(cx, cy); ctx.globalAlpha = smooth(30, 60, r);
      ctx.strokeStyle = `rgba(${INK},0.8)`; ctx.lineWidth = 1.2; for (const k of [1, 0.84, 0.62]) { ctx.beginPath(); ctx.arc(0, 0, r * k, 0, PI * 2); ctx.stroke(); }
      for (let i = 0; i < 32; i++) { const a = (i / 32) * PI * 2, l = i % 4 === 0 ? 0.84 : 0.9; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r * l, Math.sin(a) * r * l); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); ctx.stroke(); }
      for (let i = 0; i < 16; i++) { const ang = i * 22.5, kind = ang % 90 === 0 ? [1, 0.11] : ang % 45 === 0 ? [0.72, 0.08] : [0.5, 0.05], a = (ang - 90) * D2R, len = r * 0.84 * kind[0], w = r * kind[1], tx = Math.cos(a) * len, ty = Math.sin(a) * len, nx = -Math.sin(a) * w, ny = Math.cos(a) * w, bx = Math.cos(a) * w * 0.9, by = Math.sin(a) * w * 0.9;
        ctx.fillStyle = ang === 0 ? `rgba(${RED},0.9)` : `rgba(${INK},0.78)`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx + nx, by + ny); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill(); ctx.fillStyle = 'rgba(244,232,200,0.95)'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx - nx, by - ny); ctx.lineTo(tx, ty); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = `rgba(${INK},0.8)`; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(bx + nx, by + ny); ctx.lineTo(tx, ty); ctx.lineTo(bx - nx, by - ny); ctx.closePath(); ctx.stroke(); }
      ctx.fillStyle = `rgba(${INK},0.9)`; ctx.font = `italic 600 ${Math.round(clamp(r * 0.13, 10, 16))}px ${SERIF}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('SEPTENTRIO', 0, -r * 1.12); ctx.fillText('MERIDIES', 0, r * 1.12); ctx.fillText('ORIENS', r * 1.3, 0); ctx.fillText('OCCIDENS', -r * 1.3, 0); ctx.restore(); } }
    ctx.restore();
    if ((S.modernMix ?? 0) > 0) drawModern(ctx, cam, S.modernMix, S);
  }

  /* ---------- the modern map (closing shot) ---------- */
  function drawModern(ctx, cam, mix, S) {
    ctx.save(); ctx.globalAlpha = mix;
    const sea = ctx.createLinearGradient(0, 0, 0, H); sea.addColorStop(0, '#c4d9e6'); sea.addColorStop(1, '#a9c6d8'); ctx.fillStyle = sea; ctx.fillRect(0, 0, W, H);
    ctx.beginPath(); traceRings(ctx, cam); ctx.fillStyle = '#f1eee6'; ctx.fill('evenodd'); ctx.lineJoin = 'round'; ctx.lineWidth = 1; ctx.strokeStyle = '#8b9faa'; ctx.stroke();
    // empire footprint
    ctx.save(); ctx.beginPath(); traceRings(ctx, cam); ctx.clip('evenodd'); const fp = S.footprint ?? 1; ctx.beginPath(); for (const poly of EMPIRE) tracePoly(ctx, cam, poly); ctx.fillStyle = `rgba(196,52,44,${0.34 * fp})`; ctx.fill(); ctx.restore();
    ctx.beginPath(); for (const poly of EMPIRE) tracePoly(ctx, cam, poly); ctx.strokeStyle = `rgba(160,30,26,${0.9 * fp})`; ctx.lineWidth = 2; ctx.setLineDash([8, 5]); ctx.stroke(); ctx.setLineDash([]);
    // borders
    const s = cam.s, ox = W / 2 - cam.uc * s, oy = H / 2 + cam.vc * s; ctx.strokeStyle = 'rgba(120,128,136,0.75)'; ctx.lineWidth = 0.9; ctx.beginPath();
    for (const b of borders) { const p = b.p; ctx.moveTo(p[0] * s + ox, oy - p[1] * s); for (let i = 1; i < b.n; i++) ctx.lineTo(p[i * 2] * s + ox, oy - p[i * 2 + 1] * s); } ctx.stroke();
    // labels
    ctx.fillStyle = '#4b5660'; ctx.textBaseline = 'middle'; for (const [lon, lat, name, size] of MODERN_LABELS) { const x = sx(cam, lon * D2R), y = sy(cam, mercV(lat)); if (x < 0 || x > W || y < 0 || y > H) continue; const px = clamp(size * cam.ppd * 0.34, 9, 20); ctx.font = `600 ${px}px ${SANS}`; ctx.globalAlpha = mix * (S.labelsA ?? 1); spaced(ctx, name, x, y, px * 0.22, 'center'); }
    ctx.globalAlpha = mix * (S.labelsA ?? 1);
    const rx = sx(cam, 12.5 * D2R), ry = sy(cam, mercV(41.9)); ctx.fillStyle = '#b3261e'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(rx, ry, 6, 0, PI * 2); ctx.fill(); ctx.stroke(); ctx.fillStyle = '#7a1a14'; ctx.font = `700 15px ${SANS}`; ctx.textAlign = 'left'; ctx.fillText('Rome', rx + 11, ry + 1);
    ctx.restore();
  }

  return { render, camOf, W, H, sampleField };
}
