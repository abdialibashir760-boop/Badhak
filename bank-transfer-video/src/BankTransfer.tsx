import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Backdrop } from "./Backdrop";
import { Defs } from "./Defs";
import { Hud } from "./Hud";
import { Network } from "./Network";
import { PhoneScene } from "./PhoneScene";
import { Tunnel } from "./Tunnel";
import { C, H, T, W } from "./theme";
import { bell } from "./math";

/**
 * How money moves between banks — 10s, 1920×1080, 30fps.
 *  0–2s   person presses SEND
 *  2–5s   camera dives into the phone / digital transaction
 *  5–8s   glowing money crosses the banking network
 *  8–10s  receiving balance updates
 */
export const BankTransfer: React.FC = () => {
  const f = useCurrentFrame();
  const flash = bell(f, T.burst, 4);
  return (
    <AbsoluteFill style={{ background: C.bg0 }}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Defs />
        <Backdrop />
        <PhoneScene />
        <Tunnel />
        <Network />
        <rect width={W} height={H} fill="url(#glowWhite)" opacity={flash * 0.55} />
        <Hud />
      </svg>
    </AbsoluteFill>
  );
};
