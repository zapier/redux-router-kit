'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cancelRoute = exports.routeTo = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _ActionTypes = require('./ActionTypes');

var _ActionTypes2 = _interopRequireDefault(_ActionTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var routeTo = exports.routeTo = function routeTo(href) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];


  return {
    type: _ActionTypes2.default.ROUTE_TO_INIT,
    payload: _extends({
      href: href
    }, options)
  };
};

var cancelRoute = exports.cancelRoute = function cancelRoute() {

  return {
    type: _ActionTypes2.default.CANCEL_ROUTE
  };
};

exports.default = {
  routeTo: routeTo,
  cancelRoute: cancelRoute
};