import { Composition } from "remotion";
import { GpsExplainer } from "./GpsExplainer";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timing";

export const Root = () => (
  <Composition id="GpsExplainer" component={GpsExplainer} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
);
