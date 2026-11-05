import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { cameraAt } from "./camera";
import { SATS } from "./orbit";
import { smoothstep } from "./math3d";
import { Earth } from "./draw/Earth";
import { Hud } from "./draw/Hud";
import { Marker } from "./draw/Marker";
import { PhoneBase } from "./draw/Phone";
import { Signals } from "./draw/Signals";
import { Orbits, Satellite, satDepthOrder } from "./draw/Satellites";
import { Space, SpaceDefs } from "./draw/Space";
import { FPS, HEIGHT, WIDTH } from "./timing";

export const GpsExplainer: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const { cam, D, zoom } = cameraAt(t);

  const orbitFade = 1 - smoothstep(5.0, 5.8, t);
  const satOpacity = 1 - smoothstep(5.3, 6.1, t);
  const labelOpacity = smoothstep(0.4, 0.9, t) * (1 - smoothstep(4.5, 5.1, t));

  return (
    <AbsoluteFill style={{ background: "#02040b", fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif" }}>
      <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} style={{ position: "absolute", inset: 0 }}>
        <SpaceDefs />
        <Space zoom={zoom} frame={frame} />
        <Earth cam={cam} D={D} />
        <Orbits cam={cam} t={t} fade={orbitFade} />
        <PhoneBase cam={cam} t={t} D={D} />
        <Signals cam={cam} t={t} />
        <Marker cam={cam} t={t} />
        {satDepthOrder(cam, t).map((s) => (
          <Satellite key={s.id} sat={SATS[s.id]} cam={cam} t={t} opacity={satOpacity} label={labelOpacity} />
        ))}
      </svg>
      <Hud cam={cam} t={t} />
    </AbsoluteFill>
  );
};
