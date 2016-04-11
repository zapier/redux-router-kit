import React, { PropTypes } from 'react';

import findRoutes from '../utils/findRoutes';

const Router = React.createClass({

  propTypes: {
    router: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,

    renderBeforeCurrent: PropTypes.func,

    notFoundComponent: PropTypes.func,
    renderNotFound: PropTypes.func,

    defaultComponent: PropTypes.func,
    renderDefault: PropTypes.func,

    renderComponent: PropTypes.func,

    renderRoutes: PropTypes.func
  },

  getDefaultProps() {
    return {
      createElement: React.createElement
    };
  },

  matchedRoutes() {
    const { router, routes } = this.props;

    if (router.current) {
      return findRoutes(routes, router.current.routeKey) || null;
    }

    return null;
  },

  render() {

    const {
      router,
      renderBeforeCurrent,
      renderRoutes, renderComponent, renderDefault, renderNotFound,
      defaultComponent, notFoundComponent: NotFound
    } = this.props;

    const createElement = renderComponent || this.props.createElement;

    if (router.current) {

      const matchedRoutes = this.matchedRoutes();

      const baseProps = {
        query: router.current.query || {},
        router
      };

      if (!matchedRoutes) {

        if (renderNotFound) {
          return renderNotFound(baseProps);
        }

        if (NotFound) {
          return <NotFound {...baseProps}/>;
        }

        return null;
      }

      const matchProps = {
        ...router.current.params || {},
        ...baseProps,
        matchedRoutes
      };

      if (renderRoutes) {
        return renderRoutes(matchProps);
      }

      const element = matchedRoutes.reduceRight((childElement, route) => {
        const { component, components } = route;
        if (typeof component !== 'function' && (!component || typeof components !== 'object')) {
          return childElement;
        }
        const routeProps = {
          ...matchProps,
          route,
          // Deprecated
          routeValue: route
        };
        if (React.isValidElement(childElement) || childElement === null) {
          routeProps.children = childElement;
        } else if (childElement) {
          Object.keys(childElement).forEach(key => {
            routeProps[key] = childElement[key];
          });
        }
        if (component) {
          return createElement(component, routeProps);
        }
        return Object.keys(components).reduce((elements, key) => {
          elements[key] = createElement(components[key], {
            key, ...routeProps
          });
        }, {});
      }, null);

      if (element === null) {
        if (renderDefault) {
          return renderDefault(matchProps);
        } else if (defaultComponent) {
          return createElement(defaultComponent, matchProps);
        }
      }

      return element;
    }

    if (renderBeforeCurrent) {
      return renderBeforeCurrent();
    }

    return null;
  }
});

export default Router;
