const createMiddleware = ({getState, dispatch}, handlers) => {

  return next => {

    return action => {

      if (!action || !action.type || !handlers[action.type]) {
        return next(action);
      }

      if (!action.payload) {
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
