'use strict';
const { createHash } = require('node:crypto');
const { canonicalJson } = require('./canonical-json');
const sets = require('../data/sets.json');
const details = require('../data/card-details.json');
const verification = require('../data/verification.json');
const en = require('../cards/en');
const gameplayKeys = [
  'name',
  'element',
  'type',
  'subtype',
  'effect',
  'health',
  'attacks',
  'retreatCost',
  'weakness',
  'abilities',
  'evolvesFrom',
];
function gameplayFields(card, rules) {
  return {
    ...Object.fromEntries(gameplayKeys.map((key) => [key, card[key]])),
    rules,
  };
}
function gameplayId(fields) {
  // Full digest: art, rarity, packs and set are deliberately excluded.
  return (
    'gp-' + createHash('sha256').update(canonicalJson(fields)).digest('hex')
  );
}
function createDatabase(
  inventory = sets,
  exports = en,
  supplementary = details,
  evidence = verification,
) {
  const cards = inventory.flatMap((set) =>
    exports[set.exportName].map((card) => {
      const extra = supplementary[card.id];
      if (!extra) throw new Error(`Missing supplementary data for ${card.id}`);
      return {
        ...structuredClone(card),
        setId: set.id,
        number: Number(card.id.slice(card.id.lastIndexOf('-') + 1)),
        packs: [...extra.packs],
        rules: [...extra.rules],
        sourceUrl: extra.sourceUrl,
        gameplayId: gameplayId(gameplayFields(card, extra.rules)),
        alternatePrintIds: [],
      };
    }),
  );
  const byId = new Map();
  const groups = new Map();
  for (const card of cards) {
    if (byId.has(card.id)) throw new Error(`Duplicate print ${card.id}`);
    byId.set(card.id, card);
    if (!groups.has(card.gameplayId)) groups.set(card.gameplayId, []);
    groups.get(card.gameplayId).push(card);
  }
  const gameplay = [...groups.entries()].map(([id, prints]) => {
    const printIds = prints.map((card) => card.id).sort();
    for (const card of prints)
      card.alternatePrintIds = printIds.filter(
        (printId) => printId !== card.id,
      );
    return { id, ...gameplayFields(prints[0], prints[0].rules), printIds };
  });
  const setRecords = inventory.map((set) => ({
    ...set,
    cardCount: exports[set.exportName].length,
    packs: [
      ...new Set(
        cards
          .filter((card) => card.setId === set.id)
          .flatMap((card) => card.packs),
      ),
    ].sort(),
    verification: evidence[set.id],
  }));
  return {
    schemaVersion: 1,
    cards,
    gameplay,
    sets: setRecords,
    findById: (id) => byId.get(id),
    findByName: (name) =>
      cards.filter((card) => card.name.toLowerCase() === name.toLowerCase()),
    cardsForSet: (id) => cards.filter((card) => card.setId === id),
  };
}
module.exports = { createDatabase, gameplayFields, gameplayId };
