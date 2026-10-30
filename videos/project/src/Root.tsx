import React from "react";
import { Composition } from "remotion";
import { Docu, DocuTR, TOTAL_FRAMES, TOTAL_FRAMES_TR } from "./Docu";
import { FPS, H, W } from "./theme";
import { ThumbA, ThumbB, ThumbC } from "./Thumbs";
import { ThumbA as ThumbATR, ThumbB as ThumbBTR, ThumbC as ThumbCTR } from "./tr/Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Docu" component={Docu} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="ThumbA" component={ThumbA} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="ThumbB" component={ThumbB} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="ThumbC" component={ThumbC} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="DocuTR" component={DocuTR} durationInFrames={TOTAL_FRAMES_TR} fps={FPS} width={W} height={H} />
    <Composition id="ThumbATR" component={ThumbATR} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="ThumbBTR" component={ThumbBTR} durationInFrames={1} fps={FPS} width={W} height={H} />
    <Composition id="ThumbCTR" component={ThumbCTR} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
