import React from "react";
import { Composition } from "remotion";
import { CaseFile } from "./Composition";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./script";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="CaseFile07"
      component={CaseFile}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
