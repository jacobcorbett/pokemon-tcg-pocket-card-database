# Data contract

## Compatibility

The legacy `en.<setName>` arrays retain the same fields and lowercase print IDs
(for example a1-001 and p-b-001). Those IDs identify numbered prints, not Pokémon
species. Existing IDs are not renamed or reassigned. Card text/values can receive
source-backed corrections; pin a release or commit for reproducibility.

The enriched `database` export and generated dist/v1 files are additive. JSON
Schemas cover legacy records and enriched prints in schema/. TypeScript
interfaces are in index.d.ts. A breaking generated-data shape requires v2;
v1 consumers must be able to stay on v1. Additive fields can appear in a minor
release, so consumers should tolerate unfamiliar fields.

## Print fields

Legacy fields: id, name, element, type, subtype, effect, health, set, pack,
attacks, retreatCost, weakness, abilities, evolvesFrom and rarity.

- damage stays a string: empty, 40, 40+, 20x, 140- and equivalent multiplication
  notation are supported. Empty means no printed damage, not a numeric zero.
- Empty attack costs represent zero-energy attacks.
- effect is for Trainers; attacks/abilities carry Pokémon effects.
- null represents an absent or unspecified field; do not infer availability from it.
- evolvesFrom is a name reference, not a print ID. Multiple prints may share it.

Additional v1 print fields:

| Field             | Meaning                                                            |
| ----------------- | ------------------------------------------------------------------ |
| setId             | Canonical lowercase set code                                       |
| number            | Number within the set                                              |
| packs             | Named pack labels observed on the reference; [] means unspecified  |
| rules             | Source-derived card rule text, including ex/Mega ex knockout rules |
| sourceUrl         | Per-card Limitless reference URL                                   |
| gameplayId        | SHA-256 fingerprint of gameplay fields and rule text               |
| alternatePrintIds | Other prints with the exact same gameplay fingerprint              |

## Gameplay groups

Group inputs are name, element, type, subtype, effect, health, attacks,
retreatCost, weakness, abilities, evolvesFrom and rules. IDs, rarity, set, pack
and acquisition information are excluded. Object keys are sorted for hashing; attack and ability order is retained. Comparisons are conservative and
exact: visually similar cards or matching names alone are insufficient.

Each gameplay record contains id (the fingerprint), the gameplay fields, rules
and printIds. It has no rarity or pack label because those belong to prints.
Fingerprints are **content identifiers**, not permanent game card IDs: correcting
text, damage, energy costs or rules changes the fingerprint. Store stable print
IDs in long-lived collections and derive groups from the chosen snapshot.

Grouping does not establish deck legality, make effects executable, or account
for metadata not yet captured by this schema. Release status, promo acquisition
channels and complete availability information remain unknown.

## Set metadata and snapshot integrity

Sets expose id, code, name, file, exportName, expectedCount, releaseDate,
sourceUrl, cardCount, observed packs and verification. Release date is ISO
YYYY-MM-DD; promo series dates are null. Legacy display labels are retained;
they are distinct from an official naming guarantee.

metadata.json records the package/schema version, counts and SHA-256 hashes of
all generated data files. It excludes its own hash to avoid a self-reference.
Builds contain no wall-clock timestamp and are reproducible from the same inputs.
The listed reference dates come from source retrieval, not the build time.
