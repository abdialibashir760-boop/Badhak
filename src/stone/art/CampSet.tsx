import React from 'react';
import {Parallax} from '../../components/Stage';
import {CaveMouth, Fire, LeanTo, MeatRack, RockCluster} from './Camp';
import {Smoke} from './Far';
import {GROUND_Y} from './Backdrop';
import {SINK} from './Nature';

export const CAMP = {caveX: 1950, fireX: 1330, rackX: 1620, leanX: 700};

/** Shared camp dressing: rock shelter, hearth, drying rack. Layered so figures can stand in front of the hearth. */
export const CampBack: React.FC<{frame: number; tod: number; glow?: number; rack?: boolean; lean?: number; seed?: number}> = ({frame, glow = 0.6, rack = true, lean = 0}) => (
  <g>
    <CaveMouth x={CAMP.caveX} y={GROUND_Y + 14} s={1.0} glow={glow} frame={frame} />
    <Parallax depth={1}>
      <Smoke x={CAMP.fireX} y={GROUND_Y - 200} frame={frame} h={520} opacity={0.35} />
    </Parallax>
    {lean > 0 ? (
      <g opacity={Math.min(1, lean * 2)} transform={`translate(${CAMP.leanX},${GROUND_Y + 20}) scale(${0.4 + 0.6 * lean},${0.2 + 0.8 * lean}) translate(${-CAMP.leanX},${-(GROUND_Y + 20)})`}>
        <LeanTo x={CAMP.leanX} y={GROUND_Y + 20} s={1.15} />
      </g>
    ) : null}
    {rack ? <MeatRack x={CAMP.rackX} y={GROUND_Y + 28} s={1.05} frame={frame} /> : null}
    <RockCluster x={CAMP.leanX + 330} y={GROUND_Y + 40} s={0.8} seed={21} tone="#55514b" />
  </g>
);

export const CampFire: React.FC<{frame: number; intensity?: number; s?: number; id?: string}> = ({frame, intensity = 0.8, s = 0.85, id = 'campfire'}) => (
  <Fire x={CAMP.fireX} y={GROUND_Y + 28} s={s} frame={frame} intensity={intensity} id={id} />
);

/** Logs to sit on. */
export const Log: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 150}) => (
  <g>
    <path d={`M ${x - w / 2},${y - 18} L ${x + w / 2},${y - 18} Q ${x + w / 2 + 14},${y} ${x + w / 2},${y + 18} L ${x - w / 2},${y + 18} Q ${x - w / 2 - 14},${y} ${x - w / 2},${y - 18} Z`} fill="#4b3724" stroke={SINK} strokeWidth={3.5} />
    <ellipse cx={x + w / 2} cy={y} rx={9} ry={18} fill="#8b6b45" stroke={SINK} strokeWidth={3} />
    <path d={`M ${x - w * 0.3},${y - 8} l ${w * 0.3},2 M ${x - w * 0.2},${y + 8} l ${w * 0.4},-3`} stroke="#2e2014" strokeWidth={2.4} opacity={0.7} strokeLinecap="round" />
  </g>
);
