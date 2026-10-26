import React from "react";
import { Composition } from "remotion";
import { Main } from "./Main";
import { FPS, H, W } from "./geo";
import { TOTAL_SECONDS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <Composition id="SanJose" component={Main} durationInFrames={Math.ceil(TOTAL_SECONDS * FPS)} fps={FPS} width={W} height={H} />
);
