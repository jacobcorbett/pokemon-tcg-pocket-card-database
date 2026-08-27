# Pokemon TCG Pocket Card Database

An English-only JSON database of gameplay data for every Pokemon TCG Pocket card released through **Team Rocket's Ambition (B4a)**.

This project was [forked from Hugo Burguete's original repository](https://github.com/hugoburguete/pokemon-tcg-pocket-card-database) on **10 August 2026**. The exact upstream starting point is preserved at [`b636dd0`](https://github.com/hugoburguete/pokemon-tcg-pocket-card-database/tree/b636dd08eff20c9d555fe395930ae05015d67422).

## What's included

- 3,871 English cards across 23 sets and promo series
- One JSON file per set in [`cards/en`](cards/en)
- Pokemon attacks, abilities, evolution links, weaknesses, retreat costs and rarities
- Trainer card effects
- A structural and completeness validator

French data from the upstream repository is intentionally not maintained in this fork.

## Usage

```js
const { en } = require('pokemon-tcg-pocket-card-database');

const rayquaza = en.rulerOfTheSkies.find(
  (card) => card.name === 'Mega Rayquaza ex',
);
```

Each card follows this shape:

```js
{
  id, name, element, type, subtype, effect, health,
  set, pack, attacks, retreatCost, weakness,
  abilities, evolvesFrom, rarity
}
```

The package includes TypeScript declarations for the full schema.

## Validation

```sh
npm test
```

The validator checks the expected set inventory and card counts, contiguous and unique IDs, schema consistency, enum values, evolution references, English exports and the absence of locale directories.

## Contributing

Issues and pull requests are welcome. Please keep additions in the existing English schema, include the complete numbered set, cite the source used, and run `npm test` before submitting.
