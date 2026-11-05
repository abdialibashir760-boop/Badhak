import type {TransitionSpec} from '../components/Transitions';
import {createVideo} from '../video/Video';
import {LUST_SCENE_COMPONENTS, LustCaptions} from './scenes';
import {LUST_BEATS} from './config';

export const LUST_BOUNDARIES: TransitionSpec[] = LUST_BEATS.slice(0, -1).map(() => ({kind: 'cut', frames: 1}) as TransitionSpec);

export const LustVideo = createVideo({
  sceneComponents: LUST_SCENE_COMPONENTS,
  boundaries: LUST_BOUNDARIES,
  buildSfx: () => [],
  defaultMusic: null,
  grainAmount: 0.04,
  overlay: LustCaptions,
});
