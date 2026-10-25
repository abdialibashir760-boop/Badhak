export type SceneConfig = {
  id: string;
  title: string;
  /** Scene length in seconds (editable in the studio). */
  durationSec: number;
  /** Narration. `*word*` marks emphasis (rendered bold/red in subtitles). */
  narration: string;
  /** Silence before the first word, seconds. */
  leadSec: number;
  /** Silence after the last word, seconds. */
  tailSec: number;
};

export type Settings = {
  subtitles: boolean;
  grain: boolean;
  /** Hand-drawn boil, spotlights, particles, vignette. */
  effects: boolean;
  music: boolean;
  sfx: boolean;
  musicVolume: number;
  sfxVolume: number;
  narrationVolume: number;
};

export type VideoProps = {
  scenes: SceneConfig[];
  settings: Settings;
  /** Path under /public (e.g. "uploads/narration.wav") or an absolute/blob URL. */
  narrationSrc: string | null;
  narrationOffsetSec: number;
  musicSrc: string | null;
};

export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;
