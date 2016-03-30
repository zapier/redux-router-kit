'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _urlParse = require('url-parse');

var _urlParse2 = _interopRequireDefault(_urlParse);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var schemeMatcher = /^([a-zA-Z]*\:)?\/\//;

var hasScheme = function hasScheme(url) {
  if (typeof url !== 'string') {
    return false;
  }
  return schemeMatcher.test(url);
};

var parseUrl = function parseUrl() {
  var url = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
  var baseUrl = arguments[1];


  if (!hasScheme(url)) {
    if (!hasScheme(baseUrl)) {
      throw new Error('Must provide scheme in url or baseUrl to parse.');
    }
  }

  if (!hasScheme(url)) {
    if (url[0] !== '/') {
      throw new Error('Only absolute URLs are currently supported.');
    }
  }

  var urlObj = (0, _urlParse2.default)(url, baseUrl);

  return {
    protocol: urlObj.protocol,
    host: urlObj.host,
    hostname: urlObj.hostname,
    port: urlObj.port,
    pathname: urlObj.pathname,
    hash: urlObj.hash,
    search: urlObj.query,
    origin: urlObj.host ? urlObj.protocol + '//' + urlObj.host : '',
    href: urlObj.href
  };
};

exports.default = parseUrl;