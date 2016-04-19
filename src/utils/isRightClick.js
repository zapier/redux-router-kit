/**
 * Check if an event is a right-click.
 */

const isRightClick = (event = {}) => {
  // We can only make a determination if there's a `which` or `button`.
  if (event.which != null || event.button != null) {
    // jsdom only has event.button
    // srsly guise, why two different numbers for the same button???
    if (event.which == null) {
      // left button
      if (event.button !== 0) {
        return true;
      }
    } else {
      // left button
      if (event.which !== 1) {
        return true;
      }
    }
  }

  return false;
};

export default isRightClick;
