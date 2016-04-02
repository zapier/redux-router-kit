import React, { PropTypes } from 'react';
import Router from './Router';
import connectRouter from './connectRouter';
import History from './History';

const RouterContainer = React.createClass({

  propTypes: {
    routes: PropTypes.object.isRequired
  },

  onChangeAddress(url) {
    this.props.routeTo(url);
  },

  render() {
    const { router } = this.props;

    if (!router.current) {
      return null;
    }

    return (
      <div>
        <Router {...this.props} router={router}/>
        <History url={router.current.url} replace={router.current.replace} onChange={this.onChangeAddress}/>
      </div>
    );
  }
});

export default connectRouter(RouterContainer);
