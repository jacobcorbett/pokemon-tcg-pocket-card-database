# Pokémon TCG Pocket Card Database

Source-backed English card data for deck builders, collection tools and battle
simulators. **3,879 reference-listed prints across 23 sets and promo series**, with
attacks, abilities, energy costs, trainer effects, evolution names and card rules.

Maintained by Jacob Corbett. Originally [forked from Hugo Burguete's database](https://github.com/hugoburguete/pokemon-tcg-pocket-card-database)
on **10 August 2026** at [`b636dd0`](https://github.com/hugoburguete/pokemon-tcg-pocket-card-database/tree/b636dd08eff20c9d555fe395930ae05015d67422).
Upstream attribution and Git history are preserved. This fork maintains English only.

## Coverage you can inspect

- Latest included expansion: **Team Rocket's Ambition (B4a)**.
- Latest reference comparison: **29 September 2026**, against Limitless TCG Pocket.
- **2,318 gameplay records**, conservatively grouped by identical gameplay fields
  and rule text; every print retains its own stable ID.
- Every enriched print links to its reference page; every set records an audit
  date, source/file hashes, unchecked fields and unresolved discrepancies.
- Rarity is validated structurally but not fully reference-certified. Source-listed
  previews are included; individual promo availability dates remain unknown.
- **Deluxe Pack: Mega is not included yet**; its announced launch is 30 September.

Read the [coverage table and limitations](docs/coverage.md) before treating this
as a complete released-card checklist. Our goal is accurate, explainable gameplay
data with stable integration points—not an unsupported claim of perfect accuracy.

## Local setup

```sh
git clone https://github.com/jacobcorbett/pokemon-tcg-pocket-card-database.git
cd pokemon-tcg-pocket-card-database
npm ci
npm run check
```

Node.js **22 or later** is required for tooling. npm publication is not configured;
this repository currently works from a checkout or generated package tarball.

## Existing JavaScript integrations

The original `en` exports and card IDs are retained. From a checkout:

```js
const { en } = require('./');
const bulbasaur = en.geneticApex.find((card) => card.id === 'a1-001');
console.log(bulbasaur.attacks);
```

The legacy card shape is unchanged. Source-backed corrections may change field
values; consumers should pin a Git revision or release when reproducibility matters.

## Richer data for applications

```js
const { database } = require('./');
const card = database.findById('a1-001');
console.log(card.setId, card.sourceUrl, card.alternatePrintIds);
console.log(database.cardsForSet('b4a').length);
```

- `database.cards`: every print, with legacy fields plus set ID, card number, pack
  labels, rules, source URL and equivalent-print links.
- `database.gameplay`: one record per exact gameplay fingerprint, with all print IDs.
- `database.sets`: set codes, release dates, observed pack labels, counts and audit evidence.

`packs: []` means no named pack label was supplied by the reference, **not** that
the print is unavailable. The current metadata does not establish exhaustive pack
availability or promo acquisition channels.

TypeScript declarations cover both interfaces. See [the schema contract](docs/schema.md).

## Versioned JSON for a future API

```sh
npm run build
```

This creates deterministic files suitable for serving over HTTP:

| File                    | Contents                                          |
| ----------------------- | ------------------------------------------------- |
| `dist/v1/cards.json`    | All enriched prints                               |
| `dist/v1/gameplay.json` | Gameplay groups and print IDs                     |
| `dist/v1/sets.json`     | Set metadata and verification                     |
| `dist/v1/sets/a1.json`  | One set of enriched prints                        |
| `dist/v1/metadata.json` | Schema/package version, counts and file checksums |

These are local artifacts; there is no hosted API or public CDN endpoint yet.
A future API can use these files without inventing a second source of truth.
See [the API roadmap](docs/roadmap.md) and [release procedure](docs/releases.md).

## Validation and maintenance

```sh
npm run check                   # schema, inventory, tests, types, build and checksums
npm run reference -- --refresh  # fetch comparisons; never overwrite canonical data
```

CI checks Node 22 and 24. A separate daily reference workflow detects new sets,
changed counts and new gameplay discrepancies, with comparison artifacts for
review. It never imports or publishes card changes automatically.

Follow the [maintenance workflow](docs/maintenance.md) to review/import candidates
and record evidence. The validator certifies structure and audit fingerprints,
not every statement's agreement with the game.

## Contributing and licensing

Card corrections, source-backed additions and integration feedback are welcome.
Start with [CONTRIBUTING.md](CONTRIBUTING.md) and the issue templates.

Software contributions are provided under [ISC](LICENSE). Original authorship is
retained in [NOTICE.md](NOTICE.md); source attribution and scope are explained in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md). The software licence does not grant
rights to Pokémon card text, artwork or trademarks. This is an unofficial fan project.
