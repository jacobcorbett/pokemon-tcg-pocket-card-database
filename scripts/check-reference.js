'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { parseInventory } = require('./reference-inventory');
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
const serebiiObserved = require('./reference-serebii').parseSerebiiInventory(
  fs.readFileSync(path.join(cache, 'serebii-index.html'), 'utf8'),
);
const slug = (value) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const serebiiExpected = sets.map(
  (set) =>
    '/tcgpocket/' +
    (set.referenceSource === 'serebii'
      ? 'firstpartners'
      : set.id.startsWith('p-')
        ? 'promo-' + set.id.slice(2)
        : slug(set.name)),
);
assert.deepEqual(
  serebiiObserved.map(slug).sort(),
  serebiiExpected.map(slug).sort(),
  'Serebii has new/missing inventories',
);
const observed = parseInventory(
  fs.readFileSync(path.join(cache, 'sets.html'), 'utf8'),
);
assert.deepEqual(
  observed.sort(),
  sets
    .filter((set) => set.referenceSource !== 'serebii')
    .map((set) => set.id)
    .sort(),
  'Source has new/missing sets; review inventory',
);
const pending = require('../data/preview-inventories.json').filter(
  (item) => item.status === 'pending-card-detail-verification',
);
assert.equal(
  pending.length,
  0,
  `Additional source inventories still need verification: ${pending.map((item) => item.id).join(', ')}`,
);
console.log(
  'No new inventory or gameplay discrepancies (rarity remains unchecked).',
);
