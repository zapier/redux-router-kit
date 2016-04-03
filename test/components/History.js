import test from 'ava';
import createMemoryHistory from 'history/lib/createMemoryHistory';
import React from 'react';
import { render } from 'react-dom';
import sinon from 'sinon';

import 'babel-core/register';

import History from 'src/components/History';

test('History calls onChange for new history push', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChange = sinon.spy();
  render(
    <History history={history} onChange={onChange}/>,
    node
  );
  t.false(onChange.called);
  history.push('/hello');
  t.true(onChange.called);
  t.same(onChange.lastCall.args, ['/hello']);
});

test('History changes when new url is passed to history', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChange = sinon.spy();
  const onLocationChange = sinon.spy();
  render(
    <History history={history} onChange={onChange}/>,
    node
  );
  history.listen(onLocationChange);
  render(
    <History history={history} onChange={onChange} url="/hello"/>,
    node
  );
  t.false(onChange.called);
  t.true(onLocationChange.called);
  t.is(onLocationChange.lastCall.args[0].pathname, '/hello');
});

test('History sends current lcoation in callback', t => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  const history = createMemoryHistory();
  const onChange = sinon.spy();
  render(
    <History history={history} onChange={onChange} shouldTriggerCurrent/>,
    node
  );
  t.true(onChange.called);
  t.same(onChange.lastCall.args, ['/']);
});
