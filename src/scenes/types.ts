import type {SceneTiming} from '../lib/timing';

export type SceneProps = {
  /** Local frame within the scene. */
  frame: number;
  /** Scene length in frames. */
  dur: number;
  /** Normalised progress 0..1. Choreography is authored in p so it stretches with edited durations. */
  p: number;
  /** Narration timing (word / sentence start frames) so visuals can hit spoken beats. */
  tm: SceneTiming;
};
