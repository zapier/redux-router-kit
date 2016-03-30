'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createMiddleware = require('../utils/createMiddleware');

var _createMiddleware2 = _interopRequireDefault(_createMiddleware);

var _mapUrlToRoute = require('../utils/mapUrlToRoute');

var _mapUrlToRoute2 = _interopRequireDefault(_mapUrlToRoute);

var _parseUrl = require('../utils/parseUrl');

var _parseUrl2 = _interopRequireDefault(_parseUrl);

var _ActionTypes = require('../ActionTypes');

var _ActionTypes2 = _interopRequireDefault(_ActionTypes);

var _routableUrl = require('../utils/routableUrl');

var _routableUrl2 = _interopRequireDefault(_routableUrl);

var _Actions = require('../Actions');

var _Actions2 = _interopRequireDefault(_Actions);

var _routeKeyToRouteValue = require('../utils/routeKeyToRouteValue');

var _routeKeyToRouteValue2 = _interopRequireDefault(_routeKeyToRouteValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var UNDEFINED_HOST = '__undefined__';

var _id = 0;
var uniqueId = function uniqueId() {
  _id++;
  return _id;
};

var browserUrl = function browserUrl() {
  if (typeof document === 'undefined') {
    return UNDEFINED_HOST;
  }
  if (!document || !document.location) {
    return UNDEFINED_HOST;
  }
  return document.location.href;
};

var baseUrl = browserUrl();

var cleanEvent = function cleanEvent() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var metaKey = _ref.metaKey;
  var ctrlKey = _ref.ctrlKey;
  var shiftKey = _ref.shiftKey;
  var defaultPrevented = _ref.defaultPrevented;
  return { metaKey: metaKey, ctrlKey: ctrlKey, shiftKey: shiftKey, defaultPrevented: defaultPrevented };
};

var openWindow = function openWindow() {
  if (typeof window !== 'undefined') {
    var _window;

    (_window = window).open.apply(_window, arguments);
  }
};

var routeMeta = function routeMeta(routeInfo) {

  if (routeInfo && routeInfo.match) {
    var match = routeInfo.match;

    var extraState = typeof match.state === 'function' ? match.state({
      name: match.name,
      params: routeInfo.params,
      query: routeInfo.query,
      values: routeInfo.values
    }) : undefined;
    return _extends({
      name: match.name,
      params: routeInfo.params,
      query: routeInfo.query,
      values: routeInfo.values
    }, extraState || match.state);
  }

  return {};
};

var noOpBatchedUpdates = function noOpBatchedUpdates(cb) {
  cb();
};

var createRouterMiddleware = function createRouterMiddleware() {
  var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var routes = _ref2.routes;
  var _ref2$batchedUpdates = _ref2.batchedUpdates;
  var batchedUpdates = _ref2$batchedUpdates === undefined ? noOpBatchedUpdates : _ref2$batchedUpdates;


  if (!routes || !((typeof routes === 'undefined' ? 'undefined' : _typeof(routes)) === 'object')) {
    throw new Error('Must provide mapping from route strings to route objects.');
  }

  return function (store) {
    var _handlers;

    var handlers = (_handlers = {}, _defineProperty(_handlers, _ActionTypes2.default.ROUTE_TO_INIT, function (_ref3) {
      var router = _ref3.router;
      var dispatch = _ref3.dispatch;
      var action = _ref3.action;


      var parsedUrl = (0, _parseUrl2.default)(action.payload.href, router.href || baseUrl);

      var url = (0, _routableUrl2.default)(parsedUrl.href, router.origin || parsedUrl.origin);

      var nextRouteInfo = url != null && (0, _mapUrlToRoute2.default)(url, routes);

      var state = routeMeta(nextRouteInfo);

      return dispatch({
        type: _ActionTypes2.default.ROUTE_TO_NEXT,
        payload: _extends({}, action.payload, {
          event: cleanEvent(action.payload.event || {})
        }),
        meta: {
          url: url,
          location: parsedUrl,
          state: state,
          _routeId: uniqueId(),
          routeKey: nextRouteInfo && nextRouteInfo.route
        }
      });
    }), _defineProperty(_handlers, _ActionTypes2.default.ROUTE_TO_NEXT, function (_ref4) {
      var getState = _ref4.getState;
      var dispatch = _ref4.dispatch;
      var action = _ref4.action;
      var next = _ref4.next;
      var meta = action.meta;

      var result = next(action);
      var routeTo = function routeTo() {
        dispatch(_Actions2.default.routeTo.apply(_Actions2.default, arguments));
      };
      var cancelRoute = function cancelRoute() {
        dispatch(_Actions2.default.cancelRoute.apply(_Actions2.default, arguments));
      };
      var nextMatch = (0, _routeKeyToRouteValue2.default)(meta.routeKey, routes);

      return Promise.resolve(result)
      // Handle onLeave for the current route.
      .then(function () {
        var _getState = getState();

        var router = _getState.router;

        if (router.next && router.next._routeId === meta._routeId) {
          if (router.current) {
            var currRouteInfo = (0, _mapUrlToRoute2.default)(router.current.url, routes);
            var currMatch = currRouteInfo && currRouteInfo.match;
            if (currMatch) {
              if (currMatch.onLeave && typeof currMatch.onLeave === 'function') {
                return currMatch.onLeave({ routeTo: routeTo, cancelRoute: cancelRoute, getState: getState, dispatch: dispatch, action: action, router: router });
              }
            }
          }
        }
      })
      // Handle onEnter for the next route.
      .then(function () {
        var _getState2 = getState();

        var router = _getState2.router;

        if (router.next && router.next._routeId === meta._routeId) {
          if (nextMatch && nextMatch.onEnter && typeof nextMatch.onEnter === 'function') {
            return nextMatch.onEnter({ routeTo: routeTo, cancelRoute: cancelRoute, getState: getState, dispatch: dispatch, action: action, router: router });
          }
        }
      })
      // Finally, move to the next route.
      .then(function () {
        var _getState3 = getState();

        var router = _getState3.router;
        // Finish the route if we're still routing the same route.

        if (router.next && router.next._routeId === meta._routeId) {
          return new Promise(function (resolve) {
            batchedUpdates(function () {
              var batchedDispatchResult = dispatch(_extends({}, action, {
                type: _ActionTypes2.default.ROUTE_TO
              }));
              resolve(batchedDispatchResult);
            });
          });
        }
      });
    }), _defineProperty(_handlers, _ActionTypes2.default.ROUTE_TO, function (_ref5) {
      var router = _ref5.router;
      var dispatch = _ref5.dispatch;
      var next = _ref5.next;
      var action = _ref5.action;
      var meta = action.meta;
      var event = action.payload.event;


      if (event.defaultPrevented) {
        return undefined;
      }

      if (event.metaKey || event.ctrlKey || event.shiftKey) {
        return dispatch(_extends({}, action, {
          type: _ActionTypes2.default.ROUTE_TO_WINDOW
        }));
      }

      var match = (0, _routeKeyToRouteValue2.default)(meta.routeKey, routes);

      // Only allow exiting if we have already routed, to prevent loops.
      if (router.current) {
        if (!match) {
          return dispatch(_extends({}, action, {
            type: _ActionTypes2.default.ROUTE_TO_EXIT
          }));
        }
      }

      return next(action);
    }), _defineProperty(_handlers, _ActionTypes2.default.ROUTE_TO_WINDOW, function (_ref6) {
      var action = _ref6.action;
      var meta = action.meta;
      var event = action.payload.event;


      if (event.shiftKey) {
        openWindow(meta.location.href, '_blank');
        return undefined;
      }

      openWindow(meta.location.href);
    }), _defineProperty(_handlers, _ActionTypes2.default.ROUTE_TO_EXIT, function (_ref7) {
      var action = _ref7.action;
      var meta = action.meta;


      if (typeof window !== 'undefined') {
        window.location.href = meta.location.href;
      }
    }), _handlers);

    return (0, _createMiddleware2.default)(store, handlers);
  };
};

exports.default = createRouterMiddleware;