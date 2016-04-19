/**
 * Exports `matchRoutes` which takes a routing table and a url and finds the
 * set of nested routes to match that url. Returns an object like:
 *
 * {
 *   routes: [
 *     {
 *       // root route
 *     },
 *     {
 *       // todos route
 *     },
 *     {
 *       // todo route
 *     }
 *   ],
 *   key: ['/', 'todos', ':id'],
 *   params: {
 *     id: '123'
 *   },
 *   query: {}
 * }
 */

import pathToRegExp from 'path-to-regexp';
import queryStringParser from 'query-string';

import normalizeRoute from './normalizeRoute';

// Convert path to a compiled route matcher.
const createRouteMatcher = pathPattern => {
  let keys = [];
  const re = pathToRegExp(pathPattern, keys);

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

const compiledRouteMatcher = pathPattern => {
  if (!(pathPattern in cache)) {
    cache[pathPattern] = createRouteMatcher(pathPattern);
  }
  return cache[pathPattern];
};

const matchPathnameToPattern = (pathname, pathPattern) => {
  // Index match.
  if (pathname === '' && pathPattern === '.') {
    return {};
  }
  const matchRoute = compiledRouteMatcher(pathPattern);
  return matchRoute(pathname);
};

const extendResult = (result, pathPattern, route, params) => ({
  key: result.key.concat(pathPattern),
  routes: result.routes.concat(route),
  params: {...result.params, ...params}
});

const deepMatchRoutes = (routes, pathname, remainingPathname, result = {
  key: [],
  routes: [],
  params: {}
}) => {

  for (let pathPattern in routes) {

    const routeValue = routes[pathPattern];
    if (!routeValue) {
      break;
    }

    const testPathname = pathPattern[0] === '/' ? pathname : remainingPathname;
    const params = matchPathnameToPattern(testPathname, pathPattern);

    if (params) {
      const route = normalizeRoute(pathPattern, routeValue);
      const nextResult = extendResult(result, pathPattern, route, params);
      if (route.routes) {
        const deeperMatch = deepMatchRoutes(route.routes, pathname, '', nextResult);
        if (deeperMatch) {
          return deeperMatch;
        }
      }
      return nextResult;
    }

    if (routeValue.routes || routeValue.fetch) {
      if (pathPattern.charAt(pathPattern.length - 1) !== '*') {
        const trailingSlash = pathPattern.charAt(pathPattern.length - 1) === '/' ? '' : '/';
        const wildPathPattern = `${pathPattern}${trailingSlash}:__remainingPathnames__*`;
        const wildParams = matchPathnameToPattern(testPathname, wildPathPattern);
        if (wildParams) {
          const {
            __remainingPathnames__: newRemainingPathnames,
            ...otherParams
          } = wildParams;
          const newRemainingPathname = newRemainingPathnames.join('/');
          const route = normalizeRoute(pathPattern, routeValue);
          const nextResult = extendResult(result, pathPattern, route, otherParams);
          if (routeValue.routes) {
            return deepMatchRoutes(route.routes, pathname, newRemainingPathname, nextResult);
          } else {
            // Fetch result.
            return nextResult;
          }
        }
      }
    }
  }

  return null;
};

const matchRoutes = (routes, url) => {

  if (!routes || typeof routes !== 'object') {
    throw new Error('matchRoutes requires routes to be an object.');
  }

  if (typeof url !== 'string') {
    throw new Error('matchRotes requires url to be a string.');
  }

  const urlWithQueryString = url.split('#')[0];
  const pathname = urlWithQueryString.split('?')[0];

  const match = deepMatchRoutes(routes, pathname, pathname);

  if (match) {
    const queryStringAndHash = url.substring(pathname.length);
    const queryString = queryStringAndHash.split('#')[0];
    const query = queryStringParser.parse(queryString);

    return {
      ...match,
      query
    };
  }

  return null;
};

export default matchRoutes;
