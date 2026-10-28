/*
 * SOCIAL BATTERY AT A PARTY. — the whole animation as ONE pure function of time.
 *
 *     drawFrame(ctx, t)      t in seconds, 0 … 36   (frame n  →  t = n / 60)
 *
 * Nothing in here depends on wall-clock time or on previous frames: everything that looks
 * "simulated" (gait, springs, particles) is either integrated once into lookup tables at load
 * or evaluated analytically, so the browser preview and the Puppeteer export are frame-identical.
 *
 * Loaded by index.html (window.SocialBattery) and by render.js (require).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SocialBattery = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ══════════════════════════════ configuration ══════════════════════════════ */
  const CFG = {
    W: 1080, H: 1920, FPS: 60, DURATION: 36,
    BG: '#0a0a0a', FG: '#ffffff', AMBER: '#ffb703', RED: '#ff0055', MINT: '#c8ffd9',
    TITLE: 'SOCIAL BATTERY AT A PARTY.',
    FONT: '"JetBrains Mono","SF Mono","Menlo","Consolas","DejaVu Sans Mono","Liberation Mono",monospace',
    GROUND_Y: 1350,         // floor line in the party scenes
    STROKE: 5,              // character line weight (4–6 px)
    BATT_GAP: 120,          // battery floats this far above the head
    BASE_ZOOM: 1.22,        // camera framing of the party scenes
  };
  const G = CFG.GROUND_Y;

  // Story beats (seconds). Used by the animation AND by the sound track.
  const T = {
    b1In: 6.2, b1Hit: 8.2,                         // scene 2  small talk
    b2In: 14.3, b2Hit1: 16.2, b2Hit2: 17.4,        // scene 3  catch up sometime
    b3In: 22.4, b3Hit: 23.9,                       // scene 4  group photo → red alert
    chair: 25.5, seat: 26.3, launch: 27.1,         //          ejector chair
    room: 30.0, land: 30.25, duvet: 32.0, cable: 32.9, plug: 34.0, charge: 33.8, fadeOut: 35.3, // scene 5
  };
  const SCENES = [
    { name: 'ARRIVAL', t: 0 }, { name: 'SMALL TALK', t: 6 }, { name: 'CATCH UP', t: 14 },
    { name: 'RED ALERT', t: 22 }, { name: 'RECHARGE', t: 30 },
  ];

  /* ═══════════════════════════════════ helpers ═══════════════════════════════ */
  const TAU = Math.PI * 2;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const lerp2 = (p, q, k) => [lerp(p[0], q[0], k), lerp(p[1], q[1], k)];
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const rad = (d) => (d * Math.PI) / 180;

  /** CSS-style cubic-bezier easing */
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx;
    const cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u, Y = (u) => ((ay * u + by) * u + cy) * u;
    return (x) => {
      x = clamp(x); let lo = 0, hi = 1, u = x;
      for (let i = 0; i < 24; i++) { u = (lo + hi) / 2; X(u) < x ? (lo = u) : (hi = u); }
      return Y(u);
    };
  }
  const easeOutQuad = bezier(0.5, 1, 0.89, 1);
  const easeInOutCubic = bezier(0.65, 0, 0.35, 1);
  const easeInCubic = bezier(0.32, 0, 0.67, 0);
  const easeOutCubic = bezier(0.33, 1, 0.68, 1);
  const easeOutBack = bezier(0.34, 1.56, 0.64, 1);
  const easeInExpo = bezier(0.7, 0, 0.84, 0);

  /** piecewise smooth interpolation through [t, value] keys */
  function kf(t, keys) {
    if (t <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i][0]) {
        const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
        return lerp(v0, v1, smooth((t - t0) / (t1 - t0)));
      }
    }
    return keys[keys.length - 1][1];
  }

  /* ═══════════════════════════ character state over time ════════════════════ */
  // The more the evening drains him, the shorter the steps, the lower the hips, the heavier the head.
  const SPEED = [[0, 330], [8.2, 330], [8.5, 295], [10.5, 215], [14, 200], [16.2, 150], [17.6, 80], [22.4, 70], [23.9, 60], [24.6, 0]];
  const GAIT = {
    step: [[0, 130], [8.2, 130], [11, 112], [16.2, 100], [17.8, 66], [23.9, 58]],      // step length px
    lift: [[0, 48], [11, 34], [17.8, 12], [23.9, 9]],                                  // foot lift px (drag at the end)
    bend: [[0, 0.1], [8.2, 0.1], [11, 0.17], [16.2, 0.24], [17.8, 0.33], [23.9, 0.35]], // hips sink (knees bend)
    lean: [[0, 4], [8.2, 4], [10.5, 13], [16.2, 20], [17.8, 31], [23.9, 33]],          // torso forward lean °
    droop: [[0, 0], [8.2, 0], [11, 10], [17.8, 28], [23.9, 34]],                       // head hangs °
    arm: [[0, 36], [8.2, 36], [11, 22], [17.8, 8], [23.9, 5]],                         // arm swing °
  };
  const DUTY = 0.6, L1 = 92, L2 = 92, TORSO = 128, ARM = 62, HEAD_R = 34;

  const speedAt = (t) => kf(t, SPEED);

  // Lookup tables @240 Hz: world x, gait phase, battery spring.
  const HZ = 240, N = Math.ceil(CFG.DURATION * HZ) + 2;
  const tabX = new Float64Array(N), tabPhi = new Float64Array(N), tabBX = new Float64Array(N), tabBY = new Float64Array(N);
  const STEPS = []; // footfall times for the sound track

  /* ───────────── scene 5 (the quiet room): lying figure ───────────── */
  const ROOM = { floor: 1520, bedTop: 1392, headX: 330, headY: 1326 };
  function lying(t) {
    const τ = t - T.land;
    const fall = 1 - easeOutCubic(clamp(τ / 1.6));            // 1 → 0 : soft descent
    const sway = Math.sin(τ * 3.1) * fall;                    // leaf-like sway
    const breath = t > T.land + 2 ? Math.sin((t - T.charge) * TAU / 4) : 0;
    return {
      dx: sway * 70, dy: -fall * 1750 - (τ > 1.6 ? 0 : 0), rot: sway * rad(14) * fall,
      breath, fall,
    };
  }
  const headRoom = (t) => {
    const l = lying(t);
    return [ROOM.headX + l.dx, ROOM.headY + l.dy];
  };

  // Body pose (all joints in world space). Used by drawing AND by the battery spring.
  function figure(t) {
    const X = tab(tabX, t), phi = tab(tabPhi, t);
    const s = kf(t, GAIT.step), lift = kf(t, GAIT.lift), bend = kf(t, GAIT.bend);
    const lean = kf(t, GAIT.lean), droop = kf(t, GAIT.droop), amp = kf(t, GAIT.arm);
    const v = speedAt(t), stand = 1 - smooth(v / 45);
    const sitK = smooth((t - T.chair - 0.15) / (T.seat - T.chair - 0.15));
    const ry = t > T.launch ? 7000 * (t - T.launch) * (t - T.launch) : 0;     // rocket rise
    const hipH = (L1 + L2) * (0.9 - bend);
    const bounce = (1 - stand) * 5 * Math.cos(2 * TAU * phi);
    const hip = [X, lerp(G - hipH - bounce, G - 104, sitK)];

    const feet = [], rel = [];
    for (let k = 0; k < 2; k++) {
      const ph = (((phi + 0.5 * k) % 1) + 1) % 1;
      let rx, ly;
      if (ph < DUTY) { const u = ph / DUTY; rx = (0.5 - u) * s; ly = 0; }          // stance: foot planted in the world
      else { const u = (ph - DUTY) / (1 - DUTY); rx = (-0.5 + easeInOutCubic(u)) * s; ly = lift * Math.sin(Math.PI * u); } // swing
      rx = lerp(rx, k ? 16 : -16, stand); ly = lerp(ly, 0, stand);
      rel.push(rx / Math.max(1, s / 2));
      feet.push(lerp2([X + rx, G - ly], [X + 150 + k * 20, G - 62 - k * 22], sitK));
    }
    const a = rad(lerp(lean, 0, sitK));
    const shoulder = [hip[0] + Math.sin(a) * TORSO, hip[1] - Math.cos(a) * TORSO];
    const ha = a + rad(lerp(droop, -4, sitK));
    const head = [shoulder[0] + Math.sin(ha) * (18 + HEAD_R), shoulder[1] - Math.cos(ha) * (18 + HEAD_R)];
    const tired = clamp(lean / 33);
    const reach = (ARM * 2) * lerp(0.84, 0.97, tired);
    const hands = [];
    for (let j = 0; j < 2; j++) {
      const psi = rad(amp) * clamp(rel[1 - j], -1, 1) * (1 - stand * 0.9);
      const walkHand = [shoulder[0] + Math.sin(psi + a * 0.4) * reach, shoulder[1] + Math.cos(psi + a * 0.4) * reach];
      hands.push(lerp2(walkHand, [X + 30 + j * 14, hip[1] - 50], sitK));
    }
    const out = { X, hip, shoulder, head, ha, feet, hands, sitK, ry, stand, a, v };
    if (ry) { // everything rides the rocket
      ['hip', 'shoulder', 'head'].forEach((k) => { out[k] = [out[k][0], out[k][1] - ry]; });
      out.feet = feet.map((p) => [p[0], p[1] - ry]); out.hands = hands.map((p) => [p[0], p[1] - ry]);
    }
    return out;
  }

  (function precompute() {
    let X = -150, phi = 0.37, bx = 0, by = 0, vx = 0, vy = 0, prevPh = [0, 0];
    const k = 180, c = 2 * 0.52 * Math.sqrt(k), dt = 1 / HZ; // under-damped spring ⇒ a little lag + overshoot
    for (let i = 0; i < N; i++) {
      const t = i / HZ;
      if (i) {
        const v = speedAt(t); X += v * dt;
        const s = kf(t, GAIT.step); phi += (v * dt) / (s / DUTY);
      }
      tabX[i] = X; tabPhi[i] = phi;
      // footfalls (stance start) for foot sounds
      for (let q = 0; q < 2; q++) {
        const ph = (((phi + 0.5 * q) % 1) + 1) % 1;
        if (prevPh[q] > 0.9 && ph < 0.1 && speedAt(t) > 40 && t < T.b3Hit + 1) STEPS.push({ t, v: speedAt(t) });
        prevPh[q] = ph;
      }
    }
    for (let i = 0; i < N; i++) {
      const t = i / HZ;
      const head = t < T.room ? figure(t).head : headRoom(t);
      const tx = head[0], ty = head[1] - HEAD_R - CFG.BATT_GAP - 55;
      if (i === 0 || (t >= T.room && (i - 1) / HZ < T.room)) { bx = tx; by = ty; vx = 0; vy = 0; } // snap across the cut
      else { vx += (-k * (bx - tx) - c * vx) * dt; vy += (-k * (by - ty) - c * vy) * dt; bx += vx * dt; by += vy * dt; }
      tabBX[i] = bx; tabBY[i] = by;
    }
  })();
  function tab(arr, t) {
    const f = clamp(t * HZ, 0, N - 2), i = f | 0, u = f - i;
    return arr[i] * (1 - u) + arr[i + 1] * u;
  }
  const battPos = (t) => [tab(tabBX, t), tab(tabBY, t)];

  /* ═══════════════════════════════ battery model ═════════════════════════════ */
  // Blocks drain from the right. shatter[i] = moment block i breaks.
  const SHATTER = [T.b3Hit, T.b2Hit2, T.b2Hit1, T.b1Hit + 0.06, T.b1Hit];
  const BLOCK = { w: 44, h: 70, gap: 10, bodyW: 300, bodyH: 110 };
  const blockX = (i) => -((5 * BLOCK.w + 4 * BLOCK.gap) / 2) + i * (BLOCK.w + BLOCK.gap) + BLOCK.w / 2;
  const remaining = (t) => SHATTER.filter((s) => t < s).length;
  function battColor(t) {
    const r = remaining(t);
    if (t >= T.room) return CFG.MINT;
    if (r >= 3) return CFG.FG;
    if (r >= 1) return CFG.AMBER;
    return CFG.RED;
  }

  /* ═══════════════════════════ drawing primitives ═══════════════════════════ */
  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function seg(ctx, pts, w = CFG.STROKE, alpha = 1, color = CFG.FG) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
  }
  /** two-bone IK in screen space (y down). bend = ±1 picks the side of the joint. */
  function ik(A, B, l1, l2, bend) {
    const dx = B[0] - A[0], dy = B[1] - A[1], d0 = Math.hypot(dx, dy) || 1e-6;
    const d = clamp(d0, 0.001, l1 + l2 - 0.01);
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / d0, uy = dy / d0;
    return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
  }
  function textC(ctx, str, x, y, size, color = CFG.FG, weight = 700) {
    ctx.font = `${weight} ${size}px ${CFG.FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = color; ctx.fillText(str, x, y);
  }

  /* ═══════════════════════════════ the stick figure ═════════════════════════ */
  function drawFace(ctx, f, t) {
    const hit = [T.b1Hit, T.b2Hit1, T.b2Hit2, T.b3Hit].some((h) => t > h && t < h + 0.5);
    const mood = kf(t, [[0, 1], [8.1, 1], [8.6, 0.0], [14, -0.1], [17.6, -0.7], [23.8, -0.8]]); // 1 smile … −1 grimace
    ctx.save(); ctx.translate(f.head[0], f.head[1]); ctx.rotate(f.ha * 0.6);
    ctx.lineWidth = 3.5; ctx.strokeStyle = CFG.FG; ctx.fillStyle = CFG.FG; ctx.lineCap = 'round';
    const alert = t >= T.b3Hit && t < T.room;
    const ey = -6, ex = [10, 25];
    ex.forEach((x) => {
      if (alert || hit) { ctx.beginPath(); ctx.arc(x, ey, 6, 0, TAU); ctx.stroke(); }        // wide shocked eyes
      else if (mood < -0.3) { ctx.beginPath(); ctx.moveTo(x - 5, ey - 1); ctx.lineTo(x + 5, ey - 1); ctx.stroke(); } // half-dead eyes
      else { ctx.beginPath(); ctx.arc(x, ey, 3.6, 0, TAU); ctx.fill(); }
    });
    ctx.beginPath();
    if (alert || hit) ctx.ellipse(19, 14, 6, 9, 0, 0, TAU);
    else { ctx.moveTo(8, 13); ctx.quadraticCurveTo(19, 13 + mood * 9, 30, 13); }
    ctx.stroke(); ctx.restore();
  }

  function drawFigure(ctx, t) {
    const f = figure(t);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const legs = f.feet.map((ft) => ik(f.hip, ft, L1, L2, -1));
    const arms = f.hands.map((h) => ik(f.shoulder, h, ARM, ARM, f.sitK > 0.5 ? 1 : 1));
    const foot = (p, alpha) => seg(ctx, [p, [p[0] + 24, p[1]]], CFG.STROKE, alpha);
    // far limbs (slightly dimmer) first
    seg(ctx, [f.hip, legs[1], f.feet[1]], CFG.STROKE, 0.55); foot(f.feet[1], 0.55);
    seg(ctx, [f.shoulder, arms[1], f.hands[1]], CFG.STROKE, 0.55);
    // torso + head
    seg(ctx, [f.hip, f.shoulder, [lerp(f.shoulder[0], f.head[0], 0.4), lerp(f.shoulder[1], f.head[1], 0.4)]]);
    ctx.beginPath(); ctx.arc(f.head[0], f.head[1], HEAD_R, 0, TAU); ctx.fillStyle = CFG.BG; ctx.fill();
    ctx.lineWidth = CFG.STROKE; ctx.strokeStyle = CFG.FG; ctx.stroke();
    drawFace(ctx, f, t);
    // near limbs
    seg(ctx, [f.hip, legs[0], f.feet[0]]); foot(f.feet[0], 1);
    seg(ctx, [f.shoulder, arms[0], f.hands[0]]);
    return f;
  }

  /* ───────────────── ejector chair + rocket + speed streaks ───────────────── */
  function drawChair(ctx, t, f) {
    if (t < T.chair || f.ry > 3200) return;
    const rise = easeOutBack(clamp((t - T.chair) / 0.4));
    const x = f.X, y = G - f.ry + (1 - rise) * 130;
    ctx.save(); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.fillStyle = CFG.BG;
    // seat, back, armrest, nozzle
    seg(ctx, [[x - 36, y - 98], [x + 62, y - 98]], 9);
    seg(ctx, [[x - 36, y - 98], [x - 46, y - 270]], 8);
    seg(ctx, [[x - 46, y - 270], [x - 14, y - 276]], 8);
    seg(ctx, [[x + 8, y - 150], [x + 52, y - 150], [x + 52, y - 98]], 5);
    seg(ctx, [[x - 20, y - 98], [x - 20, y - 40]], 6); seg(ctx, [[x + 40, y - 98], [x + 40, y - 40]], 6);
    ctx.beginPath(); ctx.moveTo(x - 16, y - 40); ctx.lineTo(x + 36, y - 40); ctx.lineTo(x + 26, y - 14); ctx.lineTo(x - 6, y - 14); ctx.closePath();
    ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.stroke();
    // flame
    const ign = clamp((t - (T.launch - 0.35)) / 0.35), spd = t > T.launch ? 14000 * (t - T.launch) : 0;
    if (ign > 0) {
      const len = (40 + 90 * ign + Math.min(spd * 0.08, 520)) * (0.85 + 0.3 * hash(Math.floor(t * 60)));
      ctx.beginPath(); ctx.moveTo(x - 8, y - 14); ctx.lineTo(x + 18, y - 14 + len); ctx.lineTo(x + 28, y - 14); ctx.closePath();
      ctx.lineWidth = 4; ctx.strokeStyle = CFG.FG; ctx.stroke();
      ctx.beginPath(); ctx.moveTo(x, y - 14); ctx.lineTo(x + 18, y - 14 + len * 0.55); ctx.lineTo(x + 20, y - 14); ctx.closePath();
      ctx.fillStyle = CFG.FG; ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
    }
    ctx.restore();
  }
  function drawStreaks(ctx, t, f) {
    if (t < T.launch || f.ry > 5200) return;
    const spd = 14000 * (t - T.launch);
    for (let i = 0; i < 30; i++) {
      const x = f.X - 330 + hash(i * 3.3) * 700, len = clamp(spd * (0.06 + hash(i * 1.7) * 0.1), 30, 1100);
      const yTop = G - f.ry + 80 + hash(i * 8.1) * 500;
      seg(ctx, [[x, yTop], [x, yTop + len]], 3 + hash(i) * 2, 0.15 + 0.6 * hash(i * 6.6));
    }
  }

  /** scorch mark + smoke puffs left on the floor where the ejector chair took off */
  function drawLaunchAftermath(ctx, t, f) {
    if (t < T.launch) return;
    const x = f.X;
    ctx.save(); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.ellipse(x + 20, G + 8, 130, 12, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = CFG.FG; ctx.globalAlpha = 0.45 * smooth((t - T.launch) / 0.2); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const τ = t - (T.launch + i * 0.07); if (τ < 0 || τ > 2.8) continue;
      const k = τ / 2.8, px = x + 20 + (hash(i * 3.1) - 0.5) * 220 * easeOutCubic(k), py = G - 30 - 190 * easeOutQuad(k) * (0.6 + hash(i)), r = 22 + 70 * easeOutQuad(k) * (0.7 + hash(i * 5.3) * 0.6);
      ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.lineWidth = 4 * (1 - k) + 1; ctx.globalAlpha = 0.7 * (1 - k); ctx.stroke();
    }
    ctx.restore(); ctx.globalAlpha = 1;
  }

  /* ═══════════════════════════════ speech bubbles ════════════════════════════ */
  function bubble(ctx, { x, y, w, h, lines, size, sx = 1, sy = 1, rot = 0, alpha = 1, tail = 1, wiggle = false, t = 0 }) {
    if (alpha <= 0.002) return;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sx, sy);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // tail points back towards the off-screen speaker (to the right)
    ctx.beginPath(); ctx.moveTo(w / 2 - 70, h / 2 - 2); ctx.lineTo(w / 2 + 38 * tail, h / 2 + 52 * tail); ctx.lineTo(w / 2 - 20, h / 2 - 2); ctx.closePath();
    ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.stroke();
    rr(ctx, -w / 2, -h / 2, w, h, Math.min(46, h / 2.2)); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.stroke();
    ctx.fillStyle = CFG.BG; ctx.fillRect(w / 2 - 66, h / 2 - 5, 44, 8); // hide the join
    const lh = size * 1.28, y0 = -((lines.length - 1) * lh) / 2;
    lines.forEach((ln, i) => {
      if (typeof ln === 'string') textC(ctx, ln, 0, y0 + i * lh, size);
      else { // [{text, wiggle}] pieces for mixed lines
        ctx.font = `700 ${size}px ${CFG.FONT}`;
        const tw = ln.map((p) => ctx.measureText(p.text).width), tot = tw.reduce((a, b) => a + b, 0);
        let cx = -tot / 2;
        ln.forEach((p, k) => {
          ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillStyle = CFG.FG;
          const wob = p.wiggle ? Math.sin(t * 55) * 4 : 0;
          ctx.fillText(p.text, cx, y0 + i * lh + wob); cx += tw[k];
        });
      }
    });
    ctx.restore();
  }

  /* ═════════════════════════════════ effects ═════════════════════════════════ */
  function ring(ctx, x, y, τ, maxR, life, color = CFG.FG, w0 = 9) {
    if (τ < 0 || τ > life) return;
    const k = τ / life, r = maxR * easeOutQuad(k);
    ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.lineWidth = Math.max(1, w0 * (1 - k)); ctx.strokeStyle = color;
    ctx.globalAlpha = (1 - k) * 0.95; ctx.stroke(); ctx.globalAlpha = 1;
  }

  /** pixel debris: analytic ballistic motion (gravity + drag-free) so it needs no state */
  function debris(ctx, t, t0, ox, oy, count, speed, color, seed, spread = 1) {
    const τ = t - t0;
    if (τ < 0 || τ > 2.2) return;
    for (let i = 0; i < count; i++) {
      const ang = -Math.PI / 2 + (hash(seed + i * 1.37) - 0.5) * Math.PI * 1.7 * spread;
      const sp = speed * (0.35 + hash(seed + i * 2.11) * 0.9);
      const life = 1.3 + hash(seed + i * 5.3) * 0.8;
      if (τ > life) continue;
      const x = ox + Math.cos(ang) * sp * τ, y = oy + Math.sin(ang) * sp * τ + 0.5 * 2600 * τ * τ;
      const sz = 4 + hash(seed + i * 7.7) * 6, rot = (hash(seed + i) - 0.5) * 14 * τ;
      const a = Math.pow(1 - τ / life, 1.3);
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.globalAlpha = a; ctx.fillStyle = color; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ═══════════════════════════════ battery HUD ═══════════════════════════════ */
  function drawBattery(ctx, t, scale = 1) {
    const [bx, by] = battPos(t);
    const r = remaining(t), col = battColor(t);
    const alert = t >= T.b3Hit && t < T.room;
    // state-dependent glow / flicker
    let glow = 26, alpha = 1;
    if (t >= T.room) { const br = 0.5 - 0.5 * Math.cos(((t - T.charge) * TAU) / 4); glow = 14 + 36 * br * smooth((t - T.charge) / 0.8); }
    else if (r >= 1 && r <= 2) { const h = hash(Math.floor(t * 22) * 1.7); alpha = h < 0.14 ? 0.35 : 0.8 + 0.2 * hash(Math.floor(t * 40)); glow = 18 + 22 * h; }
    else if (r === 0) { const f = Math.sin(t * TAU * 2.4); alpha = f > -0.15 ? 1 : 0.18; glow = 30 + 40 * (0.5 + 0.5 * f); }

    ctx.save(); ctx.translate(bx, by); ctx.scale(scale, scale);
    if (r === 0 && t < T.room) { // pulsing aura
      const p = 0.5 + 0.5 * Math.sin(t * TAU * 2.4), R = 230 + 90 * p;
      const g = ctx.createRadialGradient(0, 0, 20, 0, 0, R);
      g.addColorStop(0, `rgba(255,0,85,${0.42 * (alert ? 1 : 0)})`); g.addColorStop(1, 'rgba(255,0,85,0)');
      ctx.fillStyle = g; ctx.fillRect(-R, -R, R * 2, R * 2);
    }
    ctx.globalAlpha = alpha; ctx.shadowColor = col; ctx.shadowBlur = glow;
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    rr(ctx, -BLOCK.bodyW / 2, -BLOCK.bodyH / 2, BLOCK.bodyW, BLOCK.bodyH, 20);
    ctx.lineWidth = 6; ctx.strokeStyle = col; ctx.stroke();
    rr(ctx, BLOCK.bodyW / 2 + 4, -22, 16, 44, 6); ctx.fillStyle = col; ctx.fill();
    ctx.fillStyle = col;
    for (let i = 0; i < 5; i++) {
      const x = blockX(i), st = SHATTER[i];
      if (t >= T.room) { // recharge: block 0 slowly fills from 0 % to 5 %
        if (i === 0) {
          const fill = 0.25 * easeInOutCubic((t - T.charge) / 1.6), hh = BLOCK.h * fill;
          ctx.fillRect(x - BLOCK.w / 2, BLOCK.h / 2 - hh, BLOCK.w, hh);
          rr(ctx, x - BLOCK.w / 2, -BLOCK.h / 2, BLOCK.w, BLOCK.h, 8); ctx.lineWidth = 2; ctx.globalAlpha = 0.35 * alpha; ctx.stroke(); ctx.globalAlpha = alpha;
        }
        continue;
      }
      if (t < st) {
        const crack = clamp(1 - (st - t) / 0.12), jx = crack * (hash(Math.floor(t * 120) + i) - 0.5) * 8;
        rr(ctx, x - BLOCK.w / 2 + jx, -BLOCK.h / 2, BLOCK.w, BLOCK.h, 8); ctx.fill();
        if (crack > 0) seg(ctx, [[x - 8 + jx, -BLOCK.h / 2], [x + 6 + jx, -8], [x - 6 + jx, 6], [x + 8 + jx, BLOCK.h / 2]], 3, 1, CFG.BG);
      }
    }
    ctx.shadowBlur = 0; ctx.globalAlpha = alpha;
    if (r === 0 && t < T.room) textC(ctx, '!', 0, 4, 64, col, 800); // empty-battery warning glyph
    // numeric readout
    const pct = t >= T.room ? Math.round(5 * easeInOutCubic((t - T.charge) / 1.6)) : r * 20;
    ctx.globalAlpha = 1; ctx.shadowColor = col; ctx.shadowBlur = glow * 0.5;
    textC(ctx, pct + '%', 0, BLOCK.bodyH / 2 + 38, 34, col, 700);
    ctx.restore();
    return [bx, by];
  }

  /* ═══════════════════════════════ party backdrop ════════════════════════════ */
  function drawParty(ctx, focusX, zoom, figX) {
    const layer = (p, alpha, spacing, fn, width = 0) => {
      ctx.save(); ctx.translate(focusX * (1 - p), 0);
      const m = 700 / zoom, i0 = Math.floor((focusX * p - m) / spacing), i1 = Math.ceil((focusX * p + m + 760) / spacing);
      for (let i = i0; i <= i1; i++) {
        // props near the character fade away so they never clutter his silhouette
        const wx = i * spacing + focusX * (1 - p) + width / 2, near = width ? clamp((Math.abs(wx - figX) - (width / 2 + 40)) / 150) : 1;
        ctx.globalAlpha = alpha * near; if (near > 0.01) fn(i * spacing, i);
      }
      ctx.restore(); ctx.globalAlpha = 1;
    };
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    // far: bunting + disco balls (kept clear of the title and the battery)
    layer(0.45, 0.16, 520, (x, i) => {
      seg(ctx, [[x, 500], [x + 260, 580], [x + 520, 500]], 3);
      for (let k = 1; k < 6; k++) { const u = k / 6, px = x + 520 * u, py = 500 + 80 * Math.sin(Math.PI * u); seg(ctx, [[px - 16, py + 2], [px + 16, py + 2], [px, py + 40]], 3); }
      if (i % 2 === 0) { seg(ctx, [[x + 260, 0], [x + 260, 600]], 2); ctx.beginPath(); ctx.arc(x + 260, 646, 46, 0, TAU); ctx.lineWidth = 3; ctx.strokeStyle = CFG.FG; ctx.stroke(); seg(ctx, [[x + 214, 646], [x + 306, 646]], 2); seg(ctx, [[x + 260, 600], [x + 260, 692]], 2); }
    });
    // mid: party guests chatting, balloons, tables
    layer(0.75, 0.22, 640, (x, i) => {
      const k = Math.abs(i) % 3;
      if (k === 0) { // two guests chatting
        [[0, 1], [150, -1]].forEach(([dx, dir]) => {
          const gx = x + dx, hy = G - 150;
          ctx.beginPath(); ctx.arc(gx, hy - 118, 24, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = CFG.FG; ctx.stroke();
          seg(ctx, [[gx, hy - 94], [gx, hy]], 4); seg(ctx, [[gx, hy], [gx - 22, G]], 4); seg(ctx, [[gx, hy], [gx + 22, G]], 4);
          seg(ctx, [[gx, hy - 76], [gx + dir * 44, hy - 40]], 4);
        });
        seg(ctx, [[x + 70, G - 330], [x + 72, G - 330]], 6); seg(ctx, [[x + 90, G - 330], [x + 92, G - 330]], 6); seg(ctx, [[x + 110, G - 330], [x + 112, G - 330]], 6);
      } else if (k === 1) { // balloons
        [[0, 360], [46, 420], [-40, 400]].forEach(([dx, h]) => {
          const bxp = x + dx; ctx.beginPath(); ctx.ellipse(bxp, G - h, 32, 40, 0, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = CFG.FG; ctx.stroke();
          seg(ctx, [[bxp, G - h + 40], [bxp + 8, G - h + 100], [x + 6, G]], 2.5);
        });
      } else { // snack table with cups
        seg(ctx, [[x, G - 150], [x + 220, G - 150]], 6); seg(ctx, [[x + 20, G - 150], [x + 20, G]], 5); seg(ctx, [[x + 200, G - 150], [x + 200, G]], 5);
        [[50, 0], [95, 0], [140, 0]].forEach(([dx]) => seg(ctx, [[x + dx - 14, G - 196], [x + dx - 10, G - 152], [x + dx + 10, G - 152], [x + dx + 14, G - 196]], 3.5));
      }
    }, 240);
  }

  function drawFloor(ctx, focusX, zoom) {
    const x0 = focusX - 700 / zoom, x1 = focusX + 1500 / zoom;
    seg(ctx, [[x0, G], [x1, G]], 5);
    const step = 120; // ticks scroll with the world so speed reads clearly
    for (let x = Math.floor(x0 / step) * step; x < x1; x += step) seg(ctx, [[x, G + 22], [x + 36, G + 22]], 3, 0.28);
    for (let x = Math.floor(x0 / 260) * 260 + 60; x < x1; x += 260) seg(ctx, [[x, G + 60], [x + 90, G + 60]], 3, 0.12);
  }

  /* ═════════════════════════════ scene 5: quiet room ═════════════════════════ */
  function drawRoom(ctx, t) {
    const l = lying(t), F = ROOM.floor, top = ROOM.bedTop;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    seg(ctx, [[-50, F], [CFG.W + 50, F]], 5, 0.5);
    // bed
    rr(ctx, 130, top, 820, 84, 18); ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.stroke();
    seg(ctx, [[170, top + 84], [170, F]], 5); seg(ctx, [[910, top + 84], [910, F]], 5);
    seg(ctx, [[130, top - 150], [130, top + 84]], 6);                     // headboard
    rr(ctx, 160, top - 40, 190, 42, 20); ctx.lineWidth = 4; ctx.stroke(); // pillow
    // wall socket
    rr(ctx, 972, top - 110, 54, 76, 8); ctx.lineWidth = 4; ctx.stroke(); seg(ctx, [[990, top - 84], [990, top - 70]], 4); seg(ctx, [[1008, top - 84], [1008, top - 70]], 4);
    // lying figure (head left)
    ctx.save();
    ctx.translate(ROOM.headX + l.dx, ROOM.headY + l.dy); ctx.rotate(l.rot);
    const settled = 1 - l.fall;
    const limbSpread = l.fall * 26;
    ctx.beginPath(); ctx.arc(0, 0, HEAD_R, 0, TAU); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = CFG.STROKE; ctx.strokeStyle = CFG.FG; ctx.stroke();
    // closed, peaceful eyes + soft smile
    seg(ctx, [[8, -4], [20, -4]], 3.5); seg(ctx, [[-4, -4], [-14, -4]], 3.5);
    ctx.beginPath(); ctx.moveTo(-8, 12); ctx.quadraticCurveTo(0, 18, 8, 12); ctx.lineWidth = 3.5; ctx.stroke();
    seg(ctx, [[HEAD_R + 8, 34], [250, 44 + limbSpread]], CFG.STROKE);                 // torso
    seg(ctx, [[250, 44 + limbSpread], [380, 50], [470, 50 + limbSpread * 0.6]], CFG.STROKE);   // legs
    seg(ctx, [[110, 38], [150, 70 + limbSpread * 1.2]], CFG.STROKE);                  // arm
    ctx.restore();
    // duvet pulls over him
    const dp = easeInOutCubic((t - T.duvet) / 1.0);
    if (dp > 0) {
      const breath = Math.sin((t - T.charge) * TAU / 4) * 5 * smooth((t - T.charge) / 1.0);
      ctx.save(); ctx.globalAlpha = clamp(dp * 1.4); ctx.translate(0, -(1 - dp) * 160 + breath);
      const x0 = 330, x1 = 900, y0 = top - 62, y1 = top + 4;
      ctx.beginPath(); ctx.moveTo(x0, y1); ctx.bezierCurveTo(x0 - 6, y0 + 10, x0 + 70, y0 - 26, x0 + 150, y0);
      ctx.bezierCurveTo(x0 + 250, y0 - 36, x0 + 370, y0 + 12, x0 + 470, y0 - 8); ctx.bezierCurveTo(x0 + 520, y0 - 14, x1 + 4, y0 + 6, x1, y1); ctx.closePath();
      ctx.fillStyle = '#0d0d0d'; ctx.fill(); ctx.lineWidth = 8; ctx.strokeStyle = CFG.FG; ctx.stroke();
      [[x0 + 140, 0.9], [x0 + 330, 1.1], [x0 + 500, 0.8]].forEach(([fx, s]) => { ctx.beginPath(); ctx.moveTo(fx, y0 + 24); ctx.quadraticCurveTo(fx + 14, y0 + 40 * s, fx - 6, y1 - 8); ctx.lineWidth = 3.5; ctx.stroke(); });
      ctx.restore();
    }
    // charging cable + plug
    const cp = easeInOutCubic((t - T.cable) / 1.0);
    if (cp > 0) {
      const p0 = [972, top - 72], p1 = [800, top - 290], p2 = [500, top - 250], p3 = [ROOM.headX + 28, ROOM.headY - 6];
      ctx.save(); ctx.shadowColor = CFG.FG; ctx.shadowBlur = 18;
      ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.bezierCurveTo(p1[0], p1[1], p2[0], p2[1], p3[0], p3[1]);
      ctx.setLineDash([2000]); ctx.lineDashOffset = 2000 * (1 - cp); ctx.lineWidth = 6; ctx.strokeStyle = CFG.FG; ctx.stroke();
      ctx.setLineDash([]); ctx.shadowBlur = 0;
      if (t > T.plug) { // little energy pulses run along the cable while it charges
        for (let k = 0; k < 4; k++) {
          const u = ((t - T.plug) * 0.35 + k / 4) % 1, v = 1 - u, bx = v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], by = v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1];
          ctx.beginPath(); ctx.arc(bx, by, 6, 0, TAU); ctx.fillStyle = CFG.MINT; ctx.shadowColor = CFG.MINT; ctx.shadowBlur = 22; ctx.fill();
        }
      }
      ctx.shadowBlur = 0;
      const pk = easeOutBack(clamp((t - T.plug) / 0.3));
      if (pk > 0) { rr(ctx, p3[0] - 10 + (1 - pk) * 24, p3[1] - 12, 26, 24, 5); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.stroke(); }
      ctx.restore();
    }
    // Zzz
    if (t > T.duvet + 0.9) for (let k = 0; k < 3; k++) {
      const u = (((t - T.duvet) * 0.22 + k / 3) % 1), a = Math.sin(Math.PI * u);
      ctx.globalAlpha = a * 0.7; textC(ctx, 'z', ROOM.headX + 110 + u * 80 + k * 14, ROOM.headY - 60 - u * 150, 30 + k * 10, CFG.FG, 700);
    }
    ctx.globalAlpha = 1;
  }


  /* ═══════════════════════════ explanatory captions (bottom of the frame) ═════ */
  // [from, to, text, colour]. Short, plain-English explanations of what each beat means.
  const CAPTIONS = [
    [0.9, 5.7, 'You arrive at the party.\nBattery: 100%.', CFG.FG],
    [6.3, 8.1, 'Uh oh. Small talk incoming…', CFG.FG],
    [8.5, 13.7, 'Small talk costs more energy\nthan it looks.  −40%', CFG.FG],
    [14.4, 16.1, 'Someone you barely know…', CFG.FG],
    [16.4, 21.6, 'A promise you will never keep\ndrains you twice.  −40%', CFG.AMBER],
    [22.5, 23.8, 'Running on fumes.', CFG.AMBER],
    [24.1, 25.4, 'Group photo. Last block gone.\nBattery: 0%.', CFG.RED],
    [25.6, 27.0, 'Emergency exit.', CFG.RED],
    [27.2, 29.7, 'Ejected. Time to go home.', CFG.FG],
    [30.5, 32.0, 'Back home. Silence.', CFG.FG],
    [32.3, 35.1, 'Plug in. Slowly recharging…\n5%', CFG.MINT],
  ];
  const opts = { captions: true };

  function drawCaptions(ctx, t) {
    if (!opts.captions) return;
    for (const [a, b, text, color] of CAPTIONS) {
      if (t < a - 0.01 || t > b + 0.01) continue;
      const al = Math.min(smooth((t - a) / 0.35), 1 - smooth((t - (b - 0.35)) / 0.35)), lines = text.split('\n');
      ctx.save(); ctx.globalAlpha = al; ctx.translate(0, (1 - al) * 14);
      ctx.font = `700 42px ${CFG.FONT}`;
      const w = Math.max(...lines.map((l) => ctx.measureText(l).width)) + 70, h = lines.length * 56 + 34, y = 1660;
      rr(ctx, CFG.W / 2 - w / 2, y - h / 2, w, h, 22); ctx.fillStyle = 'rgba(10,10,10,0.9)'; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = color; ctx.globalAlpha = al * 0.55; ctx.stroke(); ctx.globalAlpha = al;
      lines.forEach((l, i) => textC(ctx, l, CFG.W / 2, y - ((lines.length - 1) * 56) / 2 + i * 56, 42, color, 700));
      ctx.restore();
    }
  }

  /* ═════════════════════════════════ the frame ═══════════════════════════════ */
  function cameraAt(t, f) {
    const focusX = Math.max(CFG.W * 0.352, f.X);                 // figure enters from the left, then the camera follows
    const back = easeInOutCubic((t - 28.0) / 1.6);              // after he is gone, the camera settles back on the empty floor
    const zk = easeInOutCubic((t - T.b3Hit - 0.1) / 1.4) * (1 - back);       // red-alert pull-out
    const z2 = easeInCubic(clamp((t - T.launch) / 0.9)) * 0.2 * (1 - back);  // rocket: zoom out further to watch him vanish
    const zoom = CFG.BASE_ZOOM * (1 - 0.34 * zk - z2);
    const ax = lerp(360, 540, zk), ay = lerp(1420, 1280, zk);
    const focusY = G - Math.min(f.ry * 0.5, 950) * smooth((t - T.launch) / 0.4) * (1 - back);
    // impacts shake the screen (decaying noise), the rocket rumbles
    let amp = 0;
    [[T.b1Hit, 20], [T.b2Hit1, 18], [T.b2Hit2, 26], [T.b3Hit, 38]].forEach(([h, a]) => { const τ = t - h; if (τ > 0) amp += a * Math.exp(-7 * τ); });
    if (t > T.seat && t < T.launch + 0.4) amp += 5 + 8 * smooth((t - T.seat) / 0.8);
    const sx = amp * (Math.sin(t * 91) + 0.6 * Math.sin(t * 57 + 1)), sy = amp * (Math.sin(t * 83 + 2) + 0.6 * Math.sin(t * 61));
    return { focusX, focusY, zoom, ax, ay, sx, sy };
  }

  function drawFrame(ctx, tIn) {
    const t = clamp(tIn, 0, CFG.DURATION - 1e-6);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, CFG.W, CFG.H);
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    if (t < T.room) drawParty3(ctx, t); else drawScene5(ctx, t);

    // title (screen space), hidden in the quiet room
    if (t < T.room - 0.2) {
      ctx.save(); ctx.font = `700 46px ${CFG.FONT}`; ctx.textBaseline = 'middle'; ctx.fillStyle = CFG.FG;
      ctx.shadowColor = 'rgba(255,255,255,0.35)'; ctx.shadowBlur = 14;
      const chars = [...CFG.TITLE], sp = 5, wd = chars.map((c) => ctx.measureText(c).width), tot = wd.reduce((a, b) => a + b, 0) + sp * (chars.length - 1);
      const n = Math.floor(easeInOutCubic(clamp((t - 0.3) / 1.6)) * chars.length + 1e-4);
      let x = CFG.W / 2 - tot / 2; ctx.textAlign = 'left';
      chars.forEach((c, i) => { if (i < n) ctx.fillText(c, x, 160); x += wd[i] + sp; });
      ctx.restore();
    }
    drawCaptions(ctx, t);
    // red-alert vignette
    if (t >= T.b3Hit && t < T.launch + 1.2) {
      const p = 0.5 + 0.5 * Math.sin(t * TAU * 2.4), k = smooth((t - T.b3Hit) / 0.2) * (1 - smooth((t - (T.launch + 0.2)) / 1.0));
      const g = ctx.createRadialGradient(540, 960, 380, 540, 960, 1150);
      g.addColorStop(0, 'rgba(255,0,85,0)'); g.addColorStop(1, `rgba(255,0,85,${(0.12 + 0.3 * p) * k})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, CFG.W, CFG.H);
    }
    // fades: in from black, a quick black flash on the cut into the quiet room, out at the end
    let a = Math.max(1 - easeInOutCubic(t / 0.5), easeInOutCubic((t - T.fadeOut) / 0.7));
    const cut = Math.abs(t - T.room); if (cut < 0.22) a = Math.max(a, 1 - cut / 0.22);
    if (a > 0.002) { ctx.globalAlpha = clamp(a); ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, CFG.W, CFG.H); ctx.globalAlpha = 1; }
  }

  /** scenes 1–4: the party */
  function drawParty3(ctx, t) {
    const f = figure(t), cam = cameraAt(t, f);
    ctx.save();
    ctx.translate(cam.ax + cam.sx, cam.ay + cam.sy); ctx.scale(cam.zoom, cam.zoom); ctx.translate(-cam.focusX, -cam.focusY);
    drawParty(ctx, cam.focusX, cam.zoom, f.X);
    drawFloor(ctx, cam.focusX, cam.zoom);
    drawStreaks(ctx, t, f);
    drawChair(ctx, t, f);
    if (f.ry < 4000) drawFigure(ctx, t);
    drawLaunchAftermath(ctx, t, f);
    const stage = (dx, y) => [f.X + dx, y];                   // bubbles are placed relative to the figure (world px)
    const headY = f.head[1];

    // ── scene 2: "SO WHAT DO YOU DO FOR WORK?" bumps into him
    {
      const τ = t - T.b1Hit;
      if (t > T.b1In - 0.05 && τ < 1.9) {
        const u = clamp((t - T.b1In) / (T.b1Hit - T.b1In));
        let sx = lerp(1000, 250, easeInCubic(u)), sy = headY - 8, scl = [1, 1], rot = 0, al = 1;
        if (τ > 0) {
          const bounce = easeOutQuad(clamp(τ / 0.7));
          sx = 250 + 200 * bounce; sy = headY - 8 - 160 * easeOutCubic(clamp(τ / 1.2)); rot = 0.35 * bounce;
          scl = [1 - 0.28 * Math.exp(-τ * 16) + 0.0, 1 + 0.2 * Math.exp(-τ * 16)]; al = 1 - smooth((τ - 0.9) / 0.9);
        }
        const [wx, wy] = stage(sx, sy);
        bubble(ctx, { x: wx, y: wy, w: 420, h: 190, lines: ['SO WHAT DO YOU', 'DO FOR WORK?'], size: 36, sx: scl[0], sy: scl[1], rot, alpha: al, t });
      }
    }
    // ── scene 3: the oversized "catch up sometime" bubble zooms in
    {
      const τ1 = t - T.b2Hit1, τ2 = t - T.b2Hit2;
      if (t > T.b2In - 0.05 && τ2 < 2.1) {
        const u = easeInCubic(clamp((t - T.b2In) / (T.b2Hit1 - T.b2In)));
        let k = lerp(0.12, 1.0, u), sx = lerp(700, 285, u), sy = lerp(headY - 380, headY - 60, u), al = clamp((t - T.b2In) / 0.3), rot = lerp(0.2, 0, u);
        if (τ1 > 0) { k *= 1 + 0.08 * Math.exp(-τ1 * 9) * Math.cos(τ1 * 30); sx = 285 + 6 * Math.sin(t * 9); sy = headY - 60 + 5 * Math.sin(t * 7); rot = 0; }
        if (τ2 > 0) { k *= 1 + 0.17 * Math.exp(-τ2 * 9) * Math.cos(τ2 * 26); al *= 1 - smooth((τ2 - 0.9) / 1.0); sx += 100 * smooth(τ2 / 1.8); sy -= 220 * smooth(τ2 / 1.8); }
        const [wx, wy] = stage(sx, sy);
        bubble(ctx, { x: wx, y: wy, w: 560, h: 270, lines: [[{ text: 'WE SHOULD TOTALLY' }], [{ text: 'CATCH UP ' }, { text: 'Sometime!', wiggle: t > T.b2Hit2 - 0.5 && t < T.b2Hit2 + 0.35 }]], size: 41, sx: k, sy: k, rot, alpha: al, tail: 1.3, t });
      }
    }
    // ── scene 4: a tiny "GROUP PHOTO!" is all it takes
    {
      const τ = t - T.b3Hit;
      if (t > T.b3In - 0.05 && τ < 1.4) {
        const u = easeOutQuad(clamp((t - T.b3In) / (T.b3Hit - T.b3In)));
        let sx = lerp(900, 200, u), sy = headY + 30 - 30 * Math.sin(u * Math.PI), al = 1, scl = 1;
        if (τ > 0) { sx = 200 + 130 * smooth(τ / 1.0); sy = headY + 30 + 40 * smooth(τ / 1.0); al = 1 - smooth(τ / 0.9); scl = 1 - 0.2 * Math.exp(-τ * 14); }
        const [wx, wy] = stage(sx, sy);
        bubble(ctx, { x: wx, y: wy, w: 330, h: 104, lines: ['GROUP PHOTO!'], size: 31, sx: scl, sy: 1, alpha: al, tail: 0.7, t });
      }
    }
    // ── battery HUD, shockwaves, debris, alarm rings
    const bp = battPos(t);
    drawBattery(ctx, t);
    const hits = [[T.b1Hit, 120, headY - 8, 460], [T.b2Hit1, 120, headY - 60, 560], [T.b2Hit2, 120, headY - 60, 680]];
    hits.forEach(([h, sx, sy, R]) => { const [wx, wy] = stage(sx, sy); ring(ctx, wx, wy, t - h, R, 0.65); });
    const shatterAt = (i, seed, count, speed) => {
      const st = SHATTER[i], p = battPos(st), col = remaining(st - 1e-3) >= 3 ? CFG.FG : CFG.AMBER;
      debris(ctx, t, st, p[0] + blockX(i), p[1], count, speed, i === 0 ? CFG.RED : col, seed);
    };
    shatterAt(4, 1, 34, 780); shatterAt(3, 2, 34, 800); shatterAt(2, 3, 38, 860); shatterAt(1, 4, 40, 900);
    {
      const p = battPos(T.b3Hit);
      debris(ctx, t, T.b3Hit, p[0] + blockX(0), p[1], 110, 1500, CFG.FG, 9, 1.3);
      debris(ctx, t, T.b3Hit, p[0] + blockX(0), p[1], 60, 1100, CFG.RED, 19, 1.3);
      ring(ctx, p[0] + blockX(0), p[1], t - T.b3Hit, 900, 0.8, CFG.FG, 14);
      for (let k = 0; k < 8; k++) { // alarm rings expand outward from the battery
        const t0 = T.b3Hit + 0.15 + k * 0.42; if (t0 > T.launch + 0.9) break;
        const q = battPos(t0); ring(ctx, q[0], q[1], t - t0, 760, 1.25, CFG.RED, 7);
      }
    }
    void bp;
    ctx.restore();
  }

  /** scene 5: the recharge (fixed camera) */
  function drawScene5(ctx, t) {
    drawRoom(ctx, t);
    ctx.save(); drawBattery(ctx, t, 1); ctx.restore();
    // soft room glow from the charging block
    const br = 0.5 - 0.5 * Math.cos(((t - T.charge) * TAU) / 4), k = smooth((t - T.charge) / 1.2);
    const [bx, by] = battPos(t);
    const g = ctx.createRadialGradient(bx, by + 120, 10, bx, by + 120, 640);
    g.addColorStop(0, `rgba(200,255,217,${0.16 * br * k})`); g.addColorStop(1, 'rgba(200,255,217,0)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, CFG.W, CFG.H);
  }

  /* ══════════════════════════ sound-effect events for the audio track ═══════ */
  const EVENTS = [
    { t: T.b1In - 0.1, k: 'whoosh', g: 0.8 }, { t: T.b1Hit, k: 'bonk', g: 1 }, { t: T.b1Hit, k: 'shatter', g: 0.9 }, { t: T.b1Hit + 0.06, k: 'shatter', g: 0.8 },
    { t: T.b2In, k: 'zoom', g: 0.9 }, { t: T.b2Hit1, k: 'bonk', g: 1 }, { t: T.b2Hit1, k: 'shatter', g: 0.9 },
    { t: T.b2Hit2, k: 'bonk', g: 1 }, { t: T.b2Hit2, k: 'shatter', g: 0.9 }, { t: T.b2Hit1 + 0.1, k: 'amberbuzz', g: 0.6 },
    { t: T.b3In - 0.1, k: 'whoosh', g: 0.5 }, { t: T.b3Hit, k: 'boom', g: 1 }, { t: T.b3Hit, k: 'shatter', g: 1 },
    { t: T.b3Hit + 0.1, k: 'alarm', g: 0.9, d: T.launch - T.b3Hit - 0.1 },
    { t: T.chair, k: 'boing', g: 0.9 }, { t: T.launch - 0.4, k: 'ignite', g: 0.8 }, { t: T.launch, k: 'rocket', g: 1 },
    { t: T.land, k: 'thud', g: 0.7 }, { t: T.duvet, k: 'fabric', g: 0.8 }, { t: T.cable, k: 'cable', g: 0.5 }, { t: T.plug, k: 'plug', g: 0.9 },
    { t: T.charge, k: 'hum', g: 0.9, d: T.fadeOut - T.charge + 0.6 },
  ];
  STEPS.forEach((s) => EVENTS.push({ t: s.t, k: 'step', g: clamp(s.v / 330) * 0.7 + 0.15 }));
  EVENTS.sort((a, b) => a.t - b.t);

  return { CFG, T, SCENES, EVENTS, CAPTIONS, opts, drawFrame };
});
