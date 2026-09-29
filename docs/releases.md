# Releases

The prepared package version is 0.2.0; it has **not been published**. This repository
has no configured npm publication. Build/package commands are local until a
maintainer deliberately pushes a matching version tag.

## Versioning

- Patch: source-backed corrections without breaking schema/integration contracts.
- Minor: new sets, additive metadata/exports and compatible tooling features.
- Major: breaking runtime interfaces. Generated-data breaks also need a new
  schema path (v2), migration guidance and continued access to older snapshots.
- Do not retag releases or replace released assets to change their contents.

Print IDs are persistent. Gameplay fingerprints intentionally change with gameplay
content; see schema.md. Consumers seeking reproducibility should pin a release.

## Prepare a release

1. Finish source comparisons and review unresolved discrepancies. Update coverage.
2. Bump package.json and regenerate package-lock.json with npm install --package-lock-only.
3. Add an entry to CHANGELOG.md covering added sets, corrections and compatibility.
4. Run npm run check, npm pack, node scripts/check-package.js and git diff --check.
5. Review and merge the scoped changes. On the merged commit, create a v-prefixed
   tag matching package.json. Push the tag only when ready to prepare the release.

The release workflow validates the tag/version, rebuilds and tests the data,
checks the package in isolation, then creates a **draft** GitHub release containing:

- pocket-data-vVERSION.tar.gz with the versioned JSON snapshot.
- pokemon-tcg-pocket-card-database-VERSION.tgz with JavaScript/TypeScript/data.
- SHA256SUMS for the archives; metadata.json also hashes individual JSON files.

Review the draft notes and artifacts before publishing it. No npm publish,
external service deployment or API credentials are involved.

A package tarball can be installed locally using npm install /path/to/package.tgz.
Public HTTP examples will be added once there is a released snapshot or API;
no documentation should imply that an unpublished endpoint already exists.

Workflows take effect after they are pushed/merged. Because this is a fork, enable
Actions and scheduled workflows in its repository settings if GitHub disables
them. The daily check is configured for 07:17 UTC; GitHub scheduling can be delayed.
