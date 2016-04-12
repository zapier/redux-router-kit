import React, { PropTypes } from 'react';

import findRoutes from '../utils/findRoutes';
import createElementFromRoutes from '../utils/createElementFromRoutes';
import elementToProps from '../utils/elementToProps';

const Router = React.createClass({

  propTypes: {
    router: PropTypes.object.isRequired,
    routes: PropTypes.object.isRequired,

    render: PropTypes.func,
    renderBeforeCurrent: PropTypes.func,
    renderNotFound: PropTypes.func,
    renderDefault: PropTypes.func,
    renderRoot: PropTypes.func,
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
      children,
      router,
      renderBeforeCurrent,
      renderRoutes, renderComponent, renderDefault, renderRoot, renderNotFound
    } = this.props;

    const render = typeof children === 'function' ? children : this.props.render;

    const createElement = renderComponent || this.props.createElement;

    if (router.current) {

      const matchedRoutes = this.matchedRoutes();

      const baseProps = {
        query: router.current.query || {},
        router
      };

      const matchProps = {
        ...baseProps,
        matchedRoutes,
        params: router.current.params,
        ...router.current.params || {},
      };

      if (render) {
        return render(matchProps);
      }

      if (!matchedRoutes) {

        if (renderNotFound) {
          return renderNotFound(baseProps);
        }

        return null;
      }

      if (renderRoutes) {
        return renderRoutes(matchProps);
      }

      const element = createElementFromRoutes({
        ...baseProps,
        matchedRoutes,
        createElement
      });

      const elementOrDefault = element == null && renderDefault ? (
        renderDefault(matchProps)
      ) : element;

      const rootProps = {
        ...matchProps,
        ...elementToProps(elementOrDefault)
      };

      if (renderRoot) {
        return renderRoot(rootProps);
      }

      return elementOrDefault;
    }

    if (renderBeforeCurrent) {
      return renderBeforeCurrent({
        router
      });
    }

    if (render) {
      return render({
        router
      });
    }

    return null;
  }
});

export default Router;
