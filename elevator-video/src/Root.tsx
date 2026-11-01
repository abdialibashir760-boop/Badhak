import { Composition } from "remotion";
import { Elevator } from "./Video";
import { FPS, TOTAL_FRAMES } from "./timing";

export const Root = () => (
  <Composition id="Elevator" component={Elevator} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1080} height={1920} />
);
