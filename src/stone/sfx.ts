import type {SceneConfig} from '../config/types';
import type {SfxCue} from '../config/sfx';
import {buildTiming, sceneStarts} from '../lib/timing';
import {keysFor, type Lang} from './i18n';

const S = 'stone/audio';

/**
 * Sound design for the Stone Age film, placed from the same narration keywords the visuals use,
 * so edited timing/text keeps sound and picture in sync.
 */
export const buildStoneSfx = (scenes: SceneConfig[], lang: Lang = 'en'): SfxCue[] => {
  const starts = sceneStarts(scenes);
  const tms = scenes.map((s) => buildTiming(s));
  const out: SfxCue[] = [];
  const keys = tms.map((t) => keysFor(lang, t));
  const at = (i: number, kw: string, fb: number, nth = 0) => starts[i] + Math.round(keys[i].at(kw, fb, nth));
  const end = (i: number) => starts[i] + tms[i].dur;
  const cue = (c: SfxCue) => out.push({...c, from: Math.max(0, c.from)});
  const steps = (from: number, to: number, every: number, volume = 0.45) => {
    for (let f = from; f < to; f += every) cue({file: 'footstep.wav', dir: S, from: f, volume: volume * (0.8 + 0.2 * ((f / every) % 2)), durationInFrames: 9});
  };

  // ambience beds
  cue({file: 'amb-forest.wav', dir: S, from: 0, volume: 0.75, durationInFrames: end(5) - 0 + 60, loop: true, fadeIn: 45, fadeOut: 120});
  cue({file: 'amb-night.wav', dir: S, from: starts[6] - 60, volume: 0.7, durationInFrames: tms[6].dur + 60, loop: true, fadeIn: 150, fadeOut: 60});
  cue({file: 'fire.wav', dir: S, from: starts[2] + 60, volume: 0.22, durationInFrames: end(3) - starts[2] - 60, loop: true, fadeIn: 90, fadeOut: 60});
  cue({file: 'fire.wav', dir: S, from: at(5, 'Make', 0.45) + 160, volume: 0.35, durationInFrames: end(5) - at(5, 'Make', 0.45) - 160, loop: true, fadeIn: 60, fadeOut: 40});
  cue({file: 'fire.wav', dir: S, from: starts[6] - 30, volume: 0.55, durationInFrames: tms[6].dur + 30, loop: true, fadeIn: 90, fadeOut: 60});

  // scene 1: title sting + whoosh transitions
  cue({file: 'boom.wav', dir: 'audio', from: at(0, 'biggest', 0.7) + 8, volume: 0.8, durationInFrames: 90});
  scenes.forEach((_, i) => i < scenes.length - 1 && cue({file: 'whoosh.wav', dir: 'audio', from: end(i) - 24, volume: 0.45, durationInFrames: 40}));

  // scene 2: footsteps, then the deflating pause
  steps(starts[1] + 70, at(1, 'Modern', 0.28) - 12, 17);
  cue({file: 'womp.wav', dir: S, from: at(1, 'supermarket', 0.52) + 40, volume: 0.65, durationInFrames: 90});

  // scene 3: arrival, knapping clacks, the shout
  steps(starts[2] + 24, starts[2] + 190, 16);
  const tTools = at(2, 'tools', 0.5);
  for (let f = tTools - 6; f < tTools + 100; f += 24) cue({file: 'clack.wav', dir: S, from: f, volume: 0.55, durationInFrames: 10});
  cue({file: 'boing.wav', dir: S, from: at(2, 'louder', 0.9) - 2, volume: 0.6, durationInFrames: 30});

  // scene 4: rumble, three pops, the fridge
  cue({file: 'stomach.wav', dir: S, from: at(3, 'stomach', 0.1), volume: 0.8, durationInFrames: 70});
  for (const kw of ['shops', 'snacks', 'apps']) cue({file: 'pop.wav', dir: S, from: at(3, kw, 0.25) + 28, volume: 0.6, durationInFrames: 6});
  cue({file: 'ding.wav', dir: S, from: at(3, 'fridge', 0.9) - 4, volume: 0.6, durationInFrames: 45});

  // scene 5: rustle, twig, heartbeat, steps backwards, howl
  const tN = at(4, 'notice', 0.05);
  cue({file: 'rustle.wav', dir: S, from: tN - 12, volume: 0.6, durationInFrames: 30});
  cue({file: 'twig.wav', dir: S, from: tN + 14, volume: 0.6, durationInFrames: 9});
  const tBack = at(4, 'back', 0.62);
  for (let f = tN + 24; f < tBack + 150; f += 54) cue({file: 'heartbeat.wav', dir: 'audio', from: f, volume: 0.55, durationInFrames: 28});
  steps(tBack + 20, tBack + 330, 34, 0.35);
  cue({file: 'howl.wav', dir: S, from: at(4, 'Wolves', 0.78) + 150, volume: 0.5, durationInFrames: 140});

  // scene 6: carrying wood, sparks, flake
  steps(starts[5] + 20, at(5, 'Make', 0.45) - 16, 17, 0.4);
  const tShape = at(5, 'Shape', 0.55);
  for (let f = tShape + 20; f < tShape + 130; f += 25) cue({file: 'clack.wav', dir: S, from: f, volume: 0.5, durationInFrames: 10});
  const tMake = at(5, 'Make', 0.45);
  for (let f = tMake + 30; f < tMake + 150; f += 36) cue({file: 'clack.wav', dir: S, from: f, volume: 0.35, durationInFrames: 10});

  // scene 7: flute, far howl, final steps
  cue({file: 'flute.wav', dir: S, from: at(6, 'flute', 0.28) - 40, volume: 0.55, durationInFrames: 25 * 30, fadeIn: 40, fadeOut: 90});
  cue({file: 'howl.wav', dir: S, from: starts[6] + Math.round(tms[6].dur * 0.9), volume: 0.35, durationInFrames: 140});
  steps(at(6, 'tomorrow', 0.58) + 40, at(6, 'tomorrow', 0.58) + 270, 20, 0.4);
  return out;
};
