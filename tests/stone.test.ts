import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, statSync} from 'node:fs';
import {STONE_SCENES, STONE_SCENES_TR} from '../src/stone/config';
import {keysFor} from '../src/stone/i18n';
import {buildTiming, sceneFrames, totalFrames} from '../src/lib/timing';
import {buildStoneSfx} from '../src/stone/sfx';

test('storyboard timings: 20/25/30/35/40/35/35 s = 3:40 at 30 fps', () => {
  assert.deepEqual(STONE_SCENES.map((s) => s.durationSec), [20, 25, 30, 35, 40, 35, 35]);
  assert.equal(totalFrames(STONE_SCENES), 6600);
});

test('[pause:x] adds silence, is not shown in subtitles and ends the cue', () => {
  const base = {...STONE_SCENES[0], leadSec: 0, tailSec: 0, durationSec: 20};
  const a = buildTiming({...base, narration: 'One two three. Four five six.'});
  const b = buildTiming({...base, narration: 'One two three. [pause:4] Four five six.'});
  assert.equal(b.words.length, a.words.length);
  assert.ok(b.words.every((w) => !w.text.includes('pause')));
  const gap = b.words[3].start - b.words[2].end;
  assert.ok(gap >= 3.9 * 30, `gap ${gap} frames`);
  assert.equal(b.cues.length, 2);
});

test('narration fits each scene and keywords used by the scenes exist', () => {
  const must: Record<string, string[]> = {
    wake: ['houses', 'phones', 'electricity', 'trees', 'biggest'],
    wrong: ['Modern', 'thousands', 'supermarket', 'plus'],
    locals: ['skills', 'landscape', 'tracks', 'tools', 'restaurant', 'louder'],
    food: ['stomach', 'shops', 'snacks', 'apps', 'Finding', 'Archaeologists', 'fridge'],
    wolf: ['notice', 'watching', 'Suddenly', 'Out', 'back', 'Wolves'],
    learn: ['Make', 'Shape', 'Build', 'Share', 'reconstruct'],
    night: ['flute', 'tomorrow', 'hotline'],
  };
  for (const s of STONE_SCENES) {
    const tm = buildTiming(s);
    assert.ok(tm.words.at(-1)!.end <= sceneFrames(s), `${s.id} overruns`);
    for (const kw of must[s.id]) assert.notEqual(tm.find(kw), undefined, `${s.id}: "${kw}" missing`);
  }
});

test('the supplied character artwork and derived sprites are present', () => {
  for (const f of ['assets/character-source.jpg', 'public/stone/character.png', 'public/stone/head.png']) {
    assert.ok(existsSync(f) && statSync(f).size > 5000, f);
  }
});

test('stone sfx reference generated files and stay inside the film', () => {
  const total = totalFrames(STONE_SCENES);
  for (const c of buildStoneSfx(STONE_SCENES)) {
    assert.ok(c.from < total, `${c.file} @${c.from}`);
    assert.ok(existsSync(`public/${c.dir ?? 'audio'}/${c.file}`), `${c.dir}/${c.file}`);
  }
});

test('measured sentence times from the recording drive the timing exactly', () => {
  for (const s of STONE_SCENES) {
    assert.ok(s.sentenceSec && s.sentenceSec.length > 0, `${s.id} has measured sentences`);
    const tm = buildTiming(s);
    assert.ok(Math.abs(tm.words[0].start - s.sentenceSec![0][0] * 30) < 1, `${s.id} first word`);
    assert.ok(Math.abs(tm.words.at(-1)!.end - s.sentenceSec!.at(-1)![1] * 30) < 1, `${s.id} last word`);
    // sentences are in order and never overlap
    s.sentenceSec!.forEach(([a, b], i) => {
      assert.ok(b > a);
      if (i) assert.ok(a > s.sentenceSec![i - 1][1]);
    });
  }
  assert.ok(existsSync('public/stone/audio/voiceover.mp3'));
});

const MUST: Record<string, string[]> = {
  wake: ['houses', 'phones', 'electricity', 'trees', 'biggest'],
  wrong: ['Modern', 'thousands', 'supermarket', 'plus'],
  locals: ['skills', 'landscape', 'tracks', 'tools', 'restaurant', 'louder'],
  food: ['stomach', 'shops', 'snacks', 'apps', 'Finding', 'Archaeologists', 'fridge'],
  wolf: ['notice', 'watching', 'Suddenly', 'Out', 'back', 'Wolves'],
  learn: ['Make', 'Shape', 'Build', 'Share', 'reconstruct'],
  night: ['flute', 'tomorrow', 'hotline'],
};

test('Turkish version: same 40 sentences, measured times, and every cue word is found in the narration', () => {
  assert.deepEqual(STONE_SCENES_TR.map((s) => s.id), STONE_SCENES.map((s) => s.id));
  let n = 0;
  for (const s of STONE_SCENES_TR) {
    const tm = buildTiming(s);
    assert.ok(s.sentenceSec && s.sentenceSec.length > 0, `${s.id} has measured sentences`);
    n += s.sentenceSec!.length;
    assert.equal(s.sentenceSec!.length, STONE_SCENES.find((e) => e.id === s.id)!.sentenceSec!.length, `${s.id} sentence count matches English`);
    const keys = keysFor('tr', tm);
    for (const kw of MUST[s.id]) assert.notEqual(keys.find(kw, kw === 'never' ? 1 : 0), undefined, `${s.id}: "${kw}" not found in Turkish narration`);
    assert.ok(tm.words.at(-1)!.end <= sceneFrames(s));
  }
  assert.equal(n, 40);
  assert.ok(existsSync('public/stone/audio/voiceover-tr.mp3'));
});

test('Turkish cue words come in the same story order as English', () => {
  for (const s of STONE_SCENES_TR) {
    const tm = buildTiming(s);
    const keys = keysFor('tr', tm);
    const order = MUST[s.id].map((k) => keys.find(k) ?? -1);
    if (s.id === 'wolf') order.splice(0, 2); // notice/watching are one phrase; their relative order may differ by language
    assert.deepEqual([...order].sort((a, b) => a - b), order, `${s.id} cue order`);
  }
});

test('Turkish sfx stay inside the film', () => {
  const total = totalFrames(STONE_SCENES_TR);
  for (const c of buildStoneSfx(STONE_SCENES_TR, 'tr')) assert.ok(c.from < total, `${c.file}@${c.from}`);
});
