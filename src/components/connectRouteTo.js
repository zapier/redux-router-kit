/**
 * Add routeTo prop to your component.
 */

import { connect } from 'react-redux';

import { routeTo } from '../Actions';

const mapDispatchToProps = dispatch => {
  return {
    routeTo: (...args) => {
      dispatch(routeTo(...args));
    },
  };
};

const connectRouteTo = Component => {
  return connect(null, mapDispatchToProps)(Component);
};

export default connectRouteTo;
