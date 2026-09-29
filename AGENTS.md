# Repository instructions

This is Jacob Corbett's English-only fork of Hugo Burguete's database. Preserve
upstream authorship, existing print IDs and legacy en exports.

- Canonical records: cards/en; inventory: data/sets.json; supplementary fields:
  data/card-details.json; evidence: data/verification.json.
- dist is generated. Never hand-edit or commit it. Do not automatically copy
  scraped candidates over canonical data or call a structural check a game audit.
- Keep unresolved source conflicts and unchecked fields visible.
- No hosted API, npm publication or new locale expansion unless requested.
- Prefer small scoped commits with feat:, fix:, chore:, docs: or refactor: and
  descriptive messages. Inspect the base and complete diff before making a PR.
- When Jacob asks to create/open/prepare/make a PR, run his personal
  local-pr-autoreview skill before committing, pushing or opening it. Keep review
  local; do not install hosted review bots. Never merge without authorisation.
- Verify with npm run check and git diff --check; check a packaged consumer with
  npm pack followed by node scripts/check-package.js when packaging changes.
- Cite data sources and do not store credentials or private user data.
