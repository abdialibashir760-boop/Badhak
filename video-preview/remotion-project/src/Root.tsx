import React from "react";
import { Composition } from "remotion";
import { CaseFile } from "./Composition";
import { Daydream, DD_FPS, DD_FRAMES, DD_H, DD_W } from "./Daydream";
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
    </>
  );
};
