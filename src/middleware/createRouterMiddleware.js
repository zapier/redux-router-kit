import createMiddleware from '../utils/createMiddleware';
import mapUrlToRoute from '../utils/mapUrlToRoute';
import parseUrl from '../utils/parseUrl';
import ActionTypes from '../ActionTypes';
import routableUrl from '../utils/routableUrl';
import Actions from '../Actions';
import routeKeyToRouteValue from '../utils/routeKeyToRouteValue';
import statesAreEqual from '../utils/statesAreEqual';
import isRightClick from '../utils/isRightClick';

const UNDEFINED_HREF = 'http://example.com/';

let _id = 0;
const uniqueId = () => {
  _id++;
  return _id;
};

const browserUrl = () => {
  if (typeof window === 'undefined') {
    return UNDEFINED_HREF;
  }
  if (!window || !window.location) {
    return UNDEFINED_HREF;
  }
  return window.location.href;
};

const baseUrl = browserUrl();

const cleanEvent = ({metaKey, ctrlKey, shiftKey, defaultPrevented, which, button} = {}) => (
  {metaKey, ctrlKey, shiftKey, defaultPrevented, which, button}
);

const openWindow = (...args) => {
  if (typeof window !== 'undefined') {
    window.open(...args);
  }
};

const isOnlyHashChange = (router) => {
  const { current, next } = router;
  if (current && next) {
    const currentPathAndQuery = `${current.location.origin}${current.location.pathname}${current.location.search}`;
    const nextPathAndQuery = `${next.location.origin}${next.location.pathname}${next.location.search}`;
    return currentPathAndQuery === nextPathAndQuery;
  }
  return false;
};

const routeMeta = (routeInfo) => {

  if (routeInfo && routeInfo.match) {
    const { match } = routeInfo;
    const extraState = typeof match.assign === 'function' ? (
      match.assign({
        name: match.name,
        params: routeInfo.params,
        query: routeInfo.query,
        values: routeInfo.values
      })
    ) : undefined;
    return {
      name: match.name,
      params: routeInfo.params,
      query: routeInfo.query,
      values: routeInfo.values,
      ...(extraState || match.assign)
    };
  }

  return {};
};

const noOpBatchedUpdates = (cb) => {
  cb();
};

const createRouterMiddleware = ({routes, batchedUpdates = noOpBatchedUpdates} = {}) => {

  if (!routes || !(typeof routes === 'object')) {
    throw new Error('Must provide mapping from route strings to route objects.');
  }

  return store => {

    const handlers = {

      // Normalize the action against current href and origin.
      // Dispatch action for next route.
      [ActionTypes.ROUTE_TO_INIT]({router, dispatch, action}) {

        const parsedUrl = parseUrl(action.payload.href, router.href || baseUrl);

        const url = routableUrl(parsedUrl.href, router.origin || parsedUrl.origin);

        const nextRouteInfo = url != null && mapUrlToRoute(url, routes);

        const assign = routeMeta(nextRouteInfo);

        return dispatch({
          type: ActionTypes.ROUTE_TO_NEXT,
          payload: {
            ...action.payload,
            event: cleanEvent(action.payload.event || {})
          },
          meta: {
            url,
            location: parsedUrl,
            assign,
            _routeId: uniqueId(),
            routeKey: nextRouteInfo && nextRouteInfo.route
          }
        });
      },

      // Check for cancelling events.
      // Check for duplicate routes.
      // Otherwise, continue routing and check for cancellations/redirections.
      [ActionTypes.ROUTE_TO_NEXT]({router: currentRouter, getState, dispatch, action, next}) {

        const { meta } = action;
        const { event } = action.payload;

        if (event.defaultPrevented) {
          return undefined;
        }

        if (isRightClick(event)) {
          return undefined;
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          return dispatch({
            ...action,
            type: ActionTypes.ROUTE_TO_WINDOW
          });
        }

        if (action.payload.exit && !isOnlyHashChange(currentRouter)) {
          dispatch(Actions.cancelRoute());
          return dispatch({
            ...action,
            type: ActionTypes.ROUTE_TO_EXIT
          });
        }

        // Don't allow routing to the exact same location as next.
        if (
          currentRouter.next && currentRouter.next.location.href === meta.location.href &&
          statesAreEqual(currentRouter.next.state, action.payload.state)
        ) {
          return undefined;
        }

        // If there's a route in flight, auto cancel it.
        if (currentRouter.next) {
          dispatch(Actions.cancelRoute());
        }

        // Don't allow routing to the exact same location as current.
        if (
          currentRouter.current && currentRouter.current.location.href === meta.location.href &&
          statesAreEqual(currentRouter.current.state, action.payload.state)
        ) {
          return undefined;
        }

        const result = next(action);
        const routeTo = (...args) => {
          dispatch(Actions.routeTo(...args));
        };
        const cancelRoute = (...args) => {
          dispatch(Actions.cancelRoute(...args));
        };
        const nextMatch = routeKeyToRouteValue(meta.routeKey, routes);

        return Promise.resolve(result)
          // Handle onLeave for the current route.
          .then(() => {
            const { router } = getState();
            if (router.next && router.next._routeId === meta._routeId) {
              if (router.current) {
                const currRouteInfo = mapUrlToRoute(router.current.url, routes);
                const currMatch = currRouteInfo && currRouteInfo.match;
                if (currMatch) {
                  if (currMatch.onLeave && typeof currMatch.onLeave === 'function') {
                    return currMatch.onLeave({routeTo, cancelRoute, getState, dispatch, action, router});
                  }
                }
              }
            }
            return undefined;
          })
          // Handle onEnter for the next route.
          .then(() => {
            const { router } = getState();
            if (router.next && router.next._routeId === meta._routeId) {
              if (nextMatch && nextMatch.onEnter && typeof nextMatch.onEnter === 'function') {
                return nextMatch.onEnter({routeTo, cancelRoute, getState, dispatch, action, router});
              }
            }
            return undefined;
          })
          // Finally, move to the next route.
          .then(() => {
            const { router } = getState();
            let dispatchResult;
            // Finish the route if we're still routing the same route.
            if (router.next && router.next._routeId === meta._routeId) {
              batchedUpdates(() => {
                dispatchResult = dispatch({
                  ...action,
                  type: ActionTypes.ROUTE_TO
                });
              });
            }
            return dispatchResult;
          });
      },

      // Intercept actual route if unknown route.
      [ActionTypes.ROUTE_TO]({router, dispatch, next, action}) {
        const { meta } = action;

        const match = routeKeyToRouteValue(meta.routeKey, routes);

        // Only allow exiting if we have already routed, to prevent loops.
        if (router.current) {
          if (!match) {
            return dispatch({
              ...action,
              type: ActionTypes.ROUTE_TO_EXIT
            });
          }
        }

        return next(action);
      },

      [ActionTypes.ROUTE_TO_WINDOW]({action}) {
        const { meta } = action;
        const { event } = action.payload;

        if (event.shiftKey) {
          openWindow(meta.location.href, '_blank');
          return;
        }

        openWindow(meta.location.href);
      },

      [ActionTypes.ROUTE_TO_EXIT]({action}) {
        const { meta } = action;

        if (typeof window !== 'undefined') {
          // Allow cancellations to update.
          setTimeout(() => {
            window.location.href = meta.location.href;
          }, 0);
        }
      }
    };

    return createMiddleware(store, handlers);
  };
};

export default createRouterMiddleware;
