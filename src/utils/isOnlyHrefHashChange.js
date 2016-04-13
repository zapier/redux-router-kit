const isOnlyHrefHashChange = (a, b) => {
  if (a === b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  if (a.split('#')[0] === b.split('#')[0]) {
    return true;
  }
  // TODO: check for relative href
  return false;
};

export default isOnlyHrefHashChange;
