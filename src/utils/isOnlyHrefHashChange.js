/**
 * Check if two hrefs differ only by hash.
 */

const isOnlyHrefHashChange = (a, b) => {
  if (!a || !b) {
    return false;
  }

  if (!a.includes('#') || !b.includes('#')) {
    return false;
  }

  // If there is a hash, but the string before the hash matches, then it is a
  // hash only change. If the hash values are mismatching, or the same, it does
  // not matter because the browser will deal with that.
  if (a.split('#')[0] === b.split('#')[0]) {
    return true;
  }

  return false;
};

export default isOnlyHrefHashChange;
