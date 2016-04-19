/**
 * "Normalizes" routes to be an object with a `path`. If a route points directly
 * to a component/function, the component will be on a `component` property.
 */

const normalizeRoute = (pathPattern, value) => {
  const route = {
    path: pathPattern
  };
  if (typeof value === 'function') {
    return {
      ...route,
      component: value
    };
  }
  if (value === null) {
    return route;
  }
  if (typeof value === 'object') {
    return {
      ...value,
      ...route
    };
  }
  if (typeof value === 'string') {
    return {
      ...route,
      name: value
    };
  }
  return {
    ...route,
    value
  };
};

export default normalizeRoute;
