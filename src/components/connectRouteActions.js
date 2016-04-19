/**
 * Add routeTo, cancelRoute props to your component.
 */

import { connect } from 'react-redux';

import { routeTo, cancelRoute } from '../Actions';

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

const connectRouteActions = (Component) => {
  return connect(null, mapDispatchToProps)(Component);
};

export default connectRouteActions;
