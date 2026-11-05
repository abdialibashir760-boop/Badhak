import React from 'react';
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from 'remotion';
import { H, W, F, screenOf, toView, cameraAt, makeView } from './camera';
import { BodyDefs, Earth, Moon } from './Bodies';
import {
  Batch, GRID_STYLES, LINE_STYLES, buildGrid, buildOrbit, buildTrail, buildWave, type StyleDef,
} from './grid';
import { Overlay } from './Overlay';
import { EARTH_R, MASS_START, MOON_R, WAVE_SPEED, clamp01, moonBary, sceneAt, smooth } from './physics';

const BG = '#04070f';
const FONT = `'Helvetica Neue', 'Liberation Sans', Arial, sans-serif`;

const STARS = Array.from({ length: 170 }, (_, i) => ({
  x: random(`sx${i}`) * (W + 200) - 100,
  y: random(`sy${i}`) * H,
  r: 0.6 + random(`sr${i}`) * 1.3,
  base: 0.25 + random(`sb${i}`) * 0.6,
  speed: 0.6 + random(`ss${i}`) * 1.8,
  phase: random(`sp${i}`) * 6.28,
  depth: 0.3 + random(`sd${i}`) * 0.7,
}));

type Body = { id: 'earth' | 'moon'; depth: number; sx: number; sy: number; r: number };

export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const s = sceneAt(t);
  const cam = cameraAt(t);
  const view = makeView(cam);

  // ---- bodies in view space ----
  const eV = toView(view, s.earth.x, s.earthY, s.earth.z);
  const mV = toView(view, s.moon.x, s.moonY, s.moon.z);
  const eS = screenOf(eV);
  const mS = screenOf(mV);
  const bodies: Body[] = [{ id: 'earth', depth: eV[2], sx: eS.x, sy: eS.y, r: (F * EARTH_R) / eV[2] }];
  if (s.moonAmp > 0.02) bodies.push({ id: 'moon', depth: mV[2], sx: mS.x, sy: mS.y, r: (F * MOON_R) / mV[2] });
  const sorted = [...bodies].sort((a, b) => b.depth - a.depth); // farthest first
  const layerOf = (depth: number) => sorted.filter((b) => b.depth > depth).length;

  // ---- geometry ----
  const batch = new Batch();
  buildGrid(batch, view, s, layerOf);
  const orbitOpacity = 0.4 * smooth(t, 5.6, 6.6);
  if (orbitOpacity > 0.01) buildOrbit(batch, view, s, layerOf);
  buildTrail(batch, view, s, layerOf, moonBary);
  const waveR = WAVE_SPEED * (t - MASS_START);
  const waveOpacity = waveR > 0.5 && waveR < 46 ? 0.6 * (1 - waveR / 46) * clamp01(waveR / 3) : 0;
  if (waveOpacity > 0.01) buildWave(batch, view, s, layerOf, waveR);

  const styles: Record<string, StyleDef> = { ...GRID_STYLES, ...LINE_STYLES(t, waveOpacity, orbitOpacity) };

  const spin = t * 0.9;
  const parallax = cam.yaw * 140;

  return (
    <AbsoluteFill style={{ background: BG, fontFamily: FONT }}>
      {/* deep-space backdrop */}
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse at 30% 20%, rgba(40,70,140,.22), transparent 55%), radial-gradient(ellipse at 80% 85%, rgba(90,50,140,.16), transparent 50%)',
        }}
      />
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        {STARS.map((st, i) => (
          <circle
            key={i}
            cx={st.x - parallax * st.depth}
            cy={st.y}
            r={st.r}
            fill="#dbe8ff"
            opacity={st.base * (0.7 + 0.3 * Math.sin(t * st.speed + st.phase))}
          />
        ))}
      </svg>

      {/* warm glow pooling in the well as Earth's curvature switches on */}
      <div
        style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at ${eS.x}px ${eS.y}px, rgba(255,160,80,${0.2 * Math.min(1, s.earthMass)}), transparent ${(eS.depth > 0 ? (F * 7) / eS.depth : 300)}px)`,
        }}
      />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: 'absolute' }}>
        <BodyDefs />
        {Array.from({ length: sorted.length + 1 }, (_, k) => (
          <g key={k}>
            {batch.paths(k, styles)}
            {k < sorted.length && renderBody(sorted[k], spin)}
          </g>
        ))}
      </svg>

      {/* horizon haze for the pulled-back view */}
      <AbsoluteFill style={{ background: `linear-gradient(to bottom, ${BG} 0%, rgba(4,7,15,0) 22%)`, opacity: smooth(t, 8, 10) }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,.55) 100%)' }} />

      {/* labels */}
      <Label text="Earth" x={eS.x} y={eS.y + (F * EARTH_R) / eV[2] + 20} opacity={smooth(t, 4.2, 4.8)} />
      <Label text="Moon" x={mS.x + (F * MOON_R) / mV[2] + 16} y={mS.y - 16} align="left" opacity={s.moonAmp > 0.02 ? smooth(t, 5.6, 6.2) : 0} />

      <Overlay t={t} />
    </AbsoluteFill>
  );
};

function renderBody(b: Body, spin: number) {
  return (
    <g key={b.id}>
      {b.id === 'earth' ? <Earth cx={b.sx} cy={b.sy} r={b.r} spin={spin} /> : <Moon cx={b.sx} cy={b.sy} r={b.r} />}
    </g>
  );
}

const Label: React.FC<{ text: string; x: number; y: number; opacity: number; align?: 'left' }> = ({ text, x, y, opacity, align }) => (
  <div
    style={{
      position: 'absolute', left: x, top: y, transform: align === 'left' ? 'none' : 'translateX(-50%)', color: '#dbe8ff', fontSize: 26, fontWeight: 600,
      letterSpacing: 2, opacity, textShadow: '0 2px 10px rgba(0,0,0,.8)',
    }}
  >
    {text}
  </div>
);
