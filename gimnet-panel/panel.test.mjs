import test from 'node:test';
import assert from 'node:assert/strict';
import { applyEdit, getFields, parseValue, findItem } from './panel-model.js';

const net = () => ({
  format: 'GIMNET', version: '0.1', options: { headloss: 'HW' },
  junctions: [{ id: 'J1', x: 0, y: 0, elevation: 50, demand: 10 }],
  reservoirs: [{ id: 'R1', x: 0, y: 0, head: 100 }],
  tanks: [{ id: 'T1', x: 0, y: 0, elevation: 60, init_level: 3, min_level: 1, max_level: 5, diameter: 8000 }],
  pipes: [{ id: 'P1', from: 'R1', to: 'J1', length: 500, diameter: 200, roughness: 130, minor_loss: 0, status: 'OPEN' }],
  results: null,
});

test('five main values are exposed', () => {
  const keys = ['junction', 'pipe'].flatMap((k) => getFields(k, {}).filter((f) => f.main).map((f) => f.key));
  assert.deepEqual(keys, ['elevation', 'demand', 'length', 'diameter', 'roughness']);
});
test('roughness unit follows head loss equation', () => {
  assert.equal(getFields('pipe', { headloss: 'HW' }).find((f) => f.key === 'roughness').unit, '');
  assert.equal(getFields('pipe', { headloss: 'DW' }).find((f) => f.key === 'roughness').unit, 'mm');
});
test('edit updates only the chosen field and does not mutate input', () => {
  const n = net();
  const r = applyEdit(n, 'P1', 'diameter', '250');
  assert.ok(r.ok);
  assert.equal(findItem(r.network, 'P1').item.diameter, 250);
  assert.equal(findItem(r.network, 'P1').item.length, 500);
  assert.equal(n.pipes[0].diameter, 200);
});
test('decimal comma accepted, negative demand accepted', () => {
  assert.equal(applyEdit(net(), 'J1', 'demand', '-2,5').network.junctions[0].demand, -2.5);
});
test('invalid values are rejected and network is unchanged', () => {
  for (const [id, key, text] of [['P1', 'length', '0'], ['P1', 'length', '-3'], ['P1', 'diameter', 'abc'], ['P1', 'roughness', ''], ['P1', 'minor_loss', '-1'], ['J1', 'elevation', 'Infinity'], ['P1', 'status', 'BROKEN']]) {
    const r = applyEdit(net(), id, key, text);
    assert.equal(r.ok, false, `${id}.${key}=${text}`);
    assert.ok(r.error.en && r.error.tr);
  }
});
test('tank levels must stay ordered', () => {
  assert.equal(applyEdit(net(), 'T1', 'init_level', '9').ok, false);
  assert.equal(applyEdit(net(), 'T1', 'init_level', '4').ok, true);
});
test('results are flagged stale, never changed', () => {
  const n = net(); n.results = { solver: {} };
  const r = applyEdit(n, 'J1', 'demand', '12');
  assert.equal(r.resultsStale, true);
  assert.deepEqual(r.network.results, { solver: {} });
});
test('parseValue status', () => {
  assert.ok(parseValue(getFields('pipe', {}).at(-1), 'CV').ok);
});
