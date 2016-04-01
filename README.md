# Redux Router Kit

[![travis](https://travis-ci.org/zapier/redux-router-kit.svg?branch=master)](https://travis-ci.org/zapier/redux-router-kit)

Redux Router Kit aims to be a _relatively_ minimalistic router that fits well with Redux and React. Some basics are
built-in, but you can stitch together its pieces for a customized solution. It provides:

- Redux action types for routing.
- Redux action creators for routing.
- Redux middleware for some handling of routes, for example onEnter and onLeave hooks.
- Redux reducer for adding routing information to the store state.
- Some utilities, including matching URLs to routes.
- A History component that abstracts the browser's history as a React component.
- A Router component that does maps routes to components.
- Some other etc.

## Install

```bash
npm install redux-router-kit --save
```

## Basic Usage

```js
import ReactDOM from 'react-dom';
import { combineReducers, applyMiddleware, Provider } from 'react-redux';
import {
  routerReducer, createRouterMiddleware, RouterContainer, RouteToBrowserLocation
} from 'redux-router-kit';

import HomePage from './components/HomePage';
import TodoApp from './components/TodoApp';

const routes = {
  '/': HomePage,
  '/todos': TodoApp,
  '/todos/:id': TodoApp
};

const reducer = combineReducers({
  router: routerReducer
});

const store = createStore(
  reducer,
  applyMiddleware(
    createRouterMiddleware({routes})
  )
);

const Root = React.createClass({
  render() {
    return (
      <RouteToBrowserLocation>
        <RouterContainer routes={routes}/>
      </RouteToBrowserLocation>
    )
  }
})

ReactDOM.render(
  <Provider>
    <Root/>
  </Provider>
  document.getElementById('app')
);
```
