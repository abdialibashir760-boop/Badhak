import React from "react";
import { C } from "./theme";

const glow = (id: string, color: string) => (
  <radialGradient id={id}>
    <stop offset="0%" stopColor={color} stopOpacity="1" />
    <stop offset="35%" stopColor={color} stopOpacity="0.45" />
    <stop offset="100%" stopColor={color} stopOpacity="0" />
  </radialGradient>
);

/** Shared gradients used across scenes. */
export const Defs: React.FC = () => (
  <defs>
    {glow("glowTeal", C.teal)}
    {glow("glowCyan", C.cyan)}
    {glow("glowGold", C.gold)}
    {glow("glowMint", C.mint)}
    {glow("glowRed", C.red)}
    <radialGradient id="glowWhite">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
      <stop offset="25%" stopColor="#bffcf0" stopOpacity="0.7" />
      <stop offset="100%" stopColor={C.teal} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="bgGrad" cx="50%" cy="46%" r="75%">
      <stop offset="0%" stopColor="#10294a" />
      <stop offset="55%" stopColor="#081426" />
      <stop offset="100%" stopColor={C.bg0} />
    </radialGradient>
    <linearGradient id="vigBottom" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor={C.bg0} stopOpacity="0" />
      <stop offset="100%" stopColor={C.bg0} stopOpacity="0.92" />
    </linearGradient>
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="60%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.55" />
    </radialGradient>
    <linearGradient id="tealBtn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stopColor={C.teal} />
      <stop offset="100%" stopColor={C.cyan} />
    </linearGradient>
  </defs>
);
