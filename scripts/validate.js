'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const cardsRoot = path.join(root, 'cards');
const enRoot = path.join(cardsRoot, 'en');

const sets = {
  'a1-genetic-apex.json': ['a1', 286, 'geneticApex'],
  'a1a-mythical-island.json': ['a1a', 86, 'mythicalIsland'],
  'a2-space-time-smackdown.json': ['a2', 207, 'spaceTimeSmackdown'],
  'a2a-triumphant-light.json': ['a2a', 96, 'triumphantLight'],
  'a2b-shining-revelry.json': ['a2b', 111, 'shiningRevelry'],
  'a3-celestial-guardians.json': ['a3', 239, 'celestialGuardians'],
  'a3a-extradimensional-crisis.json': ['a3a', 103, 'extradimensionalCrisis'],
  'a3b-eevee-grove.json': ['a3b', 107, 'eeveeGrove'],
  'a4-wisdom-of-sea-and-sky.json': ['a4', 241, 'wisdomOfSeaAndSky'],
  'a4a-secluded-springs.json': ['a4a', 105, 'secludedSprings'],
  'a4b-deluxe-pack-ex.json': ['a4b', 379, 'deluxePackEx'],
  'promo-a.json': ['p-a', 117, 'promoA'],
  'b1-mega-rising.json': ['b1', 331, 'megaRising'],
  'b1a-crimson-blaze.json': ['b1a', 103, 'crimsonBlaze'],
  'b2-fantastical-parade.json': ['b2', 234, 'fantasticalParade'],
  'b2a-paldean-wonders.json': ['b2a', 131, 'paldeanWonders'],
  'b2b-mega-shine.json': ['b2b', 117, 'megaShine'],
  'b3-pulsing-aura.json': ['b3', 234, 'pulsingAura'],
  'b3a-paradox-drive.json': ['b3a', 109, 'paradoxDrive'],
  'b3b-everyday-wonders.json': ['b3b', 106, 'everydayWonders'],
  'b4-ruler-of-the-skies.json': ['b4', 233, 'rulerOfTheSkies'],
  'b4a-team-rockets-ambition.json': ['b4a', 110, 'teamRocketsAmbition'],
  'promo-b.json': ['p-b', 86, 'promoB'],
};

const cardKeys = [
  'id', 'name', 'element', 'type', 'subtype', 'effect', 'health', 'set',
  'pack', 'attacks', 'retreatCost', 'weakness', 'abilities', 'evolvesFrom',
  'rarity',
].sort();
const energies = new Set([
  'Grass', 'Fire', 'Water', 'Lightning', 'Psychic', 'Fighting', 'Darkness',
  'Metal', 'Dragon', 'Colorless',
]);
const pokemonSubtypes = new Set(['Basic', 'Stage 1', 'Stage 2']);
const trainerSubtypes = new Set(['Item', 'Supporter', 'Stadium', 'Tool']);
const rarities = new Set([
  'Common', 'Uncommon', 'Rare', 'Rare EX', 'Full Art',
  'Full Art EX/Support', 'Immersive', 'One Shiny Star', 'Two Shiny Stars',
  'Gold Crown',
]);

function nullableString(value) {
  return value === null || typeof value === 'string';
}

const localeEntries = fs.readdirSync(cardsRoot, { withFileTypes: true });
assert.deepEqual(
  localeEntries.filter((entry) => entry.isDirectory()).map((entry) => entry.name),
  ['en'],
  'cards must contain only the English locale directory',
);

const jsonFiles = fs.readdirSync(enRoot).filter((name) => name.endsWith('.json')).sort();
assert.deepEqual(jsonFiles, Object.keys(sets).sort(), 'English set files do not match the expected inventory');

const allCards = [];
const exportsByName = require(path.join(enRoot, 'index.js'));
assert.deepEqual(
  Object.keys(exportsByName).sort(),
  Object.values(sets).map(([, , exportName]) => exportName).sort(),
  'English exports do not match the expected set inventory',
);

for (const [file, [prefix, expectedCount, exportName]] of Object.entries(sets)) {
  const cards = require(path.join(enRoot, file));
  assert.equal(cards.length, expectedCount, `${file} should contain ${expectedCount} cards`);
  assert.strictEqual(exportsByName[exportName], cards, `${exportName} must export ${file}`);

  cards.forEach((card, index) => {
    const location = `${file}[${index}]`;
    const expectedId = `${prefix}-${String(index + 1).padStart(3, '0')}`;
    assert.equal(card.id, expectedId, `${location} has a non-contiguous ID`);
    assert.deepEqual(Object.keys(card).sort(), cardKeys, `${card.id} has an unexpected schema`);
    assert.equal(typeof card.name, 'string', `${card.id} has an invalid name`);
    assert(card.name.length > 0, `${card.id} has a blank name`);
    assert(['Pokemon', 'Trainer'].includes(card.type), `${card.id} has an invalid type`);
    assert.equal(typeof card.set, 'string', `${card.id} has an invalid set`);
    assert(nullableString(card.pack), `${card.id} has an invalid pack`);
    assert(nullableString(card.effect), `${card.id} has an invalid effect`);
    assert(card.rarity === null || rarities.has(card.rarity), `${card.id} has an invalid rarity`);
    assert(Array.isArray(card.attacks), `${card.id} attacks must be an array`);
    assert(Array.isArray(card.abilities), `${card.id} abilities must be an array`);

    if (card.type === 'Pokemon') {
      assert(pokemonSubtypes.has(card.subtype), `${card.id} has an invalid Pokemon subtype`);
      assert(energies.has(card.element), `${card.id} has an invalid element`);
      assert(Number.isInteger(card.health) && card.health > 0, `${card.id} has invalid health`);
      assert(Number.isInteger(card.retreatCost) && card.retreatCost >= 0, `${card.id} has invalid retreatCost`);
      assert(card.weakness === null || energies.has(card.weakness), `${card.id} has an invalid weakness`);
      assert.equal(card.effect, null, `${card.id} Pokemon must not use the Trainer effect field`);
    } else {
      assert(trainerSubtypes.has(card.subtype), `${card.id} has an invalid Trainer subtype`);
      assert.equal(card.element, null, `${card.id} Trainer must not have an element`);
      assert.equal(card.health, null, `${card.id} Trainer must not have health`);
      assert.equal(card.retreatCost, null, `${card.id} Trainer must not have retreatCost`);
      assert.equal(card.weakness, null, `${card.id} Trainer must not have a weakness`);
      assert.equal(card.evolvesFrom, null, `${card.id} Trainer must not evolve`);
      assert.equal(card.attacks.length, 0, `${card.id} Trainer must not have attacks`);
      assert.equal(card.abilities.length, 0, `${card.id} Trainer must not have abilities`);
      assert(typeof card.effect === 'string' && card.effect.length > 0, `${card.id} Trainer needs an effect`);
    }

    for (const attack of card.attacks) {
      const attackKeys = Object.keys(attack).sort();
      assert(
        JSON.stringify(attackKeys) === JSON.stringify(['cost', 'damage', 'name']) ||
          JSON.stringify(attackKeys) === JSON.stringify(['cost', 'damage', 'effect', 'name']),
        `${card.id} has a malformed attack`,
      );
      assert.equal(typeof attack.name, 'string', `${card.id} has an invalid attack name`);
      assert.equal(typeof attack.damage, 'string', `${card.id} has non-string attack damage`);
      assert(Array.isArray(attack.cost) && attack.cost.every((energy) => energies.has(energy)), `${card.id} has an invalid attack cost`);
      assert(attack.effect === undefined || typeof attack.effect === 'string', `${card.id} has an invalid attack effect`);
    }
    for (const ability of card.abilities) {
      assert.deepEqual(Object.keys(ability).sort(), ['effect', 'name'], `${card.id} has a malformed ability`);
      assert.equal(typeof ability.name, 'string', `${card.id} has an invalid ability name`);
      assert.equal(typeof ability.effect, 'string', `${card.id} has an invalid ability effect`);
    }
    for (const text of [card.effect, ...card.attacks.map((attack) => attack.effect), ...card.abilities.map((ability) => ability.effect)]) {
      assert(text == null || !/(<[^>]+>|\[[A-Z]+\])/.test(text), `${card.id} contains an unexpanded markup token`);
    }

    allCards.push(card);
  });
}

assert.equal(allCards.length, 3871, 'English inventory must contain 3,871 cards');
assert.equal(new Set(allCards.map((card) => card.id)).size, allCards.length, 'card IDs must be globally unique');

const cardNames = new Set(allCards.map((card) => card.name));
for (const card of allCards) {
  assert(card.evolvesFrom === null || cardNames.has(card.evolvesFrom), `${card.id} evolves from an unresolved card: ${card.evolvesFrom}`);
}

console.log(`Validated ${allCards.length} English cards across ${jsonFiles.length} sets.`);
