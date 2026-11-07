import React from 'react';
import {AbsoluteFill, Img, Loop, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {C, sans, serif} from './theme';
import clips from './clips.json';

export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const win = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const eo = (x: number) => 1 - Math.pow(1 - x, 3);
export const eio = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const useT = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  return f / fps;
};
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};
export type SceneProps = {d: number};

export const Black: React.FC<{children?: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #17140d 0%, ${C.ink} 62%)`, fontFamily: sans, color: C.ivory}}>
    {children}
  </AbsoluteFill>
);

export const Kicker: React.FC<{text: string; t: number; y?: number; x?: number; color?: string}> = ({text, t, y = 120, x = 120, color = C.gold}) => (
  <div style={{position: 'absolute', left: x, top: y, opacity: eo(win(t, 0.1, 0.7)), letterSpacing: 8, fontSize: 26, fontWeight: 600, color, textTransform: 'uppercase', transform: `translateY(${(1 - eo(win(t, 0.1, 0.7))) * 12}px)`}}>
    {text}
  </div>
);

export const Headline: React.FC<{text: string; t: number; y?: number; x?: number; size?: number; w?: number; color?: string; delay?: number; align?: 'left' | 'center'}> = ({text, t, y = 200, x = 120, size = 72, w = 1500, color = C.ivory, delay = 0.2, align = 'left'}) => {
  const p = eo(win(t, delay, delay + 0.9));
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, fontFamily: serif, fontSize: size, lineHeight: 1.18, color, opacity: p, transform: `translateY(${(1 - p) * 22}px)`, textAlign: align}}>
      {text}
    </div>
  );
};

export const Source: React.FC<{text: string; t: number}> = ({text, t}) => (
  <div style={{position: 'absolute', left: 80, bottom: 46, fontSize: 20, color: C.grey, opacity: eo(win(t, 1.6, 2.4)), maxWidth: 1500}}>{text}</div>
);

export const Gold: React.FC<{children: React.ReactNode; size?: number}> = ({children, size}) => <span style={{color: C.gold, fontSize: size}}>{children}</span>;

export const Vignette: React.FC = () => (
  <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(0,0,0,0.65) 100%)', pointerEvents: 'none'}} />
);

export const VideoBG: React.FC<{src: string; d: number; t: number; start?: number; dim?: number; tint?: number; push?: number}> = ({src, d, t, start = 0, dim = 0.28, tint = 0.22, push = 0.08}) => {
  const s = 1 + push * (t / Math.max(d, 1));
  return (
    <AbsoluteFill style={{background: C.ink}}>
      <AbsoluteFill style={{transform: `scale(${s})`}}>
        <Loop durationInFrames={Math.max(30, Math.floor(((clips as Record<string, number>)[src] - start - 0.1) * 30))}>
          <OffthreadVideo src={staticFile(`clips/${src}.mp4`)} startFrom={Math.round(start * 30)} muted style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.7) contrast(1.05)'}} />
        </Loop>
      </AbsoluteFill>
      <AbsoluteFill style={{background: `rgba(201,162,75,${tint})`, mixBlendMode: 'multiply'}} />
      <AbsoluteFill style={{background: `rgba(11,11,12,${dim})`}} />
      <Vignette />
    </AbsoluteFill>
  );
};

export const LowerThird: React.FC<{title: string; sub?: string; t: number; d: number}> = ({title, sub, t, d}) => {
  const p = eo(win(t, 0.5, 1.2)) * (1 - win(t, d - 0.5, d));
  return (
    <div style={{position: 'absolute', left: 100, bottom: 130, opacity: p, transform: `translateX(${(1 - p) * -30}px)`}}>
      <div style={{width: 90, height: 3, background: C.gold, marginBottom: 14}} />
      <div style={{fontFamily: serif, fontSize: 52, color: C.ivory, textShadow: '0 2px 18px rgba(0,0,0,.9)'}}>{title}</div>
      {sub && <div style={{fontSize: 26, color: C.goldHi, marginTop: 8, letterSpacing: 1, textShadow: '0 2px 12px rgba(0,0,0,.9)'}}>{sub}</div>}
    </div>
  );
};

export const Photo: React.FC<{src: string; d: number; t: number; title: string; sub?: string; note?: string; side?: 'left' | 'right'; maxH?: number; scale0?: number; children?: React.ReactNode}> = ({src, d, t, title, sub, note, side = 'right', maxH = 860, scale0 = 1, children}) => {
  const s = scale0 + 0.07 * (t / Math.max(d, 1));
  const p = eo(win(t, 0.1, 0.9));
  return (
    <Black>
      <AbsoluteFill style={{transform: 'scale(1.25)'}}>
        <Img src={staticFile(`img/${src}`)} style={{width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(46px) brightness(0.26) saturate(0.7)'}} />
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'rgba(11,11,12,0.35)'}} />
      <div style={{position: 'absolute', top: 0, bottom: 0, [side === 'right' ? 'right' : 'left']: 140, width: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: p}}>
        <Img src={staticFile(`img/${src}`)} style={{maxWidth: 900, maxHeight: maxH, transform: `scale(${s})`, boxShadow: '0 30px 90px rgba(0,0,0,.85)', border: `2px solid rgba(201,162,75,0.55)`, objectFit: 'contain'}} />
      </div>
      <div style={{position: 'absolute', [side === 'right' ? 'left' : 'right']: 110, top: 0, bottom: 0, width: 760, display: 'flex', flexDirection: 'column', justifyContent: 'center', opacity: eo(win(t, 0.3, 1.1))}}>
        <div style={{width: 110, height: 4, background: C.gold, marginBottom: 26}} />
        <div style={{fontFamily: serif, fontSize: 70, lineHeight: 1.1, color: C.ivory}}>{title}</div>
        {sub && <div style={{fontSize: 32, color: C.goldHi, marginTop: 22, lineHeight: 1.35, whiteSpace: 'pre-line'}}>{sub}</div>}
        {note && <div style={{fontSize: 22, color: C.grey, marginTop: 24}}>{note}</div>}
      </div>
      {children}
      <Vignette />
    </Black>
  );
};

export const Stamp: React.FC<{text: string; sub?: string; t: number; at: number; x: number; y: number; rot?: number}> = ({text, sub, t, at, x, y, rot = -8}) => {
  const p = eo(win(t, at, at + 0.18));
  const sc = 2.4 - 1.4 * p;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity: p, transform: `rotate(${rot}deg) scale(${sc})`, border: `6px solid ${C.red}`, color: '#E24B4B', padding: '12px 34px', fontWeight: 800, letterSpacing: 6, fontSize: 56, textAlign: 'center', background: 'rgba(11,11,12,0.6)'}}>
      {text}
      {sub && <div style={{fontSize: 26, letterSpacing: 3, fontWeight: 600, marginTop: 6}}>{sub}</div>}
    </div>
  );
};

export const Embers: React.FC<{t: number; n?: number; seed?: number; hue?: string}> = ({t, n = 70, seed = 11, hue = '255,150,40'}) => {
  const r = rng(seed);
  const items = Array.from({length: n}, () => ({x: r() * 1920, sp: 40 + r() * 120, ph: r() * 10, sz: 2 + r() * 5, sw: 20 + r() * 60, o: 0.3 + r() * 0.7}));
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {items.map((e, i) => {
        const y = 1180 - ((t * e.sp + e.ph * 100) % 1300);
        const x = e.x + Math.sin(t * 1.2 + e.ph) * e.sw;
        return <div key={i} style={{position: 'absolute', left: x, top: y, width: e.sz, height: e.sz, borderRadius: '50%', background: `rgba(${hue},${e.o})`, boxShadow: `0 0 ${e.sz * 4}px rgba(${hue},0.8)`}} />;
      })}
    </AbsoluteFill>
  );
};

/** Horizontal bars growing from zero */
export type Bar = {label: string; value: number; color: string; sub?: string};
export const HBars: React.FC<{bars: Bar[]; max: number; t: number; fmt: (v: number) => string; x?: number; y?: number; w?: number; rowH?: number; delay?: number; stagger?: number}> = ({bars, max, t, fmt, x = 160, y = 330, w = 1600, rowH = 150, delay = 0.5, stagger = 0.5}) => (
  <>
    {bars.map((b, i) => {
      const p = eo(win(t, delay + i * stagger, delay + i * stagger + 1.3));
      const bw = (w - 420) * (b.value / max) * p;
      return (
        <div key={i} style={{position: 'absolute', left: x, top: y + i * rowH, width: w, height: rowH - 30}}>
          <div style={{position: 'absolute', left: 0, top: 6, width: 300, fontSize: 38, fontFamily: serif, color: C.ivory}}>{b.label}</div>
          {b.sub && <div style={{position: 'absolute', left: 0, top: 60, width: 300, fontSize: 20, color: C.grey}}>{b.sub}</div>}
          <div style={{position: 'absolute', left: 320, top: 0, width: bw, height: rowH - 40, background: `linear-gradient(90deg, ${b.color}, ${b.color}cc)`, boxShadow: `0 0 30px ${b.color}55`}} />
          <div style={{position: 'absolute', left: 320 + bw + 22, top: 14, whiteSpace: 'nowrap', fontSize: 52, fontWeight: 700, color: b.color === C.red ? '#E24B4B' : b.color === C.ivory ? C.ivory : C.goldHi, opacity: p}}>{fmt(b.value * p)}</div>
        </div>
      );
    })}
  </>
);

export const Chip: React.FC<{label: string; kind: 'FACT' | 'INTERP'}> = ({label, kind}) => (
  <div style={{position: 'absolute', right: 70, top: 60, padding: '10px 20px', fontFamily: sans, fontSize: 22, letterSpacing: 4, fontWeight: 700, textTransform: 'uppercase', color: kind === 'FACT' ? C.gold : C.ivory, background: kind === 'FACT' ? 'rgba(11,11,12,0.8)' : C.red, border: kind === 'FACT' ? `2px solid ${C.gold}` : `2px solid ${C.red}`}}>
    {label}
  </div>
);
