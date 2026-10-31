import React from "react";
import { Composition } from "remotion";
import { SpeedCamera, timingFor } from "./SpeedCamera";
import { FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="SpeedCameraEN"
      component={SpeedCamera}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={Math.ceil(timingFor("en").duration * FPS)}
      defaultProps={{ lang: "en" as const }}
    />
    <Composition
      id="SpeedCameraTR"
      component={SpeedCamera}
      width={W}
      height={H}
      fps={FPS}
      durationInFrames={Math.ceil(timingFor("tr").duration * FPS)}
      defaultProps={{ lang: "tr" as const }}
    />
  </>
);
