/**
 * Checks if two states are equal. Lifted from
 * https://github.com/mjackson/history/blob/650d25bfd66da0bb68bcb97232c032b63c02ac9d/modules/LocationUtils.js#L26-L59
 * which unfortunately isn't available to the npm module.
 */

const statesAreEqual = (a = null, b = null) => {
  if (a === b) {
    return true;
  }

  const typeofA = a === null ? 'null' : typeof a;
  const typeofB = b === null ? 'null' : typeof b;

  if (typeofA !== typeofB) {
    return false;
  }

  if (typeofA === 'object') {
    if (!Array.isArray(a)) {
      return Object.keys(a).every(key => statesAreEqual(a[key], b[key]));
    }

    return (
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => statesAreEqual(item, b[index]))
    );
  }

  return false;
};

export default statesAreEqual;
