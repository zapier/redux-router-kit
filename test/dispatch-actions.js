import test from 'ava';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';

import 'babel-core/register';

import routerReducer from 'redux-router-kit/src/reducer';
import createRouterMiddleware from 'redux-router-kit/src/middleware/createRouterMiddleware';
import { routeTo } from 'redux-router-kit/src/Actions';

const reducer = combineReducers({
  router: routerReducer
});

const routes = ({
  '/todos': 'todos'
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

test('dispatch to same as next url should be no-op', t => {
  const store = createStoreWithMiddleware(reducer);
  store.dispatch(routeTo('/todos'));
  let router = store.getState().router;
  const routeId = router.next._routeId;
  store.dispatch(routeTo('/todos'));
  router = store.getState().router;
  t.is(router.next._routeId, routeId);
});
