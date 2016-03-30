"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createMiddleware = function createMiddleware(_ref, handlers) {
  var getState = _ref.getState;
  var dispatch = _ref.dispatch;


  return function (next) {

    return function (action) {

      if (!action || !action.type || !handlers[action.type]) {
        return next(action);
      }

      if (!action.payload) {
        console.warn("Ignoring routing action " + action.type + " without payload.");
        return undefined;
      }

      var router = getState().router;

      if (!router) {
        console.warn("Ignoring routing action when there is no router key on the state. Did you forget the reducer?");
        return undefined;
      }

      return handlers[action.type]({ router: router, getState: getState, dispatch: dispatch, next: next, action: action });
    };
  };
};

exports.default = createMiddleware;