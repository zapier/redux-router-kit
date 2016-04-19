/**
 * Given a route key (array of route paths), find the routes from the routing
 * table.
 */

import normalizeRoute from './normalizeRoute';

const findRoutes = (routes, key, foundRoutes = []) => {
  if (key == null) {
    return null;
  }
  if (!routes) {
    return null;
  }
  key = Array.isArray(key) ? key : [key];
  if (key.length === 0) {
    return null;
  }
  const routeValue = routes[key[0]];
  if (routeValue) {
    const route = normalizeRoute(key[0], routeValue);
    foundRoutes = foundRoutes.concat(route);
    if (key.length === 1) {
      return foundRoutes;
    }
    return findRoutes(route.routes, key.slice(1), foundRoutes);
  }
  return null;
};

export default findRoutes;
