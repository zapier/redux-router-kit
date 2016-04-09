import test from 'ava';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import React from 'react';
import { render } from 'react-dom';
import sinon from 'sinon';

import 'babel-core/register';

import History from 'redux-router-kit/src/components/History';

test('History calls onChange for new history push', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  t.false(onChangeSpy.called);
  history.push('/hello');
  t.true(onChangeSpy.called);
  t.same(onChangeSpy.lastCall.args, ['/hello', null]);
});

test('History calls onChange with state for new history push', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  t.false(onChangeSpy.called);
  history.push({pathname: '/hello', state: {name: 'Jane'}});
  t.true(onChangeSpy.called);
  t.same(onChangeSpy.lastCall.args, ['/hello', {name: 'Jane'}]);
});

test('History changes when new url is passed to history', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  const onLocationChangeSpy = sinon.spy();
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  history.listen(onLocationChangeSpy);
  render(
    <History history={history} onChange={onChangeSpy} url="/hello"/>,
    node
  );
  t.false(onChangeSpy.called);
  t.true(onLocationChangeSpy.called);
  t.is(onLocationChangeSpy.lastCall.args[0].pathname, '/hello');
});

test('History changes when new url and state is passed to history', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  const onLocationChangeSpy = sinon.spy();
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  history.listen(onLocationChangeSpy);
  render(
    <History history={history} onChange={onChangeSpy} url="/hello" state={{name: 'Jane'}}/>,
    node
  );
  t.false(onChangeSpy.called);
  t.true(onLocationChangeSpy.called);
  t.is(onLocationChangeSpy.lastCall.args[0].pathname, '/hello');
  t.same(onLocationChangeSpy.lastCall.args[0].state, {name: 'Jane'});
});

test('History sends current lcoation in callback', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  render(
    <History history={history} onChange={onChangeSpy} url={null}/>,
    node
  );
  t.true(onChangeSpy.called);
  t.same(onChangeSpy.lastCall.args, ['/', null]);
});

test('History changes when link is clicked', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  render(
    <div>
      <History history={history} onChange={onChangeSpy} url="/"/>
      <a id="hello" href="/hello">Hello</a>
    </div>,
    node
  );
  t.false(onChangeSpy.called);
  let mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.true(onChangeSpy.called);
  t.same(onChangeSpy.lastCall.args, ['https://example.com/hello']);
});

test('History has no change for right and meta clicks', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  render(
    <div>
      <History history={history} onChange={onChangeSpy} url="/"/>
      <a id="hello" href="/hello">Hello</a>
    </div>,
    node
  );
  let mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    metaKey: true
  });
  document.getElementById('hello').dispatchEvent(mouseEvent);
  mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
    button: 2
  });
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.false(onChangeSpy.called);
});

test('History pops state', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  history.push({pathname: '/hello', state: {x: 1}});
  render(
    <History history={history} onChange={onChangeSpy} url="/hello" state={{x: 1}}/>,
    node
  );
  history.push({pathname: '/bye', state: {x: 2}});
  render(
    <History history={history} onChange={onChangeSpy} url="/bye" state={{x: 2}}/>,
    node
  );
  history.goBack();
  t.same(onChangeSpy.lastCall.args, ['/hello', {x: 1}]);
});

test('Allow cancelling a change', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChangeSpy = sinon.spy();
  const onListenSpy = sinon.spy();
  history.listen(onListenSpy);
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  history.push({pathname: '/hello'});
  render(
    <History history={history} onChange={onChangeSpy} url="/"/>,
    node
  );
  t.is(onListenSpy.callCount, 3);
  t.is(onListenSpy.lastCall.args[0].pathname, '/');
});
