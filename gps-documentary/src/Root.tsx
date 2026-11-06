import { Composition } from "remotion";
import { Documentary } from "./Documentary";
import { Thumbnail } from "./scenes/thumbnail";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./timeline";

export const Root = () => (
  <>
    <Composition id="GpsDocumentary" component={Documentary} durationInFrames={TOTAL_FRAMES} fps={FPS} width={WIDTH} height={HEIGHT} />
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={WIDTH} height={HEIGHT} />
  </>
);
