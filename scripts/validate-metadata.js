'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const Ajv = require('ajv');
const root = path.resolve(__dirname, '..');
function validateMetadata() {
  const inventory = require('../data/sets.json');
  const details = require('../data/card-details.json');
  const verification = require('../data/verification.json');
  const validate = new Ajv({ allErrors: true }).compile(
    require('../schema/card.schema.json'),
  );
  const ids = [];
  assert.equal(
    new Set(inventory.map((set) => set.id)).size,
    inventory.length,
    'duplicate set ID',
  );
  assert.equal(
    new Set(inventory.map((set) => set.exportName)).size,
    inventory.length,
    'duplicate export name',
  );
  assert.deepEqual(
    Object.keys(verification).sort(),
    inventory.map((set) => set.id).sort(),
    'verification inventory mismatch',
  );
  for (const set of inventory) {
    assert.match(set.id, /^(?:[ab]\d+[ab]?|p-[ab])$/);
    assert.equal(set.code.toLowerCase(), set.id, `${set.id}: code mismatch`);
    assert.match(set.file, /^[a-z0-9-]+\.json$/);
    assert(Number.isInteger(set.expectedCount) && set.expectedCount > 0);
    assert(
      set.releaseDate === null || /^\d{4}-\d{2}-\d{2}$/.test(set.releaseDate),
    );
    assert.equal(
      set.sourceUrl,
      `https://pocket.limitlesstcg.com/cards/${set.code}`,
    );
    const file = path.join(root, 'cards/en', set.file);
    const cards = JSON.parse(fs.readFileSync(file, 'utf8'));
    const audit = verification[set.id];
    assert.equal(audit.status, 'reference-compared');
    assert.match(audit.checkedAt, /^\d{4}-\d{2}-\d{2}$/);
    assert.equal(audit.sourceUrl, set.sourceUrl);
    assert.match(audit.sourceHtmlSha256, /^[a-f0-9]{64}$/);
    assert.equal(
      audit.cardFileSha256,
      createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
      `${set.id}: data changed since reference audit; rerun reference and record-audit`,
    );
    assert.equal(
      audit.supplementarySha256,
      createHash('sha256')
        .update(
          JSON.stringify(
            Object.fromEntries(
              cards.map((card) => [card.id, details[card.id]]),
            ),
          ),
        )
        .digest('hex'),
      `${set.id}: supplementary data changed since reference audit`,
    );
    for (const card of cards) {
      assert(validate(card), `${card.id}: ${JSON.stringify(validate.errors)}`);
      ids.push(card.id);
      assert.equal(
        card.set,
        set.id.startsWith('p-') ? set.name : `${set.name} (${set.code})`,
      );
      if (card.type === 'Pokemon') {
        assert.equal(
          card.subtype === 'Basic',
          card.evolvesFrom === null,
          `${card.id}: evolution stage/reference mismatch`,
        );
      }
      const extra = details[card.id];
      assert(extra, `${card.id}: missing supplementary data`);
      assert.deepEqual(Object.keys(extra).sort(), [
        'packs',
        'rules',
        'sourceUrl',
      ]);
      assert(
        Array.isArray(extra.rules) &&
          extra.rules.every(
            (rule) => typeof rule === 'string' && rule.includes(' rule:'),
          ),
      );
      assert(
        Array.isArray(extra.packs) &&
          extra.packs.every((pack) => typeof pack === 'string' && pack.length),
      );
      assert.equal(new Set(extra.packs).size, extra.packs.length);
      assert.deepEqual(extra.packs, card.pack === null ? [] : [card.pack]);
      assert.equal(
        extra.sourceUrl,
        `${set.sourceUrl}/${Number(card.id.split('-').pop())}`,
      );
    }
  }
  assert.deepEqual(
    Object.keys(details).sort(),
    ids.sort(),
    'supplementary inventory mismatch',
  );
  const { database, en } = require('../index');
  assert.strictEqual(en, require('../cards/en'), 'legacy root export changed');
  assert.equal(database.cards.length, ids.length);
  console.log(
    'Validated schema, set metadata, supplementary data and audit fingerprints.',
  );
}
if (require.main === module) validateMetadata();
module.exports = { validateMetadata };
