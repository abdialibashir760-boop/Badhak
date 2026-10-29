/*
 * WHY 3 A.M. REPLAYS EVERYTHING YOU HAVEN'T DONE  (the Zeigarnik effect, in ~57 s)
 *
 *     drawFrame(ctx, t)   — a pure function of time (seconds). Frame n → t = n / 60.
 *
 * Story: night-time intrusive to-do thoughts → Berlin waiter anecdote → "open tabs" metaphor →
 * size doesn't matter → 2011 plan-making study → one action / one time / one place → sleep.
 * All timings live in T / CAPTIONS so the cut can be re-synced to a voice-over by editing one list.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.BrainTabs = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ═════════════════════════════ configuration ═════════════════════════════ */
  const CFG = {
    W: 1080, H: 1920, FPS: 60, DURATION: 57,
    BG: '#0a0a0a', FG: '#ffffff', AMBER: '#ffb703', MINT: '#9dffcf', RED: '#ff4d6d',
    FONT: '"JetBrains Mono","SF Mono","Menlo","Consolas","DejaVu Sans Mono","Liberation Mono",monospace',
  };
  // Scene boundaries (seconds)
  const S = { A: [0, 7.0], B: [7.0, 19.2], C: [19.2, 26.4], D: [26.4, 32.5], E: [32.5, 41.8], F: [41.8, 49.2], G: [49.2, 53.5], H: [53.5, 57] };
  const TAU = Math.PI * 2;

  /* ═══════════════════════════════════ helpers ═══════════════════════════════ */
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (t) => { t = clamp(t); return t * t * (3 - 2 * t); };
  const hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  function bezier(x1, y1, x2, y2) {
    const cx = 3 * x1, bx = 3 * (x2 - x1) - cx, ax = 1 - cx - bx, cy = 3 * y1, by = 3 * (y2 - y1) - cy, ay = 1 - cy - by;
    const X = (u) => ((ax * u + bx) * u + cx) * u, Y = (u) => ((ay * u + by) * u + cy) * u;
    return (x) => { x = clamp(x); let lo = 0, hi = 1, u = x; for (let i = 0; i < 22; i++) { u = (lo + hi) / 2; X(u) < x ? (lo = u) : (hi = u); } return Y(u); };
  }
  const easeOutBack = bezier(0.34, 1.56, 0.64, 1);
  const easeOutCubic = bezier(0.33, 1, 0.68, 1);
  const easeInOutCubic = bezier(0.65, 0, 0.35, 1);
  const easeInCubic = bezier(0.32, 0, 0.67, 0);
  const inScene = (t, sc) => t >= sc[0] && t < sc[1];

  function rr(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function seg(ctx, pts, w = 5, alpha = 1, color = CFG.FG) {
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.lineWidth = w; ctx.strokeStyle = color; ctx.globalAlpha = alpha; ctx.stroke(); ctx.globalAlpha = 1;
  }
  function text(ctx, str, x, y, size, color = CFG.FG, weight = 700, align = 'center') {
    ctx.font = `${weight} ${size}px ${CFG.FONT}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.fillText(str, x, y);
  }
  function ik(A, B, l1, l2, bend) {
    const dx = B[0] - A[0], dy = B[1] - A[1], d0 = Math.hypot(dx, dy) || 1e-6, d = clamp(d0, 0.001, l1 + l2 - 0.01);
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), ux = dx / d0, uy = dy / d0;
    return [A[0] + ux * a - uy * h * bend, A[1] + uy * a + ux * h * bend];
  }
  function ring(ctx, x, y, τ, maxR, life, color = CFG.FG, w0 = 8) {
    if (τ < 0 || τ > life) return; const k = τ / life;
    ctx.beginPath(); ctx.arc(x, y, maxR * easeOutCubic(k), 0, TAU); ctx.lineWidth = Math.max(1, w0 * (1 - k)); ctx.strokeStyle = color;
    ctx.globalAlpha = (1 - k) * 0.9; ctx.stroke(); ctx.globalAlpha = 1;
  }
  /** analytic pixel debris (gravity + fade) */
  function debris(ctx, t, t0, ox, oy, count, speed, color, seed) {
    const τ = t - t0; if (τ < 0 || τ > 1.6) return;
    for (let i = 0; i < count; i++) {
      const ang = -Math.PI / 2 + (hash(seed + i * 1.37) - 0.5) * Math.PI * 1.8, sp = speed * (0.3 + hash(seed + i * 2.1) * 0.9), life = 0.8 + hash(seed + i * 5.3) * 0.7;
      if (τ > life) continue;
      const x = ox + Math.cos(ang) * sp * τ, y = oy + Math.sin(ang) * sp * τ + 0.5 * 2400 * τ * τ, sz = 4 + hash(seed + i * 7.7) * 6;
      ctx.save(); ctx.translate(x, y); ctx.rotate((hash(seed + i) - 0.5) * 12 * τ); ctx.globalAlpha = Math.pow(1 - τ / life, 1.2); ctx.fillStyle = color; ctx.fillRect(-sz / 2, -sz / 2, sz, sz); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  /* ═════════════════════════ stick figure (side-on poses) ════════════════════ */
  function figure(ctx, p, o = {}) {
    const { head, r = 36, neck, hip, legs = [], arms = [], eyes = 'open', mouth = 'flat', alpha = 1, w = 5 } = p;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    [...legs].reverse().forEach(([a, b, c], i) => seg(ctx, [a, b, c], w, alpha * (i === legs.length - 1 ? 1 : 0.55)));
    seg(ctx, [neck, hip], w, alpha);
    arms.forEach(([a, b, c], i) => seg(ctx, [a, b, c], w, alpha * (i === 0 ? 1 : 0.55)));
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.beginPath(); ctx.arc(head[0], head[1], r, 0, TAU); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = w; ctx.strokeStyle = o.color || CFG.FG; ctx.stroke();
    const [hx, hy] = head; ctx.lineWidth = 3.5; ctx.fillStyle = CFG.FG; ctx.strokeStyle = CFG.FG;
    [-11, 11].forEach((dx) => {
      if (eyes === 'closed') { ctx.beginPath(); ctx.arc(hx + dx, hy - 3, 6, 0.1 * Math.PI, 0.9 * Math.PI); ctx.stroke(); }
      else if (eyes === 'wide') { ctx.beginPath(); ctx.arc(hx + dx, hy - 5, 7, 0, TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(hx + dx, hy - 5, 2.2, 0, TAU); ctx.fill(); }
      else { ctx.beginPath(); ctx.arc(hx + dx, hy - 5, 3.8, 0, TAU); ctx.fill(); }
    });
    ctx.beginPath();
    if (mouth === 'smile') { ctx.moveTo(hx - 10, hy + 12); ctx.quadraticCurveTo(hx, hy + 22, hx + 10, hy + 12); }
    else if (mouth === 'worry') { ctx.moveTo(hx - 10, hy + 17); ctx.quadraticCurveTo(hx, hy + 9, hx + 10, hy + 17); }
    else { ctx.moveTo(hx - 9, hy + 15); ctx.lineTo(hx + 9, hy + 15); }
    ctx.stroke(); ctx.restore();
  }

  /* ════════════════════════ shared UI pieces: windows / counter ═══════════════ */
  const TASKS = ['REPLY TO EMAIL', 'CALL MOM', 'TAXES', 'FIX THE SINK', 'GYM??', 'DENTIST', 'BIRTHDAY GIFT', 'RENEW PASSPORT', 'LAUNDRY', 'TEXT BACK', 'CANCEL TRIAL', 'UPDATE CV', 'DRINK WATER', 'SORT PHOTOS', 'BOOK FLIGHT', 'THANK-YOU NOTE'];
  const NWIN = 47;
  const spawnAt = (i) => (i < 3 ? 19.4 + i * 0.12 : 19.7 + 5.6 * Math.pow((i - 3) / (NWIN - 4), 1.7));
  // order in which windows close while the plan is written (the last three wait for the stamp)
  const closeOrder = Array.from({ length: NWIN }, (_, i) => i).sort((a, b) => hash(a * 3.7) - hash(b * 3.7));
  const closeAt = (i) => {
    const rank = closeOrder.indexOf(i);
    if (rank >= NWIN - 3) return 47.6 + (rank - (NWIN - 3)) * 0.55;       // "and the loop closes"
    return 36.8 + 4.4 * Math.pow(rank / (NWIN - 4), 0.85);                   // while he writes the plan
  };
  const openCount = (t) => { let n = 0; for (let i = 0; i < NWIN; i++) if (t >= spawnAt(i) && t < closeAt(i)) n++; return n; };
  // the counter hides during D (cards)
  function winRect(i) {
    const ang = i * 2.399963, rad = 90 + ((i * 53) % 330);
    return { x: 540 + Math.cos(ang) * rad * 1.0, y: 1080 + Math.sin(ang) * rad * 1.05, w: 250 + (i % 4) * 14, h: 150 + (i % 3) * 12, rot: (hash(i * 9.1) - 0.5) * 0.12 };
  }
  function drawWindow(ctx, i, t, alpha, label) {
    const a = spawnAt(i), c = closeAt(i);
    const pop = easeOutBack(clamp((t - a) / 0.28)), shut = 1 - easeInCubic(clamp((t - c) / 0.25));
    const sc = pop * (t > c ? Math.max(0.001, shut) : 1);
    if (sc <= 0.01) return;
    const R = winRect(i);
    ctx.save(); ctx.translate(R.x, R.y); ctx.rotate(R.rot); ctx.scale(sc, sc); ctx.globalAlpha = alpha * (t > c ? shut : 1);
    rr(ctx, -R.w / 2, -R.h / 2, R.w, R.h, 14); ctx.fillStyle = CFG.BG; ctx.fill();
    const col = t > c - 0.05 ? CFG.MINT : CFG.AMBER; ctx.lineWidth = 4; ctx.strokeStyle = col; ctx.stroke();
    seg(ctx, [[-R.w / 2 + 3, -R.h / 2 + 34], [R.w / 2 - 3, -R.h / 2 + 34]], 3, 0.9, col);
    [0, 1, 2].forEach((k) => { ctx.beginPath(); ctx.arc(-R.w / 2 + 20 + k * 18, -R.h / 2 + 17, 5, 0, TAU); ctx.fillStyle = k === 0 ? col : 'rgba(255,255,255,0.35)'; ctx.fill(); });
    text(ctx, label, 0, 8, 22, CFG.FG, 700);
    [0, 1].forEach((k) => seg(ctx, [[-R.w / 2 + 24, 38 + k * 22], [R.w / 2 - 24 - k * 60, 38 + k * 22]], 3, 0.35));
    ctx.restore();
  }
  function drawWindows(ctx, t, alpha) {
    for (let i = 0; i < NWIN; i++) drawWindow(ctx, i, t, alpha, TASKS[i % TASKS.length]);
  }
  function drawCounter(ctx, t) {
    if (t < 19.3 || t > 53.4 || inScene(t, S.D)) return;
    const n = openCount(t), done = n === 0 && t > 48.5, col = done ? CFG.MINT : CFG.AMBER, cy = t > S.G[0] ? 610 : 640, cx = t > S.G[0] ? 290 : 540;
    const al = Math.min(smooth((t - 19.3) / 0.4), 1 - smooth((t - 52.9) / 0.5));
    ctx.save(); ctx.globalAlpha = al; ctx.shadowColor = col; ctx.shadowBlur = 16;
    text(ctx, 'TABS OPEN: ' + n, cx, cy, 46, col, 800); ctx.restore();
    if (done) ring(ctx, cx, cy, t - 48.8, 380, 1.0, CFG.MINT, 6);
  }

  /* ═════════════════════════════ scene A — 3 A.M. ═════════════════════════════ */
  const THOUGHTS = [['REPLY TO EMAIL', 330, 1130], ['CALL MOM', 640, 1040], ['TAXES', 190, 960], ['FIX THE SINK', 470, 900], ['GYM??', 790, 960], ['REMEMBER PASSWORD', 360, 780], ['THAT AWKWARD THING (2014)', 650, 700], ['DENTIST', 880, 1100]];
  function bed(ctx, t, o) {
    const F = 1520;
    seg(ctx, [[-20, F], [1100, F]], 4, 0.45);
    rr(ctx, 110, 1400, 860, 72, 16); ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.stroke();
    seg(ctx, [[150, 1472], [150, F]], 5); seg(ctx, [[930, 1472], [930, F]], 5); seg(ctx, [[110, 1250], [110, 1472]], 6);
    rr(ctx, 140, 1366, 190, 40, 20); ctx.lineWidth = 4; ctx.stroke();
    // nightstand with note
    seg(ctx, [[990, 1400], [1060, 1400]], 5); seg(ctx, [[1000, 1400], [1000, F]], 4); seg(ctx, [[1050, 1400], [1050, F]], 4);
    if (o.note) { const k = easeOutBack(clamp((t - o.note) / 0.4)); ctx.save(); ctx.translate(1025, 1390); ctx.scale(k, k); rr(ctx, -26, -52, 52, 52, 4); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = CFG.MINT; ctx.stroke(); seg(ctx, [[-14, -30], [-4, -18], [16, -42]], 4, 1, CFG.MINT); ctx.restore(); }
    // window + sky
    ctx.save(); const wx = 650, wy = 650, ww = 260, wh = 300;
    const sun = o.sun || 0;
    rr(ctx, wx, wy, ww, wh, 6); ctx.fillStyle = sun > 0 ? `rgba(157,255,207,${0.1 * sun})` : '#0d0d0d'; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = CFG.FG; ctx.stroke();
    seg(ctx, [[wx + ww / 2, wy], [wx + ww / 2, wy + wh]], 4); seg(ctx, [[wx, wy + wh / 2], [wx + ww, wy + wh / 2]], 4);
    ctx.beginPath(); ctx.rect(wx + 4, wy + 4, ww - 8, wh - 8); ctx.clip();
    const mx = wx + 170, my = wy + 120 + sun * 220;
    const g = ctx.createRadialGradient(mx, my, 10, mx, my, 170); g.addColorStop(0, `rgba(255,255,255,${0.35 * (1 - sun)})`); g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g; ctx.fillRect(wx, wy, ww, wh);
    ctx.globalAlpha = 1 - sun; ctx.beginPath(); ctx.arc(mx, my, 44, 0, TAU); ctx.fillStyle = CFG.FG; ctx.fill(); ctx.globalAlpha = 1;
    if (sun > 0) { const sy = wy + wh - 40 - sun * 170; const gg = ctx.createRadialGradient(wx + 130, sy, 10, wx + 130, sy, 180); gg.addColorStop(0, `rgba(255,236,170,${0.9 * sun})`); gg.addColorStop(1, 'rgba(255,236,170,0)'); ctx.fillStyle = gg; ctx.fillRect(wx, wy, ww, wh); ctx.beginPath(); ctx.arc(wx + 130, sy, 36, 0, TAU); ctx.fillStyle = `rgba(255,243,200,${sun})`; ctx.fill(); }
    for (let i = 0; i < 14; i++) { ctx.globalAlpha = (1 - sun) * (0.3 + 0.5 * Math.abs(Math.sin(t * 1.2 + i))); ctx.fillStyle = '#fff'; ctx.fillRect(wx + 20 + hash(i * 3.1) * 220, wy + 20 + hash(i * 7.7) * 140, 3, 3); }
    ctx.restore(); ctx.globalAlpha = 1;
    // clock
    const col = o.clockCol || CFG.AMBER; ctx.save(); ctx.shadowColor = col; ctx.shadowBlur = 14;
    text(ctx, o.clock, 270, 800, 70, col, 800); ctx.restore();
    // sleeper
    const open = !o.asleep;
    const head = [250, 1330 + (o.asleep ? 4 : 0)];
    const breath = Math.sin(t * 1.6) * (o.asleep ? 4 : 1.5);
    figure(ctx, { head, neck: [290, 1368], hip: [560, 1384 - breath], r: 40,
      legs: [[[560, 1384], [700, 1338], [820, 1384]], [[560, 1384], [690, 1342], [800, 1388]]], arms: [[[330, 1372], [350, 1300], [292, 1296]]],
      eyes: open ? 'wide' : 'closed', mouth: open ? 'worry' : 'smile' });
    if (o.duvet) {
      const k = easeInOutCubic(o.duvet); ctx.save(); ctx.globalAlpha = k; ctx.translate(0, -(1 - k) * 90 + breath);
      ctx.beginPath(); ctx.moveTo(330, 1404); ctx.bezierCurveTo(324, 1330, 420, 1306, 500, 1328); ctx.bezierCurveTo(620, 1300, 760, 1340, 850, 1318); ctx.bezierCurveTo(900, 1316, 926, 1360, 926, 1404); ctx.closePath();
      ctx.fillStyle = '#0d0d0d'; ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = CFG.FG; ctx.stroke(); ctx.restore();
    }
    return head;
  }
  function drawA(ctx, t) {
    const colon = Math.floor(t * 2) % 2 === 0 ? ':' : ' ';
    bed(ctx, t, { clock: '3' + colon + '07' });
    THOUGHTS.forEach(([lab, x, y], i) => {
      const a = 0.9 + 0.42 * i, k = easeOutBack(clamp((t - a) / 0.3)); if (k <= 0.01) return;
      const bob = Math.sin(t * 2 + i * 1.7) * 7, out = 1 - smooth((t - 6.5) / 0.4);
      ctx.save(); ctx.translate(x, y + bob); ctx.scale(k, k); ctx.globalAlpha = out;
      ctx.font = `700 30px ${CFG.FONT}`; const w = ctx.measureText(lab).width + 44;
      rr(ctx, -w / 2, -30, w, 60, 30); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = CFG.AMBER; ctx.stroke();
      text(ctx, lab, 0, 2, 30, CFG.FG, 700); ctx.restore();
      if (t - a > 0 && t - a < 0.5) ring(ctx, x, y + bob, t - a, 90, 0.5, CFG.AMBER, 4);
    });
  }

  /* ═══════════════════════════ scene B — Berlin café ══════════════════════════ */
  function drawB(ctx, t) {
    const G = 1450;
    seg(ctx, [[-20, G], [1100, G]], 5);
    // street lamp + "BERLIN 1927" hint on the wall
    const tx = [220, 540, 860];
    tx.forEach((x, i) => { // tables
      seg(ctx, [[x - 90, G - 90], [x + 90, G - 90]], 6); seg(ctx, [[x, G - 90], [x, G]], 5); seg(ctx, [[x - 40, G], [x + 40, G]], 5);
      seg(ctx, [[x - 18, G - 130], [x - 14, G - 94], [x + 14, G - 94], [x + 18, G - 130]], 4); // cup
    });
    // order tickets
    const labels = ['#1', '#2', '#3'];
    tx.forEach((x, i) => {
      const born = 8.0 + i * 0.35; let k = easeOutBack(clamp((t - born) / 0.3)); if (k <= 0.01) return;
      const paid = i === 1 && t > 12.4, gone = i === 1 && t > 13.6;
      if (gone) return;
      const wob = Math.sin(t * 6 + i * 2) * (paid ? 0 : 0.05), col = paid ? CFG.FG : CFG.AMBER;
      ctx.save(); ctx.translate(x, 1080 + Math.sin(t * 2 + i) * 8); ctx.rotate(wob); ctx.scale(k * (paid ? 1 - 0.1 * smooth((t - 12.4) / 1.2) : 1), k);
      if (!paid) { ctx.shadowColor = CFG.AMBER; ctx.shadowBlur = 24; }
      rr(ctx, -80, -62, 160, 124, 10); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = col; ctx.stroke(); ctx.shadowBlur = 0;
      seg(ctx, [[-80, -30], [80, -30]], 3, 1, col); text(ctx, 'ORDER ' + labels[i], 0, -46, 22, col, 800);
      [0, 1, 2].forEach((k2) => seg(ctx, [[-56, -8 + k2 * 22], [56 - k2 * 20, -8 + k2 * 22]], 4, 0.55, col));
      if (paid) text(ctx, 'PAID', 0, 32, 30, CFG.MINT, 800);
      ctx.restore();
    });
    // coin flies from table 2 to waiter, ticket 2 crumbles to dust
    if (t > 12.0 && t < 12.9) { const u = (t - 12.0) / 0.9, px = lerp(540, 520, u), py = 1360 - Math.sin(u * Math.PI) * 220 + u * -120; ctx.beginPath(); ctx.arc(px, py, 20, 0, TAU); ctx.fillStyle = CFG.AMBER; ctx.fill(); }
    debris(ctx, t, 13.55, 540, 1080, 60, 520, CFG.FG, 11);
    // waiter: walks in, serves, ends beside table 2
    const wx = t < 8.0 ? lerp(-120, 390, easeOutCubic((t - 7.1) / 0.9)) : (t < 12.0 ? 390 : lerp(390, 410, smooth((t - 12) / 2)));
    const walking = t < 8.1, ph = t * 9;
    const sw = walking ? Math.sin(ph) : 0, hipY = G - 150, hx = wx;
    figure(ctx, { head: [hx, hipY - 215], r: 34, neck: [hx, hipY - 175], hip: [hx, hipY],
      legs: [[[hx, hipY], [hx + 18 * sw, hipY + 70], [hx + 36 * sw, G]], [[hx, hipY], [hx - 18 * sw, hipY + 70], [hx - 36 * sw, G]]],
      arms: [[[hx, hipY - 150], [hx + 36, hipY - 106], [hx + 70, hipY - 150]], [[hx, hipY - 150], [hx - 20, hipY - 90], [hx - 10, hipY - 40]]],
      eyes: 'open', mouth: t > 14.4 ? 'worry' : 'smile' });
    seg(ctx, [[hx + 30, hipY - 152], [hx + 112, hipY - 152]], 6); // tray
    seg(ctx, [[hx - 16, hipY - 172], [hx + 16, hipY - 172], [hx, hipY - 160], [hx - 16, hipY - 172]], 3, 1); // bow tie
    // memory bubble above the waiter
    if (t > 11.8) {
      const k = easeOutBack(clamp((t - 11.8) / 0.4)), bx = hx + 40, by = 820;
      ctx.save(); ctx.translate(bx, by); ctx.scale(k, k);
      rr(ctx, -260, -100, 520, 200, 40); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = CFG.FG; ctx.stroke();
      text(ctx, 'WAITER’S MEMORY', 0, -72, 22, CFG.FG, 700);
      [-150, 0, 150].forEach((dx, i) => {
        const gone = i === 1 && t > 13.6, fade = gone ? 1 - smooth((t - 13.6) / 1.2) : 1;
        ctx.save(); ctx.translate(dx, 12); ctx.globalAlpha = Math.max(0.15, fade); rr(ctx, -50, -42, 100, 84, 8); ctx.lineWidth = 4;
        ctx.strokeStyle = i === 1 && t > 13.6 ? 'rgba(255,255,255,0.4)' : CFG.AMBER; if (i === 1 && t > 13.6) ctx.setLineDash([8, 8]); ctx.stroke(); ctx.setLineDash([]);
        text(ctx, i === 1 && t > 13.8 ? '?' : '#' + (i + 1), 0, 2, 36, i === 1 && t > 13.8 ? CFG.FG : CFG.AMBER, 800); ctx.restore();
      });
      ctx.restore();
    }
  }

  /* ═════════════════════════ scene C — head full of tabs ═════════════════════ */
  function drawC(ctx, t) {
    const jit = clamp((t - 21) / 4) * 4;
    ctx.save(); ctx.translate(Math.sin(t * 61) * jit, Math.cos(t * 53) * jit * 0.6);
    ctx.beginPath(); ctx.arc(540, 1090, 270, 0, TAU); ctx.lineWidth = 6; ctx.strokeStyle = CFG.FG; ctx.globalAlpha = 0.9; ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
    // heat waves rising off the head
    const heat = clamp((t - 22) / 4);
    for (let i = 0; i < 5; i++) { const x = 380 + i * 80; ctx.globalAlpha = heat * 0.5; ctx.beginPath(); ctx.moveTo(x, 760); for (let k = 1; k <= 8; k++) ctx.lineTo(x + Math.sin(t * 5 + i + k) * 14, 760 - k * 22); ctx.lineWidth = 4; ctx.strokeStyle = CFG.AMBER; ctx.stroke(); }
    ctx.globalAlpha = 1;
    drawWindows(ctx, t, 1);
    // focus meter
    const n = openCount(t), focus = clamp(1 - n / 52);
    ctx.save(); ctx.globalAlpha = smooth((t - 20) / 0.5);
    text(ctx, 'FOCUS', 190, 1620, 34, CFG.FG, 800, 'left');
    rr(ctx, 360, 1596, 540, 48, 24); ctx.lineWidth = 4; ctx.strokeStyle = CFG.FG; ctx.stroke();
    ctx.fillStyle = focus > 0.4 ? CFG.FG : CFG.AMBER; ctx.shadowColor = ctx.fillStyle; ctx.shadowBlur = 14; rr(ctx, 366, 1602, Math.max(8, 528 * focus), 36, 18); ctx.fill(); ctx.restore();
    // spawn pops
    for (let i = 0; i < NWIN; i++) { const w = winRect(i); ring(ctx, w.x, w.y, t - spawnAt(i), 70, 0.35, CFG.AMBER, 3); }
  }

  /* ═════════════════════ scene D — size doesn't matter ═══════════════════════ */
  function card(ctx, cx, cy, w, h, label, t0, t) {
    const k = easeOutBack(clamp((t - t0) / 0.4)); if (k <= 0.01) return;
    ctx.save(); ctx.translate(cx, cy); ctx.scale(k, k);
    rr(ctx, -w / 2, -h / 2, w, h, 20); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = CFG.AMBER; ctx.shadowColor = CFG.AMBER; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0;
    seg(ctx, [[-w / 2 + 4, -h / 2 + 46], [w / 2 - 4, -h / 2 + 46]], 4, 1, CFG.AMBER);
    [0, 1, 2].forEach((k2) => { ctx.beginPath(); ctx.arc(-w / 2 + 26 + k2 * 24, -h / 2 + 23, 6, 0, TAU); ctx.fillStyle = k2 === 0 ? CFG.AMBER : 'rgba(255,255,255,0.35)'; ctx.fill(); });
    text(ctx, label, 0, -h / 2 + 96, Math.min(40, w / 10.5), CFG.FG, 800);
    for (let i = 0; i < 3; i++) seg(ctx, [[-w / 2 + 34, -h / 2 + 150 + i * 30], [w / 2 - 34 - i * 50, -h / 2 + 150 + i * 30]], 4, 0.3);
    // bell icon that shakes
    const sh = Math.sin(t * 40) * 0.25 * clamp((t - t0 - 0.4) / 0.3); ctx.save(); ctx.translate(w / 2 - 30, -h / 2 + 24); ctx.rotate(sh);
    ctx.beginPath(); ctx.moveTo(-14, 12); ctx.quadraticCurveTo(-14, -16, 0, -16); ctx.quadraticCurveTo(14, -16, 14, 12); ctx.closePath(); ctx.lineWidth = 4; ctx.strokeStyle = CFG.AMBER; ctx.stroke(); ctx.restore();
    // nag meter
    const fill = easeInOutCubic(clamp((t - t0 - 0.6) / 1.6));
    text(ctx, 'NAG LEVEL', 0, h / 2 - 96, 24, CFG.FG, 700);
    rr(ctx, -w / 2 + 34, h / 2 - 70, w - 68, 30, 15); ctx.lineWidth = 3; ctx.strokeStyle = CFG.FG; ctx.stroke();
    ctx.fillStyle = CFG.AMBER; rr(ctx, -w / 2 + 38, h / 2 - 66, Math.max(6, (w - 76) * fill), 22, 11); ctx.fill();
    if (fill >= 0.999) text(ctx, 'MAX', w / 2 - 70, h / 2 - 96, 24, CFG.AMBER, 800, 'center');
    ctx.restore();
  }
  function drawD(ctx, t) {
    card(ctx, 265, 1120, 350, 300, 'BUY BATTERIES', 28.5, t);
    card(ctx, 775, 1160, 530, 460, 'CHANGE CAREER', 29.4, t);
    if (t > 31.0) { const k = easeOutBack(clamp((t - 31.0) / 0.35)); ctx.save(); ctx.translate(540, 1540); ctx.scale(k, k); text(ctx, '=', 0, 0, 160, CFG.FG, 800); ctx.restore(); ring(ctx, 540, 1540, t - 31.0, 360, 0.7, CFG.FG, 6); }
  }

  /* ═════════════════════════ scene E — write the plan ════════════════════════ */
  function drawE(ctx, t) {
    const G = 1500;
    drawWindows(ctx, t, 0.2);
    seg(ctx, [[-20, G], [1100, G]], 4, 0.5);
    // desk + chair
    seg(ctx, [[420, 1300], [1000, 1300]], 7); seg(ctx, [[460, 1300], [460, G]], 6); seg(ctx, [[960, 1300], [960, G]], 6);
    seg(ctx, [[180, 1290], [330, 1290]], 7); seg(ctx, [[190, 1290], [150, 1100]], 6); seg(ctx, [[200, 1290], [200, G]], 5); seg(ctx, [[320, 1290], [320, G]], 5);
    // notebook + scribbled lines being written
    rr(ctx, 520, 1262, 360, 38, 4); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = CFG.FG; ctx.stroke();
    // the writing hand scribbles; the page lines build up on the desk-side card
    const writing = t > 38.8 && t < 41.5, jig = writing ? Math.sin(t * 22) * 12 : 0;
    const hand = [610 + (writing ? (t - 38.8) / 2.7 * 220 : 0) + jig, 1268];
    const shoulder = [380, 1100];
    const el = ik(shoulder, hand, 110, 120, 1);
    figure(ctx, { head: [400, 990], r: 40, neck: [385, 1042], hip: [300, 1280],
      legs: [[[300, 1280], [430, 1290], [440, 1420]], [[300, 1280], [420, 1296], [420, 1420]]],
      arms: [[shoulder, el, hand]], eyes: 'open', mouth: t > 41 ? 'smile' : 'flat' });
    // tiny floating plan card
    const k = easeOutBack(clamp((t - 39.0) / 0.4));
    if (k > 0.01) { ctx.save(); ctx.translate(780, 1090); ctx.scale(k, k); rr(ctx, -210, -110, 420, 220, 18); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 5; ctx.strokeStyle = CFG.MINT; ctx.stroke();
      text(ctx, 'THE PLAN', -20, -76, 28, CFG.MINT, 800);
      for (let i = 0; i < 3; i++) { const p = clamp((t - (39.3 + i * 0.7)) / 0.6); seg(ctx, [[-170, -26 + i * 46], [-170 + 330 * p, -26 + i * 46]], 5, 0.9, CFG.MINT); }
      ctx.restore(); }
    // tab-close sparks
    for (let i = 0; i < NWIN; i++) { const w = winRect(i); const c = closeAt(i); if (c < 41.8) ring(ctx, w.x, w.y, t - c, 80, 0.35, CFG.MINT, 3); }
  }

  /* ══════════════════════════ scene F — the one-line plan ═══════════════════ */
  function typed(str, t, t0, cps = 16) { const n = Math.floor(clamp((t - t0) * cps, 0, str.length)); return str.slice(0, n) + (n < str.length && Math.floor(t * 4) % 2 ? '▌' : ''); }
  function drawF(ctx, t) {
    drawWindows(ctx, t, 0.3);
    const k = easeOutBack(clamp((t - 41.9) / 0.5));
    ctx.save(); ctx.translate(540, 1100); ctx.scale(k, k);
    rr(ctx, -440, -400, 880, 800, 28); ctx.fillStyle = CFG.BG; ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = CFG.FG; ctx.stroke();
    text(ctx, 'THE 1-LINE PLAN', 0, -330, 48, CFG.FG, 800); seg(ctx, [[-380, -280], [380, -280]], 3, 0.5);
    const rows = [['WHAT', 'EMAIL LANDLORD', 42.0], ['WHEN', 'TUESDAY 9:00', 43.1], ['WHERE', 'AT MY DESK', 44.2]];
    rows.forEach(([lab, val, t0], i) => {
      const y = -170 + i * 150; text(ctx, lab, -380, y, 34, CFG.MINT, 800, 'left');
      text(ctx, typed(val, t, t0 + 0.2, 15), -380, y + 62, 54, CFG.FG, 800, 'left');
    });
    // stamp when the loop closes
    const sp = easeOutBack(clamp((t - 47.4) / 0.25));
    if (sp > 0.01) { ctx.save(); ctx.translate(250, 260); ctx.rotate(-0.2); ctx.scale(sp * 1.0, sp * 1.0); rr(ctx, -210, -62, 420, 124, 20); ctx.lineWidth = 9; ctx.strokeStyle = CFG.MINT; ctx.shadowColor = CFG.MINT; ctx.shadowBlur = 20; ctx.stroke(); ctx.shadowBlur = 0; text(ctx, 'PLAN MADE', 0, 4, 54, CFG.MINT, 800); ctx.restore(); }
    ctx.restore();
    if (t > 47.35 && t < 47.7) ring(ctx, 790, 1360, t - 47.35, 420, 0.5, CFG.MINT, 8);
    for (let i = 0; i < NWIN; i++) { const w = winRect(i); const c = closeAt(i); if (c >= 41.8) ring(ctx, w.x, w.y, t - c, 80, 0.35, CFG.MINT, 3); }
  }

  /* ═══════════════════════ scene G/H — night turns to morning ════════════════ */
  function drawG(ctx, t) {
    const prog = clamp((t - 50.0) / 3.2), minutes = lerp(3 * 60 + 7, 7 * 60, easeInOutCubic(prog));
    const h = Math.floor(minutes / 60), m = Math.floor(minutes % 60);
    const clock = h + ':' + String(m).padStart(2, '0');
    const sun = easeInOutCubic(clamp((t - 51.2) / 2.2));
    bed(ctx, t, { clock, clockCol: t > 50.0 ? CFG.MINT : CFG.AMBER, asleep: t > 49.9, duvet: clamp((t - 49.4) / 0.9), note: 49.6, sun });
    // zzz
    if (t > 50.4) for (let k = 0; k < 3; k++) { const u = (((t - 50.4) * 0.3 + k / 3) % 1); ctx.globalAlpha = Math.sin(Math.PI * u) * 0.8; text(ctx, 'z', 330 + u * 90 + k * 16, 1230 - u * 190, 34 + k * 12, CFG.FG, 800); }
    ctx.globalAlpha = 1;
  }

  /* ═════════════════════════════ kinetic captions ════════════════════════════ */
  // [from, to, text ('*' toggles accent colour), accent, y]
  const CAPTIONS = [
    [0.4, 1.7, 'IT’S *3 A.M.*', CFG.AMBER, 300],
    [1.6, 5.8, 'YOUR BRAIN JUST\nREMEMBERED AN EMAIL\nYOU FORGOT TO SEND.', CFG.AMBER, 330],
    [5.9, 6.95, '*WHY NOW?*', CFG.AMBER, 330],
    [7.1, 8.9, 'BERLIN, *1920s.*', CFG.AMBER, 340],
    [9.0, 11.3, 'A PSYCHOLOGIST\nNOTICES SOMETHING ODD…', CFG.AMBER, 340],
    [11.4, 14.1, 'WAITERS REMEMBERED\n*UNPAID* ORDERS\nPERFECTLY.', CFG.AMBER, 340],
    [14.3, 16.4, '…AND FORGOT\n*PAID* ONES\nINSTANTLY.', CFG.AMBER, 340],
    [16.5, 19.0, '', CFG.FG, 340, '(AT LEAST, THAT’S THE STORY)'],
    [19.3, 21.1, 'YOUR BRAIN\nDOES THE SAME.', CFG.AMBER, 330],
    [21.2, 26.3, 'EVERY *UNFINISHED* TASK\nSTAYS OPEN LIKE\nA BROWSER TAB.', CFG.AMBER, 330],
    [26.5, 28.4, 'SIZE DOESN’T\nMATTER.', CFG.AMBER, 330],
    [28.5, 32.4, 'BUYING *BATTERIES*\nNAGS AS LOUD AS\nCHANGING *CAREERS.*', CFG.AMBER, 330],
    [32.6, 36.5, 'BUT IN 2011,\nRESEARCHERS FOUND\nA *LOOPHOLE.*', CFG.MINT, 330],
    [36.6, 39.1, 'YOU DON’T HAVE\nTO FINISH IT.', CFG.MINT, 330],
    [39.2, 41.7, 'JUST\n*MAKE A PLAN.*', CFG.MINT, 330],
    [41.9, 47.3, '*ONE ACTION.*\n*ONE TIME.*\n*ONE PLACE.*', CFG.MINT, 330],
    [47.4, 49.0, 'AND THE LOOP\n*CLOSES.*', CFG.MINT, 330],
    [49.3, 52.1, 'SO TONIGHT, DON’T\nTRY TO REMEMBER IT.', CFG.MINT, 330],
    [52.2, 53.5, '*WRITE IT DOWN.*', CFG.MINT, 330],
    [53.6, 56.4, 'THEN CLOSE THE *TABS*\nAND *SLEEP.*', CFG.MINT, 330, 'FOLLOW FOR MORE BRAIN HACKS'],
  ];
  function drawCaption(ctx, t, c) {
    const [a, b, str, col, y0, sub] = c; if (t < a || t > b + 0.05) return;
    const out = 1 - smooth((t - (b - 0.3)) / 0.3), lines = str ? str.split('\n') : [], size = 62, lh = 82, top = y0 - ((lines.length - 1) * lh) / 2;
    ctx.save(); ctx.font = `800 ${size}px ${CFG.FONT}`; let k = 0;
    lines.forEach((ln, li) => {
      const words = []; ln.split('*').forEach((sg, si) => sg.split(' ').filter(Boolean).forEach((w) => words.push({ w, acc: si % 2 === 1 })));
      const ws = words.map((o) => ctx.measureText(o.w).width), sp = ctx.measureText(' ').width, total = ws.reduce((x, y) => x + y, 0) + sp * (words.length - 1);
      let x = 540 - total / 2;
      words.forEach((o, i) => {
        const p = clamp((t - (a + k * 0.14)) / 0.26); k++;
        if (p > 0) { ctx.save(); ctx.translate(x + ws[i] / 2, top + li * lh + (1 - p) * 18); ctx.scale(easeOutBack(p), easeOutBack(p)); ctx.globalAlpha = Math.min(1, p * 2) * out;
          if (o.acc) { ctx.shadowColor = col; ctx.shadowBlur = 18; }
          ctx.fillStyle = o.acc ? col : CFG.FG; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(o.w, 0, 0); ctx.restore(); }
        x += ws[i] + sp;
      });
    });
    if (sub) { ctx.globalAlpha = out * smooth((t - a - 0.4) / 0.4); text(ctx, sub, 540, top + lines.length * lh * 0.62 + (lines.length ? 40 : 0) + (lines.length ? 0 : 0), lines.length ? 32 : 36, lines.length ? CFG.MINT : 'rgba(255,255,255,0.75)', 700); }
    ctx.restore();
  }

  /* ═════════════════════════════════ the frame ═══════════════════════════════ */
  const CUTS = [S.B[0], S.C[0], S.D[0], S.E[0], S.F[0], S.G[0], S.H[0]];
  function drawFrame(ctx, tIn) {
    const t = clamp(tIn, 0, CFG.DURATION - 1e-6);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, CFG.W, CFG.H); ctx.lineCap = 'round'; ctx.lineJoin = 'round';

    // a slow push-in on the stage + punch on key beats
    const sc = inScene(t, S.A) ? S.A : inScene(t, S.B) ? S.B : inScene(t, S.C) ? S.C : inScene(t, S.D) ? S.D : inScene(t, S.E) ? S.E : inScene(t, S.F) ? S.F : inScene(t, S.G) ? S.G : S.H;
    const prog = (t - sc[0]) / (sc[1] - sc[0]), base = sc === S.B ? 1.25 : (sc === S.A || sc === S.G || sc === S.H) ? 1.1 : 1, z = base * (1 + 0.04 * prog);
    let punch = 0; [[13.6, 8], [31.0, 14], [47.4, 12], [12.4, 5]].forEach(([p, a]) => { const τ = t - p; if (τ > 0) punch += a * Math.exp(-9 * τ) * Math.sin(τ * 70); });
    const ay = base > 1 ? 1480 : 1050;
    ctx.save(); ctx.translate(540 + punch, ay + punch * 0.6); ctx.scale(z, z); ctx.translate(-540, -ay);
    if (inScene(t, S.A)) drawA(ctx, t); else if (inScene(t, S.B)) drawB(ctx, t); else if (inScene(t, S.C)) drawC(ctx, t);
    else if (inScene(t, S.D)) drawD(ctx, t); else if (inScene(t, S.E)) drawE(ctx, t); else if (inScene(t, S.F)) drawF(ctx, t); else if (inScene(t, S.G)) drawG(ctx, t);
    else drawG(ctx, S.G[1] - 1e-3);
    ctx.restore();
    drawCounter(ctx, t);
    CAPTIONS.forEach((c) => drawCaption(ctx, t, c));

    // thin progress line (retention) + tiny dip-to-black on every cut
    ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fillRect(0, 1906, CFG.W * (t / CFG.DURATION), 4);
    let a = Math.max(1 - easeInOutCubic(t / 0.4), easeInOutCubic((t - (CFG.DURATION - 0.7)) / 0.6));
    CUTS.forEach((c) => { const d = Math.abs(t - c); if (d < 0.1) a = Math.max(a, 1 - d / 0.1); });
    if (a > 0.002) { ctx.globalAlpha = clamp(a); ctx.fillStyle = CFG.BG; ctx.fillRect(0, 0, CFG.W, CFG.H); ctx.globalAlpha = 1; }
  }

  /* ═══════════════════════ sound design (events for src/sfx.js) ══════════════ */
  const EVENTS = [];
  THOUGHTS.forEach((_, i) => EVENTS.push({ t: 0.9 + 0.42 * i, k: 'pop', p: i }));
  EVENTS.push({ t: 7.1, k: 'whoosh' }, { t: 7.4, k: 'bell' });
  [8.0, 8.35, 8.7].forEach((t) => EVENTS.push({ t, k: 'ticket' }));
  EVENTS.push({ t: 12.0, k: 'coin' }, { t: 13.55, k: 'crumble' });
  for (let i = 0; i < NWIN; i++) EVENTS.push({ t: spawnAt(i), k: 'tick', p: i / NWIN });
  EVENTS.push({ t: 28.5, k: 'whoosh' }, { t: 29.4, k: 'whoosh' }, { t: 31.0, k: 'zap' });
  for (let i = 0; i < NWIN; i++) EVENTS.push({ t: closeAt(i), k: 'close', p: i % 5 });
  [39.3, 40.0, 40.7, 42.2, 43.3, 44.4].forEach((t) => EVENTS.push({ t, k: 'type' }));
  EVENTS.push({ t: 47.4, k: 'stamp' }, { t: 48.85, k: 'chime' }, { t: 49.6, k: 'note' }, { t: 51.2, k: 'lullaby' }, { t: 56.0, k: 'soft' });
  EVENTS.push({ t: 0.0, k: 'tension', d: 32 }, { t: 32.4, k: 'warm', d: 24.5 });
  EVENTS.sort((x, y) => x.t - y.t);

  return { CFG, S, CAPTIONS, EVENTS, openCount, drawFrame };
});
