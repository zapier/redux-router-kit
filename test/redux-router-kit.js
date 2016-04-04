import test from 'ava';

import 'babel-core/register';

test('can import redux-router-kit without errors', t => {
  require('src');
  t.pass();
});
