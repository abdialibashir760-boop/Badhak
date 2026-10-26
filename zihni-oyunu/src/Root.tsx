import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./data/timing";
import { Video } from "./Video";

export const RemotionRoot: React.FC = () => (
  <Composition id="ZihniOyunu" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
