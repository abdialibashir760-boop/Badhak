import {DEFAULT_SETTINGS} from '../config/defaults';
import type {SceneConfig, VideoProps} from '../config/types';

export type Beat = {t: number; tpl: string; p?: Record<string, unknown>};
export const LUST_END = 148.9;

/** Beat starts sit on the sentence boundaries of the recorded voice-over (measured with silencedetect). */
export const LUST_BEATS: Beat[] = [
  {t: 0, tpl: 'kinetic', p: {words: ['LUST'], size: 400, bg: 'crimson', shake: 1}},
  {t: 1.8, tpl: 'kinetic', p: {words: ['ONE OF THE', 'OLDEST', 'FORCES', 'IN THE', 'HUMAN MIND'], size: 200, bg: 'night', hl: [1, 2]}},
  {t: 7.1, tpl: 'stamp', p: {word: 'SIN', sub: 'FOR CENTURIES'}},
  {t: 9.85, tpl: 'strike', p: {from: 'SIN', to: 'A DRIVE'}},
  {t: 14.5, tpl: 'kinetic', p: {words: ['FAR', 'STRANGER', 'THAN YOU', 'THINK'], size: 230, bg: 'violet', hl: [1]}},
  {t: 18.1, tpl: 'number', p: {n: '1', label: 'THE FIRST SURPRISE', icon: 'bolt'}},
  {t: 20.0, tpl: 'twosys', p: {}},
  {t: 26.0, tpl: 'kinetic', p: {words: ['“WANTING”', 'AND', '“LIKING”'], size: 190, bg: 'night', hl: [0, 2]}},
  {t: 29.4, tpl: 'brain', p: {mode: 'dopamine'}},
  {t: 31.9, tpl: 'chase', p: {mode: 'chase', label: 'PULLS YOU FORWARD'}},
  {t: 35.3, tpl: 'spark', p: {label: 'LIKING = THE PLEASURE ITSELF'}},
  {t: 38.2, tpl: 'compare', p: {a: ['WANTING', 0.95, 'pink'], b: ['LIKING', 0.22, 'gold'], title: 'SMALLER. SHORTER.'}},
  {t: 43.6, tpl: 'compare', p: {a: ['THE CHASE', 0.92, 'pink'], b: ['THE PRIZE', 0.3, 'gold'], title: 'THE CHASE FEELS BETTER'}},
  {t: 46.8, tpl: 'carrot', p: {label: 'NOT BUILT TO REWARD YOU FOR HAVING'}},
  {t: 50.1, tpl: 'chase', p: {mode: 'reach', label: 'BUILT TO KEEP YOU REACHING'}},
  {t: 52.5, tpl: 'phone', p: {label: 'MODERN LIFE KNOWS IT'}},
  {t: 54.4, tpl: 'cards', p: {kind: 'photos', label: 'ENDLESS PHOTOS'}},
  {t: 55.8, tpl: 'cards', p: {kind: 'profiles', label: 'ENDLESS PROFILES'}},
  {t: 57.3, tpl: 'cards', p: {kind: 'videos', label: 'ENDLESS VIDEOS'}},
  {t: 59.2, tpl: 'promise', p: {}},
  {t: 65.2, tpl: 'brain', p: {mode: 'lights'}},
  {t: 67.5, tpl: 'feast', p: {}},
  {t: 70.0, tpl: 'meter', p: {}},
  {t: 76.0, tpl: 'kinetic', p: {words: ['WHY LUST', 'FEELS', 'SO', 'POWERFUL'], size: 220, bg: 'crimson', hl: [3]}},
  {t: 79.4, tpl: 'twofig', p: {label: 'NOT ONLY ABOUT THE OTHER PERSON'}},
  {t: 81.9, tpl: 'curve', p: {mode: 'anticipation'}},
  {t: 84.3, tpl: 'compare', p: {a: ['WHAT MIGHT HAPPEN', 0.96, 'pink'], b: ['WHAT DOES', 0.4, 'gold'], title: 'ANTICIPATION WINS'}},
  {t: 89.0, tpl: 'new', p: {}},
  {t: 91.3, tpl: 'fade', p: {}},
  {t: 95.5, tpl: 'gears', p: {label: 'NOT A FLAW. HOW THE SYSTEM WORKS.'}},
  {t: 100.4, tpl: 'kinetic', p: {words: ['SO', 'WHAT', 'CAN YOU', 'DO?'], size: 260, bg: 'violet', hl: [3]}},
  {t: 103.1, tpl: 'number', p: {n: '1', label: 'NOTICE THE WANTING', icon: 'eye'}},
  {t: 107.0, tpl: 'versus', p: {a: 'DOPAMINE', b: 'DECISION'}},
  {t: 110.0, tpl: 'slider', p: {}},
  {t: 114.3, tpl: 'number', p: {n: '2', label: 'WAIT', icon: 'hourglass'}},
  {t: 116.5, tpl: 'curve', p: {mode: 'waves'}},
  {t: 119.7, tpl: 'timer', p: {}},
  {t: 123.3, tpl: 'number', p: {n: '3', label: 'BUILD REAL CONNECTION', icon: 'link'}},
  {t: 126.0, tpl: 'chem', p: {}},
  {t: 130.3, tpl: 'versus', p: {a: 'HUNGRY', b: 'SAFE', safe: true}},
  {t: 134.7, tpl: 'energy', p: {mode: 'bolt'}},
  {t: 138.0, tpl: 'energy', p: {mode: 'direction'}},
  {t: 140.5, tpl: 'kinetic', p: {words: ['THE STRONGEST', 'PEOPLE', 'FEEL', 'DESIRE', 'TOO'], size: 190, bg: 'night', hl: [3]}},
  {t: 144.7, tpl: 'closing', p: {}},
];

const fr = (t: number) => Math.round(t * 30);
export const LUST_STARTS = LUST_BEATS.map((b) => b.t);
export const LUST_DURS = LUST_BEATS.map((b, i) => (fr(i + 1 < LUST_BEATS.length ? LUST_BEATS[i + 1].t : LUST_END) - fr(b.t)) / 30);

/** Caption cues (sentence times from the recording). */
export const LUST_CAPTIONS: Array<[number, number, string]> = [
  [0.0, 0.95, 'Lust.'],
  [1.95, 6.1, 'One of the oldest words for one of the oldest forces in the human mind.'],
  [7.2, 9.4, 'For centuries it was called a sin.'],
  [9.95, 14.0, 'Today, scientists call it something else: a drive.'],
  [14.67, 16.9, 'And it is far stranger than you think.'],
  [18.26, 19.4, "Here's the first surprise."],
  [20.13, 25.0, 'Wanting something and enjoying something are two different systems in your brain.'],
  [26.09, 28.6, 'Researchers call them “wanting” and “liking.”'],
  [29.48, 31.5, 'Wanting is driven by dopamine.'],
  [32.0, 34.4, 'It pulls you forward. It makes you chase.'],
  [35.46, 37.6, 'Liking is the pleasure itself.'],
  [38.35, 42.5, 'And it is much smaller, and much shorter, than the wanting that came before it.'],
  [43.71, 46.1, "That's why the chase can feel better than the prize."],
  [46.87, 49.4, "Your brain isn't built to reward you for having."],
  [50.21, 51.6, "It's built to keep you reaching."],
  [52.58, 53.8, 'And modern life knows it.'],
  [54.47, 58.5, 'Endless photos. Endless profiles. Endless videos.'],
  [59.27, 63.8, 'Each one a tiny promise that something better is one swipe away.'],
  [65.31, 67.1, 'Your brain lights up for every promise.'],
  [67.63, 69.1, 'But a promise is not a feast.'],
  [70.13, 75.1, 'So you keep scrolling, and you keep wanting, and the wanting never gets full.'],
  [76.14, 78.8, 'This is why lust feels so powerful.'],
  [79.55, 81.2, "It isn't only about the other person."],
  [81.98, 83.5, 'It is about anticipation.'],
  [84.38, 87.9, 'The brain loves what might happen more than what does.'],
  [89.09, 90.5, 'It also loves what is new.'],
  [91.41, 94.7, 'When something becomes familiar, the same signal fades.'],
  [95.64, 99.0, "That's not a flaw in you. It's how the system works."],
  [100.55, 101.8, 'So what can you do?'],
  [103.25, 105.1, 'First, notice the wanting. Name it.'],
  [107.19, 109.1, "“That's dopamine, not a decision.”"],
  [110.16, 113.2, 'A craving you can name is a craving you can slow down.'],
  [114.4, 115.7, 'Second, wait.'],
  [116.55, 119.0, 'Cravings rise and fall like waves.'],
  [119.8, 122.0, "Most pass in minutes if you don't feed them."],
  [123.4, 125.4, 'Third, build real connection.'],
  [126.14, 129.8, 'Closeness, trust and attention release different chemicals,'],
  [130.43, 133.2, 'ones that make people feel safe, not just hungry.'],
  [134.8, 137.2, 'Lust is not your enemy. It is energy.'],
  [138.11, 139.7, 'But energy needs a direction.'],
  [140.69, 143.9, 'Because the strongest people are not the ones who feel no desire.'],
  [144.86, 147.0, 'They are the ones who choose what to do with it.'],
];

export const LUST_SCENES: SceneConfig[] = LUST_BEATS.map((b, i) => ({id: `${b.tpl}-${i}`, title: b.tpl, durationSec: LUST_DURS[i], leadSec: 0, tailSec: 0, narration: ''}));

export const LUST_PROPS: VideoProps = {
  scenes: LUST_SCENES,
  settings: {...DEFAULT_SETTINGS, subtitles: false, music: false, sfx: false, grain: true, narrationVolume: 1},
  narrationSrc: 'lust/audio/mix.wav',
  narrationOffsetSec: 0,
  musicSrc: null,
};
