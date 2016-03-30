'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _reactRedux = require('react-redux');

var _Actions = require('../Actions');

var mapStateToProps = function mapStateToProps(state) {
  return {
    router: state.router
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch) {
  return {
    routeTo: function routeTo() {
      dispatch(_Actions.routeTo.apply(undefined, arguments));
    },
    cancelRoute: function cancelRoute() {
      dispatch(_Actions.cancelRoute.apply(undefined, arguments));
    }
  };
};

var connectRouter = function connectRouter(Component) {
  return (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(Component);
};

exports.default = connectRouter;