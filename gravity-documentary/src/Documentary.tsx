import React from 'react';
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { SHOTS } from './shots';
import { CAPTIONS, FPS } from './timeline';
import { AUDIO_FILE } from './generated/audio';
import { FONT, INK, clamp, seg } from './lib';

const OVERLAP = 0.45; // seconds each shot runs under the next, for cross-dissolves

const ShotWrap: React.FC<{ index: number }> = ({ index }) => {
  const frame = useCurrentFrame();
  const shot = SHOTS[index];
  const t = frame / FPS;
  const fadeIn = index === 0 ? 1 : clamp(seg(t, 0, OVERLAP));
  const { Component } = shot;
  return (
    <AbsoluteFill style={{ opacity: fadeIn }}>
      <Component t={t} dur={shot.dur} />
    </AbsoluteFill>
  );
};

const Captions: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const c = CAPTIONS.find((x) => t >= x.start - 0.05 && t < x.end + 0.15);
  if (!c) return null;
  const o = Math.min(clamp(seg(t, c.start - 0.05, c.start + 0.15)), 1 - clamp(seg(t, c.end - 0.05, c.end + 0.15)));
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 46, display: 'flex', justifyContent: 'center', opacity: o, pointerEvents: 'none' }}>
      <div style={{
        maxWidth: 1480, padding: '14px 34px 18px', borderRadius: 18, background: 'rgba(2,4,11,.72)', color: INK, fontFamily: FONT,
        fontSize: 40, lineHeight: 1.28, textAlign: 'center', fontWeight: 500, textShadow: '0 2px 10px rgba(0,0,0,.8)', border: '1px solid rgba(140,190,255,.16)',
      }}>
        {c.text}
      </div>
    </div>
  );
};

export const Documentary: React.FC = () => (
  <AbsoluteFill style={{ background: '#02040b' }}>
    {SHOTS.map((s, i) => (
      <Sequence key={s.id} from={Math.round(s.start * FPS)} durationInFrames={Math.round((s.dur + (i < SHOTS.length - 1 ? OVERLAP : 0)) * FPS)} layout="none">
        <AbsoluteFill>
          <ShotWrap index={i} />
        </AbsoluteFill>
      </Sequence>
    ))}
    <Captions />
    {AUDIO_FILE ? <Audio src={staticFile(AUDIO_FILE)} /> : null}
  </AbsoluteFill>
);
