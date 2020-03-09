/**
 * Given a list of routes, create an element from any of the components defined
 * for those routes.
 */

import React from 'react';

import elementToProps from './elementToProps';

const createElementFromRoutes = ({
  query, router, matchedRoutes, createElement = React.createElement
}) => {
  if (!matchedRoutes) {
    return null;
  }
  const element = matchedRoutes.reduceRight((childElement, route, matchedRouteIndex) => {
    const { component, components } = route;
    const isComponent = typeof component === 'function' ||
      (typeof component === 'object' && component.hasOwnProperty('$$typeof'));

    if (!isComponent && (!component || typeof components !== 'object')) {
      return childElement;
    }
    const routeProps = {
      query,
      params: router.current.params,
      router,
      matchedRoutes,
      route,
      matchedRouteIndex,
      ...elementToProps(childElement)
    };
    if (component) {
      return createElement(component, routeProps);
    }
    return Object.keys(components).reduce((elements, key) => {
      elements[key] = createElement(components[key], {
        key, ...routeProps
      });
    }, {});
  }, null);
  return element;
};

export default createElementFromRoutes;
