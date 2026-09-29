# Contributing

## Report a card problem

Use the card-error template with the print ID, incorrect field, proposed value,
and a reference URL. Explain whether other prints share the error. In-game
screenshots can help resolve conflicts, but do not include private account data.

## Add or correct data

1. Create a branch from current main. Work on cards/en and its metadata; dist is
   generated and must not be edited or committed.
2. Cite the card/set reference. Preserve existing print IDs and the legacy schema.
3. For a new set, add data/sets.json, its cards/en file, English export, TypeScript
   export and supplementary details. Include its whole numbered inventory.
4. Compare the source and review every difference. Preserve shiny rarity distinctions;
   a star symbol alone does not establish whether an art is shiny.
5. Check alternate prints for equivalent fixes. Avoid grouping cards by name alone.
6. Refresh audit evidence and coverage according to docs/maintenance.md.
7. Run npm run check, npm pack, node scripts/check-package.js and git diff --check.
8. Open a focused PR stating the change, sources, validation and remaining uncertainty.

For new preview cards, explicitly say they are previews. Never infer release or
availability dates from a card simply appearing on a reference site.

## Code contributions

Use built-in Node facilities where practical; keep consumers free of runtime
network calls and scraping dependencies. Add tests for meaningful behaviour and
regressions. Schema breaks need a versioned contract and migration guide.

Prefer small, reversible commits using feat:, fix:, chore:, docs: or refactor:
with specific descriptions. Keep unrelated changes out of the same PR.

By submitting original code you agree to its distribution under the project's
ISC software licence. Do not submit material you lack permission to contribute;
third-party Pokémon content retains its own rights. Preserve source attribution.
