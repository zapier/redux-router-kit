'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var isSameOrigin = function isSameOrigin(href) {
  var origin = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  return href.substring(0, origin.length) === origin;
};

var routableUrl = function routableUrl(href) {
  var origin = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

  if (!isSameOrigin(href, origin)) {
    return null;
  }
  return href.substring(origin.length);
};

exports.default = routableUrl;