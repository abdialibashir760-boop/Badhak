import React from "react";
import { Composition } from "remotion";
import { SanJose } from "./san-jose/Main";
import { TOTAL_SECONDS as SAN_JOSE_SECONDS } from "./san-jose/timeline";
import { Apollo13, Apollo13Props, apollo13Seconds } from "./apollo13/Main";
import { Thumbnail } from "./apollo13/Thumbnail";
import { QuecreekThumbnail } from "./quecreek/Thumbnail";
import { HudsonThumbnail } from "./hudson/Thumbnail";
import { Hudson, HudsonDraft, HudsonProps, hudsonDraftSeconds, hudsonSeconds } from "./hudson/Main";
import { QuecreekCover } from "./quecreek/Cover";
import { Quecreek, QuecreekProps, QuecreekShort, quecreekSeconds, quecreekShortSeconds } from "./quecreek/Main";
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

const hudson = (id: string, lang: HudsonProps["lang"], wide: boolean) => (
  <Composition
    id={id}
    component={Hudson}
    durationInFrames={Math.ceil(hudsonSeconds(lang) * FPS)}
    fps={FPS}
    width={wide ? 1920 : 1080}
    height={wide ? 1080 : 1920}
    defaultProps={{ lang, wide } satisfies HudsonProps}
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
    {hudson("Hudson", "en", false)}
    <Composition id="HudsonDraft" component={HudsonDraft} durationInFrames={Math.ceil(hudsonDraftSeconds() * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "en" as const, wide: false }} />
    <Composition id="HudsonDraftWide" component={HudsonDraft} durationInFrames={Math.ceil(hudsonDraftSeconds() * FPS)} fps={FPS} width={1920} height={1080} defaultProps={{ lang: "en" as const, wide: true }} />
    {hudson("HudsonWide", "en", true)}
    <Composition id="ThumbHEN" component={HudsonThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "en" as const, wide: true }} />
    <Composition id="ThumbHTR" component={HudsonThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "tr" as const, wide: true }} />
    <Composition id="CoverHEN" component={HudsonThumbnail} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "en" as const, wide: false }} />
    <Composition id="CoverHTR" component={HudsonThumbnail} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "tr" as const, wide: false }} />
    <Composition id="QuecreekShort" component={QuecreekShort} durationInFrames={Math.ceil(quecreekShortSeconds("en") * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
    <Composition id="QuecreekShortTR" component={QuecreekShort} durationInFrames={Math.ceil(quecreekShortSeconds("tr") * FPS)} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "tr" as const }} />
    <Composition id="CoverQEN" component={QuecreekCover} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "en" as const }} />
    <Composition id="CoverQTR" component={QuecreekCover} durationInFrames={1} fps={FPS} width={1080} height={1920} defaultProps={{ lang: "tr" as const }} />
    <Composition id="ThumbQEN" component={QuecreekThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "en" as const }} />
    <Composition id="ThumbQTR" component={QuecreekThumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "tr" as const }} />
    <Composition id="ThumbEN" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "en" as const }} />
    <Composition id="ThumbTR" component={Thumbnail} durationInFrames={1} fps={FPS} width={1280} height={720} defaultProps={{ lang: "tr" as const }} />
  </>
);
