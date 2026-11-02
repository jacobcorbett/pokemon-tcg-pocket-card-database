'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { parseSet, comparable } = require('../scripts/reference');
const { stage } = require('../scripts/import-set');
const set = {
  id: 'a1',
  code: 'A1',
  name: 'Genetic Apex',
  sourceUrl: 'https://pocket.limitlesstcg.com/cards/A1',
};
function html({
  cost = 'GC',
  count = 1,
  number = 1,
  trainer = false,
  rarity = '◊',
} = {}) {
  return `<div class="infobox-content">${count} Cards</div><div class="cards-full"><div class="card-page-main">
    <div class="card-text"><div class="card-text-section"><p class="card-text-title"><span class="card-text-name"><a href="/cards/A1/${number}">Example</a></span>${trainer ? '' : ' - Grass - 70 HP'}</p>
    <p class="card-text-type">${trainer ? 'Trainer - Item' : 'Pokémon - Basic'}</p></div>
    <div class="card-text-section">${trainer ? 'Choose 1:<br>First option.<br>Second option.' : `<div class="card-text-attack"><p class="card-text-attack-info"><span class="ptcg-symbol">${cost}</span> Sample Attack 40+</p><p class="card-text-attack-effect">Take a [G] Energy.</p></div>`}</div>
    ${trainer ? '' : '<p class="card-text-wrr">Weakness: none<br>Retreat: 1</p>'}</div>
    <div class="prints-current-details"><span>Genetic Apex (A1)</span><span>#${number} · ${rarity} · Mewtwo pack</span></div></div></div>`;
}
test('reference parser expands energy tokens, supports zero-cost attacks and no weakness', () => {
  const normal = parseSet(html(), set)[0].card;
  assert.deepEqual(normal.attacks[0], {
    name: 'Sample Attack',
    damage: '40+',
    cost: ['Grass', 'Colorless'],
    effect: 'Take a Grass Energy.',
  });
  assert.equal(normal.weakness, null);
  assert.equal(normal.pack, 'Mewtwo');
  assert.deepEqual(
    parseSet(html({ cost: '0' }), set)[0].card.attacks[0].cost,
    [],
  );
});
test('trainer paragraphs preserve word boundaries', () => {
  assert.equal(
    parseSet(html({ trainer: true }), set)[0].card.effect,
    'Choose 1: First option. Second option.',
  );
});
test('parser fails closed on partial inventory and unknown encodings', () => {
  assert.throws(() => parseSet(html({ count: 2 }), set), /page declares/);
  assert.throws(
    () => parseSet(html({ number: 2 }), set),
    /incomplete numbering/,
  );
  assert.throws(() => parseSet(html({ cost: 'Z' }), set), /Unknown energy/);
  assert.throws(
    () => parseSet(html({ rarity: 'Unknown' }), set),
    /unknown rarity/,
  );
  assert.throws(
    () => parseSet('<html>error page</html>', set),
    /no card records/,
  );
});
test('import staging preserves shiny rarity and does not mutate canonical cards', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pocket-import-test-'));
  try {
    const file = path.resolve(
      __dirname,
      '../cards/en/a2b-shining-revelry.json',
    );
    const before = fs.readFileSync(file, 'utf8');
    const cards = JSON.parse(before);
    cards.find((card) => card.id === 'a2b-097').rarity = 'Full Art';
    const input = path.join(dir, 'candidate.json');
    fs.writeFileSync(input, JSON.stringify(cards));
    const output = stage('a2b', input, path.join(dir, 'out'));
    assert.equal(
      JSON.parse(fs.readFileSync(output)).find((card) => card.id === 'a2b-097')
        .rarity,
      'One Shiny Star',
    );
    assert.equal(fs.readFileSync(file, 'utf8'), before);
    cards[0].id = 'a2b-002';
    fs.writeFileSync(input, JSON.stringify(cards));
    assert.throws(
      () => stage('a2b', input, path.join(dir, 'out')),
      /misordered/,
    );
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

test('comparison normalises typography before JSON escaping and tolerates missing fields', () => {
  assert.equal(
    comparable({ effect: 'Has “Team Rocket” in its name.' }),
    comparable({ effect: 'Has "Team Rocket" in its name.' }),
  );
  assert.equal(
    comparable('Pokémon takes −20 damage.'),
    comparable('Pokemon takes -20 damage.'),
  );
  assert.equal(comparable(undefined), undefined);
  assert.notEqual(
    comparable('Discard 2 Water Energy.'),
    comparable('Discard Water2 Water Energy.'),
  );
});

test('published schema rejects contradictory Pokemon and Trainer records', () => {
  const Ajv = require('ajv');
  const validate = new Ajv().compile(require('../schema/card.schema.json'));
  const pokemon = structuredClone(require('../cards/en').geneticApex[0]);
  assert(validate(pokemon));
  pokemon.health = null;
  assert(!validate(pokemon));
  const trainer = structuredClone(
    require('../cards/en').geneticApex.find((card) => card.type === 'Trainer'),
  );
  assert(validate(trainer));
  trainer.attacks = [{ name: 'Impossible', damage: '10', cost: [] }];
  assert(!validate(trainer));
});

test('dual-type cards retain both types through parsing, schema and gameplay grouping', () => {
  const dual = parseSet(
    html().replace(' - Grass - ', ' - Water/Darkness - '),
    set,
  )[0].card;
  assert.equal(dual.element, 'Water/Darkness');
  const Ajv = require('ajv');
  const validate = new Ajv().compile(require('../schema/card.schema.json'));
  assert.equal(validate(dual), true);
  const { gameplayId, gameplayFields } = require('../lib/database');
  assert.notEqual(
    gameplayId(gameplayFields(dual, [])),
    gameplayId(gameplayFields({ ...dual, element: 'Water' }, [])),
  );
});

test('SP1 preserves all numbered prints, source provenance and the three Mew variants', () => {
  const cards = require('../cards/en/sp1-first-partners.json');
  const details = require('../data/card-details.json');
  assert.equal(cards.length, 30);
  assert.deepEqual(
    cards.slice(-3).map((c) => [c.id, c.name, c.rarity]),
    [
      ['sp1-028', 'Mew', null],
      ['sp1-029', 'Mew', null],
      ['sp1-030', 'Mew', null],
    ],
  );
  assert(
    cards.every((c, i) => c.id === `sp1-${String(i + 1).padStart(3, '0')}`),
  );
  assert(
    cards.every((c) =>
      details[c.id].sourceUrl.startsWith(
        'https://www.serebii.net/tcgpocket/firstpartners/',
      ),
    ),
  );
  const {
    parseSerebiiCard,
    parseSerebiiInventory,
    serebiiChecklist,
  } = require('../scripts/reference-serebii');
  assert.throws(
    () => parseSerebiiCard('', { id: 'sp1' }, 1, null),
    /Missing Serebii card/,
  );
  assert.throws(
    () =>
      serebiiChecklist('', {
        sourceUrl: 'https://www.serebii.net/tcgpocket/firstpartners/',
        expectedCount: 30,
      }),
    /Checklist count/,
  );
  assert.deepEqual(
    parseSerebiiInventory(
      '<ul><li><b>Sets</b></li><li><a href="/tcgpocket/dualfusion/">Dual Fusion</a></li><li>Special Packs</li><li><a href="/tcgpocket/firstpartners/">First Partners</a></li><li>Promos</li><li><a href="/tcgpocket/promo-c/">Promo-C</a></li><li>Features</li></ul>',
    ),
    ['/tcgpocket/dualfusion', '/tcgpocket/firstpartners', '/tcgpocket/promo-c'],
  );
});

test('Serebii gameplay parser reads source Mew fields and rejects unknown energy', () => {
  const fs = require('node:fs');
  const { parseSerebiiCard } = require('../scripts/reference-serebii');
  const fixture = fs.readFileSync(
    require('node:path').join(__dirname, 'fixtures/serebii-sp1-028.html'),
    'utf8',
  );
  const set = require('../data/sets.json').find((s) => s.id === 'sp1');
  const result = parseSerebiiCard(fixture, set, 28, null);
  assert.deepEqual(
    result.card,
    require('../cards/en/sp1-first-partners.json')[27],
  );
  assert.throws(
    () =>
      parseSerebiiCard(
        fixture.replaceAll('/psychic.png', '/unknown.png'),
        set,
        28,
        null,
      ),
    /Unknown/,
  );
  assert.throws(
    () => parseSerebiiCard(fixture, set, 29, null),
    /Artwork number/,
  );
});
