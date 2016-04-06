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

    return Array.isArray(b) &&
      a.length === b.length &&
      a.every((item, index) => statesAreEqual(item, b[index]));
  }

  return false;
};

export default statesAreEqual;
