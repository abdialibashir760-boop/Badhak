import React from 'react';
import {createVideo} from '../video/Video';
import type {TransitionSpec} from '../components/Transitions';
import type {VideoProps} from '../config/types';
import {buildStoneSfx} from './sfx';
import {STONE_SCENE_COMPONENTS} from './scenes';
import {StoneHud} from './Hud';
import {LangContext, type Lang} from './i18n';

export const STONE_BOUNDARIES: TransitionSpec[] = [
  {kind: 'blink', frames: 20}, // wake -> wrong: a long blink as he comes to
  {kind: 'wipe', frames: 28}, // wrong -> locals
  {kind: 'pulse', frames: 12}, // locals -> food: stomach growl dip
  {kind: 'iris', x: 1500, y: 600, frames: 26}, // food -> wolf: attention narrows to the trees
  {kind: 'wipe', frames: 30}, // wolf -> learn: relief
  {kind: 'iris', x: 960, y: 700, frames: 36}, // learn -> night: the world closes in on the fire
];

/** One film, two languages: narration, subtitles, on-screen text and word-keyed cues all follow `lang`. */
const makeStoneVideo = (lang: Lang): React.FC<VideoProps> => {
  const Film = createVideo({
    sceneComponents: STONE_SCENE_COMPONENTS,
    boundaries: STONE_BOUNDARIES,
    buildSfx: (scenes) => buildStoneSfx(scenes, lang),
    defaultMusic: null,
    grainAmount: 0.045,
    overlay: StoneHud,
  });
  const Localised: React.FC<VideoProps> = (props) => (
    <LangContext.Provider value={lang}>
      <Film {...props} />
    </LangContext.Provider>
  );
  return Localised;
};

export const StoneVideo = makeStoneVideo('en');
export const StoneVideoTR = makeStoneVideo('tr');
