'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { database, en } = require('../index');
const { createDatabase } = require('../lib/database');
test('legacy exports preserve records and derived exports never mutate them', () => {
  const before = JSON.stringify(en);
  const derived = createDatabase();
  derived.cards[0].attacks[0].name = 'Consumer edit';
  assert.equal(JSON.stringify(en), before);
  assert.equal(en.geneticApex[0].id, 'a1-001');
  assert.equal(en.promoB.length, 94);
  assert.equal('gameplayId' in en.geneticApex[0], false);
});
test('all print groups partition the inventory and include only matching gameplay', () => {
  const seen = new Set();
  for (const group of database.gameplay) {
    for (const id of group.printIds) {
      assert(!seen.has(id));
      seen.add(id);
      const print = database.findById(id);
      assert.equal(print.gameplayId, group.id);
      assert.deepEqual(
        print.alternatePrintIds,
        group.printIds.filter((other) => other !== id),
      );
    }
  }
  assert.equal(seen.size, database.cards.length);
  const bulb = database.findById('a1-001');
  assert(
    bulb.alternatePrintIds.includes('a1-227'),
    'Bulbasaur art should share gameplay',
  );
  const different = database.cards.find(
    (card) => card.name === 'Bulbasaur' && card.health !== bulb.health,
  );
  assert(
    different && different.gameplayId !== bulb.gameplayId,
    'same name must not imply identical gameplay',
  );
});
test('changing rules or attack cost creates a distinct gameplay group', () => {
  const base = en.geneticApex[0];
  const sets = [{ id: 'a1', exportName: 'sample' }];
  const make = (card, rules) =>
    createDatabase(
      sets,
      { sample: [base, card] },
      {
        [base.id]: { packs: [], rules: [], sourceUrl: '' },
        [card.id]: { packs: [], rules, sourceUrl: '' },
      },
      {},
    );
  assert.equal(make({ ...base, id: 'a1-999' }, []).gameplay.length, 1);
  assert.equal(
    make({ ...base, id: 'a1-999' }, ['Different rule']).gameplay.length,
    2,
  );
  const changed = structuredClone(base);
  changed.id = 'a1-999';
  changed.attacks[0].cost.push('Colorless');
  assert.equal(make(changed, []).gameplay.length, 2);
});
test('reference corrections include missing effects, damage and energy counts', () => {
  assert.equal(database.findById('b4a-043').attacks[0].damage, '60');
  assert.equal(database.findById('b4a-021').attacks[1].cost.length, 3);
  assert(
    database
      .findById('b4a-100')
      .attacks[0].effect.includes('prevent all damage'),
  );
  assert.equal(database.findById('b4a-096').attacks[0].cost[0], 'Fire');
  assert(database.findById('p-b-094'));
});
test('lookups support case-insensitive names and missing IDs', () => {
  assert(database.findByName('bulbasaur').length > 1);
  assert.equal(database.findById('missing'), undefined);
  assert.deepEqual(database.cardsForSet('missing'), []);
  assert.equal(
    database.cardsForSet('b4a').length,
    en.teamRocketsAmbition.length,
  );
});
test('source-derived ex rules are included in enriched records', () => {
  const mega = database.cards.find(
    (card) => card.name.startsWith('Mega ') && card.name.endsWith(' ex'),
  );
  assert(mega.rules.some((rule) => rule.includes('3 points')));
});

test('gameplay content fingerprints ignore object key ordering', () => {
  const { gameplayId, gameplayFields } = require('../lib/database');
  const card = structuredClone(en.geneticApex[0]);
  const before = gameplayId(gameplayFields(card, []));
  card.attacks = card.attacks.map((attack) =>
    Object.fromEntries(Object.entries(attack).reverse()),
  );
  assert.equal(gameplayId(gameplayFields(card, [])), before);
});
