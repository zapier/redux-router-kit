import ActionTypes from './ActionTypes';

const defaultState = {
  current: null,
  previous: null,
  next: null
};

const undefinedAsNull = value => value === undefined ? null : value;

export default function reducer(state = defaultState, action) {
  if (action) {

    if (action.type === ActionTypes.CANCEL_ROUTE) {

      state = {
        ...state,
        next: null
      };

    } else if (action.type === ActionTypes.ROUTE_TO_NEXT) {

      const { payload, meta } = action;

      state = {
        ...state,
        next: {
          ...meta.assign,
          _routeId: meta._routeId,
          routeKey: meta.routeKey,
          location: meta.location,
          url: meta.url,
          state: undefinedAsNull(payload.state),
          replace: !!payload.replace
        },
        origin: state.origin || meta.location.origin
      };

    } else if (action.type === ActionTypes.ROUTE_TO) {

      const { payload, meta } = action;

      state = {
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
  }

  return state;
}
