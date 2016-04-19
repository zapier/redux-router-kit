/**
 * Just like it says: clones routes for a route key (array of route paths). When
 * fetching async routes, we want to update the routing table but not mutate
 * what was passed in. So we clone the pieces we need.
 */

const cloneRoutesForKey = (routes, key) => {
  routes = {
    ...routes
  };
  if (!key || key.length === 0) {
    return routes;
  }
  const route = routes[key[0]];
  if (!route || typeof route === 'function' || typeof route !== 'object') {
    return routes;
  }
  const routeCopy = {...route};
  routes[key[0]] = routeCopy;
  if (!routeCopy.routes) {
    return routes;
  }
  routeCopy.routes = cloneRoutesForKey(routeCopy.routes, key.slice(1));
  return routes;
};

export default cloneRoutesForKey;
