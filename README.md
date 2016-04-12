# Redux Router Kit

[![travis](https://travis-ci.org/zapier/redux-router-kit.svg?branch=master)](https://travis-ci.org/zapier/redux-router-kit)

Redux Router Kit is a routing solution for React that leverages Redux to store routing and transition states and enable powerful middleware and `connect`-powered components.

## Features

- Routing state lives in the store just like any other state.
- Redux middleware has full access to routing and transition state along with your other store state.
- The built-in onLeave/onEnter hooks have access to store state and `dispatch`. onLeave/onEnter hooks can easily see the current and next routing state.
- Use `connect` to grab routing state anywhere in your component tree, just like other Redux store state.
- Because transition states live in the store, you can render transition states or otherwise react to transition states in your React components.
- Fetching routes asynchronously also exposes state in the store.
- Even though routes can be fetched asynchronously, you can still easily work with the currently available routes synchronously.
- Fall-through to server rendering for unmatched routes.
- Ability to force server-rendering when needed.

## Install

```bash
npm install redux-router-kit --save
```

## Basic usage

```js
import ReactDOM from 'react-dom';
import { combineReducers, applyMiddleware, Provider } from 'react-redux';
import {
  routerReducer, createRouterMiddleware, RouterContainer
} from 'redux-router-kit';

const HomePage = () => (
  <div>Home!</div>
);

// Params are automatically passed as props.
const TodoApp = ({id}) => (
  id ? (
    <div>Todo: {id}</div>
  ) : (
    <div>Todos: {/* list todos */}</div>
  )
);

// You can point route paths directly to components in simple cases.
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
      <RouterContainer routes={routes}/>
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

## Nested routes

```js
const Layout = ({children}) => (
  <div>
    <header>The Header</header>
    <div>{children}</div>
  </div>
);

const HomePage = () => (
  <div>Home!</div>
);

const TodoApp = ({children}) => (
  <div>{children}</div>
);

const TodoList = () => (
  <div>Todos: {/* list todos */}</div>
);

const TodoItem = ({id}) => (
  <div>Todo: {id}</div>
);

const routes = {
  '/': {
    component: Layout,
    routes: {
      // This is the "index" route. (Like a current directory.)
      '.': {
        component: HomePage
      },
      '/todos': {
        component: TodoApp,
        routes: {
          '.': {
            component: TodoList
          },
          ':id': {
            component: TodoItem
          }
        }
      }
    }
  }
};
```

## Routing component props

Components rendered by routes receive the following props:

### `router`

This is the current routing state.

### `matchedRoutes`

An array of matched routes.

### `route`

The specific route being rendered.

### `matchedRouteIndex`

The index of the route in the `matchedRoutes`.

## Links

When you use `RouterContainer`, it responds to click/touch events so routing actions are automatically triggered. So you don't have to use a special `<Link>` component. A normal `<a>` will work just fine.

## Routing actions

If you do want to manually trigger routing actions, you can either manually wire up the action with `connect`:

```js
import { routeTo } from 'redux-router-kit';

const AddTodoButton = ({routeTo}) => (
  <button onClick={() => routeTo('/todos/new')}>Add New Todo</button>
);

const ConnectedAddTodoButton = connect(
  null,
  (dispatch) => {
    routeTo(..args) {
      dispatch(routeTo(...args));
    }
  }
)(AddTodoButton);
```

Or you can use the included `connectRouterActions` to add the actions as props.

```js
import { connectRouterActions } from 'redux-router-kit';

const AddTodoButton = ({routeTo}) => (
  <button onClick={() => routeTo('/todos/new')}>Add New Todo</button>
);

const ConnectedAddTodoButton = connectRouterActions(AddTodoButton);
```

## Routing state
