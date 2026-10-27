import React from "react";
import { Composition } from "remotion";
import { SanJose } from "./san-jose/Main";
import { TOTAL_SECONDS as SAN_JOSE_SECONDS } from "./san-jose/timeline";
import { Apollo13 } from "./apollo13/Main";
import { TOTAL_SECONDS as APOLLO_SECONDS } from "./apollo13/timeline";
import { FPS, H, W } from "./common/math";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SanJose" component={SanJose} durationInFrames={Math.ceil(SAN_JOSE_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    <Composition id="Apollo13" component={Apollo13} durationInFrames={Math.ceil(APOLLO_SECONDS * FPS)} fps={FPS} width={W} height={H} />
  </>
);
