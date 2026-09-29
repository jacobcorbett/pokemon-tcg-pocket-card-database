'use strict';
// Stage an import for human review. Never writes cards/en or certifies an audit.
const fs = require('node:fs');
const path = require('node:path');
const Ajv = require('ajv');
const root = path.resolve(__dirname, '..');
function stage(
  setId,
  input,
  outputRoot = path.join(root, '.cache/candidates'),
) {
  const set = require('../data/sets.json').find((set) => set.id === setId);
  if (!set) throw new Error(`Unknown set ${setId}; add its metadata first`);
  const entries = JSON.parse(fs.readFileSync(input, 'utf8'));
  if (!Array.isArray(entries) || !entries.length)
    throw new Error('Candidate must be a non-empty array');
  const existingFile = path.join(root, 'cards/en', set.file);
  const existing = fs.existsSync(existingFile)
    ? JSON.parse(fs.readFileSync(existingFile, 'utf8'))
    : [];
  const cards = entries.map((entry) => {
    const card = structuredClone(entry.card || entry);
    const old = existing.find((old) => old.id === card.id);
    // Limitless cannot distinguish shiny/art rarity. Keep existing classifications.
    if (old) card.rarity = old.rarity;
    return card;
  });
  const validate = new Ajv({ allErrors: true }).compile(
    require('../schema/card.schema.json'),
  );
  cards.forEach((card, i) => {
    if (card.id !== `${setId}-${String(i + 1).padStart(3, '0')}`)
      throw new Error(`Incomplete or misordered inventory at ${i}`);
    if (!validate(card))
      throw new Error(`${card.id}: ${JSON.stringify(validate.errors)}`);
  });
  fs.mkdirSync(outputRoot, { recursive: true });
  const output = path.join(outputRoot, set.file);
  fs.writeFileSync(output, JSON.stringify(cards, null, 2) + '\n');
  return output;
}
if (require.main === module) {
  try {
    const [setId, input] = process.argv.slice(2);
    if (!setId || !input)
      throw new Error('Usage: npm run import -- <set-id> <candidate.json>');
    console.log(
      `Staged ${stage(setId, path.resolve(input))}. Review the diff before copying to cards/en; check rarity and refresh supplementary data/audit.`,
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
module.exports = { stage };
