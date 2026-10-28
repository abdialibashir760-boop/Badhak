/*
 * WHAT A WEEK FEELS LIKE. — shared scene (browser + Node).
 * Pure Canvas2D, fully deterministic: drawFrame(ctx, t) depends only on time t (seconds).
 * Loaded by index.html (window.WeekRide) and by render.js (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.WeekRide = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ───────────────────────────── configuration ───────────────────────────── */
  const CFG = {
    W: 1080, H: 1920, FPS: 60, DURATION: 14,
    BG: '#0a0a0a', FG: '#ffffff', RED: '#ff2a55',
    TITLE: 'WHAT A WEEK FEELS LIKE.',
    FONT: '"JetBrains Mono","SF Mono","Menlo","Consolas","DejaVu Sans Mono","Liberation Mono",monospace',
    GROUND_SCREEN_Y: 1420,      // where the wheels sit on screen
    BIKE_SCALE: 1.35,
    WALL_X: 7400,               // world x of the sheer wall
    HILL: { x0: 500, x1: 4300, rise: 1500 },      // Mon → Thu (uphill)
    DROP: { x0: 4300, x1: 6300, fall: 1800 },     // Fri → Sat (plunge)
  };
  const S = CFG.BIKE_SCALE;
  const TAU = Math.PI * 2;

  /* ──────────────────────────────── helpers ──────────────────────────────── */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const rad = (d) => (d * Math.PI) / 180;

  /** CSS-style cubic-bezier easing: bezier(x1,y1,x2,y2)(t) */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u;
    const Y = (u) => ((ay * u + by) * u + cy) * u;
    return (x) => {
      x = clamp(x);
      let lo = 0, hi = 1, u = x;
      for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; X(u) < x ? (lo = u) : (hi = u); }
      return Y(u);
    };
  }
  const easeInOut = bezier(0.65, 0, 0.35, 1);
  const easeOut = bezier(0.16, 1, 0.3, 1);
  const easeSnap = bezier(0.5, 0, 0.1, 1);

  /* ───────────────────────────────── terrain ─────────────────────────────── */
  // Ground height (world y, y grows downward). 0 = Monday's flat base.
  function G(x) {
    const { HILL: h, DROP: d } = CFG;
    if (x <= h.x0) return 0;
    if (x < h.x1) return -h.rise * smooth((x - h.x0) / (h.x1 - h.x0));
    if (x < d.x1) return -h.rise + d.fall * smooth((x - d.x0) / (d.x1 - d.x0));
    return -h.rise + d.fall; // valley floor (+300) up to the wall
  }
  function dG(x) { // slope dy/dx
    const { HILL: h, DROP: d } = CFG;
    if (x <= h.x0 || x >= d.x1) return 0;
    if (x < h.x1) { const u = (x - h.x0) / (h.x1 - h.x0); return (-h.rise * 6 * u * (1 - u)) / (h.x1 - h.x0); }
    const u = (x - d.x0) / (d.x1 - d.x0); return (d.fall * 6 * u * (1 - u)) / (d.x1 - d.x0);
  }

  /* ─────────────────────────── motion timeline (tables) ───────────────────── */
  // Bike centre x(t): cubic Hermite through keyframes (t, x, velocity) – smooth, monotonic.
  const KEYS = [
    { t: 0.0, x: 0, v: 200 },     // rolls in
    { t: 1.2, x: 380, v: 480 },   // MON sign
    { t: 8.0, x: 4250, v: 520 },  // heavy grind up to the crest (Mon→Thu)
    { t: 9.0, x: 4850, v: 700 },  // over the top
    { t: 11.0, x: 6450, v: 1000 },// plunge (Fri→Sat)
    { t: 11.75, x: 7170, v: 900 },// valley floor → wall contact
  ];
  const T_CRASH = KEYS[KEYS.length - 1].t;
  const X_STOP = KEYS[KEYS.length - 1].x;
  function xAt(t) {
    if (t >= T_CRASH) return X_STOP;
    let i = 0;
    while (i < KEYS.length - 2 && t > KEYS[i + 1].t) i++;
    const a = KEYS[i], b = KEYS[i + 1], dt = b.t - a.t, u = (t - a.t) / dt;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * a.x + (u3 - 2 * u2 + u) * dt * a.v + (-2 * u3 + 3 * u2) * b.x + (u3 - u2) * dt * b.v;
  }

  const TBL_HZ = 240;
  const N = Math.ceil(CFG.DURATION * TBL_HZ) + 2;
  const tabX = new Float64Array(N), tabArc = new Float64Array(N), tabPhi = new Float64Array(N), tabCam = new Float64Array(N);
  const CREST_X = CFG.HILL.x1;
  (function precompute() {
    let arc = 0, phi = rad(-30);
    for (let i = 0; i < N; i++) {
      const t = i / TBL_HZ;
      tabX[i] = xAt(t);
      if (i) arc += Math.hypot(tabX[i] - tabX[i - 1], G(tabX[i]) - G(tabX[i - 1]));
      tabArc[i] = arc;
      // crank: slow and heavy up the hill (stalls at the top of each stroke), coasts after the crest
      const cadence = lerp(0.35, 0.92, smooth(t / 1.6)) * (1 - smooth((tabX[i] - (CREST_X - 250)) / 380));
      const heavy = 1 + 0.5 * Math.cos(2 * (phi - rad(70)));
      phi += (TAU * cadence * heavy) / TBL_HZ;
      tabPhi[i] = phi;
      tabCam[i] = G(tabX[i]);
    }
    // camera height follows the ground with a (non-causal, deterministic) gaussian smoothing
    const raw = Float64Array.from(tabCam), sig = 0.32 * TBL_HZ, rr = Math.ceil(sig * 3);
    for (let i = 0; i < N; i++) {
      let s = 0, w = 0;
      for (let k = -rr; k <= rr; k++) {
        const j = clamp(i + k, 0, N - 1) | 0, g = Math.exp(-(k * k) / (2 * sig * sig));
        s += raw[j] * g; w += g;
      }
      tabCam[i] = s / w;
    }
  })();
  function tab(arr, t) {
    const f = clamp(t * TBL_HZ, 0, N - 2), i = f | 0, u = f - i;
    return arr[i] * (1 - u) + arr[i + 1] * u;
  }

  /* ───────────────────────────────── drawing ─────────────────────────────── */
  function spaced(ctx, text, cx, y, spacing, count) {
    const chars = [...text];
    const widths = chars.map((c) => ctx.measureText(c).width);
    const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
    let x = cx - total / 2;
    for (let i = 0; i < chars.length; i++) {
      if (i < count) ctx.fillText(chars[i], x, y);
      x += widths[i] + spacing;
    }
  }

  function line(ctx, pts, w, alpha = 1, color = CFG.FG, close = false) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    if (close) ctx.closePath();
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
  }

  function drawSky(ctx, t, camX) {
    ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, CFG.W, CFG.H);
    // stars
    for (let i = 0; i < 90; i++) {
      const x = ((hash(i * 3.1) * 1200 - camX * 0.015) % 1100 + 1100) % 1100 - 10;
      const y = hash(i * 7.7) * 1100 + 40;
      const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * (0.6 + hash(i) * 1.2) + i));
      ctx.globalAlpha = 0.12 + 0.4 * tw * hash(i * 5.5);
      ctx.fillStyle = CFG.FG; ctx.beginPath(); ctx.arc(x, y, 0.9 + hash(i * 2.2) * 1.3, 0, TAU); ctx.fill();
    }
    ctx.globalAlpha = 1;
    // moon + bloom
    const mx = 850, my = 430, mr = 66;
    const bloom = ctx.createRadialGradient(mx, my, mr * 0.6, mx, my, 420);
    bloom.addColorStop(0, 'rgba(255,255,255,0.30)'); bloom.addColorStop(0.35, 'rgba(255,255,255,0.09)'); bloom.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = bloom; ctx.fillRect(mx - 430, my - 430, 860, 860);
    const disc = ctx.createRadialGradient(mx - 14, my - 14, 6, mx, my, mr);
    disc.addColorStop(0, '#ffffff'); disc.addColorStop(1, '#e6e6e6');
    ctx.fillStyle = disc; ctx.beginPath(); ctx.arc(mx, my, mr, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(160,160,160,0.55)'; ctx.lineWidth = 2.5;
    [[-18, -4, 14], [20, 22, 9], [10, -26, 6]].forEach(([dx, dy, r]) => { ctx.beginPath(); ctx.arc(mx + dx, my + dy, r, 0, TAU); ctx.stroke(); });
  }

  function drawTitle(ctx, t) {
    ctx.font = `700 46px ${CFG.FONT}`; ctx.textBaseline = 'middle'; ctx.fillStyle = CFG.FG;
    const count = Math.floor(easeInOut(clamp((t - 0.45) / 1.5)) * [...CFG.TITLE].length + 0.0001);
    ctx.shadowColor = 'rgba(255,255,255,0.35)'; ctx.shadowBlur = 14;
    spaced(ctx, CFG.TITLE, CFG.W / 2, 200, 9, count);
    ctx.shadowBlur = 0;
  }

  const SIGNS = [
    { x: 380, t: 'MON' }, { x: 1500, t: 'TUE' }, { x: 2500, t: 'WED' }, { x: 3500, t: 'THU' },
    { x: 4650, t: 'FRI' }, { x: 5350, t: 'SAT' }, { x: 6050, t: 'SUN' },
  ];

  function drawSign(ctx, sg) {
    const gy = G(sg.x), post = 560, w = 210, h = 86, slope = Math.atan(dG(sg.x));
    ctx.save();
    ctx.translate(sg.x, gy);
    line(ctx, [[0, 0], [0, -post]], 5);
    ctx.beginPath(); ctx.arc(0, 0, 8, 0, TAU); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = CFG.FG; ctx.stroke();
    ctx.translate(0, -post); ctx.rotate(slope * 0.15);
    ctx.fillStyle = CFG.BG; ctx.fillRect(-w / 2, -h, w, h);
    ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.strokeRect(-w / 2, -h, w, h);
    ctx.lineWidth = 2; ctx.globalAlpha = 0.45; ctx.strokeRect(-w / 2 + 9, -h + 9, w - 18, h - 18); ctx.globalAlpha = 1;
    ctx.font = `700 44px ${CFG.FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = CFG.FG;
    ctx.fillText(sg.t, 0, -h / 2 + 3); ctx.textAlign = 'left';
    ctx.restore();
  }

  function drawTerrain(ctx, camX, t, gain) {
    const x0 = Math.floor((camX - 160) / 6) * 6, x1 = camX + CFG.W + 160, WX = CFG.WALL_X;
    const xe = Math.min(x1, WX);
    const pts = [];
    for (let x = x0; x <= xe; x += 6) pts.push([x, G(x)]);
    if (xe === WX) pts.push([WX, G(WX)]);
    // solid mass under the line + contour lines (vector "hatching")
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    pts.forEach((p) => ctx.lineTo(p[0], p[1]));
    ctx.lineTo(pts[pts.length - 1][0], 6000); ctx.lineTo(pts[0][0], 6000); ctx.closePath();
    ctx.fillStyle = '#050505'; ctx.fill();
    [[46, 0.2], [112, 0.11], [200, 0.06]].forEach(([d, a]) => line(ctx, pts.map((p) => [p[0], p[1] + d]), 2, a));
    // the wall: pure black slab with a white leading edge, stretching off the top of the canvas
    if (x1 > WX - 20) {
      const gy = G(WX);
      ctx.fillStyle = '#000'; ctx.fillRect(WX, -9000, 3000, 9000 + gy + 6000);
      for (let i = 1; i < 14; i++) { // faint vertical hatch lines on the face
        line(ctx, [[WX + i * 38, -9000], [WX + i * 38, gy + 6000]], 1.5, 0.07);
      }
      const glow = ctx.createRadialGradient(WX - 140, gy - 520, 20, WX - 140, gy - 520, 520);
      glow.addColorStop(0, `rgba(255,42,85,${0.30 * gain})`); glow.addColorStop(1, 'rgba(255,42,85,0)');
      ctx.fillStyle = glow; ctx.fillRect(WX - 700, gy - 1100, 700, 1200);
      line(ctx, [[WX, gy], [WX, -9000]], 7);
    }
    // the path itself
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    line(ctx, pts, 6);
  }

  function drawRedSign(ctx, t) {
    const gy = G(CFG.WALL_X), cx = CFG.WALL_X - 135, cy = gy - 560, w = 270, h = 120;
    const on = 0.78 + 0.22 * easeOut(clamp((t - T_CRASH) / 0.6));
    const flick = t < T_CRASH ? 1 : 0.94 + 0.06 * Math.sin(t * 38);
    ctx.save();
    ctx.globalAlpha = on * flick;
    line(ctx, [[CFG.WALL_X, cy - 36], [cx + w / 2 - 20, cy - 36]], 5, 0.9, CFG.RED);
    line(ctx, [[CFG.WALL_X, cy + 36], [cx + w / 2 - 20, cy + 36]], 5, 0.9, CFG.RED);
    ctx.shadowColor = CFG.RED; ctx.shadowBlur = 38;
    ctx.lineWidth = 7; ctx.strokeStyle = CFG.RED;
    const r = 18, x = cx - w / 2, y = cy - h / 2;
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); ctx.stroke();
    ctx.font = `700 78px ${CFG.FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = CFG.RED;
    ctx.fillText('MON', cx, cy + 5); ctx.textAlign = 'left';
    ctx.shadowBlur = 0; ctx.restore();
  }

  /* ───────────────────────────── bike + rider ────────────────────────────── */
  const WHEEL_R = 62 * S, WB = 210 * S;
  function wheelCenter(xc) {
    const d = dG(xc), n = Math.hypot(d, 1);
    return [xc + (WHEEL_R * d) / n, G(xc) - WHEEL_R / n];
  }
  function bikePose(bx) {
    const xr = bx - (WB / 2);
    const A = wheelCenter(xr);
    let lo = xr + WB * 0.6, hi = xr + WB * 1.4;
    for (let i = 0; i < 30; i++) {
      const mid = (lo + hi) / 2, C = wheelCenter(mid);
      Math.hypot(C[0] - A[0], C[1] - A[1]) < WB ? (lo = mid) : (hi = mid);
    }
    const F = wheelCenter((lo + hi) / 2);
    return { A, F, M: [(A[0] + F[0]) / 2, (A[1] + F[1]) / 2], theta: Math.atan2(F[1] - A[1], F[0] - A[0]) };
  }

  /** two-bone IK in y-up local space; bend = ±1 picks the side of the joint */
  function ik(A, B, l1, l2, bend) {
    const dx = B[0] - A[0], dy = B[1] - A[1];
    const dist = clamp(Math.hypot(dx, dy), 0.001, l1 + l2 - 0.01);
    const a = (l1 * l1 - l2 * l2 + dist * dist) / (2 * dist);
    const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / Math.hypot(dx, dy || 1e-6), uy = dy / Math.hypot(dx, dy || 1e-6);
    return [A[0] + ux * a + -uy * h * bend, A[1] + uy * a + ux * h * bend];
  }

  // local (y-up) frame, origin = midpoint of the axles, +x forward
  const L = {
    rear: [-105, 0], front: [105, 0], bb: [-5, -14], seat: [-37, 98], headTop: [76, 104], headBot: [84, 66],
    stem: [70, 112], bar: [90, 128], hip: [-36, 106],
  };

  function drawBike(ctx, st) {
    const { wheelAng, phi, lean, fling, tK, theta } = st;
    const lw = (w) => w / S;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // wheels
    [L.rear, L.front].forEach((c) => {
      ctx.save(); ctx.translate(c[0], c[1]); ctx.rotate(-wheelAng);
      ctx.lineWidth = lw(5); ctx.strokeStyle = CFG.FG;
      ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.stroke();
      ctx.lineWidth = lw(1.5); ctx.globalAlpha = 0.5; ctx.beginPath(); ctx.arc(0, 0, 55, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
      ctx.lineWidth = lw(1.6); ctx.globalAlpha = 0.8;
      for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; ctx.beginPath(); ctx.moveTo(Math.cos(a) * 6, Math.sin(a) * 6); ctx.lineTo(Math.cos(a) * 55, Math.sin(a) * 55); ctx.stroke(); }
      ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(0, 0, 6, 0, TAU); ctx.fillStyle = CFG.FG; ctx.fill();
      ctx.restore();
    });
    // frame
    const F = CFG.FG;
    const seg = (a, b, w = 5.5) => line(ctx, [a, b], lw(w), 1, F);
    seg(L.rear, L.bb); seg(L.bb, L.seat); seg(L.rear, L.seat, 4.5);
    seg(L.seat, L.headTop); seg(L.bb, L.headBot); seg(L.headTop, L.headBot, 4.5);
    seg(L.front, L.headBot, 5); seg(L.headBot, [L.stem[0] - 4, L.stem[1] + 8], 4.5);
    seg([L.stem[0] - 4, L.stem[1] + 8], L.stem, 4.5); seg(L.stem, L.bar, 5);
    seg([L.seat[0] - 2, L.seat[1] + 2], [L.seat[0] - 2, L.seat[1] + 12], 4);
    seg([L.seat[0] - 20, L.seat[1] + 14], [L.seat[0] + 16, L.seat[1] + 14], 7);
    // drivetrain
    ctx.lineWidth = lw(1.8); ctx.strokeStyle = F; ctx.globalAlpha = 0.9;
    ctx.beginPath(); ctx.arc(L.bb[0], L.bb[1], 17, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(L.rear[0], L.rear[1], 8, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(L.bb[0], L.bb[1] + 17); ctx.lineTo(L.rear[0], L.rear[1] + 8);
    ctx.moveTo(L.bb[0], L.bb[1] - 17); ctx.lineTo(L.rear[0], L.rear[1] - 8); ctx.stroke(); ctx.globalAlpha = 1;
    // cranks + pedals
    const crank = 38;
    const pNear = [L.bb[0] + Math.cos(phi) * crank, L.bb[1] + Math.sin(phi) * crank];
    const pFar = [L.bb[0] - Math.cos(phi) * crank, L.bb[1] - Math.sin(phi) * crank];
    line(ctx, [pFar, L.bb, pNear], lw(5), 1, F);
    [pNear, pFar].forEach((p) => line(ctx, [[p[0] - 9, p[1]], [p[0] + 9, p[1]]], lw(5), 1, F));

    /* ── rider ── */
    const hip = L.hip;
    const a = rad(lean);
    const shoulder = [hip[0] + Math.sin(a) * 118, hip[1] + Math.cos(a) * 118];
    const tilt = rad(lean * 0.2 - 6 * fling);
    const head = [shoulder[0] + Math.sin(a + tilt) * 38, shoulder[1] + Math.cos(a + tilt) * 38];
    // hands: pinned to the bars… or flung up
    const gripNear = [L.bar[0] + 6, L.bar[1] + 2], gripFar = [L.bar[0] - 2, L.bar[1] + 2];
    // arms/legs are aimed in WORLD space (compensating for the bike's pitch) so the pose reads correctly on slopes
    const aN = rad(34) - theta, aF = rad(-8) - theta;
    const upNear = [shoulder[0] + Math.sin(aN) * 123, shoulder[1] + Math.cos(aN) * 123];
    const upFar = [shoulder[0] + Math.sin(aF) * 126, shoulder[1] + Math.cos(aF) * 126];
    const lerp2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
    const handNear = lerp2(gripNear, upNear, fling), handFar = lerp2(gripFar, upFar, fling);
    // feet: on the pedals… or stretched out ahead
    const bN = 0.85 * theta - 0.06, bF = 0.85 * theta + 0.2;
    const outNear = [hip[0] + Math.cos(bN) * 156, hip[1] + Math.sin(bN) * 156], outFar = [hip[0] + Math.cos(bF) * 150, hip[1] + Math.sin(bF) * 150];
    const footNear = lerp2(pNear, outNear, fling), footFar = lerp2(pFar, outFar, fling);

    const limb = (A, Bp, Bq, bend, w, alpha) => {
      const J = ik(A, Bp, 82, 82, bend);
      line(ctx, [A, J, Bp], lw(w), alpha, F);
    };
    const arm = (A, Bp, alpha) => { const J = ik(A, Bp, 61, 61, -1); line(ctx, [A, J, Bp], lw(8), alpha, F); };
    // far limbs (dimmer, behind)
    arm([shoulder[0] - 3, shoulder[1]], handFar, 0.5);
    limb(hip, footFar, null, 1, 8.5, 0.5);
    line(ctx, [footFar, [footFar[0] + 16, footFar[1] - 2]], lw(7), 0.5, F);
    // torso + head
    line(ctx, [hip, shoulder], lw(10), 1, F);
    ctx.beginPath(); ctx.arc(head[0], head[1], 25, 0, TAU); ctx.fillStyle = CFG.BG; ctx.fill();
    ctx.lineWidth = lw(6); ctx.strokeStyle = F; ctx.stroke();
    // near limbs
    limb(hip, footNear, null, 1, 9.5, 1);
    line(ctx, [footNear, [footNear[0] + 17, footNear[1] - 2]], lw(8), 1, F);
    arm(shoulder, handNear, 1);
    ctx.beginPath(); ctx.arc(handNear[0], handNear[1], 5.5, 0, TAU); ctx.fillStyle = F; ctx.fill();
    void tK;
  }

  /* ───────────────────────────────── frame ───────────────────────────────── */
  function drawFrame(ctx, tIn) {
    const t = ((tIn % CFG.DURATION) + CFG.DURATION) % CFG.DURATION;
    const u = t - T_CRASH;                          // time since impact
    const bxBase = tab(tabX, t);
    const camX = bxBase - CFG.W / 2;
    const camY = tab(tabCam, t);
    const shake = u > 0 ? Math.exp(-6 * u) * Math.sin(70 * u) : 0;

    drawSky(ctx, t, camX);

    // wind lines streaming back past the rider once the descent begins (screen space)
    const wind = smooth((bxBase - (CREST_X - 150)) / 500) * (1 - smooth(u / 0.25));
    if (wind > 0.01) {
      ctx.lineCap = 'round';
      for (let i = 0; i < 24; i++) {
        const sp = 1.2 + hash(i * 1.7) * 0.9, span = CFG.W + 500;
        const x = (((hash(i * 4.1) * span - bxBase * sp) % span) + span) % span - 250;
        const y = 760 + hash(i * 9.3) * 640, len = 110 + hash(i * 2.9) * 280;
        line(ctx, [[x, y], [x + len, y]], 3, wind * (0.18 + 0.45 * hash(i * 6.1)));
      }
    }

    ctx.save();
    ctx.translate(-camX + shake * 9, CFG.GROUND_SCREEN_Y - camY + shake * 6);
    drawTerrain(ctx, camX, t, 0.4 + 0.6 * easeOut(clamp(u / 0.6)));
    SIGNS.forEach((sg) => { if (sg.x > camX - 200 && sg.x < camX + CFG.W + 200) drawSign(ctx, sg); });
    if (camX + CFG.W > CFG.WALL_X - 600) drawRedSign(ctx, t);

    // bike
    const recoil = u > 0 ? -34 * Math.abs(Math.sin(7.5 * u)) * Math.exp(-5.5 * u) : 0;
    const P = bikePose(bxBase + recoil);
    const arc = tab(tabArc, t);
    const phi = tab(tabPhi, t);
    const fling = easeInOut(clamp((bxBase - (CREST_X - 60)) / 650)) * (1 - easeSnap(clamp(u / 0.28)));
    const hill = smooth((bxBase - CFG.HILL.x0) / 3000);
    const rise = easeInOut(clamp((bxBase - (CREST_X - 100)) / 600));   // 0 = grinding uphill, 1 = sitting up for the descent
    const leanWorld = lerp(lerp(30, 42, hill), -6, rise);              // degrees from vertical, in the world
    const lean = leanWorld - (P.theta * 180) / Math.PI
      + 3 * Math.sin(phi * 2 + 0.6) * (1 - fling)                      // body rocks with each pedal stroke
      + (u > 0 ? 30 * Math.exp(-4.2 * u) * (1 - Math.exp(-30 * u)) : 0); // whiplash on impact
    const kick = u > 0 ? rad(9) * Math.abs(Math.sin(7 * u)) * Math.exp(-4.5 * u) : 0;

    ctx.save();
    // pitch kick about the front wheel's contact point
    const cx = P.F[0], cy = P.F[1] + WHEEL_R;
    ctx.translate(cx, cy); ctx.rotate(kick); ctx.translate(-cx, -cy);
    ctx.translate(P.M[0], P.M[1]); ctx.rotate(P.theta); ctx.scale(S, -S);
    drawBike(ctx, { wheelAng: arc / WHEEL_R, phi, lean, fling, tK: u, theta: P.theta });
    ctx.restore();

    // impact burst
    if (u > 0 && u < 0.5) {
      const k = easeOut(u / 0.5), cxp = CFG.WALL_X - 10, cyp = G(CFG.WALL_X) - WHEEL_R;
      for (let i = 0; i < 9; i++) {
        const r0 = 40 + 20 * k, r1 = 40 + 140 * k;
        const aa = Math.PI + rad(-70 + i * 17.5);
        line(ctx, [[cxp + Math.cos(aa) * r0, cyp + Math.sin(aa) * r0], [cxp + Math.cos(aa) * r1, cyp + Math.sin(aa) * r1]], 4, (1 - k) * 0.9);
      }
    }
    ctx.restore();

    drawTitle(ctx, t);

    // loop fade (black at both ends so the loop is seamless)
    const fade = Math.max(1 - easeInOut(clamp(t / 0.5)), easeInOut(clamp((t - (CFG.DURATION - 1.0)) / 0.9)));
    if (fade > 0.001) { ctx.globalAlpha = fade; ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, CFG.W, CFG.H); ctx.globalAlpha = 1; }
  }

  return { CFG, drawFrame, T_CRASH, G, KEYS };
});
