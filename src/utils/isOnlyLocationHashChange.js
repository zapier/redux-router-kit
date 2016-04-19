/**
 * Check if two locations differ only by hash.
 */

const isOnlyLocationHashChange = (locationA, locationB) => {
  if (locationA && locationB) {
    const pathAndQueryA = `${locationA.origin}${locationA.pathname}${locationA.search}`;
    const pathAndQueryB = `${locationB.origin}${locationB.pathname}${locationB.search}`;
    return pathAndQueryA === pathAndQueryB;
  }
  return false;
};

export default isOnlyLocationHashChange;
