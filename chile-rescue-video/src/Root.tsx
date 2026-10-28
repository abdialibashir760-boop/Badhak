import React from "react";
import { Composition } from "remotion";
import { SanJose } from "./san-jose/Main";
import { TOTAL_SECONDS as SAN_JOSE_SECONDS } from "./san-jose/timeline";
import { Apollo13, Apollo13Props, apollo13Seconds } from "./apollo13/Main";
import { Thumbnail } from "./apollo13/Thumbnail";
import { QuecreekThumbnail } from "./quecreek/Thumbnail";
import { Quecreek, QuecreekProps, quecreekSeconds } from "./quecreek/Main";
import { FPS, H, W } from "./common/math";

const apollo = (id: string, lang: Apollo13Props["lang"], wide: boolean) => (
  <Composition
    id={id}
    component={Apollo13}
    durationInFrames={Math.ceil(apollo13Seconds(lang) * FPS)}
    fps={FPS}
    width={wide ? 1920 : 1080}
    height={wide ? 1080 : 1920}
    defaultProps={{ lang, wide } satisfies Apollo13Props}
  />
);

const quecreek = (id: string, lang: QuecreekProps["lang"], wide: boolean) => (
  <Composition
    id={id}
    component={Quecreek}
    durationInFrames={Math.ceil(quecreekSeconds(lang) * FPS)}
    fps={FPS}
    width={wide ? 1920 : 1080}
    height={wide ? 1080 : 1920}
    defaultProps={{ lang, wide } satisfies QuecreekProps}
  />
);

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SanJose" component={SanJose} durationInFrames={Math.ceil(SAN_JOSE_SECONDS * FPS)} fps={FPS} width={W} height={H} />
    {apollo("Apollo13", "en", false)}
    {apollo("Apollo13TR", "tr", false)}
    {apollo("Apollo13Wide", "en", true)}
    {apollo("Apollo13WideTR", "tr", true)}
    {quecreek("Quecreek", "en", false)}
    {quecreek("QuecreekTR", "tr", false)}
    {quecreek("QuecreekWide", "en", true)}
    {quecreek("QuecreekWideTR", "tr", true)}
    <Composition id="ThumbQEN" component={QuecreekThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "en" as const }} />
    <Composition id="ThumbQTR" component={QuecreekThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "tr" as const }} />
    <Composition id="ThumbEN" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "en" as const }} />
    <Composition id="ThumbTR" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "tr" as const }} />
  </>
);
