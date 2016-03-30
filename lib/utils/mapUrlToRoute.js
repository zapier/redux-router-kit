'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _pathToRegexp = require('path-to-regexp');

var _pathToRegexp2 = _interopRequireDefault(_pathToRegexp);

var _queryString = require('query-string');

var _queryString2 = _interopRequireDefault(_queryString);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createRouteMatcher = function createRouteMatcher(path) {
  var keys = [];
  var re = (0, _pathToRegexp2.default)(path, keys);

  return function (pathname, params) {
    var m = re.exec(pathname);
    if (!m) {
      return false;
    }

    params = params || {};

    var key, param;
    for (var i = 0; i < keys.length; i++) {
      key = keys[i];
      param = m[i + 1];
      if (!param) {
        continue;
      }
      params[key.name] = decodeURIComponent(param);
      if (key.repeat) {
        params[key.name] = params[key.name].split(key.delimiter);
      }
    }

    return params;
  };
};

var cache = {};

var compiledRouteMatcher = function compiledRouteMatcher(route) {
  if (!(route in cache)) {
    cache[route] = createRouteMatcher(route);
  }
  return cache[route];
};

var mapUrlToRoute = function mapUrlToRoute(urlAndQueryString, routes) {

  var querySeparatorIndex = urlAndQueryString.indexOf('?');
  var url = urlAndQueryString.substring(0, querySeparatorIndex >= 0 ? querySeparatorIndex : urlAndQueryString.length);
  var queryStringAndHash = querySeparatorIndex >= 0 ? urlAndQueryString.substring(querySeparatorIndex) : '';

  for (var route in routes) {
    var matchRoute = compiledRouteMatcher(route);
    var routeMatch = matchRoute(url);
    if (routeMatch) {
      var hashIndex = queryStringAndHash.indexOf('#');
      var queryString = hashIndex >= 0 ? queryStringAndHash.split('#')[0] : queryStringAndHash;
      var query = _queryString2.default.parse(queryString);
      return {
        route: route,
        match: routes[route],
        values: _extends({}, query, routeMatch),
        query: query,
        params: routeMatch
      };
    }
  }
  return null;
};

exports.default = mapUrlToRoute;