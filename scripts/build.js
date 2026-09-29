'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { createDatabase } = require('../lib/database');
const pkg = require('../package.json');
const root = path.resolve(__dirname, '..');
function build(destination = path.join(root, 'dist')) {
  const database = createDatabase();
  fs.rmSync(destination, { recursive: true, force: true });
  const out = path.join(destination, 'v1');
  fs.mkdirSync(path.join(out, 'sets'), { recursive: true });
  const checksums = {};
  function write(file, value) {
    const text = JSON.stringify(value, null, 2) + '\n';
    fs.writeFileSync(path.join(out, file), text);
    checksums[file] = createHash('sha256').update(text).digest('hex');
  }
  write('cards.json', database.cards);
  write('gameplay.json', database.gameplay);
  write('sets.json', database.sets);
  for (const set of database.sets)
    write(`sets/${set.id}.json`, database.cardsForSet(set.id));
  write('metadata.json', {
    schemaVersion: 1,
    version: pkg.version,
    language: 'en',
    cardCount: database.cards.length,
    gameplayCount: database.gameplay.length,
    setCount: database.sets.length,
    referenceCheckedAt: [
      ...new Set(database.sets.map((set) => set.verification.checkedAt)),
    ].sort(),
    coverage:
      'Reference-listed prints; includes previews. See docs/coverage.md for audit limits.',
    provenance:
      'https://github.com/jacobcorbett/pokemon-tcg-pocket-card-database',
    upstream:
      'https://github.com/hugoburguete/pokemon-tcg-pocket-card-database',
    checksums,
  });
  return database;
}
if (require.main === module) {
  const database = build();
  console.log(
    `Built schema v1: ${database.cards.length} prints, ${database.gameplay.length} gameplay records, ${database.sets.length} sets.`,
  );
}
module.exports = { build };
