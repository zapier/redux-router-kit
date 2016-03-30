import ActionTypes from './ActionTypes';

const defaultState = {
  current: null,
  previous: null,
  next: null
};

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
          ...meta.state,
          _routeId: meta._routeId,
          routeKey: meta.routeKey,
          location: meta.location,
          url: meta.url,
          replace: !!payload.replace
        },
        origin: state.origin || meta.location.origin
      };

    } else if (action.type === ActionTypes.ROUTE_TO) {

      const { payload, meta } = action;

      state = {
        ...state,
        previous: state.current,
        current: {
          ...meta.state,
          _routeId: meta._routeId,
          routeKey: meta.routeKey,
          location: meta.location,
          url: meta.url,
          replace: !!payload.replace
        },
        next: null,
        origin: state.origin || meta.location.origin
      };
    }
  }

  return state;
}
