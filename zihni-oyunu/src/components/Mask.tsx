import React from "react";
import { C } from "../theme";
import { SmilingMask } from "./Stickman";

/** A free-standing mask (on the floor, in a mirror, floating). */
export const Mask: React.FC<{ x: number; y: number; r?: number; rot?: number; opacity?: number; mood?: "smile" | "blank" | "sad"; color?: string }> = ({ x, y, r = 40, rot = 0, opacity = 1, mood = "smile", color = C.ink }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={opacity}>
    <SmilingMask r={r} mood={mood} color={color} />
  </g>
);
