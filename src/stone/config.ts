import {DEFAULT_SETTINGS} from '../config/defaults';
import type {SceneConfig, VideoProps} from '../config/types';

/**
 * "What If You Woke Up in the Stone Age?" — storyboard timings (0–20, 20–45, 45–75, 75–110, 110–150, 150–185, 185–220 s)
 * and narration. Sentences from the brief are verbatim; the short extra lines are marked in NARRATION.md.
 * `[pause:1.5]` inserts 1.5 s of silence; *asterisks* emphasise a word in the subtitles.
 */
export const STONE_SCENES: SceneConfig[] = [
  {
    id: 'wake',
    title: 'You Wake Up in the Wrong World',
    durationSec: 20,
    leadSec: 1,
    tailSec: 3.63,
    narration:
      'Imagine waking up one morning and discovering that your entire world has disappeared. No houses. No phones. No electricity. [pause:0.5] Just trees, wild animals, and a world where surviving until tomorrow is your *biggest achievement.*',
  },
  {
    id: 'wrong',
    title: 'Something Is Very Wrong',
    durationSec: 25,
    leadSec: 0.8,
    tailSec: 3.61,
    narration:
      'You are somewhere in prehistoric Europe, around 30,000 years ago. [pause:0.4] Modern civilization is thousands of years in the future. [pause:0.4] And unfortunately, nobody here has invented a *supermarket.* [pause:2.2] On the plus side: no traffic. On the minus side: no roads.',
  },
  {
    id: 'locals',
    title: 'Meeting the Locals',
    durationSec: 30,
    leadSec: 0.8,
    tailSec: 6.12,
    narration:
      "Eventually, you meet some of the locals. [pause:1] They have skills you don't. They know the landscape, recognize animal tracks, and understand how to make useful tools. [pause:1.2] You, meanwhile, have absolutely no idea how to ask where the nearest *restaurant* is. [pause:1.5] Saying it louder does not help.",
  },
  {
    id: 'food',
    title: 'The Problem With Food',
    durationSec: 35,
    leadSec: 0.8,
    tailSec: 8.7,
    narration:
      'Then your stomach starts complaining. [pause:0.6] You need food, but there are no shops, no packaged snacks, and no delivery apps. [pause:1.5] Finding food requires knowledge, cooperation, and skills you have never needed before. [pause:1.5] Archaeologists find evidence for hunted animals and gathered plants. What they have never found is a *fridge.*',
  },
  {
    id: 'wolf',
    title: 'Nature Does Not Care About You',
    durationSec: 40,
    leadSec: 1,
    tailSec: 8.77,
    narration:
      'And then you notice something watching you from the trees. [pause:3.5] Suddenly, you understand why knowing your environment matters. [pause:2.5] Out here, confidence is not a survival skill. Knowing when to *back away* is. [pause:2.5] Wolves were part of this landscape. Wild, wary, and not interested in being your friend.',
  },
  {
    id: 'learn',
    title: 'Learning to Survive',
    durationSec: 35,
    leadSec: 0.8,
    tailSec: 5.74,
    narration:
      'Slowly, you begin to understand something. [pause:0.8] Survival is not about being the strongest person in the forest. It is about learning, adapting, sharing knowledge, and cooperating with people who understand the world around them. [pause:1.5] Make fire. Shape stone. Build shelter. Share the work. [pause:1] We can only reconstruct how, from the tools and hearths they left behind.',
  },
  {
    id: 'night',
    title: 'Nightfall',
    durationSec: 35,
    leadSec: 2.5,
    tailSec: 8.04,
    narration:
      'By nightfall, you have made it through your first day. You have learned more about survival than you expected. [pause:0.8] Somewhere in the dark, someone is playing a bone flute. Instruments like that are known from Europe at least 35,000 years ago. [pause:0.8] But tomorrow brings another challenge. [pause:1.2] And the Stone Age has no emergency *hotline.*',
  },
];

export const STONE_PROPS: VideoProps = {
  scenes: STONE_SCENES,
  settings: {...DEFAULT_SETTINGS, musicVolume: 0.5, sfxVolume: 0.7},
  narrationSrc: 'stone/audio/narration.wav',
  narrationOffsetSec: 0,
  musicSrc: null,
};
