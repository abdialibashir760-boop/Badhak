import type {TransitionSpec} from '../components/Transitions';
import {createVideo} from '../video/Video';
import {FIVE_SCENES} from './scenes';

const cut: TransitionSpec = {kind: 'cut', frames: 1};
/** Hard cuts everywhere, as in the reference; only the sleep and blackout beats dip. */
export const FIVE_BOUNDARIES: TransitionSpec[] = FIVE_SCENES.slice(0, -1).map((_, i) => ([6, 10].includes(i) ? ({kind: 'pulse', frames: 10} as TransitionSpec) : cut));

export const FiveVideo = createVideo({
  sceneComponents: FIVE_SCENES,
  boundaries: FIVE_BOUNDARIES,
  buildSfx: () => [],
  defaultMusic: null,
  grainAmount: 0.05,
});
