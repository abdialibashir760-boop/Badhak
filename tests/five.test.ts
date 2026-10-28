import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FIVE_SCENES} from '../src/five/config';
import {totalFrames} from '../src/lib/timing';
import {DOC_KEYS, NOTE_STEPS, S, SWIPES, TOTAL, timerLeft} from '../src/five/timeline';

test('24 scenes, 180 s, 5400 frames', () => {
  assert.equal(FIVE_SCENES.length, 24);
  assert.equal(TOTAL, 180);
  assert.equal(totalFrames(FIVE_SCENES), 5400);
});

test('Foley events sit inside their scenes', () => {
  assert.ok(DOC_KEYS.every((k) => k.t >= S(17) && k.t < S(22)));
  assert.ok(NOTE_STEPS.every((k) => k.t >= S(13) && k.t < S(14)));
  assert.ok(SWIPES.every((t) => t >= S(4) && t < S(5)));
});

test('the 5-minute timer starts at 5:00 and rings at 0 during scene 20', () => {
  assert.equal(timerLeft(S(14)), 300);
  assert.equal(timerLeft(S(20) + 2.7), 0);
});
