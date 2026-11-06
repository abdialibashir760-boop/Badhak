import React from 'react';
import { Composition, Still } from 'remotion';
import { Documentary } from './Documentary';
import { Thumbnail } from './Thumbnail';
import { TIMELINE } from './data/timeline.generated';

export const Root: React.FC = () => (
  <>
    <Composition id="Documentary" component={Documentary} durationInFrames={TIMELINE.totalFrames} fps={30} width={1920} height={1080} />
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
