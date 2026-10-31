'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { load } = require('cheerio');
const { canonicalJson } = require('../lib/canonical-json');
const root = path.resolve(__dirname, '..');
const clean = (value) =>
  value
    .replace(/\[([GRWLPFDMNC])\]/g, (_, symbol) => energies[symbol])
    .replace(/\s+/g, ' ')
    .trim();
const energies = {
  G: 'Grass',
  R: 'Fire',
  W: 'Water',
  L: 'Lightning',
  P: 'Psychic',
  F: 'Fighting',
  D: 'Darkness',
  M: 'Metal',
  N: 'Dragon',
  C: 'Colorless',
};
const rarityMap = {
  '◊': 'Common',
  '◊◊': 'Uncommon',
  '◊◊◊': 'Rare',
  '◊◊◊◊': 'Rare EX',
  '☆': 'Full Art',
  '☆☆': 'Full Art EX/Support',
  '☆☆☆': 'Immersive',
  'Crown Rare': 'Gold Crown',
  'Shiny Rare': 'One Shiny Star',
  'Shiny Super Rare': 'Two Shiny Stars',
};
function parseSet(html, set) {
  const $ = load(html);
  $('br').replaceWith(' ');
  const result = [];
  $('.cards-full > .card-page-main').each((_, node) => {
    const el = $(node);
    const link = el.find('.card-text-name a');
    const number = Number(link.attr('href')?.split('/').pop());
    if (!Number.isInteger(number) || number < 1)
      throw new Error('Unrecognised card number');
    const title = clean(el.find('.card-text-title').text());
    const name = clean(link.text());
    const typeText = clean(el.find('.card-text-type').text());
    const isPokemon = typeText.startsWith('Pokémon - ');
    if (!isPokemon && !typeText.startsWith('Trainer - '))
      throw new Error(`${set.code}-${number}: unknown type`);
    const subtype = typeText.split(' - ')[1];
    const stats = clean(el.find('.card-text-wrr').first().text());
    const print = clean(
      el.find('.prints-current-details > span').last().text(),
    ).split(' · ');
    const rarityText = set.id.startsWith('p-') ? '' : print[1] || '';
    if (rarityText && !rarityMap[rarityText])
      throw new Error(`${set.code}-${number}: unknown rarity ${rarityText}`);
    const attacks = el
      .find('.card-text-attack')
      .toArray()
      .map((node) => {
        const a = $(node);
        const info = a.find('.card-text-attack-info').clone();
        const symbols = clean(info.find('.ptcg-symbol').text());
        info.find('.ptcg-symbol').remove();
        const label = clean(info.text());
        const match = label.match(/^(.*?)\s+(\d+[+×x−-]?)$/);
        const attack = {
          name: match ? match[1] : label,
          damage: match ? match[2] : '',
          cost: [...(symbols === '0' ? '' : symbols)].map((symbol) => {
            if (!energies[symbol]) throw new Error(`Unknown energy ${symbol}`);
            return energies[symbol];
          }),
        };
        const effect = clean(a.find('.card-text-attack-effect').text());
        if (effect) attack.effect = effect;
        return attack;
      });
    const abilities = el
      .find('.card-text-ability')
      .toArray()
      .map((node) => ({
        name: clean($(node).find('.card-text-ability-info').text()).replace(
          /^Ability: /,
          '',
        ),
        effect: clean($(node).find('.card-text-ability-effect').text()),
      }));
    const rules = el
      .find('.card-text-wrr')
      .toArray()
      .map((n) => clean($(n).text()))
      .filter((t) => / rule:/.test(t));
    const pack = print[2]?.replace(/ pack$/, '') || null;
    const card = {
      id: `${set.id}-${String(number).padStart(3, '0')}`,
      name,
      element: isPokemon
        ? title
            .slice(name.length)
            .match(/-\s*([A-Za-z]+(?:\/[A-Za-z]+)?)\s*-/)?.[1]
        : null,
      type: isPokemon ? 'Pokemon' : 'Trainer',
      subtype,
      effect: isPokemon
        ? null
        : clean(el.find('.card-text > .card-text-section').eq(1).text()),
      health: isPokemon ? Number(title.match(/(\d+) HP$/)?.[1]) : null,
      set: set.id.startsWith('p-') ? set.name : `${set.name} (${set.code})`,
      pack,
      attacks,
      retreatCost: isPokemon
        ? Number(stats.match(/Retreat: (\d+)/)?.[1])
        : null,
      weakness: isPokemon
        ? stats.match(/Weakness: (\w+)/)?.[1] === 'none'
          ? null
          : stats.match(/Weakness: (\w+)/)?.[1] || null
        : null,
      abilities,
      evolvesFrom: isPokemon
        ? clean(el.find('.card-text-type a').text()) || null
        : null,
      rarity: rarityMap[rarityText] || null,
    };
    result.push({
      card,
      details: {
        rules,
        packs: pack ? [pack] : [],
        sourceUrl: `${set.sourceUrl}/${number}`,
      },
    });
  });
  if (!result.length) throw new Error(`${set.code}: no card records parsed`);
  const declared = Number(
    clean($('.infobox-content').text()).match(/(\d+) Cards/)?.[1],
  );
  if (result.length !== declared)
    throw new Error(
      `${set.code}: parsed ${result.length}, page declares ${declared}`,
    );
  result.sort((a, b) => a.card.id.localeCompare(b.card.id));
  result.forEach((entry, i) => {
    if (entry.card.id !== `${set.id}-${String(i + 1).padStart(3, '0')}`)
      throw new Error(`${set.code}: incomplete numbering`);
  });
  return result;
}
async function fetchPage(url, file) {
  if (fs.existsSync(file)) return fs.readFileSync(file, 'utf8');
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30000),
    headers: {
      'User-Agent':
        'pokemon-tcg-pocket-card-database/reference-check (github.com/jacobcorbett/pokemon-tcg-pocket-card-database)',
    },
  });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  const html = await response.text();
  fs.writeFileSync(file, html);
  fs.writeFileSync(
    file.replace(/\.html$/, '.meta.json'),
    JSON.stringify({ url, retrievedAt: new Date().toISOString() }, null, 2) +
      '\n',
  );
  await new Promise((resolve) => setTimeout(resolve, 500));
  return html;
}
function comparable(value) {
  function normalise(item) {
    if (typeof item === 'string')
      return item
        .replace(/\bPokemon\b/g, 'Pokémon')
        .replace(/[‘’]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/−/g, '-')
        .replace(/:\s*([①②])/g, ':$1')
        .replace(/\s+/g, ' ')
        .trim();
    if (Array.isArray(item)) return item.map(normalise);
    if (item && typeof item === 'object')
      return Object.fromEntries(
        Object.entries(item).map(([key, val]) => [key, normalise(val)]),
      );
    return item;
  }
  return canonicalJson(normalise(value));
}

async function main() {
  const sets = require('../data/sets.json');
  const cache = path.join(root, '.cache/reference');
  fs.mkdirSync(cache, { recursive: true });
  const args = process.argv.slice(2);
  const selection = args.find((arg) => !arg.startsWith('--'));
  const refresh = args.includes('--refresh');
  if (!selection) {
    const inventoryFile = path.join(cache, 'sets.html');
    if (refresh && fs.existsSync(inventoryFile)) fs.unlinkSync(inventoryFile);
    await fetchPage('https://pocket.limitlesstcg.com/cards', inventoryFile);
  }
  if (selection && !sets.some((s) => s.id === selection))
    throw new Error(`Unknown set ${selection}`);
  const report = [];
  for (const set of sets.filter((s) => !selection || s.id === selection)) {
    const cachedFile = path.join(cache, `${set.id}.html`);
    if (refresh && fs.existsSync(cachedFile)) fs.unlinkSync(cachedFile);
    const html = await fetchPage(
      `${set.sourceUrl}?display=full&show=all`,
      path.join(cache, `${set.id}.html`),
    );
    const parsed = parseSet(html, set);
    fs.writeFileSync(
      path.join(cache, `${set.id}.json`),
      JSON.stringify(parsed, null, 2) + '\n',
    );
    const currentFile = path.join(root, 'cards/en', set.file);
    const current = fs.existsSync(currentFile)
      ? JSON.parse(fs.readFileSync(currentFile, 'utf8'))
      : [];
    const changes = parsed.flatMap(({ card, details }) => {
      const old = current.find((c) => c.id === card.id);
      if (!old)
        return [{ id: card.id, field: 'missing', reference: card.name }];
      const oldExtra = require('../data/card-details.json')[card.id];
      return [
        ...Object.keys(card).flatMap((field) =>
          comparable(old[field]) === comparable(card[field])
            ? []
            : [
                {
                  id: card.id,
                  field,
                  current: old[field],
                  reference: card[field],
                },
              ],
        ),
        ...Object.keys(details).flatMap((field) =>
          comparable(oldExtra?.[field]) === comparable(details[field])
            ? []
            : [
                {
                  id: card.id,
                  field,
                  current: oldExtra?.[field] ?? null,
                  reference: details[field],
                },
              ],
        ),
      ];
    });
    const entry = {
      id: set.id,
      sourceUrl: set.sourceUrl,
      referenceCount: parsed.length,
      localCount: current.length,
      htmlSha256: crypto.createHash('sha256').update(html).digest('hex'),
      changes,
    };
    report.push(entry);
    console.log(
      `${set.id}: ${parsed.length} reference cards; ${changes.length} differences`,
    );
  }
  fs.writeFileSync(
    path.join(
      cache,
      selection ? `comparison-${selection}.json` : 'comparison.json',
    ),
    JSON.stringify(report, null, 2) + '\n',
  );
}
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = { parseSet, clean, comparable };
