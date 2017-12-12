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
import createReactClass from 'create-react-class';

test('render route to string', t => {
  const Home = createReactClass({
    render() {
      return <div>Home</div>;
    },
  });
  const routes = {
    '/': Home,
  };
  const store = createStore(
    combineReducers({
      router: routerReducer,
    }),
    applyMiddleware(createRouterMiddleware({ routes }))
  );
  return store.dispatch(routeTo('/')).then(() => {
    const htmlString = renderToStaticMarkup(
      <Provider store={store}>
        <RouterContainer routes={routes} />
      </Provider>
    );
    t.is(htmlString, '<div>Home</div>');
  });
});

test('render async route to string', t => {
  const Home = createReactClass({
    render() {
      return <div>Home</div>;
    },
  });
  const Todos = createReactClass({
    render() {
      return <div>Todos</div>;
    },
  });
  let routes = {
    '/': Home,
    '/todos': {
      fetch: () => {
        return Promise.resolve({
          component: Todos,
        });
      },
    },
  };
  const routerMiddleware = createRouterMiddleware({ routes });
  const store = createStore(
    combineReducers({
      router: routerReducer,
    }),
    applyMiddleware(routerMiddleware)
  );
  routerMiddleware.onRoutesChanged(newRoutes => {
    routes = newRoutes;
  });
  return store.dispatch(routeTo('/todos')).then(() => {
    const htmlString = renderToStaticMarkup(
      <Provider store={store}>
        <RouterContainer routes={routes} />
      </Provider>
    );
    t.is(htmlString, '<div>Todos</div>');
  });
});
