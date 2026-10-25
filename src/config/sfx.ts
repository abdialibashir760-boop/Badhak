import type {SceneConfig} from './types';
import {FPS} from './types';
import {buildTiming, sceneStarts} from '../lib/timing';
import {beatFrames} from '../lib/heart';

export type SfxCue = {
  file: string;
  from: number;
  volume: number;
  durationInFrames: number;
  /** Folder under /public (default "audio"). */
  dir?: string;
  loop?: boolean;
  fadeIn?: number;
  fadeOut?: number;
};

/** Sound-effect placement derived from the same scene timing the visuals use. */
export const buildSfx = (scenes: SceneConfig[]): SfxCue[] => {
  const starts = sceneStarts(scenes);
  const out: SfxCue[] = [];
  scenes.forEach((s, i) => {
    const tm = buildTiming(s);
    const at = starts[i];
    if (i < scenes.length - 1) {
      out.push({file: 'whoosh.wav', from: at + tm.dur - 22, volume: 0.55, durationInFrames: 40});
    }
    if (i === 0) {
      const w = tm.words.slice(-5)[0];
      out.push({file: 'boom.wav', from: at + Math.round(w?.start ?? tm.dur * 0.6) - 4, volume: 0.9, durationInFrames: 90});
    }
    if (i === 1) {
      tm.words.filter((w) => /^(checked|scored)/i.test(w.text)).forEach((w) =>
        out.push({file: 'tick.wav', from: at + Math.round(w.start), volume: 0.7, durationInFrames: 12}),
      );
    }
    if (i === 5) {
      beatFrames(tm.dur).forEach((f) => out.push({file: 'heartbeat.wav', from: at + f, volume: 0.9, durationInFrames: 28}));
    }
    if (i === 7) {
      out.push({file: 'chime.wav', from: at + Math.round(tm.at('event', 0.8)), volume: 0.4, durationInFrames: 120});
    }
    if (i === scenes.length - 1) {
      out.push({file: 'chime.wav', from: at + tm.dur - Math.round(2.9 * FPS), volume: 0.8, durationInFrames: 150});
    }
  });
  return out;
};
