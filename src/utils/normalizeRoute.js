/**
 * "Normalizes" routes to be an object with a `path`. If a route points directly
 * to a component/function, the component will be on a `component` property.
 */

const normalizeRoute = (pathPattern, value) => {
  const isComponent = typeof value === 'function' ||
    (typeof value === 'object' && value.hasOwnProperty('$$typeof'));

  const route = {
    path: pathPattern,
  };
  if (isComponent) {
    return {
      ...route,
      component: value,
    };
  }
  if (value === null) {
    return route;
  }
  if (typeof value === 'object') {
    return {
      ...value,
      ...route,
    };
  }
  if (typeof value === 'string') {
    return {
      ...route,
      name: value,
    };
  }
  return {
    ...route,
    value,
  };
};

export default normalizeRoute;
