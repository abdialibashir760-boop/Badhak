import React from 'react';
import {Composition} from 'remotion';
import {DEFAULT_PROPS} from './config/defaults';
import {FPS, HEIGHT, VideoProps, WIDTH} from './config/types';
import {totalFrames} from './lib/timing';
import {Video} from './video/Video';
import {StoneVideo, StoneVideoTR} from './stone/StoneVideo';
import {STONE_PROPS, STONE_PROPS_TR} from './stone/config';
import {FiveVideo} from './five/FiveVideo';
import {FIVE_PROPS} from './five/config';
import {TimeVideo} from './time/TimeVideo';
import {TIME_PROPS} from './time/config';
import {Thumbnail} from './stone/Thumbnail';

export const RemotionRoot: React.FC = () => (
  <>
  <Composition
    id="ZihniOyunu"
    component={Video as React.FC<Record<string, unknown>>}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={totalFrames(DEFAULT_PROPS.scenes)}
    defaultProps={DEFAULT_PROPS as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames((props as unknown as VideoProps).scenes)})}
  />
  <Composition
    id="StoneAge"
    component={StoneVideo as React.FC<Record<string, unknown>>}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={totalFrames(STONE_PROPS.scenes)}
    defaultProps={STONE_PROPS as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames((props as unknown as VideoProps).scenes)})}
  />
  <Composition
    id="StoneAgeTR"
    component={StoneVideoTR as React.FC<Record<string, unknown>>}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={totalFrames(STONE_PROPS_TR.scenes)}
    defaultProps={STONE_PROPS_TR as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames((props as unknown as VideoProps).scenes)})}
  />
  <Composition
    id="FiveMinuteRule"
    component={FiveVideo as React.FC<Record<string, unknown>>}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={totalFrames(FIVE_PROPS.scenes)}
    defaultProps={FIVE_PROPS as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames((props as unknown as VideoProps).scenes)})}
  />
  <Composition
    id="TimeFlies"
    component={TimeVideo as React.FC<Record<string, unknown>>}
    width={WIDTH}
    height={HEIGHT}
    fps={FPS}
    durationInFrames={totalFrames(TIME_PROPS.scenes)}
    defaultProps={TIME_PROPS as unknown as Record<string, unknown>}
    calculateMetadata={({props}) => ({durationInFrames: totalFrames((props as unknown as VideoProps).scenes)})}
  />
  <Composition
    id="Thumbnail"
    component={Thumbnail as React.FC<Record<string, unknown>>}
    width={1280}
    height={720}
    fps={FPS}
    durationInFrames={1}
    defaultProps={{lang: 'en', variant: 'A'}}
  />
  </>
);
