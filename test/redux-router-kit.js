import test from 'ava';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import React from 'react';
import ReactDOM from 'react-dom';
import { render } from 'react-dom';
import { createStore, combineReducers, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

import 'babel-core/register';

import routerReducer from 'redux-router-kit/src/reducer';
import createRouterMiddleware from 'redux-router-kit/src/middleware/createRouterMiddleware';
import { routeTo } from 'redux-router-kit/src/Actions';
import RouterContainer from 'redux-router-kit/src/components/RouterContainer';

const reducer = combineReducers({
  router: routerReducer
});

test('can import redux-router-kit without errors', t => {
  require('redux-router-kit');
  t.pass();
});

test('can render route', t => {
  return new Promise((resolve) => {

    const node = document.createElement('div');
    document.body.appendChild(node);

    const Home = React.createClass({
      componentDidMount() {
        const homeNode = node.childNodes[0];
        t.is(homeNode.textContent, 'hello');
        resolve();
      },
      render() {
        return <div>hello</div>;
      }
    });

    const routes = {
      '/': Home
    };

    const createStoreWithMiddleware = compose(
      applyMiddleware(
        createRouterMiddleware({routes})
      )
    )(createStore);

    const history = createMemoryHistory();
    const store = createStoreWithMiddleware(reducer);

    render(
      <Provider store={store}>
        <RouterContainer routes={routes} history={history}/>
      </Provider>,
      node
    );
  });
});

test('can change query parameter of route', t => {

  const node = document.createElement('div');
  document.body.appendChild(node);

  const Home = React.createClass({
    componentDidMount() {
    },
    render() {
      const { router } = this.props;
      return <div>{router.current.query.x}</div>;
    }
  });

  const routes = {
    '/': Home
  };

  const createStoreWithMiddleware = compose(
    applyMiddleware(
      createRouterMiddleware({routes})
    )
  )(createStore);

  const history = createMemoryHistory();
  const store = createStoreWithMiddleware(reducer);

  render(
    <Provider store={store}>
      <RouterContainer routes={routes} history={history}/>
    </Provider>,
    node
  );

  return store.dispatch(routeTo('/?x=1'))
    .then(() => {
      const homeNode = node.childNodes[0];
      t.is(homeNode.textContent, '1');
    });
});

test('can throw exception', t => {

  const node = document.createElement('div');
  document.body.appendChild(node);

  const Home = React.createClass({
    componentDidMount() {
      const { router } = this.props;
      if (!router.next && router.current && router.current.query.x === '1') {
        const x = y;
      }
    },
    render() {
      const { router } = this.props;
      return <div>{router.current.query.x}</div>;
    }
  });

  const routes = {
    '/': Home
  };

  const createStoreWithMiddleware = compose(
    applyMiddleware(
      createRouterMiddleware({
        routes,
        batchedUpdates: ReactDOM.unstable_batchedUpdates
      })
    )
  )(createStore);

  const history = createMemoryHistory();
  const store = createStoreWithMiddleware(reducer);

  render(
    <Provider store={store}>
      <RouterContainer routes={routes} history={history}/>
    </Provider>,
    node
  );

  return store.dispatch(routeTo('/?x=1'))
    .then(() => {
      const homeNode = node.childNodes[0];
      t.is(homeNode.textContent, '1');
    })
    .catch(() => {
      return true;
    })
    .then((hadException) => {
      t.true(hadException);
    });
});

test('can render nested routes', t => {

  const node = document.createElement('div');
  document.body.appendChild(node);

  const TodoApp = React.createClass({
    render() {
      return <div>{this.props.children}</div>;
    }
  });

  const TodoEditor = React.createClass({
    render() {
      return <div className="todo">{this.props.params.id}</div>;
    }
  });

  const routes = {
    '/todos': {
      component: TodoApp,
      routes: {
        ':id': {
          component: TodoEditor
        }
      }
    }
  };

  const createStoreWithMiddleware = compose(
    applyMiddleware(
      createRouterMiddleware({routes})
    )
  )(createStore);

  const history = createMemoryHistory();
  const store = createStoreWithMiddleware(reducer);

  render(
    <Provider store={store}>
      <RouterContainer routes={routes} history={history}/>
    </Provider>,
    node
  );

  return store.dispatch(routeTo('/todos/123'))
    .then(() => {
      const todoNodes = node.getElementsByClassName('todo');
      t.ok(todoNodes);
      t.is(todoNodes[0].textContent, '123');
    });
});

test('can render nested routes with named components', t => {

  const node = document.createElement('div');
  document.body.appendChild(node);

  const TodoApp = React.createClass({
    render() {
      return <div>{this.props.todo}</div>;
    }
  });

  const TodoEditor = React.createClass({
    render() {
      return <div className="todo">{this.props.params.id}</div>;
    }
  });

  const routes = {
    '/todos': {
      components: {todo: TodoApp},
      routes: {
        ':id': {
          component: TodoEditor
        }
      }
    }
  };

  const createStoreWithMiddleware = compose(
    applyMiddleware(
      createRouterMiddleware({routes})
    )
  )(createStore);

  const history = createMemoryHistory();
  const store = createStoreWithMiddleware(reducer);

  render(
    <Provider store={store}>
      <RouterContainer routes={routes} history={history}/>
    </Provider>,
    node
  );

  return store.dispatch(routeTo('/todos/123'))
    .then(() => {
      const todoNodes = node.getElementsByClassName('todo');
      t.ok(todoNodes);
      t.is(todoNodes[0].textContent, '123');
    });
});
