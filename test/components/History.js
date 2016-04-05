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
  t.same(onChangeSpy.lastCall.args, ['/hello']);
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
  t.same(onChangeSpy.lastCall.args, ['/']);
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
  var mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.true(onChangeSpy.called);
  t.same(onChangeSpy.lastCall.args, ['https://example.com/hello']);
});
