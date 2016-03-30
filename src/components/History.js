import createHistory from 'history/lib/createBrowserHistory';
import React from 'react';
import onLink from '../utils/onLink';

const History = React.createClass({

  shouldComponentUpdate({url}) {
    return url !== this.props.url;
  },

  componentWillMount() {
    this.history = createHistory();
    this.history.listenBefore(this.onBeforeLocationChange);
    onLink((event) => {
      if (event.target.href) {
        event.preventDefault();
        this.props.onChange(event.target.href);
      }
    });
    // Transition if necessary.
    this.transition({
      replace: true
    });
  },

  transition({replace} = {}) {
    this.shouldIgnoreChange = true;
    if (replace || this.props.replace) {
      this.history.replace(this.props.url);
    } else {
      this.history.push(this.props.url);
    }
    this.shouldIgnoreChange = false;
  },

  componentDidUpdate() {
    if (this.waitingUrl) {
      if (this.waitingUrl === this.props.url) {
        this.finish();
      } else {
        this.finish(false);
        this.transition();
      }
      this.finish = null;
      this.waitingUrl = null;
    } else {
      this.transition();
    }
  },

  onBeforeLocationChange(location, callback) {
    const newUrl = `${location.pathname}${location.search}${location.hash}`;
    if (this.shouldIgnoreChange || newUrl === this.props.url) {
      this.shouldIgnoreChange = false;
      callback();
      return;
    }
    this.waitingUrl = `${location.pathname}${location.search}${location.hash}`;
    this.finish = (result) => {
      callback(result);
    };
    this.props.onChange(`${location.pathname}${location.search}${location.hash}`);
  },

  render() {
    return null;
  }
});

export default History;
