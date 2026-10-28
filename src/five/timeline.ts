import {lerp, rng} from '../lib/anim';

/** Scene lengths in seconds (24 scenes = 180 s). Shared by the picture, the sound design and the audio script. */
export const DURS = [5, 7, 5, 10, 7, 7, 9, 10, 8, 9, 8, 10, 9, 7, 9, 7, 7, 6, 8, 7, 7, 6, 6, 6];
export const STARTS = DURS.map((_, i) => DURS.slice(0, i).reduce((a, b) => a + b, 0));
export const TOTAL = DURS.reduce((a, b) => a + b, 0);
/** start of scene n (1-based) in seconds */
export const S = (n: number) => STARTS[n - 1];

/** Piecewise-linear interpolation through [time, value] points. */
export const pts = (t: number, p: Array<[number, number]>) => {
  if (t <= p[0][0]) return p[0][1];
  for (let i = 1; i < p.length; i++) if (t <= p[i][0]) return lerp(p[i - 1][1], p[i][1], (t - p[i - 1][0]) / (p[i][0] - p[i - 1][0] || 1));
  return p[p.length - 1][1];
};

/** Clock time as minutes after 12:00 (can exceed 1440). The film jumps between nights; see CLOCK_LABEL. */
export const clockMinutes = (t: number) =>
  pts(t, [
    [0, 19 * 60 + 50], [5, 20 * 60], [12, 20 * 60 + 1], [17, 20 * 60 + 41], [20, 21 * 60 + 26], [24, 22 * 60 + 13], [27, 22 * 60 + 20],
    [30, 22 * 60 + 48], [41, 23 * 60 + 58], [43, 24 * 60], [60, 24 * 60 + 40], [62, 25 * 60 + 12], [85, 23 * 60 + 44], [89, 23 * 60 + 45],
    [120, 23 * 60 + 49], [135, 23 * 60 + 52], [150.7, 23 * 60 + 55], [155, 24 * 60 + 20], [160, 24 * 60 + 48], [164, 24 * 60 + 51],
  ]);
export const fmtClock = (m: number, withSuffix = true) => {
  const mm = Math.round(m) % 1440;
  const h24 = Math.floor(mm / 60);
  const min = mm % 60;
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${String(min).padStart(2, '0')}${withSuffix ? (h24 >= 12 ? ' PM' : ' AM') : ''}`;
};

export const batteryAt = (t: number) => Math.round(pts(t, [[0, 62], [17, 55], [27, 41], [30, 29], [34, 19], [41, 12], [60, 17], [62, 17], [77, 9], [80, 1], [85, 1], [88, 6], [112, 28], [160, 70], [168, 100]]));

/** Phone countdown (seconds left). The film compresses real time, so the timer runs faster than the clock. */
export const TIMER_START = S(14) + 5.5; // thumb taps Start
export const timerLeft = (t: number) =>
  t < TIMER_START ? 300 : pts(t, [[TIMER_START, 300], [TIMER_START + 1.1, 299], [S(15) + 5, 252], [S(16) + 2, 230], [S(17) + 4, 218], [S(18) + 3, 151], [S(19) + 5, 41], [S(20) + 2.7, 0]]);

export const fmtMS = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;

/** Document keystrokes (scenes 17–21). Rate is hesitant, then accelerates until the timer rings, pauses, then settles. */
const rate = (t: number) =>
  pts(t, [
    [S(17) + 1.2, 0.001], [S(17) + 1.3, 1.1], [S(17) + 6, 1.3], [S(18) + 3.0, 2.6], [S(18) + 3.3, 0.001], [S(18) + 3.8, 3.2], [S(19), 3.4],
    [S(19) + 5, 6.5], [S(19) + 8, 8.4], [S(20) + 2.5, 8.4], [S(20) + 2.8, 0.001], [S(20) + 4.4, 0.001], [S(20) + 4.5, 5.5], [S(21) + 4, 4.2], [S(21) + 5.1, 3],
  ]);
export type Key = {t: number; kind: 'key' | 'space' | 'back'};
export const docKeys = (): Key[] => {
  const r = rng(77);
  const out: Key[] = [];
  let t = S(17) + 1.2;
  const end = S(21) + 5.3;
  while (t < end) {
    const rt = rate(t);
    if (rt < 0.01) {
      t += 0.05;
      continue;
    }
    t += (1 / rt) * (0.6 + r() * 0.8);
    if (t >= end) break;
    out.push({t, kind: r() < 0.16 ? 'space' : 'key'});
  }
  // the hesitant title: type, delete, retype (scene 17)
  const back = [S(17) + 3.4, S(17) + 3.55, S(17) + 3.7];
  back.forEach((b) => out.push({t: b, kind: 'back'}));
  return out.sort((a, b) => a.t - b.t);
};
export const DOC_KEYS = docKeys();
export const keysTyped = (t: number) => DOC_KEYS.filter((k) => k.t <= t && k.kind !== 'back').length - DOC_KEYS.filter((k) => k.t <= t && k.kind === 'back').length;

/** The note typed on the phone (scene 13): a plan typed, deleted, then replaced by the rule. */
export const NOTE_FIRST = 'Build the dream project for 4 hours.';
export const NOTE_RULE = ['Just open the laptop.', '5 minutes.', 'If it hurts, close it and sleep.'];
export type NoteStep = {t: number; text: string; kind: 'key' | 'back'};
export const noteTimeline = (): NoteStep[] => {
  const r = rng(5);
  const steps: NoteStep[] = [];
  let t = S(13) + 0.3;
  let text = '';
  for (const ch of NOTE_FIRST) {
    text += ch;
    steps.push({t, text, kind: 'key'});
    t += 0.035 + r() * 0.02;
  }
  t += 0.3;
  while (text.length > 0) {
    text = text.slice(0, -1);
    steps.push({t, text, kind: 'back'});
    t += 0.012;
  }
  t += 0.4;
  const full = NOTE_RULE.join('\n');
  for (const ch of full) {
    text += ch;
    steps.push({t, text, kind: 'key'});
    t += ch === '\n' ? 0.2 : 0.04 + r() * 0.025;
  }
  return steps;
};
export const NOTE_STEPS = noteTimeline();
export const noteTextAt = (t: number) => {
  let cur = '';
  for (const s of NOTE_STEPS) if (s.t <= t) cur = s.text;
  return cur;
};

/** Phone swipes in the scroll spiral (scene 4): 1/s accelerating to 4/s. */
export const swipeTimes = (): number[] => {
  const out: number[] = [];
  let t = S(4) + 0.3;
  while (t < S(4) + 9.7) {
    out.push(t);
    t += 1 / pts(t, [[S(4), 1], [S(4) + 10, 4.2]]);
  }
  return out;
};
export const SWIPES = swipeTimes();
