# Coverage and verification

3,879 reference-listed English prints across 23 sets/promo series.

Coverage means numbered records listed by the source, including previews. It does
not certify every card as released or currently obtainable. Promo acquisition
channels and individual release dates are not yet modelled.

The audit compares IDs, names, types, stages, HP, attacks, energy costs, abilities,
trainer effects, weakness, retreat, evolution names and pack labels with
[Limitless TCG Pocket](https://pocket.limitlesstcg.com/cards). Energy symbols are
expanded to English names; whitespace and equivalent quotation/minus characters
are normalised. This is one community reference, not an independent in-game audit.

**Rarity is structurally checked but not reference-certified:** the reference's
text representation conflates shiny and ordinary star symbols. Existing rarity
classifications were retained except four reviewed B4a diamond-rarity corrections.

| Set | Prints | Release date | Reference checked | Open differences |
| --- | ---: | --- | --- | ---: |
| [A1: Genetic Apex](https://pocket.limitlesstcg.com/cards/A1) | 286 | 2024-10-30 | 2026-09-29 | 0 |
| [A1a: Mythical Island](https://pocket.limitlesstcg.com/cards/A1a) | 86 | 2024-12-17 | 2026-09-29 | 0 |
| [A2: Space-Time Smackdown](https://pocket.limitlesstcg.com/cards/A2) | 207 | 2025-01-29 | 2026-09-29 | 0 |
| [A2a: Triumphant Light](https://pocket.limitlesstcg.com/cards/A2a) | 96 | 2025-02-28 | 2026-09-29 | 0 |
| [A2b: Shining Revelry](https://pocket.limitlesstcg.com/cards/A2b) | 111 | 2025-03-27 | 2026-09-29 | 0 |
| [A3: Celestial Guardians](https://pocket.limitlesstcg.com/cards/A3) | 239 | 2025-04-30 | 2026-09-29 | 0 |
| [A3a: Extradimensional Crisis](https://pocket.limitlesstcg.com/cards/A3a) | 103 | 2025-05-29 | 2026-09-29 | 0 |
| [A3b: Eevee Grove](https://pocket.limitlesstcg.com/cards/A3b) | 107 | 2025-06-26 | 2026-09-29 | 0 |
| [A4: Wisdom of Sea and Sky](https://pocket.limitlesstcg.com/cards/A4) | 241 | 2025-07-30 | 2026-09-29 | 0 |
| [A4a: Secluded Springs](https://pocket.limitlesstcg.com/cards/A4a) | 105 | 2025-08-28 | 2026-09-29 | 0 |
| [A4b: Deluxe Pack ex](https://pocket.limitlesstcg.com/cards/A4b) | 379 | 2025-09-30 | 2026-09-29 | 0 |
| [P-A: Promo-A](https://pocket.limitlesstcg.com/cards/P-A) | 117 | Promo series | 2026-09-29 | 0 |
| [B1: Mega Rising](https://pocket.limitlesstcg.com/cards/B1) | 331 | 2025-10-30 | 2026-09-29 | 0 |
| [B1a: Crimson Blaze](https://pocket.limitlesstcg.com/cards/B1a) | 103 | 2025-12-17 | 2026-09-29 | 0 |
| [B2: Fantastical Parade](https://pocket.limitlesstcg.com/cards/B2) | 234 | 2026-01-29 | 2026-09-29 | 0 |
| [B2a: Paldean Wonders](https://pocket.limitlesstcg.com/cards/B2a) | 131 | 2026-02-26 | 2026-09-29 | 0 |
| [B2b: Mega Shine](https://pocket.limitlesstcg.com/cards/B2b) | 117 | 2026-03-26 | 2026-09-29 | 0 |
| [B3: Pulsing Aura](https://pocket.limitlesstcg.com/cards/B3) | 234 | 2026-04-28 | 2026-09-29 | 0 |
| [B3a: Paradox Drive](https://pocket.limitlesstcg.com/cards/B3a) | 109 | 2026-05-28 | 2026-09-29 | 0 |
| [B3b: Everyday Wonders](https://pocket.limitlesstcg.com/cards/B3b) | 106 | 2026-06-30 | 2026-09-29 | 0 |
| [B4: Ruler of the Skies](https://pocket.limitlesstcg.com/cards/B4) | 233 | 2026-07-30 | 2026-09-29 | 1 |
| [B4a: Team Rocket's Ambition](https://pocket.limitlesstcg.com/cards/B4a) | 110 | 2026-08-27 | 2026-09-29 | 0 |
| [P-B: Promo-B](https://pocket.limitlesstcg.com/cards/P-B) | 94 | Promo series | 2026-09-29 | 0 |

## Known gaps

- B4-019 retains **Teal Mask Ogerpon**; the reference currently says
  **Teal MaskOgerpon**. This spelling discrepancy is visible in verification.json.
- Deluxe Pack: Mega launches on **30 September 2026** and is not included in this
  snapshot. Add it once its complete reference inventory can be checked.
  [Official announcement](https://the-pokemon-company-international.prezly.com/nouveau-booster-special-du-jcc-pokemon-pocket-deluxe-pack-mega-lancement-le-30-septembre).
- Source-listed promos may be previews. Listing a print does not establish its
  availability or event dates.
- Card rule text is included in enriched exports; effects are descriptive text,
  not executable simulator logic.

## Evidence

- data/verification.json: dates, source HTML hashes, local card-file hashes,
  checked/unchecked fields and unresolved discrepancies.
- data/corrections-2026-09-29.json: reviewed corrections and added promos.
- data/card-details.json: per-print reference URLs, pack labels and rule text.
- data/sets.json: expected inventory and source-backed set release dates.

Run npm run reference to produce fresh comparison candidates without changing
canonical data. See [maintenance](maintenance.md) before recording a new audit.
