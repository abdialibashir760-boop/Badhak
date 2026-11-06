import React, { useEffect, useState } from 'react';
import { AbsoluteFill, Audio, Sequence, delayRender, continueRender, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import './fonts';
import { FONT_LOADS } from './fonts';
import { TIMELINE } from './data/timeline.generated';
import { ART } from './art/registry';
import { MapShot } from './components/MapShot';
import { LowerThird, ChapterCard, TitleOverlay, EndCard } from './components/Overlays';
import { FilmFX } from './components/FX';
import type { ShotDef } from './data/shots';
type ShotT = ShotDef & { id: string; start: number; dur: number };

const OV = 12; // transition overlap (frames)
const cl = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * cl(t));

const useFontsReady = () => {
  const [ready, setReady] = useState(false); const [h] = useState(() => delayRender('fonts'));
  useEffect(() => { Promise.all(FONT_LOADS.map((s) => (document as any).fonts.load(s, 'AaBb Rome 123'))).then(() => (document as any).fonts.ready).then(() => { setReady(true); continueRender(h); }); }, [h]);
  return ready;
};

const transitionStyle = (tr: string | undefined, f: number): React.CSSProperties => {
  if (f >= OV) return {}; const q = ease(f / OV);
  switch (tr) { case 'wipe': return { clipPath: `inset(0 ${(1 - q) * 100}% 0 0)` }; case 'iris': return { clipPath: `circle(${q * 78}% at 50% 50%)` }; case 'flash': return { opacity: 0.2 + 0.8 * q }; default: return { opacity: q }; }
};

const Shot: React.FC<{ shot: ShotT; fps: number }> = ({ shot, fps }) => {
  const f = useCurrentFrame(), durF = Math.round(shot.dur * fps) + OV, p = cl(f / Math.max(1, durF - 1));
  const hasTl = shot.kind === 'map';
  let body: React.ReactNode;
  if (shot.kind === 'map') body = <MapShot scene={shot.scene} f={f} dur={durF} fps={fps} />;
  else {
    const Scene = ART[shot.scene]; const c = (shot.cam ?? [1, 1.06, 0, 0, 0, 0]) as number[]; const q = ease(p), z = c[0] + (c[1] - c[0]) * q;
    const tx = c[2] + (c[3] - c[2]) * q + Math.sin(f * 0.03) * 3, ty = c[4] + (c[5] - c[4]) * q + Math.cos(f * 0.027) * 2.5;
    body = shot.kind === 'card' ? <svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }}><Scene f={f} p={p} d={durF} /></svg>
      : <div style={{ position: 'absolute', inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: '50% 55%' }}><svg viewBox="0 0 1920 1080" style={{ position: 'absolute', inset: 0, width: 1920, height: 1080 }}><Scene f={f} p={p} d={durF} /></svg></div>;
  }
  const flash = shot.tr === 'flash' && f < 8 ? (1 - f / 8) * 0.55 : 0;
  return (
    <AbsoluteFill style={transitionStyle(shot.tr, f)}>
      <AbsoluteFill style={{ overflow: 'hidden' }}>{body}</AbsoluteFill>
      {shot.cap && <LowerThird title={shot.cap[0]} sub={shot.cap[1]} f={Math.max(0, f - OV / 2)} fps={fps} hasTimeline={hasTl} />}
      {flash > 0 && <AbsoluteFill style={{ background: '#fff4d6', opacity: flash }} />}
    </AbsoluteFill>
  );
};

export const Documentary: React.FC = () => {
  const frame = useCurrentFrame(), { fps } = useVideoConfig(), ready = useFontsReady(), time = frame / fps;
  if (!ready) return <AbsoluteFill style={{ background: '#000' }} />;
  const fadeIn = 1 - ease(frame / 15), fadeOut = ease((frame - (TIMELINE.totalFrames - 20)) / 20);
  return (
    <AbsoluteFill style={{ background: '#0b0603' }}>
      <Audio src={staticFile('audio/mix.mp3')} />
      {TIMELINE.shots.map((s, i) => { const from = Math.max(0, Math.round(s.start * fps) - (i ? OV : 0)), end = Math.round((s.start + s.dur) * fps);
        if (frame < from - 1 || frame > end + 1) return null; // only mount shots that are on screen
        return <Sequence key={s.id} from={from} durationInFrames={end - from} layout="none"><Shot shot={s as any} fps={fps} /></Sequence>; })}
      <FilmFX frame={frame} />
      <ChapterCard time={time} /><TitleOverlay time={time} /><EndCard time={time} />
      <AbsoluteFill style={{ background: '#000', opacity: Math.max(fadeIn, fadeOut) }} />
    </AbsoluteFill>
  );
};
