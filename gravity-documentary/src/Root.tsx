import React from 'react';
import { Composition } from 'remotion';
import { Documentary } from './Documentary';
import { Thumbnail } from './Thumbnail';
import { FPS, TOTAL_FRAMES } from './timeline';
import { W, H } from './lib';

export const Root: React.FC = () => (
  <>
    <Composition id="Documentary" component={Documentary} durationInFrames={TOTAL_FRAMES} fps={FPS} width={W} height={H} />
    <Composition id="Thumbnail" component={Thumbnail} durationInFrames={1} fps={FPS} width={W} height={H} />
  </>
);
