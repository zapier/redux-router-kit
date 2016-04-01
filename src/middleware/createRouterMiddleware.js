import createMiddleware from '../utils/createMiddleware';
import mapUrlToRoute from '../utils/mapUrlToRoute';
import parseUrl from '../utils/parseUrl';
import ActionTypes from '../ActionTypes';
import routableUrl from '../utils/routableUrl';
import Actions from '../Actions';
import routeKeyToRouteValue from '../utils/routeKeyToRouteValue';

const UNDEFINED_HREF = 'http://example.com/';

let _id = 0;
const uniqueId = () => {
  _id++;
  return _id;
};

const browserUrl = () => {
  if (typeof document === 'undefined') {
    return UNDEFINED_HREF;
  }
  if (!document || !document.location) {
    return UNDEFINED_HREF;
  }
  return document.location.href;
};

const baseUrl = browserUrl();

const cleanEvent = ({metaKey, ctrlKey, shiftKey, defaultPrevented} = {}) => (
  {metaKey, ctrlKey, shiftKey, defaultPrevented}
);

const openWindow = (...args) => {
  if (typeof window !== 'undefined') {
    window.open(...args);
  }
};

const routeMeta = (routeInfo) => {

  if (routeInfo && routeInfo.match) {
    const { match } = routeInfo;
    const extraState = typeof match.state === 'function' ? (
      match.state({
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
      ...(extraState || match.state)
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

        // Don't allow routing to the exact same location.
        if (router.current && router.current.location.href === parsedUrl.href) {
          return;
        }

        const nextRouteInfo = url != null && mapUrlToRoute(url, routes);

        const state = routeMeta(nextRouteInfo);

        return dispatch({
          type: ActionTypes.ROUTE_TO_NEXT,
          payload: {
            ...action.payload,
            event: cleanEvent(action.payload.event || {})
          },
          meta: {
            url,
            location: parsedUrl,
            state,
            _routeId: uniqueId(),
            routeKey: nextRouteInfo && nextRouteInfo.route
          }
        });
      },

      // Intercept next route and only dispatch actual route if not cancelled.
      [ActionTypes.ROUTE_TO_NEXT]({getState, dispatch, action, next}) {

        const { meta } = action;
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
          })
          // Handle onEnter for the next route.
          .then(() => {
            const { router } = getState();
            if (router.next && router.next._routeId === meta._routeId) {
              if (nextMatch && nextMatch.onEnter && typeof nextMatch.onEnter === 'function') {
                return nextMatch.onEnter({routeTo, cancelRoute, getState, dispatch, action, router});
              }
            }
          })
          // Finally, move to the next route.
          .then(() => {
            const { router } = getState();
            // Finish the route if we're still routing the same route.
            if (router.next && router.next._routeId === meta._routeId) {
              return new Promise(resolve => {
                batchedUpdates(() => {
                  const batchedDispatchResult = dispatch({
                    ...action,
                    type: ActionTypes.ROUTE_TO
                  });
                  resolve(batchedDispatchResult);
                });
              });
            }
          });
      },

      // Intercept actual route if blocked by event or unknown route.
      [ActionTypes.ROUTE_TO]({router, dispatch, next, action}) {
        const { meta } = action;
        const { event } = action.payload;

        if (event.defaultPrevented) {
          return undefined;
        }

        if (event.metaKey || event.ctrlKey || event.shiftKey) {
          return dispatch({
            ...action,
            type: ActionTypes.ROUTE_TO_WINDOW
          });
        }

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
          return undefined;
        }

        openWindow(meta.location.href);
      },

      [ActionTypes.ROUTE_TO_EXIT]({action}) {
        const { meta } = action;

        if (typeof window !== 'undefined') {
          window.location.href = meta.location.href;
        }
      }
    };

    return createMiddleware(store, handlers);
  };
};

export default createRouterMiddleware;
