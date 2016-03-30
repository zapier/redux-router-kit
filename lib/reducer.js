'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = reducer;

var _ActionTypes = require('./ActionTypes');

var _ActionTypes2 = _interopRequireDefault(_ActionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var defaultState = {
  current: null,
  next: null
};

function reducer() {
  var state = arguments.length <= 0 || arguments[0] === undefined ? defaultState : arguments[0];
  var action = arguments[1];

  if (action) {

    if (action.type === _ActionTypes2.default.CANCEL_ROUTE) {

      state = _extends({}, state, {
        next: null
      });
    } else if (action.type === _ActionTypes2.default.ROUTE_TO_NEXT) {
      var payload = action.payload;
      var meta = action.meta;


      state = _extends({}, state, {
        next: _extends({}, meta.state, {
          _routeId: meta._routeId,
          routeKey: meta.routeKey,
          location: meta.location,
          url: meta.url,
          replace: !!payload.replace
        }),
        origin: state.origin || meta.location.origin
      });
    } else if (action.type === _ActionTypes2.default.ROUTE_TO) {
      var _payload = action.payload;
      var _meta = action.meta;


      state = _extends({}, state, {
        previous: state.current,
        current: _extends({}, _meta.state, {
          _routeId: _meta._routeId,
          routeKey: _meta.routeKey,
          location: _meta.location,
          url: _meta.url,
          replace: !!_payload.replace
        }),
        next: null,
        origin: state.origin || _meta.location.origin
      });
    }
  }

  return state;
}