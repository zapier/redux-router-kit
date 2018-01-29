import test from 'ava';

import 'babel-core/register';
import cloneRoutesForKey from 'redux-router-kit/src/utils/cloneRoutesForKey';

test('clone empty routes', t => {
  const routes = {};
  const copy = cloneRoutesForKey(routes);
  t.same(routes, copy);
  t.not(routes, copy);
});

test('clone routes with no key', t => {
  const routes = {
    '/': 'home',
  };
  const copy = cloneRoutesForKey(routes);
  t.same(routes, copy);
  t.not(routes, copy);
});

test('clone routes with one key, string value', t => {
  const routes = {
    '/': 'home',
  };
  const copy = cloneRoutesForKey(routes, ['/']);
  t.same(routes, copy);
  t.not(routes, copy);
});

test('clone routes with one key, function value', t => {
  const routes = {
    '/': () => {},
  };
  const copy = cloneRoutesForKey(routes, ['/']);
  t.same(routes, copy);
  t.not(routes, copy);
});

test('clone routes with one key, object value', t => {
  const routes = {
    '/': {
      routes: {
        foo: {},
      },
    },
  };
  const copy = cloneRoutesForKey(routes, ['/']);
  t.same(routes, copy);
  t.not(routes, copy);
  t.is(routes['/'].routes.foo, copy['/'].routes.foo);
});

test('clone routes with two keys, object value', t => {
  const routes = {
    '/': {
      routes: {
        foo: {},
      },
    },
  };
  const copy = cloneRoutesForKey(routes, ['/', 'foo']);
  t.same(routes, copy);
  t.not(routes, copy);
  t.not(routes['/'].routes.foo, copy['/'].routes.foo);
});
