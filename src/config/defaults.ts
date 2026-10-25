import type {SceneConfig, Settings, VideoProps} from './types';

/**
 * Scene-by-scene script + timing. This is the single source of truth for the
 * edit: durations drive the timeline, narration drives subtitles AND the
 * choreography inside each scene (scenes look up key words in this text).
 * Wrap a word in *asterisks* to emphasise it.
 */
export const DEFAULT_SCENES: SceneConfig[] = [
  {
    id: 'hook',
    title: 'The Hook',
    durationSec: 7.7,
    leadSec: 1.6,
    tailSec: 0.5,
    narration: 'Someone speaks. You answer. The moment ends. *It was just a conversation.*',
  },
  {
    id: 'exam',
    title: 'The Invisible Examination',
    durationSec: 8.6,
    leadSec: 0.6,
    tailSec: 0.6,
    narration: 'For some of us, an ordinary exchange quietly becomes an *exam.* Every word is checked. Every pause is scored.',
  },
  {
    id: 'replay',
    title: 'The Conversation Replays',
    durationSec: 8.8,
    leadSec: 0.5,
    tailSec: 0.6,
    narration: 'Then the replay begins. Rewind. Freeze the awkward part. Watch yourself from the outside, hunting for the mistake.',
  },
  {
    id: 'blanks',
    title: 'The Mind Fills In the Blanks',
    durationSec: 10.2,
    leadSec: 0.5,
    tailSec: 0.6,
    narration: 'A neutral face becomes a verdict. The mind dislikes blanks, so it fills them in, often harshly. But imagination is not *evidence.*',
  },
  {
    id: 'loop',
    title: 'Inside the Thought Loop',
    durationSec: 8.9,
    leadSec: 0.6,
    tailSec: 0.6,
    narration: 'Researchers call this repetitive replaying *rumination.* It can feel like problem solving, yet the loop rarely goes anywhere.',
  },
  {
    id: 'body',
    title: 'The Body Joins In',
    durationSec: 9.7,
    leadSec: 0.5,
    tailSec: 0.6,
    narration: "The body joins in. Shoulders tighten. The heart quickens. Breathing turns shallow. It is bracing for a judgment that hasn't arrived.",
  },
  {
    id: 'avoid',
    title: 'The Avoidance Trap',
    durationSec: 10.3,
    leadSec: 0.5,
    tailSec: 0.6,
    narration: 'Then an invitation arrives. Stepping back brings instant relief. But every retreat teaches the mind the danger was real, and the world *shrinks.*',
  },
  {
    id: 'turn',
    title: 'The Turning Point',
    durationSec: 9.1,
    leadSec: 0.8,
    tailSec: 0.8,
    narration: 'The shift is small. A thought appears, and you *notice* it instead of obeying it. A thought is an event, not a verdict.',
  },
  {
    id: 'response',
    title: 'A Different Response',
    durationSec: 9,
    leadSec: 0.5,
    tailSec: 0.8,
    narration: 'This time, let the silence exist. A pause is not a failure. Conversations are rarely smooth, and still worth having.',
  },
  {
    id: 'ending',
    title: 'The Ending',
    durationSec: 14.8,
    leadSec: 0.4,
    tailSec: 3.6,
    narration:
      'Overthinking has many causes, and this video is education, not diagnosis. If it weighs on you, a professional can help. *You don\'t have to win every conversation.*',
  },
];

export const DEFAULT_SETTINGS: Settings = {
  subtitles: true,
  grain: true,
  effects: true,
  music: true,
  sfx: true,
  musicVolume: 0.7,
  sfxVolume: 0.8,
  narrationVolume: 1,
};

export const DEFAULT_PROPS: VideoProps = {
  scenes: DEFAULT_SCENES,
  settings: DEFAULT_SETTINGS,
  narrationSrc: 'audio/narration.wav',
  narrationOffsetSec: 0,
  musicSrc: null,
};
