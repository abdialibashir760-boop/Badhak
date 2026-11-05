import React from 'react';
import { Composition } from 'remotion';
import { Scene } from './Scene';
import { H, W } from './camera';

export const FPS = 30;
export const DURATION_IN_FRAMES = 300; // 10 s

export const Root: React.FC = () => (
  <Composition id="SpacetimeGravity" component={Scene} durationInFrames={DURATION_IN_FRAMES} fps={FPS} width={W} height={H} />
);
