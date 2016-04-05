import test from 'ava';

import 'babel-core/register';

import reducer from 'redux-router-kit/src/reducer';
import { ROUTE_TO_NEXT, ROUTE_TO } from 'redux-router-kit/src/ActionTypes';

const createRouteAction = (options) => ({
  type: options.type,
  payload: {
    replace: !!options.replace
  },
  meta: {
    state: {},
    _routeId: options._routeId,
    routeKey: options.routeKey || options.url,
    url: options.url,
    location: {
      href: `https://example.com${options.url}`,
      origin: 'https://example.com'
    }
  }
});

const createRouteToNextAction = (options) => createRouteAction({
  type: ROUTE_TO_NEXT,
  ...options
});

const createRouteToAction = (options) => createRouteAction({
  type: ROUTE_TO,
  ...options
});

test('initial state', t => {
  const state = reducer();
  t.same(state, {
    current: null,
    previous: null,
    next: null
  });
});

test('route to next', t => {
  let state = reducer();
  state = reducer(state, createRouteToNextAction({
    _routeId: 1,
    url: '/users'
  }));
  t.is(state.previous, null);
  t.is(state.current, null);
  t.is(state.next.url, '/users');
  t.is(state.next._routeId, 1);
  t.is(state.next.location.origin, 'https://example.com');
});

test('route to', t => {
  let state = reducer();
  state = reducer(state, createRouteToNextAction({
    _routeId: 1,
    url: '/users'
  }));
  state = reducer(state, createRouteToAction({
    _routeId: 1,
    url: '/users'
  }));

  t.is(state.previous, null);
  t.is(state.next, null);
  t.is(state.current.url, '/users');
  t.is(state.current._routeId, 1);
  t.is(state.current.location.origin, 'https://example.com');

  state = reducer(state, createRouteToAction({
    _routeId: 2,
    url: '/users/joe'
  }));

  t.is(state.current.url, '/users/joe');
  t.is(state.current._routeId, 2);
  t.is(state.current.location.origin, 'https://example.com');
  t.is(state.previous.url, '/users');
  t.is(state.previous._routeId, 1);
  t.is(state.previous.location.origin, 'https://example.com');
});

test('replace', t => {
  let state = reducer();
  state = reducer(state, createRouteToAction({
    _routeId: 1,
    url: '/users'
  }));
  state = reducer(state, createRouteToAction({
    _routeId: 2,
    url: '/users/joe'
  }));
  state = reducer(state, createRouteToAction({
    _routeId: 3,
    url: '/users/joseph',
    replace: true
  }));
  t.is(state.current.url, '/users/joseph');
  t.is(state.previous.url, '/users');
});
