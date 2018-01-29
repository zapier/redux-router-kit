/**
 * routeTo and cancelRoute action creators.
 */

import ActionTypes from './ActionTypes';

export const routeTo = (href, options = {}) => {
  return {
    type: ActionTypes.ROUTE_TO_INIT,
    payload: {
      href,
      ...options,
    },
  };
};

export const cancelRoute = () => {
  return {
    type: ActionTypes.CANCEL_ROUTE,
  };
};

export const resetLocation = href => {
  return {
    type: ActionTypes.RESET_LOCATION,
    payload: {
      href,
    },
  };
};

export default {
  routeTo,
  cancelRoute,
  resetLocation,
};
