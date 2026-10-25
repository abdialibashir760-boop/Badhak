import React from 'react';
import {clamp, rng, wob} from '../../lib/anim';
import {useFx} from '../../components/Stage';
import {SINK, Rock} from './Nature';

/** Deterministic flicker (0.7..1.2) shared by the fire and everything it lights. */
export const flicker = (frame: number, seed = 0) => 0.92 + 0.14 * wob(frame * 0.35, seed) + 0.06 * Math.sin(frame * 1.7 + seed);

export const Fire: React.FC<{x: number; y: number; s?: number; frame: number; intensity?: number; id?: string; glow?: boolean}> = ({x, y, s = 1, frame, intensity = 1, id = 'fire', glow = true}) => {
  const {effects} = useFx();
  const f = flicker(frame) * intensity;
  const flame = (w: number, h: number, sway: number, c1: string, c2: string, k: number) => {
    const sx = Math.sin(frame * 0.27 + k * 2) * sway + Math.sin(frame * 0.51 + k) * sway * 0.5;
    const hh = h * (0.86 + 0.2 * Math.sin(frame * 0.4 + k * 3)) * intensity;
    return (
      <path
        d={`M ${-w},0 C ${-w * 1.1},${-hh * 0.35} ${-w * 0.4 + sx * 0.4},${-hh * 0.6} ${sx},${-hh} C ${w * 0.4 + sx * 0.4},${-hh * 0.55} ${w * 1.1},${-hh * 0.3} ${w},0 Z`}
        fill={`url(#${id}-${c1}${c2})`}
      />
    );
  };
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <linearGradient id={`${id}-ro`} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#f6c043" />
          <stop offset="0.5" stopColor="#ee7d2b" />
          <stop offset="1" stopColor="#c43d1f" />
        </linearGradient>
        <linearGradient id={`${id}-yw`} x1="0" x2="0" y1="1" y2="0">
          <stop offset="0" stopColor="#fff2a8" />
          <stop offset="1" stopColor="#f8b73c" />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#ff9a3c" stopOpacity="0.55" />
          <stop offset="0.5" stopColor="#d1521f" stopOpacity="0.2" />
          <stop offset="1" stopColor="#d1521f" stopOpacity="0" />
        </radialGradient>
      </defs>
      {glow && effects ? <ellipse cx={0} cy={-60} rx={520 * f} ry={380 * f} fill={`url(#${id}-glow)`} /> : null}
      {/* stones + logs */}
      <g>
        {[-62, -34, 0, 34, 62].map((dx, i) => (
          <ellipse key={i} cx={dx} cy={6 + Math.abs(dx) * 0.04} rx={20} ry={13} fill={i % 2 ? '#6a655d' : '#57534c'} stroke={SINK} strokeWidth={3} />
        ))}
        <path d="M -60,-4 L 52,-22 L 56,-12 L -54,6 Z" fill="#3b2a1d" stroke={SINK} strokeWidth={3} />
        <path d="M 58,-4 L -50,-24 L -54,-14 L 54,6 Z" fill="#46321f" stroke={SINK} strokeWidth={3} />
      </g>
      {flame(52, 150, 12, 'r', 'o', 1)}
      {flame(36, 112, 10, 'y', 'w', 2)}
      {flame(18, 70, 7, 'y', 'w', 3)}
      <circle cx={0} cy={-18} r={4} fill="#fff6c8" opacity={0.0} />
      {effects
        ? Array.from({length: 16}, (_, i) => {
            const r = rng(i * 31 + 5);
            const life = 70 + r() * 60;
            const t = ((frame + r() * life) % life) / life;
            const x0 = (r() - 0.5) * 50;
            return <circle key={i} cx={x0 + Math.sin(t * 9 + i) * 26 * t + (r() - 0.3) * 30 * t} cy={-30 - t * (260 + r() * 140)} r={2.4 * (1 - t) + 0.6} fill={t < 0.4 ? '#ffd36a' : '#ff8a3a'} opacity={(1 - t) * 0.95} />;
          })
        : null}
    </g>
  );
};

/** Red ochre hand stencil: palm, fingers and thumb with a sprayed halo. */
export const HandStencil: React.FC<{x: number; y: number; s?: number; rot?: number; opacity?: number; color?: string}> = ({x, y, s = 1, rot = 0, opacity = 0.85, color = '#a8452a'}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    <circle r={58} fill={color} opacity={0.14} />
    <circle r={42} fill={color} opacity={0.12} />
    <path
      d="M -22,34 Q -30,10 -28,-10 L -34,-34 Q -34,-44 -27,-40 L -20,-14 L -16,-52 Q -14,-60 -8,-55 L -4,-16 L 2,-58 Q 5,-65 10,-58 L 12,-16 L 20,-50 Q 24,-56 28,-49 L 24,-8 L 38,-22 Q 46,-24 44,-14 L 30,12 Q 26,30 20,36 Z"
      fill={color}
    />
  </g>
);

/** A simple bison/horse-like cave painting in charcoal strokes. */
export const CavePainting: React.FC<{x: number; y: number; s?: number; kind?: 'bison' | 'horse'; opacity?: number}> = ({x, y, s = 1, kind = 'bison', opacity = 0.85}) => (
  <g transform={`translate(${x},${y}) scale(${s})`} opacity={opacity} fill="none" stroke="#17100d" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
    {kind === 'bison' ? (
      <>
        <path d="M -90,10 C -92,-30 -50,-46 -10,-38 C 20,-60 60,-42 80,-18 C 96,-10 98,14 84,30 L 84,62 M 60,30 L 60,64 M -60,30 L -64,64 M -80,26 L -84,60" />
        <path d="M 82,-14 C 98,-30 112,-24 108,-8 M 100,-18 l 10,-14" />
        <path d="M -90,10 C -100,20 -102,40 -96,52" />
      </>
    ) : (
      <>
        <path d="M -80,6 C -70,-24 -30,-30 10,-22 C 40,-30 70,-46 92,-34 C 100,-26 94,-18 84,-14 C 70,-6 62,4 50,10 L 52,56 M 20,18 L 22,58 M -56,12 L -60,52 M -76,10 L -84,48" />
        <path d="M 92,-34 l 6,-22 l 10,12 M 70,-40 q -10,-18 -22,-8 M -80,6 q -22,10 -26,36" />
      </>
    )}
  </g>
);

export const CaveMouth: React.FC<{x: number; y: number; s?: number; glow?: number; frame?: number; lw?: number; rock?: string; rockDark?: string}> = ({
  x,
  y,
  s = 1,
  glow = 0,
  frame = 0,
  lw = 4,
  rock = '#6b6761',
  rockDark = '#47433e',
}) => {
  const f = flicker(frame);
  return (
    <g transform={`translate(${x},${y}) scale(${s})`}>
      <defs>
        <radialGradient id={`cave-in-${Math.round(x)}`} cx="0.5" cy="0.85" r="0.7">
          <stop offset="0" stopColor="#7a3a1c" stopOpacity={0.9 * glow * f} />
          <stop offset="0.55" stopColor="#1a0f0a" />
          <stop offset="1" stopColor="#060403" />
        </radialGradient>
      </defs>
      {/* rock mass */}
      <path d="M -520,0 L -470,-210 L -380,-330 L -250,-440 L -90,-520 L 90,-540 L 250,-500 L 380,-400 L 470,-250 L 540,-80 L 560,0 Z" fill={rock} stroke={SINK} strokeWidth={lw} strokeLinejoin="round" />
      <path d="M -380,-330 L -300,-200 L -330,-60 M -90,-520 L -120,-380 L -90,-300 M 250,-500 L 300,-340 L 400,-250 M 90,-540 L 160,-420" fill="none" stroke={SINK} strokeWidth={lw * 0.7} strokeLinecap="round" opacity={0.75} />
      <path d="M -250,-440 L -150,-330 M 380,-400 L 300,-300 M -470,-210 L -380,-150" fill="none" stroke={rockDark} strokeWidth={14} strokeLinecap="round" opacity={0.55} />
      {/* mouth */}
      <path d="M -190,0 C -200,-120 -150,-240 0,-262 C 150,-240 200,-120 190,0 Z" fill={`url(#cave-in-${Math.round(x)})`} stroke={SINK} strokeWidth={lw + 1} strokeLinejoin="round" />
      <HandStencil x={-80} y={-130} s={0.55} rot={-10} opacity={0.5 * clamp(0.35 + glow)} />
      <HandStencil x={60} y={-170} s={0.5} rot={12} opacity={0.45 * clamp(0.35 + glow)} />
      {/* lintel shadow */}
      <path d="M -190,0 C -200,-120 -150,-240 0,-262" fill="none" stroke="#000" strokeWidth={16} opacity={0.35} />
    </g>
  );
};

/** Interior cave wall for the night scene: stone, ochre hand stencils and charcoal animals lit by the fire. */
export const CaveWall: React.FC<{frame: number; fireX: number; fireY: number; x0?: number; x1?: number; y0?: number; y1?: number}> = ({frame, fireX, fireY, x0 = -300, x1 = 2300, y0 = -100, y1 = 900}) => {
  const f = flicker(frame);
  const r = rng(77);
  return (
    <g>
      <defs>
        <radialGradient id="wall-light" gradientUnits="userSpaceOnUse" cx={fireX} cy={fireY - 140} r={900 * f}>
          <stop offset="0" stopColor="#c46a2d" stopOpacity="0.95" />
          <stop offset="0.35" stopColor="#6a3519" stopOpacity="0.75" />
          <stop offset="1" stopColor="#0a0605" stopOpacity="0.96" />
        </radialGradient>
      </defs>
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="#2c2420" />
      {Array.from({length: 40}, (_, i) => {
        const x = x0 + r() * (x1 - x0);
        const y = y0 + r() * (y1 - y0);
        return <path key={i} d={`M ${x},${y} q ${40 + r() * 80},${-20 + r() * 40} ${80 + r() * 120},${r() * 30 - 15}`} stroke="#120d0a" strokeWidth={3 + r() * 5} fill="none" opacity={0.5} strokeLinecap="round" />;
      })}
      <CavePainting x={560} y={300} s={1.5} kind="bison" opacity={0.75} />
      <CavePainting x={1330} y={250} s={1.3} kind="horse" opacity={0.7} />
      {[
        [300, 230, -8, 1],
        [380, 330, 10, 0.8],
        [900, 160, 4, 1.1],
        [1000, 230, -12, 0.9],
        [1700, 330, 8, 1],
        [1820, 240, -6, 0.85],
      ].map(([x, y, rot, s], i) => (
        <HandStencil key={i} x={x} y={y} s={s} rot={rot} opacity={0.8} />
      ))}
      <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} fill="url(#wall-light)" />
    </g>
  );
};

/* ---------------------------------------------------------------- props */

export const FlintBlade: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -34,6 Q 0,-14 34,0 Q 0,10 -34,6 Z" fill="#57606a" stroke={SINK} strokeWidth={3} strokeLinejoin="round" />
    <path d="M -20,4 Q 0,-4 24,0" stroke="#aeb8c2" strokeWidth={2} fill="none" opacity={0.7} />
  </g>
);

/** Wooden spear with a knapped stone point; drawn along +x from the grip. */
export const Spear: React.FC<{x: number; y: number; rot?: number; len?: number}> = ({x, y, rot = -80, len = 340}) => (
  <g transform={`translate(${x},${y}) rotate(${rot})`}>
    <line x1={-len * 0.3} y1={0} x2={len} y2={0} stroke="#6b4a2d" strokeWidth={8} strokeLinecap="round" />
    <line x1={-len * 0.3} y1={0} x2={len} y2={0} stroke={SINK} strokeWidth={11} strokeLinecap="round" opacity={0.35} />
    <path d={`M ${len - 6},-11 L ${len + 52},0 L ${len - 6},11 Z`} fill="#8b8f93" stroke={SINK} strokeWidth={3} strokeLinejoin="round" />
    <path d={`M ${len + 4},0 l 36,0`} stroke="#d0d5d8" strokeWidth={1.8} opacity={0.6} />
    <path d={`M ${len - 22},-5 l 0,10 M ${len - 30},-5 l 0,10`} stroke="#d5b277" strokeWidth={3} />
  </g>
);

export const HideBag: React.FC<{x: number; y: number; s?: number; rot?: number}> = ({x, y, s = 1, rot = 0}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`}>
    <path d="M -30,-10 C -44,20 -30,48 0,50 C 30,48 44,20 30,-10 Q 0,-22 -30,-10 Z" fill="#8a6a48" stroke={SINK} strokeWidth={3.5} strokeLinejoin="round" />
    <path d="M -28,-8 Q 0,-26 28,-8" fill="none" stroke="#3f2d1d" strokeWidth={4} strokeLinecap="round" />
    <path d="M -10,-14 l 0,-18 M 10,-14 l 0,-18" stroke="#3f2d1d" strokeWidth={3} strokeLinecap="round" />
    <path d="M -18,8 l 8,6 M 8,16 l 8,-6 M -4,28 l 7,5" stroke="#4e3825" strokeWidth={2.2} strokeLinecap="round" opacity={0.7} />
  </g>
);

/** A drying/roasting rack: two forked posts, a cross pole and strips of meat or hides. */
export const MeatRack: React.FC<{x: number; y: number; s?: number; frame?: number}> = ({x, y, s = 1, frame = 0}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -110,0 L -104,-190 M -118,-150 L -104,-190 L -92,-150 M 110,0 L 104,-190 M 98,-150 L 104,-190 L 118,-150" stroke="#5a3e27" strokeWidth={9} fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M -112,-186 L 112,-186" stroke="#6b4a2d" strokeWidth={9} strokeLinecap="round" />
    {[-70, -20, 38, 80].map((dx, i) => (
      <path key={i} transform={`rotate(${Math.sin(frame * 0.05 + i) * 2} ${dx} -186)`} d={`M ${dx - 11},-184 q -6,50 2,92 q 10,18 20,0 q 8,-40 -2,-92 Z`} fill={i % 2 ? '#9a4a36' : '#b0573d'} stroke={SINK} strokeWidth={3} strokeLinejoin="round" />
    ))}
  </g>
);

/** Hide lean-to shelter (reconstruction: poles + stitched hides). */
export const LeanTo: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x},${y}) scale(${s})`}>
    <path d="M -170,0 L -110,-230 L 0,-262 L 150,0 Z" fill="#7f5f40" stroke={SINK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -110,-230 L -60,0 M 0,-262 L 40,0 M -150,-120 L 100,-150 M -165,-30 L 130,-40" stroke="#3f2d1d" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.8} />
    <path d="M -110,-230 L -170,0 M 0,-262 L -120,10" stroke="#5a3e27" strokeWidth={9} strokeLinecap="round" />
    <path d="M -80,-120 l 10,6 l -4,8 M 20,-170 l 10,6 l -4,8 M 60,-60 l 10,6 l -4,8" stroke="#d9c7a0" strokeWidth={2.4} fill="none" opacity={0.6} strokeLinecap="round" />
  </g>
);

/** Animal tracks pressed into soft ground (wolf, hoofed animal, mammoth). */
export const Tracks: React.FC<{x: number; y: number; kind: 'wolf' | 'hoof' | 'mammoth'; s?: number; rot?: number; count?: number; opacity?: number}> = ({x, y, kind, s = 1, rot = 0, count = 4, opacity = 1}) => (
  <g transform={`translate(${x},${y}) rotate(${rot}) scale(${s})`} opacity={opacity}>
    {Array.from({length: count}, (_, i) => {
      const px = i * 110 * (kind === 'mammoth' ? 2 : 1);
      const py = (i % 2 ? 1 : -1) * 18;
      return (
        <g key={i} transform={`translate(${px},${py})`}>
          {kind === 'wolf' ? (
            <g fill="#241a14" stroke="#0d0907" strokeWidth={1.5}>
              <ellipse cx={0} cy={6} rx={13} ry={11} />
              {[-16, -6, 6, 16].map((dx, j) => (
                <ellipse key={j} cx={dx} cy={-10 - (j === 1 || j === 2 ? 5 : 0)} rx={4.5} ry={6.5} />
              ))}
            </g>
          ) : kind === 'hoof' ? (
            <g fill="#241a14">
              <path d="M -4,-14 Q -14,0 -8,14 Q 0,12 0,0 Z" />
              <path d="M 4,-14 Q 14,0 8,14 Q 0,12 0,0 Z" />
            </g>
          ) : (
            <g fill="#2a1f18" stroke="#0d0907" strokeWidth={2}>
              <ellipse cx={0} cy={0} rx={52} ry={42} />
              {[-30, -10, 10, 30].map((dx, j) => (
                <ellipse key={j} cx={dx} cy={-42} rx={7} ry={9} />
              ))}
            </g>
          )}
        </g>
      );
    })}
  </g>
);

export const RockCluster: React.FC<{x: number; y: number; s?: number; seed?: number; tone?: string}> = ({x, y, s = 1, seed = 1, tone}) => (
  <g>
    <Rock x={x} y={y} s={s} seed={seed} tone={tone} />
    <Rock x={x + 90 * s} y={y + 8} s={s * 0.6} seed={seed + 3} tone={tone} />
    <Rock x={x - 80 * s} y={y + 6} s={s * 0.5} seed={seed + 7} tone={tone} />
  </g>
);
