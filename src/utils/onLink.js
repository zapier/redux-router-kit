import urlParse from 'url-parse';

let isListening = false;

const listeners = [];

const onLink = (handler) => {

  listeners.push(handler);

  const unsubscribe = () => {
    for (let i = 0; i < listeners.length; i++) {
      if (listeners[i] === handler) {
        listeners.splice(i, 1);
        break;
      }
    }
  };

  if (isListening) {
    return unsubscribe;
  }

  // This code borrows heavily from:
  // https://github.com/cerebral/addressbar/blob/master/index.js

  // Check if IE history polyfill is added
  const location = window.history.location || window.location;

  const initialUrl = location.href;
  const uri = urlParse(initialUrl);
  const origin = uri.protocol + '//' + uri.host;

  const emitChange = (url, event) => {
    listeners.forEach(listener => {
      listener(event);
    });
  };

  const isSameOrigin = (href) => {
    return (href && (href.indexOf(origin) === 0));
  };

  const getClickedHref = (event) => {
    // jsdom only has event.button
    // srsly guise, why two different numbers for the same button???
    if (event.which == null) {
      // left button
      if (event.button !== 0) {
        return false;
      }
    } else {
      // left button
      if (event.which !== 1) {
        return false;
      }
    }

    // check for modifiers
    if (event.metaKey || event.ctrlKey || event.shiftKey) { return false; }
    if (event.defaultPrevented) { return false; }

    // ensure link
    let element = event.target;
    while (element && element.nodeName !== 'A') { element = element.parentNode; }
    if (!element || element.nodeName !== 'A') { return false; }

    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (element.hasAttribute('download') || element.getAttribute('rel') === 'external') { return false; }

    // Check for mailto: in the href
    const href = element.getAttribute('href');
    if (href && href.indexOf('mailto:') > -1) { return false; }

    // check target
    if (element.target) { return false; }

    // x-origin
    if (!isSameOrigin(element.href)) { return false; }

    return href;
  };

  window.addEventListener(document.ontouchstart ? 'touchstart' : 'click', function (event) {
    const href = getClickedHref(event);
    if (href) {
      emitChange(href, event);
    }
  });

  return unsubscribe;
};

export default onLink;
