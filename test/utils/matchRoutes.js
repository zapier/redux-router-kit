import test from 'ava';
import 'babel-core/register';
import matchRoutes from 'redux-router-kit/src/utils/matchRoutes';

const routes = {
  '/users': 'users',
  '/users/:id': 'user',
  '/todos': {
    name: 'todos',
    routes: {
      ':id': {
        name: 'todo'
      }
    }
  },
  '/things': {
    name: 'things',
    routes: {
      '/things/:id': {
        name: 'thing'
      }
    }
  }
};

const createObjectWithoutPrototype = (obj) => {
  const newObj = Object.create(null);
  Object.keys(obj).forEach(key => {
    newObj[key] = obj[key];
  });
  return newObj;
};

test('simple route', t => {

  const routeMatch = matchRoutes(routes, '/users');

  t.is(routeMatch.routes[0].name, routes['/users']);
  t.same(routeMatch.key, ['/users']);

  const routeNoMatch = matchRoutes(routes, '/losers');

  t.is(routeNoMatch, null);
});

test('optional trailing slash', t => {

  const routeMatch = matchRoutes(routes, '/users/');

  t.is(routeMatch.routes[0].name, routes['/users']);
  t.same(routeMatch.key, ['/users']);
});

test('route with params', t => {

  const routeMatch = matchRoutes(routes, '/users/joe');

  t.same(routeMatch.params, {id: 'joe'});
});

test('route with query', t => {

  const routeMatch = matchRoutes(routes, '/users?q=joe');

  t.same(routeMatch.query, createObjectWithoutPrototype({q: 'joe'}));
});

test('route with hash', t => {

  const routeMatch = matchRoutes(routes, '/users#joe');

  t.same(routeMatch.key, ['/users']);
});

test('route with hash and query', t => {

  const routeMatch = matchRoutes(routes, '/users?q=joe#foo');

  t.same(routeMatch.query, createObjectWithoutPrototype({q: 'joe'}));
  t.same(routeMatch.key, ['/users']);
});

test('nested route', t => {

  const routeMatch = matchRoutes(routes, '/todos/123');

  t.same(routeMatch.key, ['/todos', ':id']);
});

test('absolute nested route', t => {

  const routeMatch = matchRoutes(routes, '/things/123');

  t.same(routeMatch.key, ['/things', '/things/:id']);
});

test('parent route', t => {
  const routeMatch = matchRoutes({
    '/todos': {
      name: 'todos',
      routes: {
        ':id': {
          name: 'todo'
        }
      }
    }
  }, '/todos');
  t.same(routeMatch.key, ['/todos']);
});

test('match index route', t => {
  const routeMatch = matchRoutes({
    '/todos': {
      name: 'todos',
      routes: {
        '.': {
          name: 'todos-index'
        },
        ':id': {
          name: 'todo'
        }
      }
    }
  }, '/todos');
  t.same(routeMatch.key, ['/todos', '.']);
});

test('match index route at root', t => {
  const routeMatch = matchRoutes({
    '/': {
      name: 'root',
      routes: {
        '.': {
          name: 'home'
        },
        'todos': {
          name: 'todos'
        }
      }
    }
  }, '/');
  t.same(routeMatch.key, ['/', '.']);
});

test('match unknown route at root', t => {
  const routeMatch = matchRoutes({
    '/': {
      name: 'root',
      routes: {
        'todos': {
          name: 'todos'
        },
        '*': {
          name: 'unknown'
        }
      }
    }
  }, '/todo');
  t.same(routeMatch.key, ['/', '*']);
});
