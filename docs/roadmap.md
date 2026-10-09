# Roadmap

## Foundation in this branch

- Stable print IDs and legacy exports retained.
- Reference comparisons across all 24 current inventories, reviewed corrections
  and visible limitations.
- Full prints, conservative gameplay groups and per-set JSON with schemas,
  source URLs, metadata and checksums.
- CI, daily reference comparison and draft release artifacts.
- Contribution templates, ISC software licence and retained upstream attribution.

## Next data priorities

1. Independently audit shiny/parallel rarity mappings.
2. Model promo/event acquisition and per-print release status from evidence.
3. Reconcile reference conflicts with in-game evidence or a second independent source.
4. Make pack availability explicit where the current reference omits named labels.

An operational target is to review new sets within 24 hours of release. This is
an aspiration, not a guarantee or an automatic-publication policy.

## Future API

Build the API over versioned generated snapshots, with canonical data maintained
here. Proposed resources: /v1/cards, /v1/cards/:id, /v1/sets and /v1/sets/:id/cards.
Support predictable filtering/pagination and publish an OpenAPI contract with
schema/package version and snapshot provenance. Use ETags/cache headers and
stable errors; validate queries against the published field vocabulary.

Keep ingestion separate from serving: a website request must never scrape a
reference or update card data. Deploy immutable snapshots atomically and keep old
versions available. API hosting and npm publication are separate future work.

## Adoption

After the data foundation is released, add tested integration examples and
migration guidance, then seek feedback from actual tool maintainers. Measure
independent projects depending on releases and correction turnaround rather
than treating GitHub stars as proof of data quality.
