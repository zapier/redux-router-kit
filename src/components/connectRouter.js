/**
 * Add `router` prop to your component that has the full state of the router.
 * Also adds routeTo and cancelRoute actions.
 */

import { connect } from 'react-redux';

import { routeTo, cancelRoute } from '../Actions';

const mapStateToProps = (state) => {
  return {
    router: state.router
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    routeTo: (...args) => {
      dispatch(routeTo(...args));
    },
    cancelRoute: (...args) => {
      dispatch(cancelRoute(...args));
    }
  };
};

const connectRouter = (Component) => {
  return connect(mapStateToProps, mapDispatchToProps)(Component);
};

export default connectRouter;
