import React, { useLayoutEffect, useRef } from 'react';
import { createMapEngine } from '../map/engine';
import { MAP_STATES } from '../map/mapStates';
import { yearAtTau, fmtYear } from '../data/history';
import { TimelineBar, YearBadge } from './Overlays';

let engine: any = null;
export const getEngine = () => (engine ??= createMapEngine({ W: 1920, H: 1080, quality: 0.5, makeCanvas: (w: number, h: number) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } }));

export const MapShot: React.FC<{ scene: string; f: number; dur: number; fps: number }> = ({ scene, f, dur, fps }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const p = Math.min(1, Math.max(0, f / Math.max(1, dur - 1))), t = f / fps;
  const st = MAP_STATES[scene](p, t);
  useLayoutEffect(() => { const ctx = ref.current!.getContext('2d')!; getEngine().render(ctx, { cam: st.cam, tau: st.tau, time: t, layers: st.layers, modernMix: st.modernMix, footprint: st.footprint, labelsA: st.labelsA }); });
  const cam = getEngine().camOf(st.cam);
  const pos = (lon: number, lat: number) => ({ x: 960 + (lon * Math.PI / 180 - cam.uc) * cam.s, y: 540 - (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2)) - cam.vc) * cam.s });
  const y = st.yr ?? yearAtTau(st.tau);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: 'absolute', inset: 0 }} />
      {(st.texts || []).map((tx, i) => { const { x, y: yy } = pos(tx.lon, tx.lat); if (tx.a <= 0) return null; const caps = tx.font !== 'serif';
        return <div key={i} style={{ position: 'absolute', left: x, top: yy, transform: `translate(-50%,-50%) rotate(${tx.rot ?? 0}deg)`, opacity: tx.a, whiteSpace: 'nowrap', fontFamily: caps ? 'Cinzel, serif' : '"Cormorant Garamond", serif', fontStyle: caps ? 'normal' : 'italic', fontWeight: 600, fontSize: tx.size ?? 20, letterSpacing: caps ? (tx.size ?? 20) * 0.28 : 1, color: `rgb(${tx.color ?? '70,10,12'})`, textShadow: '0 0 6px rgba(242,230,196,0.95), 0 0 2px rgba(242,230,196,1), 0 0 12px rgba(242,230,196,0.8)' }}>{tx.text}</div>; })}
      {st.year && <YearBadge label={fmtYear(y)} />}
      {st.timeline && <TimelineBar year={y} />}
    </div>
  );
};
