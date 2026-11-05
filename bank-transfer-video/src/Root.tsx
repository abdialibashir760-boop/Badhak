import React from "react";
import { Composition } from "remotion";
import { BankTransfer } from "./BankTransfer";
import { DURATION, FPS, H, W } from "./theme";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="BankTransfer"
    component={BankTransfer}
    durationInFrames={DURATION}
    fps={FPS}
    width={W}
    height={H}
  />
);
