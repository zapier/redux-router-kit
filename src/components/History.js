import createHistory from 'history/lib/createBrowserHistory';
import createLocation from 'history/lib/createLocation';
import React, { PropTypes } from 'react';

import onLink from '../utils/onLink';
import statesAreEqual from '../utils/statesAreEqual';

const History = React.createClass({

  propTypes: {
    url: PropTypes.string,
    state: PropTypes.object
  },

  shouldComponentUpdate({url, state}) {
    return url !== this.props.url || !statesAreEqual(state, this.props.state);
  },

  componentWillMount() {
    this.history = this.props.history || createHistory();
    if (this.props.url == null) {
      const unlistenCurrent = this.history.listen(location => {
        this.initialUrl = `${location.pathname}${location.search}${location.hash}`;
        this.initialState = location.state;
      });
      unlistenCurrent();
    }
    this.history.listenBefore(this.onBeforeLocationChange);
    this.unsubscribeFromLinks = onLink((event) => {
      if (event.target.href) {
        event.preventDefault();
        this.props.onChange(event.target.href);
      }
    });
    // Transition if necessary.
    this.transition({
      url: this.initialUrl != null ? this.initialUrl : undefined,
      state: this.initialState != null ? this.initialState : undefined,
      replace: true
    });
  },

  componentDidMount() {
    if (this.props.url == null && this.initialUrl != null) {
      this.props.onChange(this.initialUrl, this.initialState);
    }
  },

  componentWillUnmount() {
    this.unsubscribeFromLinks();
  },

  transition({replace, url = this.props.url, state = this.props.state} = {}) {
    const location = createLocation(url);
    if (typeof state !== 'undefined') {
      location.state = state;
    }
    this.shouldIgnoreChange = true;
    if (replace || this.props.replace) {
      this.history.replace(location);
    } else {
      this.history.push(location);
    }
    this.shouldIgnoreChange = false;
  },

  componentDidUpdate() {
    if (this.waitingUrl) {
      if (this.waitingUrl === this.props.url && statesAreEqual(this.waitingState, this.props.state)) {
        this.finish();
      } else {
        this.finish(false);
        this.transition();
      }
      this.finish = null;
      this.waitingUrl = null;
      this.waitingState = null;
    } else {
      this.transition();
    }
  },

  onBeforeLocationChange(location, callback) {
    const newUrl = `${location.pathname}${location.search}${location.hash}`;
    const newState = location.state;
    if (this.shouldIgnoreChange || (newUrl === this.props.url && statesAreEqual(newState, this.props.state))) {
      this.shouldIgnoreChange = false;
      callback();
      return;
    }
    this.waitingUrl = newUrl;
    this.waitingState = newState;
    this.finish = (result) => {
      callback(result);
    };
    this.props.onChange(
      newUrl,
      newState
    );
  },

  render() {
    return null;
  }
});

export default History;
