import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT_SCENES} from '../src/config/defaults';
import {buildTiming, fitScenesToAudio, sceneFrames, sceneStarts, totalFrames} from '../src/lib/timing';
import {beatFrames} from '../src/lib/heart';
import {buildSfx} from '../src/config/sfx';

test('ten scenes, ~90-100 s total, contiguous starts', () => {
  assert.equal(DEFAULT_SCENES.length, 10);
  const total = totalFrames(DEFAULT_SCENES);
  assert.ok(total / 30 >= 60 && total / 30 <= 105, `duration ${total / 30}s`);
  const starts = sceneStarts(DEFAULT_SCENES);
  starts.forEach((s, i) => assert.equal(s + sceneFrames(DEFAULT_SCENES[i]), starts[i + 1] ?? total));
});

test('every cue sits inside its scene and words are ordered', () => {
  for (const s of DEFAULT_SCENES) {
    const tm = buildTiming(s);
    assert.ok(tm.words.length > 5, s.id);
    let prev = -1;
    for (const w of tm.words) {
      assert.ok(w.start >= prev && w.end <= tm.dur, `${s.id}:${w.text}`);
      prev = w.start;
    }
    tm.cues.forEach((c) => assert.ok(c.lines.length <= 2 && c.showEnd <= tm.dur));
  }
});

test('emphasis markers are parsed and stripped', () => {
  const tm = buildTiming({...DEFAULT_SCENES[0], narration: 'Plain *very loud* words.'});
  assert.deepEqual(tm.words.map((w) => [w.text, w.emph]), [['Plain', false], ['very', true], ['loud', true], ['words.', false]]);
});

test('keyword lookup drives choreography and falls back when the word is edited out', () => {
  const tm = buildTiming(DEFAULT_SCENES[3]);
  assert.ok((tm.find('evidence') ?? 0) > (tm.find('verdict') ?? 1e9));
  const edited = buildTiming({...DEFAULT_SCENES[3], narration: 'Nothing relevant here.'});
  assert.equal(edited.find('evidence'), undefined);
  assert.equal(edited.at('evidence', 0.5), edited.dur * 0.5);
});

test('fitScenesToAudio hits the requested total within rounding', () => {
  const fitted = fitScenesToAudio(DEFAULT_SCENES, 120);
  const sum = fitted.reduce((n, s) => n + s.durationSec, 0);
  assert.ok(Math.abs(sum - 120) < 1.5, `sum ${sum}`);
});

test('heartbeat accelerates and sfx stay inside the film', () => {
  const beats = beatFrames(270);
  assert.ok(beats.length > 8);
  assert.ok(beats[1] - beats[0] > beats[beats.length - 1] - beats[beats.length - 2]);
  const total = totalFrames(DEFAULT_SCENES);
  buildSfx(DEFAULT_SCENES).forEach((c) => assert.ok(c.from >= 0 && c.from < total, c.file));
});
