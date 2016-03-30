import test from 'ava';
import 'babel-core/register';
import _mapUrlToRoute from '../../src/utils/mapUrlToRoute';

// Tweak mapUrlToRoute until t.same is relaxed in ava.
const mapUrlToRoute = (...args) => {
  const routeMatch = _mapUrlToRoute(...args);
  if (routeMatch && routeMatch.query) {
    routeMatch.query = JSON.parse(JSON.stringify(routeMatch.query));
  }
  return routeMatch;
};

const routes = {
  '/users': 'users',
  '/users/:id': 'user'
};

test('simple route', t => {

  const routeMatch = mapUrlToRoute('/users', routes);

  t.is(routeMatch.match, routes['/users']);
  t.is(routeMatch.route, '/users');

  const routeNoMatch = mapUrlToRoute('/losers', routes);

  t.is(routeNoMatch, null);
});

test('route with params', t => {

  const routeMatch = mapUrlToRoute('/users/joe', routes);

  t.same(routeMatch.params, {id: 'joe'});
});

test('route with query', t => {

  const routeMatch = mapUrlToRoute('/users?q=joe', routes);

  t.same(routeMatch.query, {q: 'joe'});
});
