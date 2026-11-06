import React from "react";
import { S01, S02, S03, S47 } from "./scenes/hook";
import { S04, S05, S06, S07, S08, S09, S10, S12, S17, S48, S49, S50, S51, S52, S53, S54 } from "./scenes/globe";
import { S11, S13, S14, S15, S16, S18, S19, S20, S21, S22 } from "./scenes/diagrams1";
import { S23, S24, S25, S32, S34, S36, S42, S43, S44, S45, S46 } from "./scenes/diagrams2";
import { S26, S27, S28, S29, S30, S31, S33, S35 } from "./scenes/trilat";
import { S37, S38, S39, S40, S41 } from "./scenes/city";
import { useShot } from "./components/context";
import { SpaceDefs, Space } from "./components/Space";
import { HEIGHT, WIDTH, SHOTS } from "./timeline";

const Placeholder: React.FC<{ id: string }> = ({ id }) => {
  const { frame } = useShot();
  const s = SHOTS.find((x) => x.id === id)!;
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0 }}>
      <SpaceDefs />
      <Space zoom={0} frame={frame} />
      <text x={960} y={520} textAnchor="middle" fill="#6fd6ff" fontSize={64} fontFamily="Inter, sans-serif" fontWeight={700}>{id}</text>
      <text x={960} y={590} textAnchor="middle" fill="#cfe3ff" fontSize={32} fontFamily="Inter, sans-serif">{s.name}</text>
    </svg>
  );
};

const real: Record<string, React.FC> = { s01: S01, s02: S02, s03: S03, s47: S47, s04: S04, s05: S05, s06: S06, s07: S07, s08: S08, s09: S09, s10: S10, s12: S12, s17: S17, s48: S48, s49: S49, s50: S50, s51: S51, s52: S52, s53: S53, s54: S54, s37: S37, s38: S38, s39: S39, s40: S40, s41: S41, s26: S26, s27: S27, s28: S28, s29: S29, s30: S30, s31: S31, s33: S33, s35: S35, s11: S11, s13: S13, s14: S14, s15: S15, s16: S16, s18: S18, s19: S19, s20: S20, s21: S21, s22: S22, s23: S23, s24: S24, s25: S25, s32: S32, s34: S34, s36: S36, s42: S42, s43: S43, s44: S44, s45: S45, s46: S46 };

export const SHOT_COMPONENTS: Record<string, React.FC> = Object.fromEntries(
  SHOTS.map((s) => [s.id, real[s.id] ?? (() => <Placeholder id={s.id} />)]),
);
