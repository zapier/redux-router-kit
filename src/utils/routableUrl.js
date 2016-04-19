/**
 * Exports `routabelUrl` to make sure that we can route to the url.
 */

const isSameOrigin = (href, origin = '') => {
  return href.substring(0, origin.length) === origin;
};

const routableUrl = (href, origin = '') => {
  if (!isSameOrigin(href, origin)) {
    return null;
  }
  return href.substring(origin.length);
};

export default routableUrl;
