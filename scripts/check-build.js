'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const Ajv = require('ajv');
const { database } = require('../index');
const out = path.resolve(__dirname, '../dist/v1');
const read = (file) =>
  JSON.parse(fs.readFileSync(path.join(out, file), 'utf8'));
const cards = read('cards.json');
const gameplay = read('gameplay.json');
const validate = new Ajv({ allErrors: true }).compile(
  require('../schema/print.schema.json'),
);
for (const card of cards)
  assert(
    validate(card),
    `${card.id}: invalid export ${JSON.stringify(validate.errors)}`,
  );
assert.deepEqual(cards, database.cards);
assert.deepEqual(gameplay, database.gameplay);
assert.deepEqual(read('sets.json'), database.sets);
for (const set of database.sets)
  assert.deepEqual(read(`sets/${set.id}.json`), database.cardsForSet(set.id));
const metadata = read('metadata.json');
assert.equal(metadata.cardCount, cards.length);
assert.equal(metadata.gameplayCount, gameplay.length);
assert.equal(metadata.setCount, database.sets.length);
for (const [file, hash] of Object.entries(metadata.checksums)) {
  assert.equal(
    createHash('sha256')
      .update(fs.readFileSync(path.join(out, file)))
      .digest('hex'),
    hash,
    `${file}: hash mismatch`,
  );
}
const expectedFiles = [
  'cards.json',
  'gameplay.json',
  'sets.json',
  'metadata.json',
  ...database.sets.map((set) => `sets/${set.id}.json`),
];
assert.deepEqual(
  fs
    .readdirSync(out, { recursive: true })
    .filter((file) => file.endsWith('.json'))
    .sort(),
  expectedFiles.sort(),
);
console.log('Validated exported records, set shards and SHA-256 checksums.');
