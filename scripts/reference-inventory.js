'use strict';
const assert = require('node:assert/strict');
const { load } = require('cheerio');

function parseInventory(html) {
  const $ = load(html);
  const observed = new Set();
  $('table tr').each((_, row) => {
    const href = $(row).find('a').first().attr('href');
    if (!href || !href.startsWith('/cards/')) return;
    // Discover identifiers from the source, including future series and special
    // packs. Unknown formats must require review rather than disappear.
    const match = /^\/cards\/([a-z0-9-]+)\/?$/i.exec(href);
    assert(match, `Unrecognised reference inventory link: ${href}`);
    observed.add(match[1].toLowerCase());
  });
  assert(observed.size > 0, 'Could not parse the reference set inventory');
  return [...observed].sort();
}

module.exports = { parseInventory };
