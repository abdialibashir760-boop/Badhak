import React from 'react';
import {Composition} from 'remotion';
import {DEFAULT_PROPS} from './config/defaults';
import {FPS, HEIGHT, VideoProps, WIDTH} from './config/types';
import {totalFrames} from './lib/timing';
import {Video} from './video/Video';
import {StoneVideo} from './stone/StoneVideo';
import {STONE_PROPS} from './stone/config';

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
  </>
);
