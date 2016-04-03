import React, { PropTypes } from 'react';

import routeKeyToRouteValue from '../utils/routeKeyToRouteValue';

const componentFromRouteValue = routeValue => {
  if (routeValue) {
    if (routeValue.component) {
      return routeValue.component;
    }
    if (typeof routeValue === 'function') {
      return routeValue;
    }
  }
  return undefined;
};

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

    renderRoute: PropTypes.func
  },

  routeValue() {
    const { router, routes } = this.props;

    if (router.current) {
      return routeKeyToRouteValue(router.current.routeKey, routes) || null;
    }
    return null;
  },

  render() {

    const {
      router,
      renderBeforeCurrent,
      renderRoute, renderComponent, renderDefault, renderNotFound,
      defaultComponent, notFoundComponent
    } = this.props;

    if (router.current) {
      const routeValue = this.routeValue();

      const componentProps = {
        ...router.current.params || {},
        query: router.current.query || {},
        router: router,
        routeValue
      };

      if (renderRoute) {
        return renderRoute(componentProps);
      }

      const Component = routeValue ? (
        componentFromRouteValue(routeValue) || defaultComponent
      ) : notFoundComponent;

      if (Component) {
        if (renderComponent) {
          return renderComponent(Component, componentProps);
        }

        return <Component {...componentProps}/>;
      }

      if (!routeValue && renderNotFound) {
        return renderNotFound(componentProps);
      }

      if (renderDefault) {
        return renderDefault(componentProps);
      }
    }

    if (renderBeforeCurrent) {
      return renderBeforeCurrent();
    }

    return null;
  }
});

export default Router;
