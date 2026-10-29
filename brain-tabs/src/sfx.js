/*
 * Sound design synth for the brain-tabs video: renderSfx(events, seconds, sampleRate) → Float32Array (mono).
 * Anxious drone + blips for the "tabs", then warm pad + chime + a music-box lullaby once the plan closes the loop.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SfxSynth = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TAU = Math.PI * 2;
  function renderSfx(events, seconds, sr = 44100) {
    const out = new Float32Array(Math.ceil(seconds * sr));
    let seed = 4242; const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
    const lp = (c) => { let y = 0; return (x) => (y += c * (x - y)); };
    function put(t0, dur, gain, fn) {
      const i0 = Math.floor(t0 * sr), n = Math.floor(dur * sr);
      for (let i = 0; i < n && i0 + i < out.length; i++) if (i0 + i >= 0) out[i0 + i] += fn(i / sr) * gain;
    }
    const note = (m) => 440 * Math.pow(2, (m - 69) / 12);
    const synth = {
      pop: (t0, g, e) => { const f = 420 + 60 * (e.p || 0); put(t0, 0.18, g * 0.5, (t) => Math.sin(TAU * (f + 500 * Math.exp(-t * 40)) * t) * Math.exp(-t * 28)); },
      whoosh: (t0, g) => { const f = lp(0.06); put(t0, 0.7, g * 0.4, (t) => f(rnd()) * 6 * Math.sin((Math.PI * t) / 0.7) ** 2); },
      bell: (t0, g) => put(t0, 1.6, g * 0.4, (t) => (Math.sin(TAU * 1568 * t) + 0.5 * Math.sin(TAU * 2349 * t) + 0.3 * Math.sin(TAU * 3136 * t)) * Math.exp(-t * 3.2)),
      ticket: (t0, g) => { const f = lp(0.3); put(t0, 0.12, g * 0.45, (t) => f(rnd()) * 3 * Math.exp(-t * 45) + Math.sin(TAU * 900 * t) * Math.exp(-t * 60) * 0.5); },
      coin: (t0, g) => put(t0, 0.7, g * 0.4, (t) => (Math.sin(TAU * 2637 * t) + 0.6 * Math.sin(TAU * 3520 * t)) * Math.exp(-t * 7) * (1 + 0.4 * Math.sin(TAU * 40 * t))),
      crumble: (t0, g) => { const f = lp(0.5); put(t0, 0.9, g * 0.5, (t) => f(rnd()) * 3 * Math.exp(-t * 4) * (0.5 + 0.5 * Math.sin(TAU * 31 * t + rnd()))); },
      tick: (t0, g, e) => put(t0, 0.08, g * 0.28, (t) => Math.sin(TAU * (700 + 1300 * (e.p || 0)) * t) * Math.exp(-t * 70)),
      zap: (t0, g) => { const f = lp(0.4); put(t0, 0.5, g * 0.5, (t) => Math.sin(TAU * (180 + 900 * Math.exp(-t * 14)) * t) * Math.exp(-t * 8) + f(rnd()) * 2 * Math.exp(-t * 25)); },
      close: (t0, g, e) => put(t0, 0.2, g * 0.3, (t) => Math.sin(TAU * (1500 - 500 * (e.p || 0) * 0.2 - 900 * t) * t) * Math.exp(-t * 28)),
      type: (t0, g) => { const f = lp(0.35); for (let k = 0; k < 7; k++) put(t0 + k * 0.095, 0.05, g * 0.3, (t) => f(rnd()) * 3 * Math.exp(-t * 80)); },
      stamp: (t0, g) => { const f = lp(0.1); put(t0, 0.6, g * 0.8, (t) => Math.sin(TAU * (55 + 90 * Math.exp(-t * 30)) * t) * Math.exp(-t * 9) + f(rnd()) * 3 * Math.exp(-t * 38)); },
      chime: (t0, g) => [74, 78, 81, 86].forEach((m, k) => put(t0 + k * 0.11, 2.2, g * 0.22, (t) => Math.sin(TAU * note(m) * t) * Math.exp(-t * 2.2))),
      note: (t0, g) => put(t0, 0.5, g * 0.25, (t) => Math.sin(TAU * 1200 * t) * Math.exp(-t * 14)),
      lullaby: (t0, g) => [74, 78, 81, 78, 83, 81, 78, 74].forEach((m, k) => put(t0 + k * 0.45, 1.6, g * 0.17, (t) => (Math.sin(TAU * note(m) * t) + 0.35 * Math.sin(TAU * note(m) * 2 * t)) * Math.exp(-t * 2.6))),
      soft: (t0, g) => put(t0, 1.0, g * 0.15, (t) => Math.sin(TAU * note(86) * t) * Math.exp(-t * 3)),
      // anxious drone that tightens until the plan is made
      tension: (t0, g, e) => put(t0, e.d, g * 0.16, (t) => { const k = t / e.d, trem = 0.55 + 0.45 * Math.sin(TAU * (1.2 + 5 * k * k) * t);
        return (Math.sin(TAU * 55 * t) + 0.6 * Math.sin(TAU * 58.3 * t) + 0.25 * Math.sin(TAU * 110 * t)) * trem * Math.min(1, t / 1.5) * Math.min(1, (e.d - t) / 0.35)
          + Math.sin(TAU * (880 + 220 * k) * t) * 0.025 * k; }),
      warm: (t0, g, e) => put(t0, e.d, g * 0.15, (t) => { const env = Math.min(1, t / 2.5) * Math.min(1, (e.d - t) / 3);
        return [50, 57, 62, 66].reduce((s, m, i) => s + Math.sin(TAU * note(m) * t + i) * (i ? 0.5 : 1) + Math.sin(TAU * note(m) * 1.004 * t) * 0.4, 0) * 0.25 * env; }),
    };
    events.forEach((e) => { const fn = synth[e.k]; if (fn) fn(e.t, e.g == null ? 1 : e.g, e); });
    for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 1.3) * 0.85;
    return out;
  }
  function toWav(samples, sr = 44100) {
    const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
    v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
    return new Uint8Array(buf);
  }
  return { renderSfx, toWav };
});
