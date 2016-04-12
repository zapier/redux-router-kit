import ActionTypes from './ActionTypes';

const defaultState = {
  current: null,
  previous: null,
  next: null
};

const undefinedAsNull = value => value === undefined ? null : value;

const handlers = {

  [ActionTypes.CANCEL_ROUTE](state) {
    return {
      ...state,
      next: null
    };
  },

  [ActionTypes.MODIFY_ROUTE](state, action) {
    if (!state.next) {
      return state;
    }
    const { payload } = action;
    return {
      ...state,
      next: {
        ...state.next,
        exit: !!payload.exit
      }
    };
  },

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
        exit: !!payload.exit
      },
      origin: state.origin || meta.location.origin
    };
  },

  [ActionTypes.ROUTE_TO_FETCH](state, action) {
    const { payload, meta } = action;

    if (!payload) {
      return {
        ...state,
        fetch: null
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
        exit: !!payload.exit
      },
      origin: state.origin || meta.location.origin
    };
  },

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
        replace: !!payload.replace
      },
      next: null,
      origin: state.origin || meta.location.origin
    };
  }
};

export default function reducer(state = defaultState, action) {
  if (action) {
    if (handlers[action.type]) {
      return handlers[action.type](state, action);
    }
  }

  return state;
}
