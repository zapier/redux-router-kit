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

## Why not React Router?

If the features above aren't useful, by all means, use React Router instead! It's battle-tested, and Redux Router Kit borrows its concepts heavily! Redux Router Kit is an alternative that gives tighter integration with Redux.

## Is this thing ready?

Well, it's been used in production for https://zapier.com for a while now. So for us, it's ready. :-) For your use case, you may find edges. If so, let us know!

## Install

```bash
npm install redux-router-kit --save
```

## Basic usage

```js
import ReactDOM from 'react-dom';
import { combineReducers, applyMiddleware, Provider } from 'react-redux';
import {
  routerReducer, createRouterMiddleware, RouterHistoryContainer
} from 'redux-router-kit';

const HomePage = () => (
  <div>Home!</div>
);

const TodoApp = ({params}) => (
  params.id ? (
    <div>Todo: {params.id}</div>
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

const Root = createReactClass({
  render() {
    return (
      <RouterHistoryContainer routes={routes}/>
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

## Nested routes, onLeave/onEnter, and assign

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

const TodoItem = ({params}) => (
  <div>Todo: {params.id}</div>
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
            component: TodoList,
            assign({query}) {
              if (query.page) {
                // Return any properties for `routing.next`/`routing.current`.
                // These can be new ad-hoc properties, or modifications of
                // params or query.
                return {
                  query: {
                    ...query,
                    // Convert page to an integer.
                    page: parseInt(query.page)
                  }
                };
              }
            }
          },
          'new': {
            onEnter({routeTo}) {
              // This might be a terrible example, if this is slow.
              return createTodo()
                .then(todo => {
                  routeTo(`/todos/${todo.id}`);
                })
            }
          },
          ':id': {
            component: TodoItem,
            onLeave({router, cancelRoute, getState, dispatch}) {
              const todo = getState().todos[router.current.params.id];
              if (!todo.isSaved) {
                cancelRoute();
                dispatch(notifyToSaveTodo());
              }
            }
          }
        }
      }
    }
  }
};
```

## Router / RouterContainer / RouterHistoryContainer

The Router component requires a `routing` prop with routing state from the store.

The RouterContainer component is connected to the store, and so automatically gets that prop.

The RouterHistoryContainer component adds in a History component to update browser address state and automatically dispatch routing actions when the browser history changes.

All these components accept the following props.

### `routes`

Route mapping object. See the examples above.

### `renderBeforeCurrent({router})`

If there is no current route, this function will be called.

### `render({router, query, params, matchedRoutes})`

If you'd like to take control of all rendering for routes, pass in this function. No other rendering functions will be called. If no routes match, then `matchedRoutes` will be `null`.

###  `renderRoutes({router, query, params, matchedRoutes})`

Like `render`, but only called if there are matchedRoutes.

### `renderDefault({router, query, params, matchedRoutes})`

If the matching routes don't have any components or don't reduce to a single element, this function will be called.

### `renderRoot({router, query, params, matchedRoutes})`

After all components have reduced to a single element (or map of named elements), this function will be called to render any wrapping elements.

### `createElement(Component, {router, query, params, matchedRoutes, route, children})`

For each component in a route, this function is called to return an element to be rendered. If child routes provide named components, named elements will be passed as props instead of `children`.

## Routing component props

Components rendered by routes receive the following props. These will also be passed to `createElement` if you provide that function to `Router`/`RouterContainer`/`RouterHistoryContainer`. (As well as the other render callbacks listed above.)

### `router`

This is the current routing state. An example of the routing state is:

```js
{
  // When the url changes, `current` moves to `previous`.
  previous: {
    url: '/todos/123',
    // ... same properties as current
  },
  current: {
    url: '/todos/123?edit=true',
    query: {
      edit: 'true'
    },
    params: {
      id: 123
    },
    routeKey: ['/todos', ':id'],
    location: {
      host: 'www.example.com',
      pathname: '/todos/123',
      protocol: 'https:',
      // etc., just like browser's location
    },
    replace: false,
    state: null
  },
  // When the url changes, `next` will first get the new value of `current`.
  // Middleware or components can then cancel or redirect. If not canceled
  // or redirected, `current` will then become `next`. If `next` is null,
  // there is no current transition.
  next: null
}
```

### `matchedRoutes`

An array of matched routes.

### `route`

The specific route being rendered.

### `params`

The route parameters.

### `query`

The query parameters.

## Links

When you use `RouterHistoryContainer`, it responds to click/touch events so routing actions are automatically triggered. So you don't have to use a special `<Link>` component. A normal `<a>` will work just fine.

## Routing action creators

### `routeTo(url, {event, replace, exit})`

Returns a `ROUTE_TO_NEXT` action, which, when dispatched, adds `url` to `router.next` state. Calls `onLeave` hooks for any routes which are removed and `onEnter` hooks for any routes which are added.

The route can be canceled with `cancelRoute` or redirected or exited with another `routeTo`.

If `event` is provided, it will be inspected for things like command-click to open new tabs.

If `exit` is provided, the route will roughly be equivalent to:

```js
window.location.href = url
```

(Currently, only absolute urls are supported though.)

### `cancelRoute()`

Cancels the `router.next` route and removes it from state.

## Dispatching routing actions from components

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

If you only need `routeTo` (because you typically don't need `cancelRoute`), then you can use `connectRouteTo` instead.

## Connecting your components to routing state

You can use `connect` to grab any routing state for your components. For example:

```js
const TodoItem = ({query, todo}) => {
  const style = query.theme === 'dark' ? {
    color: 'white',
    backgroundColor: 'black'
  } : {};
  return <div style={style}>{todo.title}</div>;
};

const TodoItemContainer = connect(
  state => ({
    query: state.router.current.query
  })
)(TodoItem);
```

You can also use `connectRouter` to grab _all_ routing state and action creators for your components. For example:

```js
const TodoItem = ({router, todo}) => {
  const style = router.current.query.theme === 'dark' ? {
    color: 'white',
    backgroundColor: 'black'
  } : {};
  return <div style={style}>{todo.title}</div>;
};

const TodoItemContainer = connectRouter(TodoItem);
```

You should only use this if you want your component to be updated for _all_ routing state changes. For example, the second example will update during routing transition, whereas the second will only update when the current route is changed.

## Custom middleware

Here's an example of custom middleware that would require the user to login.

```js
import { ROUTE_TO_NEXT, findRoutes, routeTo } from 'redux-router-kit';

const routes = {
  '/': {
    component: HomePage
  }
  '/me': {
    component: AccountDetails,
    requiresLogin: true
  }
};

const createLoginMiddleware = ({routes}) => {
  const middleware = store => next => action => {
    if (!action || !action.type) {
      return next(action);
    }

    if (!action.type === ROUTE_TO_NEXT) {
      const matchedRoutes = findRoutes(routes, action.meta.routeKey);
      if (matchedRoutes.some(route => route.requiresLogin)) {
        const { account } = store.getState();
        if (!account.isLoggedIn) {
          return dispatch(routeTo('/login'));
        }
      }
    }

    return next(action);
  };
  return middleware;
};

const store = createStore(
  reducer,
  applyMiddleware(
    createRouterMiddleware({routes}),
    createLoginMiddleware({routes})
  )
);
```

## Async route loading

To load routes asynchronously, just add a `fetch` property to your route.

```js
const routes = {
  '/': HomePage,
  '/todos': TodoApp,
  '/developer': {
    // This is a big page, and we don't want it loaded for everyone.
    fetch() {
      return System.import('developerRoutes');
    }
  }
}
```

The result of the fetch will be used in place of that route. The routing table in middleware will be modified with the new route, and the url will be retried against the new routing table. (And any nested async routes will also be fetched.) If you need the routing table outside middleware, you can listen to changes.

```js
const routerMiddleware = createRouterMiddleware({routes});

const store = createStore(
  reducer,
  applyMiddleware(
    routerMiddleware
  )
);

routerMiddleware.onRoutesChanged(routes => {
  // do something with these routes, like pass them to components or other middleware that need them
});
```

If you'd like to be in control of fetching routes, you can pass a `fetchRoute` function into the middleware.

```js
const routes = {
  '/': HomePage,
  '/todos': TodoApp,
  '/developer': {
    // Can be any truthy value.
    fetch: true
  }
}

const fetchRoute = route => {
  // Return fetched route.
};

const routerMiddleware = createRouterMiddleware({routes, fetchRoute});
```

### Async route loading state

While loading async routes, `router.fetch` will be set in state. Because routes aren't yet loaded, the params/etc. will be incomplete.

## Server-side/static rendering

For server-side or static rendering, just use RouterContainer instead of RouterHistoryContainer.

```js
const Home = createReactClass({
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
        <RouterContainer routes={routes}/>
      </Provider>
    );
    // htmlString is now: <div>Home</div>
  });
```

## Thanks!

Redux Router Kit heavily borrows ideas from React Router (https://github.com/reactjs/react-router).

The History component borrows heavily from https://github.com/cerebral/addressbar and https://github.com/christianalfoni/react-addressbar.

Internally, history (https://github.com/mjackson/history) is used, and it's pretty awesome that it's separate from React Router. :-)
