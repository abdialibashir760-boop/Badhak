import React from 'react';
import {Composition} from 'remotion';
import {Film, TOTAL_FRAMES} from './Film';
import {FPS} from './theme';
export const Root: React.FC = () => (<Composition id="Film" component={Film} durationInFrames={TOTAL_FRAMES} fps={FPS} width={1920} height={1080} />);
