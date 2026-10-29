import type {TransitionSpec} from '../components/Transitions';
import {createVideo} from '../video/Video';
import {TIME_SCENE_COMPONENTS} from './scenes';

export const TIME_BOUNDARIES: TransitionSpec[] = TIME_SCENE_COMPONENTS.slice(0, -1).map(() => ({kind: 'pulse', frames: 14}) as TransitionSpec);

export const TimeVideo = createVideo({
  sceneComponents: TIME_SCENE_COMPONENTS,
  boundaries: TIME_BOUNDARIES,
  buildSfx: () => [],
  defaultMusic: null,
  grainAmount: 0.04,
});
