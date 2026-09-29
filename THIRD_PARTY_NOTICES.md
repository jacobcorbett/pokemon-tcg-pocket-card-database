# Third-party sources

## Original repository

- Author: Hugo Burguete and contributors.
- Repository: https://github.com/hugoburguete/pokemon-tcg-pocket-card-database
- Fork baseline: `b636dd08eff20c9d555fe395930ae05015d67422`.
- Licence declaration: ISC in upstream package.json; see NOTICE.md for its scope.
- Historical author attribution is preserved in Git history and package.json.

## Reference checks

[Limitless TCG Pocket](https://pocket.limitlesstcg.com/cards) is a community
reference used for inventory comparisons and corrections, not an official game
API. Every set has a source URL; every enriched print has a card reference URL.
Audit dates, source hashes and known limitations are recorded in
`data/verification.json`. Corrections are recorded in
`data/corrections-2026-09-29.json`.

Source attribution is not permission to reproduce copyrighted material.
The underlying Pokémon card text remains third-party material; see NOTICE.md.
Images and complete reference HTML pages are not included in releases.

## Development dependencies

Development tools are installed through npm and recorded in package-lock.json;
their own licence files remain in their packages. They are not runtime
requirements or vendored into the data exports.
