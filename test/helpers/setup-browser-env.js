global.document = require('jsdom').jsdom('<body></body>', {
  url: 'https://example.com'
});
global.window = document.defaultView;
global.navigator = window.navigator;
