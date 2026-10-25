import type {TransitionSpec} from '../components/Transitions';

/** Transition between scene i and i+1 (closing the first, opening the second). */
export const BOUNDARIES: TransitionSpec[] = [
  {kind: 'blink', frames: 16}, // hook -> exam: the examiner's eye opens
  {kind: 'iris', x: 960, y: 560, frames: 18}, // exam -> replay: attention narrows to a point
  {kind: 'glitch', frames: 12}, // replay -> blanks: tape dropout
  {kind: 'iris', x: 960, y: 420, frames: 20}, // blanks -> loop: into the head
  {kind: 'pulse', frames: 10}, // loop -> body: a heartbeat dip
  {kind: 'blink', frames: 16}, // body -> avoid
  {kind: 'wipe', frames: 30}, // avoid -> turn: slow soft edge of darkness
  {kind: 'iris', x: 960, y: 480, frames: 26}, // turn -> response: gentle opening
  {kind: 'wipe', frames: 26}, // response -> ending
];
