"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var routeKeyToRouteValue = function routeKeyToRouteValue(routeKey, routes) {
  return routes && routes[routeKey];
};

exports.default = routeKeyToRouteValue;