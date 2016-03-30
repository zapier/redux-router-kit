import urlParse from 'url-parse';

const schemeMatcher = /^([a-zA-Z]*\:)?\/\//;

const hasScheme = url => {
  if (typeof url !== 'string') {
    return false;
  }
  return schemeMatcher.test(url);
};

const parseUrl = (url = '', baseUrl) => {

  if (!hasScheme(url)) {
    if (!hasScheme(baseUrl)) {
      throw new Error('Must provide scheme in url or baseUrl to parse.');
    }
  }

  if (!hasScheme(url)) {
    if (url[0] !== '/') {
      throw new Error('Only absolute URLs are currently supported.');
    }
  }

  const urlObj = urlParse(url, baseUrl);

  return {
    protocol: urlObj.protocol,
    host: urlObj.host,
    hostname: urlObj.hostname,
    port: urlObj.port,
    pathname: urlObj.pathname,
    hash: urlObj.hash,
    search: urlObj.query,
    origin: urlObj.host ? (urlObj.protocol + '//' + urlObj.host) : '',
    href: urlObj.href
  };
};

export default parseUrl;
