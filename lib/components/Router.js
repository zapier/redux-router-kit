'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _routeKeyToRouteValue = require('../utils/routeKeyToRouteValue');

var _routeKeyToRouteValue2 = _interopRequireDefault(_routeKeyToRouteValue);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var componentFromRouteValue = function componentFromRouteValue(routeValue) {
  if (routeValue) {
    if (routeValue.component) {
      return routeValue.component;
    }
    if (typeof routeValue === 'function') {
      return routeValue;
    }
  }
  return undefined;
};

var Router = _react2.default.createClass({
  displayName: 'Router',


  propTypes: {
    router: _react.PropTypes.object.isRequired,
    routes: _react.PropTypes.object.isRequired,

    notFoundComponent: _react.PropTypes.func,
    renderNotFound: _react.PropTypes.func,

    defaultComponent: _react.PropTypes.func,
    renderDefault: _react.PropTypes.func,

    renderComponent: _react.PropTypes.func,

    renderRoute: _react.PropTypes.func
  },

  routeValue: function routeValue() {
    var _props = this.props;
    var router = _props.router;
    var routes = _props.routes;


    if (router.current) {
      return (0, _routeKeyToRouteValue2.default)(router.current.routeKey, routes) || null;
    }
    return null;
  },
  render: function render() {
    var _props2 = this.props;
    var router = _props2.router;
    var renderRoute = _props2.renderRoute;
    var renderComponent = _props2.renderComponent;
    var renderDefault = _props2.renderDefault;
    var renderNotFound = _props2.renderNotFound;
    var defaultComponent = _props2.defaultComponent;
    var notFoundComponent = _props2.notFoundComponent;


    if (router.current) {
      var routeValue = this.routeValue();

      var componentProps = _extends({}, router.current.params || {}, {
        query: router.current.query || {},
        router: router,
        routeValue: routeValue
      });

      if (renderRoute) {
        return renderRoute(componentProps);
      }

      var Component = routeValue ? componentFromRouteValue(routeValue) || defaultComponent : notFoundComponent;

      if (Component) {
        if (renderComponent) {
          return renderComponent(Component, componentProps);
        }

        return _react2.default.createElement(Component, componentProps);
      }

      if (!routeValue && renderNotFound) {
        return renderNotFound(componentProps);
      }

      if (renderDefault) {
        return renderDefault(componentProps);
      }
    }

    return null;
  }
});

exports.default = Router;