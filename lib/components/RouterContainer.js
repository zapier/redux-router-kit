'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reduxRouterKit = require('app/common/redux-router-kit');

var _History = require('./History');

var _History2 = _interopRequireDefault(_History);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RouterContainer = _react2.default.createClass({
  displayName: 'RouterContainer',


  propTypes: {
    routes: _react.PropTypes.object.isRequired
  },

  onChangeAddress: function onChangeAddress(url) {
    this.props.routeTo(url);
  },
  render: function render() {
    var router = this.props.router;


    if (!router.current) {
      return null;
    }

    return _react2.default.createElement(
      'div',
      null,
      _react2.default.createElement(_reduxRouterKit.Router, _extends({}, this.props, { router: router })),
      _react2.default.createElement(_History2.default, { url: router.current.url, onChange: this.onChangeAddress })
    );
  }
});

exports.default = (0, _reduxRouterKit.connectRouter)(RouterContainer);