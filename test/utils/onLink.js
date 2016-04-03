import test from 'ava';

import 'babel-core/register';

import onLink from 'src/utils/onLink';

test('onLink subscribe/click/unsubscribe', t => {
  const node = document.createElement('div');
  node.id = 'onLinkContainer';
  document.body.appendChild(node);
  node.innerHTML = `
    <a id="hello" href="/hello">Hello</a>
  `;
  let triggerCount = 0;
  let clickedHref = '';
  const unsubscribe = onLink(({target}) => {
    triggerCount++;
    clickedHref = target.href;
  });
  var mouseEvent = new document.defaultView.MouseEvent('click', {
    view: window,
    bubbles: true,
    cancelable: true
  });
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.is(triggerCount, 1);
  t.is(clickedHref, 'https://example.com/hello');
  console.log(window.location.href);
  unsubscribe();
  document.getElementById('hello').dispatchEvent(mouseEvent);
  t.is(triggerCount, 1);
});
