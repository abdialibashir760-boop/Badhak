import { Composition } from "remotion";
import { Main, DURATION, FPS, HEIGHT, WIDTH } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
