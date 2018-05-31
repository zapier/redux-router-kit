import test from 'ava';
import sinon from 'sinon';

import 'babel-core/register';

import onLink from '../../src/utils/onLink';

test('onLink subscribe/click/unsubscribe', t => {
  const node = document.createElement('div');
  node.id = 'onLinkContainer';
  document.body.appendChild(node);
  node.innerHTML = `
    <a id="hello" href="/hello">Hello</a>
  `;
  const onLinkSpy = sinon.spy();
  const unsubscribe = onLink({ shouldEmitCrossOriginLinks: false }, onLinkSpy);
  var mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.is(onLinkSpy.callCount, 1);
  t.is(onLinkSpy.lastCall.args[0].target.href, 'https://example.com/hello');
  unsubscribe();
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.is(onLinkSpy.callCount, 1);
});

test('onLink should emit cross-origin links when enabled', t => {
  const node = document.createElement('div');
  node.id = 'onLinkContaine-1';
  document.body.appendChild(node);
  node.innerHTML = `
    <a id="onlink-1" href="http://www.google.com/hello">Hello</a>
  `;

  const onLinkSpy = sinon.spy();
  const unsubscribe = onLink({ shouldEmitCrossOriginLinks: true }, onLinkSpy);

  const mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  document.getElementById('onlink-1').dispatchEvent(mouseEvent);
  t.is(onLinkSpy.lastCall.args[0].target.href, 'http://www.google.com/hello');
  unsubscribe();

  document.getElementById('onlink-1').dispatchEvent(mouseEvent);
  t.is(onLinkSpy.callCount, 1);
});

test('onLink should NOT emit cross-origin links when enabled', t => {
  const node = document.createElement('div');
  node.id = 'onLinkContainer-2';
  document.body.appendChild(node);
  node.innerHTML = `
    <a id="onlink-2" href="http://www.google.com/hello">Hello</a>
  `;

  const onLinkSpy = sinon.spy();
  const unsubscribe = onLink({ shouldEmitCrossOriginLinks: false }, onLinkSpy);

  const mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  document.getElementById('onlink-2').dispatchEvent(mouseEvent);
  t.is(onLinkSpy.lastCall.args[0].href, undefined);
  unsubscribe();
});
