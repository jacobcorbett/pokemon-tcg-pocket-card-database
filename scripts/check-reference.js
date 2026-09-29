'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { load } = require('cheerio');
const sets = require('../data/sets.json');
const verification = require('../data/verification.json');
const cache = path.resolve(__dirname, '../.cache/reference');
const report = JSON.parse(fs.readFileSync(path.join(cache, 'comparison.json')));
assert.equal(
  report.length,
  sets.length,
  'Run the full reference comparison first',
);
for (const entry of report) {
  const set = sets.find((set) => set.id === entry.id);
  assert.equal(
    entry.referenceCount,
    set.expectedCount,
    `${entry.id}: reference inventory changed`,
  );
  const meaningful = entry.changes.filter(
    (change) => !['rarity', 'set'].includes(change.field),
  );
  assert.deepEqual(
    meaningful,
    verification[entry.id].unresolvedDifferences,
    `${entry.id}: new reference discrepancies; review comparison.json`,
  );
}
const $ = load(fs.readFileSync(path.join(cache, 'sets.html'), 'utf8'));
const observed = [];
$('table tr').each((_, row) => {
  const href = $(row).find('a').first().attr('href');
  if (!href || !/^\/cards\/(?:[AB]\d+[ab]?|P-[AB])$/.test(href)) return;
  observed.push(href.slice('/cards/'.length).toLowerCase());
});
assert(observed.length > 0, 'Could not parse the reference set inventory');
assert.deepEqual(
  observed.sort(),
  sets.map((set) => set.id).sort(),
  'Source has new/missing sets; review inventory',
);
console.log(
  'No new inventory or gameplay discrepancies (rarity remains unchecked).',
);
