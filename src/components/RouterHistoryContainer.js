/**
 * RouterHistoryContainer is already connected to the router state, so you only
 * have to pass in `routes`. It also responds to history/click events and
 * dispatches routeTo actions appropriately.
 */

import React from 'react';
import createReactClass from 'create-react-class';
import PropTypes from 'prop-types';

import Router from './Router';
import connectRouter from './connectRouter';
import History from './History';

const RouterHistoryContainer = createReactClass({
  propTypes: {
    routes: PropTypes.object.isRequired,
  },

  onChangeAddress(url, state) {
    this.props.routeTo(url, {
      state,
      isHistoryChange: true,
    });
  },

  render() {
    const { router } = this.props;

    const url = router.current ? router.current.url : null;
    const state = router.current ? router.current.state : undefined;
    const replace = router.current ? router.current.replace : undefined;

    return (
      <div>
        <Router {...this.props} router={router} />
        <History
          history={this.props.history}
          url={url}
          state={state}
          replace={replace}
          isWaiting={!!router.next}
          onChange={this.onChangeAddress}
        />
      </div>
    );
  },
});

export default connectRouter(RouterHistoryContainer);
