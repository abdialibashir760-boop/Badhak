import {DEFAULT_SETTINGS} from '../config/defaults';
import type {SceneConfig, VideoProps} from '../config/types';
import {DURS} from './timeline';

const IDS = [
  'dream', 'desk', 'temptation', 'spiral', 'slump', 'screentime', 'missed', 'repeat', 'pillow', 'ghost', 'dies', 'plugin',
  'rule', 'wheel', 'walk', 'lid', 'words', 'buzz', 'flow', 'bell', 'lamp', 'bed', 'ritual', 'end',
];

/** 24 storyboard scenes, 180 s. No narration: the picture, Foley and score carry the film. */
export const FIVE_SCENES: SceneConfig[] = DURS.map((d, i) => ({id: IDS[i], title: IDS[i], durationSec: d, leadSec: 0, tailSec: 0, narration: ''}));

export const FIVE_PROPS: VideoProps = {
  scenes: FIVE_SCENES,
  settings: {...DEFAULT_SETTINGS, subtitles: false, music: false, sfx: false, grain: true, narrationVolume: 1},
  narrationSrc: 'five/audio/mix.wav',
  narrationOffsetSec: 0,
  musicSrc: null,
};
