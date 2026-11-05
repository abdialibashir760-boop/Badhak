import React from 'react';
import {Composition} from 'remotion';
import {Overthinking} from './Overthinking';
import {DURATION, FPS, H, W} from './utils';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="Overthinking"
      component={Overthinking}
      durationInFrames={DURATION}
      fps={FPS}
      width={W}
      height={H}
    />
  );
};
