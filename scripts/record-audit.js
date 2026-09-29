'use strict';
// Record a comparison after reviewed edits. A comparison is not a game-text certification.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { parseSet, comparable } = require('./reference');
const root = path.resolve(__dirname, '..');
const inventory = require('../data/sets.json');
const result = {};
const supplementary = require('../data/card-details.json');
for (const set of inventory) {
  const htmlFile = path.join(root, '.cache/reference', `${set.id}.html`);
  const html = fs.readFileSync(htmlFile, 'utf8');
  const reference = parseSet(html, set);
  const file = path.join(root, 'cards/en', set.file);
  const cards = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (reference.length !== cards.length)
    throw new Error(
      `${set.id}: reference count differs; review/import before recording audit`,
    );
  const differences = [];
  for (const { card, details } of reference) {
    const current = cards.find((c) => c.id === card.id);
    if (!current) throw new Error(`${card.id}: missing`);
    for (const field of Object.keys(card).filter(
      (field) => !['rarity', 'set'].includes(field),
    )) {
      if (comparable(current[field]) !== comparable(card[field]))
        differences.push({
          id: card.id,
          field,
          current: current[field],
          reference: card[field],
        });
    }
    for (const field of Object.keys(details)) {
      if (
        comparable(supplementary[card.id]?.[field]) !==
        comparable(details[field])
      )
        differences.push({
          id: card.id,
          field,
          current: supplementary[card.id]?.[field] ?? null,
          reference: details[field],
        });
    }
  }
  const metaFile = htmlFile.replace(/\.html$/, '.meta.json');
  const retrievedAt = fs.existsSync(metaFile)
    ? JSON.parse(fs.readFileSync(metaFile)).retrievedAt
    : fs.statSync(htmlFile).mtime.toISOString();
  result[set.id] = {
    status: 'reference-compared',
    checkedAt: retrievedAt.slice(0, 10),
    sourceUrl: set.sourceUrl,
    sourceHtmlSha256: createHash('sha256').update(html).digest('hex'),
    cardFileSha256: createHash('sha256')
      .update(fs.readFileSync(file))
      .digest('hex'),
    supplementarySha256: createHash('sha256')
      .update(
        JSON.stringify(
          Object.fromEntries(
            cards.map((card) => [card.id, supplementary[card.id]]),
          ),
        ),
      )
      .digest('hex'),
    checkedFields: [
      'id',
      'name',
      'element',
      'type',
      'subtype',
      'effect',
      'health',
      'pack',
      'attacks',
      'retreatCost',
      'weakness',
      'abilities',
      'evolvesFrom',
      'rules',
      'packs',
      'sourceUrl',
    ],
    uncheckedFields: ['rarity'],
    unresolvedDifferences: differences,
    notes: [
      'One community reference comparison, not an independent in-game audit.',
      'Rarity not certified: source symbols do not distinguish shiny from ordinary art rarities.',
      'Numbered inventory may include preview cards; individual release/availability dates are unknown.',
    ],
  };
}
fs.writeFileSync(
  path.join(root, 'data/verification.json'),
  JSON.stringify(result, null, 2) + '\n',
);
console.log(
  'Recorded source comparisons; unresolved differences remain visible in verification.json.',
);
