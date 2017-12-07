import test from 'ava';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import 'babel-core/register';

import routerReducer from 'redux-router-kit/src/reducer';
import createRouterMiddleware from 'redux-router-kit/src/middleware/createRouterMiddleware';
import { routeTo } from 'redux-router-kit/src/Actions';
import RouterContainer from 'redux-router-kit/src/components/RouterContainer';

const routes = {
  '/': () => <div>Home</div>
};

const store = createStore(
  combineReducers({
    router: routerReducer
  }),
  applyMiddleware(createRouterMiddleware({ routes, ssrMode: true }))
);

test('render route to string', t => {
  return store.dispatch(routeTo('/')).then(() => {
    const htmlString = renderToStaticMarkup(
      <Provider store={store}>
        <RouterContainer routes={routes} />
      </Provider>
    );

    t.is(htmlString, '<div>Home</div>');
  });
});

test('it should not set the `router.origin` in SSR mode', t => {
  return store.dispatch(routeTo('/')).then(() => {
    t.is(store.getState().router.origin, undefined);
  });
});
