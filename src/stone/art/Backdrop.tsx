import React from 'react';
import {clamp, rng} from '../../lib/anim';
import {Parallax} from '../../components/Stage';
import {Birds, Fog, Leaves, Birch, SkyBox, TreeLine, skyAt, toneAt, Terrain, SINK, mix} from './Nature';

export const GROUND_Y = 820;

/** Light/colour context derived from the time of day. */
export const useLook = (tod: number) => {
  const s = skyAt(tod);
  const warm = clamp(1 - Math.abs(tod - 0.04) / 0.1) * 0.9 + clamp(1 - Math.abs(tod - 0.88) / 0.1);
  return {...s, warm};
};

/** Layered prehistoric forest/steppe backdrop with parallax. Figures are drawn between Backdrop and Foreground. */
export const Backdrop: React.FC<{
  frame: number;
  tod: number;
  seed?: number;
  /** Gap in the tree lines (world x ranges) where something important stands. */
  clearing?: [number, number];
  fog?: number;
  birds?: boolean;
  leaves?: boolean;
  giant?: boolean;
  sunX?: number;
  snow?: number;
}> = ({frame, tod, seed = 1, clearing, fog = 1, birds = true, leaves = false, giant = true, sunX, snow = 6}) => {
  const L = useLook(tod);
  const skip: [number, number][] = clearing ? [clearing] : [];
  const far = toneAt('far', L.night, L.warm);
  const mid = toneAt('mid', L.night, L.warm);
  const near = toneAt('near', L.night, L.warm);
  const hill = (c: string, y: number, amp: number, sd: number, depthShade = 0) => {
    const r = rng(sd);
    const pts = Array.from({length: 14}, (_, i) => `L ${-600 + i * 330},${y - r() * amp}`).join(' ');
    return <path d={`M -600,1100 ${pts} L 4000,1100 Z`} fill={mix(c, '#070a10', L.night * 0.8 + depthShade)} stroke={SINK} strokeWidth={2.5} opacity={0.95} />;
  };
  return (
    <g>
      <Parallax depth={0.04}>
        <SkyBox tod={tod} frame={frame} horizonY={640} sunX={sunX ?? 1400} />
      </Parallax>
      <Parallax depth={0.14}>{hill(mix('#7f9a9c', L.hor, 0.35), 700, 120, seed + 1)}</Parallax>
      <Parallax depth={0.2}>
        <Fog frame={frame} y={690} opacity={0.5 * fog} id={`fogA${seed}`} color={mix('#cdd9d6', L.hor, 0.4)} seed={seed} speed={0.22} h={110} />
      </Parallax>
      <Parallax depth={0.28}>{hill(mix('#5f7b7c', L.hor, 0.2), 760, 90, seed + 2, 0.05)}</Parallax>
      <Parallax depth={0.36}>
        <TreeLine x0={-700} x1={3400} base={760} count={26} hMin={220} hMax={330} seed={seed + 3} tone={far} night={L.night} lw={2.4} />
      </Parallax>
      <Parallax depth={0.42}>
        <Fog frame={frame} y={740} opacity={0.42 * fog} id={`fogB${seed}`} color={mix('#c3d0cd', L.hor, 0.3)} seed={seed + 1} speed={0.4} h={120} />
      </Parallax>
      <Parallax depth={0.62}>
        <TreeLine x0={-900} x1={3600} base={810} count={18} hMin={420} hMax={620} seed={seed + 4} tone={mid} night={L.night} skip={skip} lw={3} />
      </Parallax>
      <Parallax depth={0.8}>
        <Fog frame={frame} y={800} opacity={0.34 * fog} id={`fogC${seed}`} color={mix('#bccac7', L.hor, 0.25)} seed={seed + 2} speed={0.6} h={90} />
      </Parallax>
      {giant ? (
        <Parallax depth={0.9}>
          <TreeLine x0={-1000} x1={3800} base={GROUND_Y + 6} count={5} hMin={800} hMax={1050} seed={seed + 5} tone={near} night={L.night} skip={skip} birchRatio={0.1} lw={4} />
        </Parallax>
      ) : null}
      <Terrain x0={-1400} x1={4200} y={GROUND_Y} top={mix('#4b5340', '#2a2e1f', 0.2 + L.night * 0.4)} deep={mix('#232820', '#07080a', L.night * 0.8)} seed={seed + 6} tufts={80} tuftColor={mix('#7a8a58', '#16200f', L.night * 0.8)} snow={snow} />
      {birds ? (
        <Parallax depth={0.3}>
          <Birds frame={frame} seed={seed} y={200} color={mix('#1b2227', '#000', L.night)} />
        </Parallax>
      ) : null}
      {leaves ? <Leaves frame={frame} seed={seed} color={mix('#c9a63e', '#2a2a1a', L.night)} /> : null}
    </g>
  );
};

/** Dark foreground trunks, grass and drifting leaves that slide faster than the action (depth > 1). */
export const Foreground: React.FC<{frame: number; tod: number; seed?: number; trunks?: number[]; grass?: boolean}> = ({frame, tod, seed = 1, trunks = [-260, 2160], grass = true}) => {
  const L = useLook(tod);
  const near = toneAt('near', L.night, L.warm);
  const r = rng(seed + 90);
  return (
    <Parallax depth={1.35}>
      {trunks.map((x, i) => (
        <g key={i}>
          <path d={`M ${x - 90},1400 L ${x - 60},-200 L ${x + 60},-200 L ${x + 100},1400 Z`} fill={near.trunk} stroke={SINK} strokeWidth={5} strokeLinejoin="round" />
          <path d={`M ${x - 30},1000 q -10,-300 6,-700 M ${x + 30},1100 q 14,-400 -4,-900 M ${x + 6},300 q 10,-200 0,-420`} stroke={SINK} strokeWidth={4} fill="none" opacity={0.6} />
        </g>
      ))}
      {grass
        ? Array.from({length: 18}, (_, i) => {
            const x = -300 + r() * 2700;
            const h = 60 + r() * 90;
            const sw = Math.sin(frame * 0.05 + i) * 10;
            const c = mix('#3a4a2a', '#070a06', L.night * 0.85);
            return (
              <g key={i}>
                {[-14, 0, 14].map((o, j) => (
                  <path key={j} d={`M ${x + o - 7},1130 Q ${x + o + sw * 0.5},${1130 - h * (0.55 + j * 0.1)} ${x + o * 1.6 + sw},${1130 - h * (0.9 + (j % 2) * 0.25)} Q ${x + o + sw * 0.4 + 5},${1130 - h * 0.5} ${x + o + 7},1130 Z`} fill={c} stroke={SINK} strokeWidth={2.2} />
                ))}
              </g>
            );
          })
        : null}
    </Parallax>
  );
};

export { Birch };
