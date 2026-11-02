# Maintaining the database

Canonical data must remain reviewable. The normal flow is **fetch → compare →
stage → review → update → audit → validate → release**.

## Compare with the source

```sh
npm ci
npm run reference -- --refresh
node scripts/check-reference.js
```

The fetcher uses a timeout and a short pause between requests. Raw pages and
parsed candidates are cached under .cache/reference, outside Git and releases.
A normal rerun uses the cache; --refresh fetches new pages. A partial page,
unknown energy/rarity encoding or incomplete numbering fails closed.

For one set: npm run reference -- b4a --refresh. The full check-reference command
requires a full comparison and a fetched set inventory.

Inventory discovery includes all source-listed series, promos and special pack
identifiers. Never restrict it to already-known series. New inventory must fail
the freshness check until reviewed and registered, rather than count as no change.
Cross-check [Pokemon Zone's set index](https://www.pokemon-zone.com/sets/) for sets,
special packs and preview cards absent from Limitless. Save both source inventories
with each daily run. Reconcile differences at print level: displayed totals may
count different kinds of variants. Preserve source URLs, availability uncertainty
and unresolved conflicts; a source listing alone does not prove a card is released.

Read .cache/reference/comparison.json. It separates current and reference values;
source failure does not prove missing data. Review counts, missing sets, gameplay
fields and supplementary rules. The freshness check suppresses rarity comparisons
and recognises existing unresolved discrepancies; it is not a rarity audit.

## Stage a candidate

```sh
npm run import -- p-b .cache/reference/p-b.json
git diff --no-index cards/en/promo-b.json .cache/candidates/promo-b.json
```

The staging tool writes only .cache/candidates. It retains existing rarity values
because the source's plain-text stars cannot distinguish shiny/art categories.
Review new rarities separately. Candidates must start at 001 and remain contiguous.
New sets must first be registered in data/sets.json, with source URL, expected
count, release date (or null when unknown), file and export name.

Apply only reviewed corrections to cards/en. Keep data/card-details.json in sync
with the parsed candidate's details: source URL, rule text and pack labels. For
new sets update cards/en/index.js and the legacy en interface in index.d.ts.
Do not edit generated dist files. Capture material corrections with affected
IDs, before/after values and source URLs in a dated data/corrections-*.json file.

Release dates in data/sets.json come from the source's set inventory, or a cited
official release announcement. A promo being listed does not establish its release.

## Record evidence after review

```sh
npm run record-audit
npm run check
```

record-audit reads cached full-set pages and compares current fields and
supplementary data. It requires matching inventories. It records the original
retrieval date, source hash and current data hashes, and retains unresolved
conflicts. It does not overwrite card or supplementary data, approve discrepancies,
or certify the game's text. Review the resulting verification and coverage diff.
Never merely update hashes to silence validation without doing the comparison.

## Source conflicts

Prefer direct in-game evidence when available; otherwise compare independent
references and explain the uncertainty. Keep the disputed field and both values
visible in verification.json. Review canonical data and supplemental rules together.
The existing B4-019 spacing conflict is documented rather than silently accepted.

## Release checks

Run npm run check, npm pack, node scripts/check-package.js and git diff --check.
Follow releases.md for versioning and publication. Daily reference checks report
changes for human review; they never import, commit or publish automatically.

## Alternative reference sources

SP1 is sourced from Serebii: `referenceSource: serebii` dispatches the reviewed
Basic-card parser and caches a bundle of the complete numbered checklist plus
all 30 individual pages. Audit hashes cover that bundle; per-print URLs point to
the actual Serebii pages. Artwork uses the set's verified URL template. Numbered
Mew prints 028, 029 and 030 must remain separate. Promo-marked rarity remains null.
The source adapter fails for unreviewed sets instead of assuming matching layouts.
The normal full refresh also fetches Serebii's expansion/special/promo inventory.
