/**
 * Handles all the state changes, of course.
 */

import ActionTypes from './ActionTypes';

const defaultState = {
  current: null,
  previous: null,
  next: null,
};

const undefinedAsNull = value => (value === undefined ? null : value);

const handlers = {
  /**
   * Wipe out the next route.
   */
  [ActionTypes.CANCEL_ROUTE](state) {
    return {
      ...state,
      next: null,
    };
  },

  /**
   * Modify the next route. Currently only used to switch the `exit` flag.
   */
  [ActionTypes.MODIFY_ROUTE](state, action) {
    if (!state.next) {
      return state;
    }
    const { payload } = action;
    return {
      ...state,
      next: {
        ...state.next,
        exit: !!payload.exit,
      },
    };
  },

  /**
   * Set the next route in state to alert the outside world that we _might_ be
   * routing somewhere else.
   */
  [ActionTypes.ROUTE_TO_NEXT](state, action) {
    const { payload, meta } = action;

    return {
      ...state,
      next: {
        ...meta.assign,
        _routeId: meta._routeId,
        routeKey: meta.routeKey,
        location: meta.location,
        url: meta.url,
        state: undefinedAsNull(payload.state),
        replace: !!payload.replace,
        exit: !!payload.exit,
      },
      origin: state.origin || meta.location.origin,
    };
  },

  /**
   * Set the fetching state, to alert the outside world that we are trying to
   * fetch a new async route.
   */
  [ActionTypes.ROUTE_TO_FETCH](state, action) {
    const { payload, meta } = action;

    if (!payload) {
      return {
        ...state,
        fetch: null,
      };
    }

    return {
      ...state,
      next: null,
      fetch: {
        ...meta.assign,
        _routeId: meta._routeId,
        routeKey: meta.routeKey,
        location: meta.location,
        url: meta.url,
        state: undefinedAsNull(payload.state),
        replace: !!payload.replace,
        exit: !!payload.exit,
      },
      origin: state.origin || meta.location.origin,
    };
  },

  /**
   * Finally, we're routing somewhere! Set previous to current. Set current to
   * next. Wipe out next.
   */
  [ActionTypes.ROUTE_TO](state, action) {
    const { payload, meta } = action;

    return {
      ...state,
      previous: (!payload.replace && state.current) || state.previous,
      current: {
        ...meta.assign,
        _routeId: meta._routeId,
        routeKey: meta.routeKey,
        location: meta.location,
        url: meta.url,
        state: undefinedAsNull(payload.state),
        replace: !!payload.replace,
      },
      next: null,
      origin: state.origin || meta.location.origin,
    };
  },

  /**
   * Resets the current location to whatever the provided `location` payload
   * is. This is used after hydrating state from an SSR request. The server is
   * unable to identify precisely what the location is, so we have the
   * browser inform us. This ensures that when we client-side route, our code
   * doesn't think client-side links are external links. This would typically
   * be called with `window.location.href`
   */
  [ActionTypes.RESET_LOCATION](state, action) {
    const { payload } = action;

    return {
      ...state,
      current: {
        ...state.current,
        location: payload.location,
      },
      origin: payload.location.origin,
    };
  },
};

export default function reducer(state = defaultState, action) {
  if (action) {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }
  }

  return state;
}
