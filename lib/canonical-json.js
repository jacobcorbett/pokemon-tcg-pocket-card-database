'use strict';
// JSON object key order must not affect a content identifier or comparison.
function canonicalJson(value) {
  function ordered(item) {
    if (Array.isArray(item)) return item.map(ordered);
    if (item && typeof item === 'object') {
      return Object.fromEntries(
        Object.keys(item)
          .sort()
          .map((key) => [key, ordered(item[key])]),
      );
    }
    return item;
  }
  return JSON.stringify(ordered(value));
}
module.exports = { canonicalJson };
