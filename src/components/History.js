/**
 * Abstracts browser history as a component. `url` passed in will become the
 * new browser address. Any changes to the history will call the `onChange`
 * callback.
 *
 * All links will be wired up and also act as history events.
 *
 * Thanks to https://github.com/cerebral/addressbar and
 * https://github.com/christianalfoni/react-addressbar for the inspiration.
 *
 * A couple reasons to create a different implementation based on
 * https://github.com/mjackson/history:
 *
 * - addressbar doesn't keep track of history, so when you block navigation,
 *   you _always_ lose forward history.
 * - mjackson/history provides memory implementations which are nice for
 *   testing!
 */

import createHistory from 'history/lib/createBrowserHistory';
import createLocation from 'history/lib/createLocation';
import React from 'react';
import PropTypes from 'prop-types';

import onLink from '../utils/onLink';
import statesAreEqual from '../utils/statesAreEqual';
import isOnlyHrefHashChange from '../utils/isOnlyHrefHashChange';

const History = React.createClass({

  propTypes: {
    url: PropTypes.string,
    state: PropTypes.object,
    onChange: PropTypes.func,
    isWaiting: PropTypes.bool,
    history: PropTypes.object
  },

  shouldComponentUpdate({url, state, isWaiting}) {
    return (this.waitingUrl != null && !isWaiting) ||
           url !== this.props.url || !statesAreEqual(state, this.props.state);
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
    this.unlistenBeforeLocationChange =
      this.history.listenBefore(this.onBeforeLocationChange);
    this.unsubscribeFromLinks = onLink((event) => {
      if (event.target.href) {
        // Anchor tags are frontend-only anyway, so they will get picked up
        // by history. Don't let them call `onChange`.
        let shouldEmit = true;
        if (typeof window !== 'undefined') {
          if (isOnlyHrefHashChange(window.location.href, event.target.href)) {
            shouldEmit = false;
          }
        }
        if (shouldEmit) {
          event.preventDefault();
          this.props.onChange(event.target.href);
        }
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
    this.unlistenBeforeLocationChange();
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
    if (this.waitingUrl != null) {
      if (this.waitingUrl === this.props.url && statesAreEqual(this.waitingState, this.props.state)) {
        this.finish();
      } else {
        this.transition();
      }
      this.finish = null;
      this.waitingUrl = null;
      this.waitingState = null;
    } else {
      this.transition();
    }
  },

  componentWillReceiveProps({url, state, isWaiting}) {
    // Cancel synchronously.
    if (this.waitingUrl != null && !isWaiting) {
      if (this.waitingUrl !== url || !statesAreEqual(this.waitingState, state)) {
        this.finish(false);
      }
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
