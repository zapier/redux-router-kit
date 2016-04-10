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

const isOnlyHashChange = (current, next) => {
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

  let inFlightNext = null;

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
          return Promise.resolve();
        }

        if (isRightClick(event)) {
          return Promise.resolve();
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          return Promise.resolve(dispatch({
            ...action,
            type: ActionTypes.ROUTE_TO_WINDOW
          }));
        }

        // Don't allow routing to the exact same location as next.
        if (
          currentRouter.next && currentRouter.next.location.href === meta.location.href &&
          statesAreEqual(currentRouter.next.state, action.payload.state)
        ) {
          // Unless we change `exit` flag, in which case we can modify
          // the next route.
          if (!!currentRouter.next.exit !== !!action.payload.exit) {
            dispatch({
              type: ActionTypes.MODIFY_ROUTE,
              payload: {
                exit: !!action.payload.exit
              }
            });
          }
          return inFlightNext || Promise.resolve();
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
          return Promise.resolve();
        }

        const result = next(action);
        const routeTo = (...args) => {
          dispatch(Actions.routeTo(...args));
        };
        const cancelRoute = (...args) => {
          dispatch(Actions.cancelRoute(...args));
        };
        const nextMatch = routeKeyToRouteValue(meta.routeKey, routes);

        inFlightNext = Promise.resolve(result)
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
                  type: router.next.exit ? ActionTypes.ROUTE_TO_EXIT : ActionTypes.ROUTE_TO
                });
              });
            }
            return dispatchResult;
          });

        return inFlightNext;
      },

      // Intercept actual route if unknown route.
      [ActionTypes.ROUTE_TO]({router, dispatch, next, action}) {
        inFlightNext = null;
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
        inFlightNext = null;
        const { meta } = action;
        const { event } = action.payload;

        if (event.shiftKey) {
          openWindow(meta.location.href, '_blank');
          return;
        }

        openWindow(meta.location.href);
      },

      [ActionTypes.ROUTE_TO_EXIT]({action, next, router}) {
        inFlightNext = null;
        const { meta } = action;

        // If we change back to ROUTE_TO here, we DO NOT RE-DISPATCH.
        // If we did, we could loop back around.
        // This logic could move to ROUTE_TO to avoid this, but it's nice to
        // only worry about window here. Alternatively, we could add a flag to
        // avoid looping, but that seems more confusing.

        if (typeof window !== 'undefined') {
          if (isOnlyHashChange(router.current, meta)) {
            // Browser wouldn't have reloaded this, so we won't either.
            // Probably should add a `reload` option later to force this.
            return next({
              ...action,
              type: ActionTypes.ROUTE_TO
            });
          } else if (isOnlyHashChange(window, meta)) {
            // Need for force a change, because window is out of sync.
            // Cancel may not have made it through yet to History.
            window.location.hash = meta.location.hash;
            window.location.reload();
          } else {
            window.location.href = meta.location.href;
          }
        }
        else if (meta.url) {
          // If we have a url and no window, then go ahead with ROUTE_TO.
          // (Because origin matched anyway.)
          return next({
            ...action,
            type: ActionTypes.ROUTE_TO
          });
        }
        return undefined;
      },

      [ActionTypes.CANCEL_ROUTE]({action, next}) {
        inFlightNext = null;
        return next(action);
      }
    };

    return createMiddleware(store, handlers);
  };
};

export default createRouterMiddleware;
