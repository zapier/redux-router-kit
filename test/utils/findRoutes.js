import test from 'ava';
import 'babel-core/register';

import findRoutes from 'redux-router-kit/src/utils/findRoutes';

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

test('find top-level route', t => {
  const routeList = findRoutes(routes, ['/users']);
  t.ok(routeList);
  t.is(routeList.length, 1);
  t.is(routeList[0].name, 'users');
});

test('find nested route', t => {
  const routeList = findRoutes(routes, ['/todos', ':id']);
  t.ok(routeList);
  t.is(routeList.length, 2);
  t.is(routeList[0].name, 'todos');
  t.is(routeList[1].name, 'todo');
});

test('find top-level route with string key', t => {
  const routeList = findRoutes(routes, '/users');
  t.ok(routeList);
  t.is(routeList.length, 1);
  t.is(routeList[0].name, 'users');
});

test('missing top-level route', t => {
  const routeList = findRoutes(routes, ['/losers']);
  t.notOk(routeList);
});

test('missing nested route', t => {
  const routeList = findRoutes(routes, ['/todos', ':tid']);
  t.notOk(routeList);
});
