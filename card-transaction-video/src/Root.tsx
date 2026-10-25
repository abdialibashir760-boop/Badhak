import { Composition } from "remotion";
import { CardTransactionMaster } from "./CardTransactionMaster";
import { DURATION, FPS, HEIGHT, WIDTH } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition id="CardTransaction" component={CardTransactionMaster} durationInFrames={DURATION} fps={FPS} width={WIDTH} height={HEIGHT} />
);
