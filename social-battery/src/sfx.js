/*
 * Tiny dependency-free sound-effect synth. renderSfx(events, seconds, sampleRate) → Float32Array (mono).
 * Used by index.html (WebAudio preview) and render.js (muxed into the MP4).
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.SfxSynth = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const TAU = Math.PI * 2;

  function renderSfx(events, seconds, sr = 44100) {
    const out = new Float32Array(Math.ceil(seconds * sr));
    let seed = 1337;
    const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296) * 2 - 1;
    const lp = (coef) => { let y = 0; return (x) => (y += coef * (x - y)); };           // one-pole low-pass
    const hp = (coef) => { let y = 0; return (x) => x - (y += coef * (x - y)); };        // one-pole high-pass
    const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d));

    /** write a generated clip into the output at time t0 (seconds) */
    function put(t0, dur, gain, fn) {
      const i0 = Math.floor(t0 * sr), n = Math.floor(dur * sr);
      for (let i = 0; i < n && i0 + i < out.length; i++) if (i0 + i >= 0) out[i0 + i] += fn(i / sr, i) * gain;
    }

    const synth = {
      whoosh: (t0, g) => { const f = lp(0.05); put(t0, 0.7, g * 0.5, (t) => f(rnd()) * 6 * Math.sin((Math.PI * t) / 0.7) ** 2); },
      zoom: (t0, g) => { const f = lp(0.03); put(t0, 1.9, g * 0.5, (t) => { const k = t / 1.9; f(rnd()); return f(rnd()) * 8 * k * k + Math.sin(TAU * (120 + 700 * k * k) * t) * 0.25 * k; }); },
      bonk: (t0, g) => { const f = lp(0.2); put(t0, 0.5, g * 0.7, (t) => Math.sin(TAU * (60 + 170 * Math.exp(-t * 30)) * t) * Math.exp(-t * 11) + f(rnd()) * Math.exp(-t * 60) * 0.8); },
      boom: (t0, g) => { const f = lp(0.08); put(t0, 1.6, g * 0.8, (t) => Math.sin(TAU * (34 + 80 * Math.exp(-t * 6)) * t) * Math.exp(-t * 2.8) + f(rnd()) * Math.exp(-t * 6) * 1.4); },
      shatter: (t0, g) => { const h = hp(0.35), pings = Array.from({ length: 14 }, () => ({ f: 2200 + Math.random() * 0, d: 0 }));
        const fr = Array.from({ length: 14 }, (_, k) => 2000 + ((k * 977) % 4200)), dl = fr.map((_, k) => ((k * 0.037) % 0.28));
        void pings; put(t0, 1.0, g * 0.45, (t) => { let s = h(rnd()) * Math.exp(-t * 11) * 0.9; for (let k = 0; k < 14; k++) if (t > dl[k]) s += Math.sin(TAU * fr[k] * (t - dl[k])) * Math.exp(-(t - dl[k]) * 24) * 0.14; return s; }); },
      amberbuzz: (t0, g) => put(t0, 0.9, g * 0.15, (t) => Math.sign(Math.sin(TAU * 120 * t)) * (Math.sin(TAU * 17 * t) > 0 ? 1 : 0.1) * Math.exp(-t * 2.5)),
      alarm: (t0, g, d) => { const f = lp(0.3); put(t0, d, g * 0.26, (t) => { const ph = (t * 2.2) % 1, fr = ph < 0.5 ? 880 : 620; const s = f(Math.sign(Math.sin(TAU * fr * t))); return s * Math.min(1, t / 0.05) * Math.min(1, (d - t) / 0.4); }); },
      boing: (t0, g) => put(t0, 0.9, g * 0.5, (t) => Math.sin(TAU * (220 + 90 * Math.sin(TAU * 13 * t)) * t) * Math.exp(-t * 4.5)),
      ignite: (t0, g) => { const f = lp(0.1); put(t0, 0.5, g * 0.4, (t) => f(rnd()) * 5 * (t / 0.5)); },
      rocket: (t0, g) => { const f = lp(0.12); put(t0, 1.8, g * 0.65, (t) => { const k = Math.min(1, t / 0.5); return f(rnd()) * 5 * Math.exp(-t * 1.6) + Math.sin(TAU * (80 + 700 * k * k) * t) * 0.3 * Math.exp(-t * 2.2); }); },
      thud: (t0, g) => { const f = lp(0.05); put(t0, 0.6, g * 0.6, (t) => Math.sin(TAU * 52 * t) * Math.exp(-t * 9) + f(rnd()) * Math.exp(-t * 20) * 3); },
      fabric: (t0, g) => { const f = lp(0.04); put(t0, 1.1, g * 0.4, (t) => f(rnd()) * 6 * Math.sin((Math.PI * t) / 1.1) ** 2); },
      cable: (t0, g) => { const f = lp(0.12); put(t0, 0.9, g * 0.3, (t) => f(rnd()) * 4 * Math.sin((Math.PI * t) / 0.9) * (Math.sin(TAU * 30 * t) * 0.5 + 0.6)); },
      plug: (t0, g) => { put(t0, 0.15, g * 0.5, (t) => Math.sign(Math.sin(TAU * 180 * t)) * Math.exp(-t * 60)); put(t0 + 0.12, 1.4, g * 0.25, (t) => Math.sin(TAU * 1320 * t) * Math.exp(-t * 4) + Math.sin(TAU * 1980 * t) * Math.exp(-t * 7) * 0.4); },
      hum: (t0, g, d) => put(t0, d, g * 0.16, (t) => { const b = 0.5 - 0.5 * Math.cos((TAU * t) / 4); return (Math.sin(TAU * 110 * t) + 0.5 * Math.sin(TAU * 165 * t) + 0.25 * Math.sin(TAU * 220 * t)) * (0.35 + 0.65 * b) * Math.min(1, t / 0.8) * Math.min(1, (d - t) / 0.8); }),
      step: (t0, g) => { const f = lp(0.12); put(t0, 0.09, g * 0.32, (t) => f(rnd()) * 3 * Math.exp(-t * 55) + Math.sin(TAU * 90 * t) * Math.exp(-t * 40) * 0.5); },
    };
    events.forEach((e) => { const fn = synth[e.k]; if (fn) fn(e.t, e.g == null ? 1 : e.g, e.d); });
    // gentle limiter so overlapping effects never clip
    for (let i = 0; i < out.length; i++) out[i] = Math.tanh(out[i] * 1.2) * 0.85;
    return out;
  }

  /** 16-bit mono WAV bytes */
  function toWav(samples, sr = 44100) {
    const buf = new ArrayBuffer(44 + samples.length * 2), v = new DataView(buf);
    const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + samples.length * 2, true); w(8, 'WAVEfmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
    v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
    w(36, 'data'); v.setUint32(40, samples.length * 2, true);
    for (let i = 0; i < samples.length; i++) v.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 32767, true);
    return new Uint8Array(buf);
  }
  return { renderSfx, toWav };
});
