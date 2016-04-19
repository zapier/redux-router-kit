/**
 * Just a little boilerplate for the routing middleware.
 */

import ActionTypes from '../ActionTypes';

const noPayloadActions = {
  [ActionTypes.CANCEL_ROUTE]: true
};

const createMiddleware = ({getState, dispatch}, handlers) => {

  return next => {

    return action => {

      if (!action || !action.type || !handlers[action.type]) {
        return next(action);
      }

      if (!action.payload && !noPayloadActions[action.type]) {
        console.warn(`Ignoring routing action ${action.type} without payload.`);
        return undefined;
      }

      const router = getState().router;

      if (!router) {
        console.warn(`Ignoring routing action when there is no router key on the state. Did you forget the reducer?`);
        return undefined;
      }

      return handlers[action.type]({router, getState, dispatch, next, action});
    };
  };
};

export default createMiddleware;
