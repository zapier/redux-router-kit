/**
 * RouterContainer is already connected to the router state, so you only have to
 * pass in `routes`.
 */

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';
import Router from './Router';
import connectRouter from './connectRouter';

const RouterContainer = createReactClass({
  propTypes: {
    routes: PropTypes.object.isRequired,
  },

  render() {
    const { router } = this.props;

    return <Router {...this.props} router={router} />;
  },
});

export default connectRouter(RouterContainer);
