import React from "react";
import { Composition } from "remotion";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./data/timing";
import { Video } from "./Video";
import { Thumbnail } from "./Thumbnail";

export const RemotionRoot: React.FC = () => (
  <>
  <Composition id="ZihniOyunu" component={Video} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
  <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={1920} height={1080}
    defaultProps={{ kicker: ["WHY YOU", "CAN’T SAY"], box: "NO", sub: "The prison of being liked" }} />
  <Composition id="ThumbnailTR" component={Thumbnail} durationInFrames={1} fps={FPS} width={1920} height={1080}
    defaultProps={{ kicker: ["NEDEN"], box: "HAYIR", rest: "DİYEMİYORSUN?", sub: "Sevilmenin hapishanesi", kickerSize: 140, boxSize: 300 }} />
  </>
);
