import { Composition } from "remotion";
import { SuffixLego } from "./Video";
import { FPS, TOTAL_FRAMES } from "./timing";

export const Root = () => (
  <Composition id="SuffixLego" component={SuffixLego} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
