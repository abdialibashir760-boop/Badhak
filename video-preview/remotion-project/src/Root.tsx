import React from "react";
import { Composition } from "remotion";
import { CaseFile } from "./Composition";
import { Daydream, DD_FPS, DD_FRAMES, DD_H, DD_W } from "./Daydream";
import { Story3D, ST_FPS, ST_FRAMES, ST_H, ST_W } from "./Story3D";
import { Wire3D, W3_FPS, W3_FRAMES, W3_H, W3_W } from "./Wire3D";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./script";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CaseFile07"
        component={CaseFile}
        durationInFrames={TOTAL_FRAMES}
        fps={FPS}
        width={WIDTH}
        height={HEIGHT}
      />
      <Composition
        id="Daydream"
        component={Daydream}
        durationInFrames={DD_FRAMES}
        fps={DD_FPS}
        width={DD_W}
        height={DD_H}
      />
      <Composition
        id="Wire3D"
        component={Wire3D}
        durationInFrames={W3_FRAMES}
        fps={W3_FPS}
        width={W3_W}
        height={W3_H}
      />
      <Composition
        id="Story3D"
        component={Story3D}
        durationInFrames={ST_FRAMES}
        fps={ST_FPS}
        width={ST_W}
        height={ST_H}
      />
    </>
  );
};
