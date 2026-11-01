import { Composition } from "remotion";
import { Main, FPS, HEIGHT, WIDTH } from "./Composition";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Main"
      component={Main}
      durationInFrames={FPS * 15}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
    />
  );
};
