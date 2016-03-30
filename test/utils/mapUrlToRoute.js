import test from 'ava';
import 'babel-core/register';
import mapUrlToRoute from '../../src/utils/mapUrlToRoute';

test('simple route', t => {

  const routes = {'/users': 'users'};

  const routeMatch = mapUrlToRoute('/users', routes);

  t.is(routeMatch.match, 'users');

  const routeNoMatch = mapUrlToRoute('/losers', routes);

  t.is(routeNoMatch, null);
});
