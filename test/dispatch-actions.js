import test from 'ava';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';

import 'babel-core/register';

import routerReducer from 'redux-router-kit/src/reducer';
import createRouterMiddleware from 'redux-router-kit/src/middleware/createRouterMiddleware';
import { routeTo } from 'redux-router-kit/src/Actions';
import findRoutes from 'redux-router-kit/src/utils/findRoutes';

const reducer = combineReducers({
  router: routerReducer
});

const routes = ({
  '/todos': {
    name: 'todos',
    assign() {
      return {
        isTodosRoute: true
      };
    },
    routes: {
      ':id': {
        name: 'todo'
      }
    }
  },
});

const createStoreWithMiddleware = compose(
  applyMiddleware(
    createRouterMiddleware({routes})
  )
)(createStore);

test('dispatch routeTo', t => {
  const store = createStoreWithMiddleware(reducer);
  const result = store.dispatch(routeTo('/todos'));
  let router = store.getState().router;
  t.is(router.next.url, '/todos');
  t.is(router.current, null);
  return result
    .then(() => {
      router = store.getState().router;
      t.is(router.current.url, '/todos');
      const routeList = findRoutes(routes, router.current.routeKey);
      t.is(routeList[0].name, 'todos');
      t.true(router.current.isTodosRoute);
    });
});

// test('dispatch routeTo for nested route', t => {
//   const store = createStoreWithMiddleware(reducer);
//   store.dispatch(routeTo('/todos/123'))
//     .then(() => {
//       const router = store.getState().router;
//       t.is(router.current.url, '/todos/123');
//       t.same(router.current.params, {id: '123'});
//       const routeList = findRoutes(routes, router.current.routeKey);
//       t.is(routeList[0].name, 'todos');
//       t.is(routeList[1].name, 'todo');
//     });
// });

test('dispatch routeTo with state', t => {
  const store = createStoreWithMiddleware(reducer);
  const result = store.dispatch(routeTo('/todos', {
    state: {count: 100}
  }));
  let router = store.getState().router;
  t.is(router.next.url, '/todos');
  t.same(router.next.state, {count: 100});
  t.is(router.current, null);
  return result
    .then(() => {
      router = store.getState().router;
      t.is(router.current.url, '/todos');
      t.same(router.current.state, {count: 100});
    });
});

test('dispatch to same as current url should be no-op', t => {
  const store = createStoreWithMiddleware(reducer);
  return store.dispatch(routeTo('/todos'))
    .then(() => {
      return store.dispatch(routeTo('/todos'));
    })
    .then(() => {
      const router = store.getState().router;
      t.is(router.previous, null);
    });
});

test('dispatch with right-click should be no-op', t => {
  const store = createStoreWithMiddleware(reducer);
  return Promise.resolve(
    store.dispatch(
      routeTo('/todos', {
        event: {
          button: 2
        }
      })
    )
  )
    .then(() => {
      const router = store.getState().router;
      t.is(router.current, null);
    });
});

test('dispatch with meta-click should be no-op', t => {
  const store = createStoreWithMiddleware(reducer);
  return Promise.resolve(
    store.dispatch(
      routeTo('/todos', {
        event: {
          metaKey: true
        }
      })
    )
  )
    .then(() => {
      const router = store.getState().router;
      t.is(router.current, null);
    });
});

test('dispatch to same as current url with new state should not be a no-op', t => {
  const store = createStoreWithMiddleware(reducer);
  return store.dispatch(routeTo('/todos', {
    state: {
      count: 100
    }
  }))
    .then(() => {
      return store.dispatch(routeTo('/todos', {
        state: {
          count: 200
        }
      }));
    })
    .then(() => {
      const router = store.getState().router;
      t.same(router.previous.state, {count: 100});
      t.same(router.current.state, {count: 200});
    });
});

test('dispatch to same as next url should be no-op', t => {
  const store = createStoreWithMiddleware(reducer);
  store.dispatch(routeTo('/todos'));
  let router = store.getState().router;
  const routeId = router.next._routeId;
  store.dispatch(routeTo('/todos'));
  router = store.getState().router;
  t.is(router.next._routeId, routeId);
});
