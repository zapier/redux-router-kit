import pathToRegExp from 'path-to-regexp';
import queryStringParser from 'query-string';

const createRouteMatcher = path => {
  let keys = [];
  const re = pathToRegExp(path, keys);

  return (pathname, params) => {
    const m = re.exec(pathname);
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

const cache = {};

const compiledRouteMatcher = route => {
  if (!(route in cache)) {
    cache[route] = createRouteMatcher(route);
  }
  return cache[route];
};

const mapUrlToRoute = (urlAndQueryString, routes) => {

  const querySeparatorIndex = urlAndQueryString.indexOf('?');
  const url = urlAndQueryString.substring(0, querySeparatorIndex >= 0 ? querySeparatorIndex : urlAndQueryString.length);
  const queryStringAndHash = querySeparatorIndex >= 0 ? urlAndQueryString.substring(querySeparatorIndex) : '';

  for (let route in routes) {
    const matchRoute = compiledRouteMatcher(route);
    const routeMatch = matchRoute(url);
    if (routeMatch) {
      const hashIndex = queryStringAndHash.indexOf('#');
      const queryString = hashIndex >= 0 ? queryStringAndHash.split('#')[0] : queryStringAndHash;
      const query = queryStringParser.parse(queryString);
      return {
        route,
        match: routes[route],
        values: {...query, ...routeMatch},
        query,
        params: routeMatch
      };
    }
  }
  return null;
};

export default mapUrlToRoute;
