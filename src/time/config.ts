import {DEFAULT_SETTINGS} from '../config/defaults';
import type {SceneConfig, VideoProps} from '../config/types';

/** Scene boundaries are cut inside the pauses of the recorded voice-over (measured with silencedetect). */
export const TIME_DURS = [20.8, 23.6, 40.1, 21.7, 21.5, 23.7, 14.6];
export const TIME_STARTS = TIME_DURS.map((_, i) => Math.round(TIME_DURS.slice(0, i).reduce((a, b) => a + b, 0) * 10) / 10);
const IDS = ['question', 'proportion', 'memory', 'holiday', 'firsts', 'slowdown', 'close'];

export const TIME_SCENES: SceneConfig[] = TIME_DURS.map((d, i) => ({id: IDS[i], title: IDS[i], durationSec: d, leadSec: 0, tailSec: 0, narration: ''}));

export const TIME_PROPS: VideoProps = {
  scenes: TIME_SCENES,
  settings: {...DEFAULT_SETTINGS, subtitles: false, music: false, sfx: false, grain: true, narrationVolume: 1},
  narrationSrc: 'time/audio/mix.wav',
  narrationOffsetSec: 0,
  musicSrc: null,
};
