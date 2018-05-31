import test from 'ava';

import 'babel-core/register';
import statesAreEqual from '../../src/utils/statesAreEqual';

test('null equal null', t => {
  t.true(statesAreEqual(null, null));
});

test('null not equal object', t => {
  t.false(statesAreEqual(null, {}));
});

test('object not equal null', t => {
  t.false(statesAreEqual({}, null));
});

test('object equals similar object', t => {
  t.true(statesAreEqual({x: 1}, {x: 1}));
});

test('object not equal different object', t => {
  t.false(statesAreEqual({x: 1}, {x: 2}));
});
