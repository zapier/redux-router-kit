import React, { PropTypes } from 'react';
import Router from './Router';
import connectRouter from './connectRouter';
import History from './History';

const RouterContainer = React.createClass({

  propTypes: {
    routes: PropTypes.object.isRequired
  },

  onChangeAddress(url, state) {
    this.props.routeTo(url, {
      state
    });
  },

  render() {
    const { router } = this.props;

    const url = router.current ? router.current.url : null;
    const state = router.current ? router.current.state : undefined;
    const replace = router.current ? router.current.replace : undefined;

    return (
      <div>
        <Router {...this.props} router={router}/>
        <History
          url={url} state={state} replace={replace}
          onChange={this.onChangeAddress}
        />
      </div>
    );
  }
});

export default connectRouter(RouterContainer);
