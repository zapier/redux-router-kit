'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _connectRouter = require('./connectRouter');

var _connectRouter2 = _interopRequireDefault(_connectRouter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var browserUrl = function browserUrl() {
  if (typeof document === 'undefined') {
    return '';
  }
  if (typeof document.location === 'undefined') {
    return '';
  }
  return document.location.href || '';
};

var RouteToBrowserLocation = _react2.default.createClass({
  displayName: 'RouteToBrowserLocation',
  componentDidMount: function componentDidMount() {
    var _props = this.props;
    var router = _props.router;
    var routeTo = _props.routeTo;

    var url = browserUrl();
    if (!router.current && url) {
      routeTo(url);
    }
  },
  render: function render() {
    var _props2 = this.props;
    var router = _props2.router;
    var children = _props2.children;
    var renderBeforeCurrent = _props2.renderBeforeCurrent;

    if (!router.current && renderBeforeCurrent) {
      return renderBeforeCurrent({ router: router, href: browserUrl() });
    }
    if (typeof children === 'function') {
      return children(router);
    }
    if (!router.current) {
      return null;
    }
    return children;
  }
});

exports.default = (0, _connectRouter2.default)(RouteToBrowserLocation);