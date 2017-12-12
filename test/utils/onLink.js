import test from 'ava';
import sinon from 'sinon';

import 'babel-core/register';

import onLink from 'redux-router-kit/src/utils/onLink';

test('onLink subscribe/click/unsubscribe', t => {
  const node = document.createElement('div');
  node.id = 'onLinkContainer';
  document.body.appendChild(node);
  node.innerHTML = `
    <a id="hello" href="/hello">Hello</a>
  `;
  const onLinkSpy = sinon.spy();
  const unsubscribe = onLink(onLinkSpy);
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
