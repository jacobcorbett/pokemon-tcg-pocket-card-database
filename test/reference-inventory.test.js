'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseInventory } = require('../scripts/reference-inventory');

const inventory = (codes) =>
  `<table>${codes.map((code) => `<tr><td><a href="/cards/${code}">${code}</a></td></tr>`).join('')}</table>`;

test('inventory discovery includes new series, promos and special packs', () => {
  const observed = parseInventory(
    inventory(['A1', 'B4b', 'C1', 'P-C', 'D1c', 'SPECIAL-1']),
  );
  assert.deepEqual(observed, ['a1', 'b4b', 'c1', 'd1c', 'p-c', 'special-1']);
});

test('inventory discovery fails closed on empty pages or unknown link formats', () => {
  assert.throws(() => parseInventory('<html>Error</html>'), /Could not parse/);
  assert.throws(
    () => parseInventory(inventory(['A1', 'C1?unexpected=yes'])),
    /Unrecognised reference inventory link/,
  );
});
