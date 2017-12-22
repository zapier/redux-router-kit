/**
 * Check if two hrefs differ only by hash.
 */

const isOnlyHrefHashChange = (a, b) => {
  if (!a || !b) {
    return false;
  }

  const aPath = a.split('#')[0];
  const bPath = b.split('#')[0];
  const hasHashInA = a.includes('#');
  const hasHashInB = b.includes('#');

  if (aPath !== bPath) {
    return false;
  }

  if ((!hasHashInA && hasHashInB) || (hasHashInA && !hasHashInB)) {
    return true;
  }

  if (!hasHashInA && !hasHashInB) {
    return false;
  }

  // If there is a hash, but the string before the hash matches, then it is a
  // hash only change. If the hash values are mismatching, or the same, it does
  // not matter because the browser will deal with that.
  if (aPath === bPath) {
    return true;
  }

  return false;
};

export default isOnlyHrefHashChange;
