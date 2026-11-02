'use strict';
const assert = require('node:assert/strict');
const { load } = require('cheerio');
const clean = (value) => value.replace(/\s+/g, ' ').trim();
const energy = (src) => src?.match(/\/([a-z]+)\.png$/)?.[1];
const energies = {
  grass: 'Grass',
  fire: 'Fire',
  water: 'Water',
  lightning: 'Lightning',
  psychic: 'Psychic',
  fighting: 'Fighting',
  darkness: 'Darkness',
  metal: 'Metal',
  dragon: 'Dragon',
  colorless: 'Colorless',
};
function parseSerebiiInventory(html) {
  const $ = load(html),
    links = new Set();
  const heading = $('li')
    .filter((_, n) => clean($(n).text()) === 'Sets')
    .first();
  const list = heading.parent();
  assert(list.length, 'No Serebii expansion navigation');
  let inside = false;
  list.children('li').each((_, n) => {
    const text = clean($(n).text());
    if (text === 'Sets') {
      inside = true;
      return;
    }
    if (text === 'Features') inside = false;
    if (!inside) return;
    const href = $(n).find('a[href]').attr('href');
    if (href) {
      assert(href.startsWith('/tcgpocket/'), 'Unknown inventory URL');
      links.add(href.replace(/\/$/, ''));
    }
  });
  assert(links.size, 'No Serebii inventory links');
  return [...links].sort();
}
function parseSerebiiCard(html, set, number, rarity) {
  assert(
    set.id === 'sp1',
    'Serebii gameplay adapter currently supports reviewed SP1 Basic cards only',
  );
  const $ = load(html),
    table = $('table.tcgtable').first(),
    info = table.find('td.cardinfo > table').first(),
    rows = info.children('tbody').children('tr');
  assert(table.length && rows.length, 'Missing Serebii card table');
  const name = clean(rows.first().find('td').first().text());
  assert(
    table.find('img.card').attr('src') ===
      `/tcgpocket/firstpartners/${number}.jpg`,
    'Artwork number mismatch',
  );
  const hp = Number(clean(rows.first().text()).match(/(\d+) HP/)[1]);
  const element = energies[energy(rows.first().find('img').attr('src'))];
  assert(element, 'Unknown type');
  const attacks = [];
  rows.each((_, row) => {
    const r = $(row),
      a = r.find('a[href*="/dex/moves/"]');
    if (!a.length) return;
    assert(a.length === 1, 'Ambiguous attack');
    const cells = r.children('td');
    const cost = cells
      .first()
      .find('img')
      .map((_, n) => {
        const e = energies[energy($(n).attr('src'))];
        assert(e, 'Unknown energy');
        return e;
      })
      .get();
    const label = cells.eq(1).clone();
    label.find('span.main').remove();
    const effect = clean(label.text());
    const attack = {
      name: clean(a.text()),
      damage: clean(cells.last().text()),
      cost,
    };
    if (effect) attack.effect = effect;
    attacks.push(attack);
  });
  assert(attacks.length, 'Missing attacks');
  const weaknessRow = table
    .find('td')
    .filter((_, n) => clean($(n).text()) === 'Weakness')
    .first()
    .parent();
  const weakness =
    energies[
      energy(weaknessRow.children('td').eq(1).find('img').attr('src'))
    ] || null;
  const retreatCell = table
    .find('td')
    .filter((_, n) => clean($(n).text()) === 'Retreat Cost')
    .first()
    .next();
  assert(retreatCell.length, 'Missing retreat');
  const card = {
    id: `${set.id}-${String(number).padStart(3, '0')}`,
    name,
    element,
    type: 'Pokemon',
    subtype: 'Basic',
    effect: null,
    health: hp,
    set: `${set.name} (${set.code})`,
    pack: null,
    attacks,
    retreatCost: retreatCell.find('img').length,
    weakness,
    abilities: [],
    evolvesFrom: null,
    rarity,
  };
  return {
    card,
    details: {
      rules: [],
      packs: [],
      sourceUrl: `${set.sourceUrl}${String(number).padStart(3, '0')}.shtml`,
    },
  };
}
function serebiiChecklist(html, set) {
  const $ = load(html),
    out = [];
  $('.dextable tr').each((_, r) => {
    const row = $(r),
      link = row
        .find(`a[href^="${new URL(set.sourceUrl).pathname}"]`)
        .filter((_, n) => /\/\d{3}\.shtml$/.test($(n).attr('href')))
        .first();
    if (!link.length) return;
    const number = Number(link.attr('href').match(/(\d{3})\.shtml$/)[1]);
    const rarityImage = row.children('td').first().find('img').attr('src');
    const rarity = {
      'star1.png': 'Full Art',
      'star2.png': 'Full Art EX/Support',
      'star3.png': 'Immersive',
      'crown.png': 'Gold Crown',
      'promo.png': null,
    }[rarityImage?.split('/').pop()];
    assert(rarity !== undefined, `Unknown rarity ${rarityImage}`);
    out.push({ number, name: clean(row.children('td').eq(2).text()), rarity });
  });
  assert(out.length === set.expectedCount, 'Checklist count mismatch');
  out.sort((a, b) => a.number - b.number);
  out.forEach((x, i) =>
    assert(x.number === i + 1, 'Incomplete Serebii numbering'),
  );
  return out;
}
module.exports = { parseSerebiiInventory, parseSerebiiCard, serebiiChecklist };
