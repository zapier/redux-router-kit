'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createBrowserHistory = require('history/lib/createBrowserHistory');

var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _onLink = require('../utils/onLink');

var _onLink2 = _interopRequireDefault(_onLink);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var History = _react2.default.createClass({
  displayName: 'History',
  shouldComponentUpdate: function shouldComponentUpdate(_ref) {
    var url = _ref.url;

    return url !== this.props.url;
  },
  componentWillMount: function componentWillMount() {
    var _this = this;

    this.history = (0, _createBrowserHistory2.default)();
    this.history.listenBefore(this.onBeforeLocationChange);
    (0, _onLink2.default)(function (event) {
      if (event.target.href) {
        event.preventDefault();
        _this.props.onChange(event.target.href);
      }
    });
    // Transition if necessary.
    this.transition({
      replace: true
    });
  },
  transition: function transition() {
    var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var replace = _ref2.replace;

    this.shouldIgnoreChange = true;
    if (replace || this.props.replace) {
      this.history.replace(this.props.url);
    } else {
      this.history.push(this.props.url);
    }
    this.shouldIgnoreChange = false;
  },
  componentDidUpdate: function componentDidUpdate() {
    if (this.waitingUrl) {
      if (this.waitingUrl === this.props.url) {
        this.finish();
      } else {
        this.finish(false);
        this.transition();
      }
      this.finish = null;
      this.waitingUrl = null;
    } else {
      this.transition();
    }
  },
  onBeforeLocationChange: function onBeforeLocationChange(location, callback) {
    var newUrl = '' + location.pathname + location.search + location.hash;
    if (this.shouldIgnoreChange || newUrl === this.props.url) {
      this.shouldIgnoreChange = false;
      callback();
      return;
    }
    this.waitingUrl = '' + location.pathname + location.search + location.hash;
    this.finish = function (result) {
      callback(result);
    };
    this.props.onChange('' + location.pathname + location.search + location.hash);
  },
  render: function render() {
    return null;
  }
});

exports.default = History;