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
