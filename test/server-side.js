import test from 'ava';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import 'babel-core/register';

import routerReducer from 'redux-router-kit/src/reducer';
import createRouterMiddleware from 'redux-router-kit/src/middleware/createRouterMiddleware';
import { routeTo } from 'redux-router-kit/src/Actions';
import Router from 'redux-router-kit/src/components/Router';

test('render route to string', t => {
  const Home = React.createClass({
    render() {
      return <div>Home</div>;
    }
  });
  const routes = {
    '/': Home
  };
  const store = createStore(
    combineReducers({
      router: routerReducer
    }),
    applyMiddleware(
      createRouterMiddleware({routes})
    )
  );
  return store.dispatch(routeTo('/'))
    .then(() => {
      const htmlString = renderToStaticMarkup(
        <Provider store={store}>
          <Router router={store.getState().router} routes={routes}/>
        </Provider>
      );
      t.is(htmlString, '<div>Home</div>');
    });
});
