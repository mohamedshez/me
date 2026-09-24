# Big O audit · shez.app

This implementation applies the supplied guide without treating every operation as constant time. `n` is the public repository count, `a` the approved live application count, `s` the total searchable text length, and `p` the visible page size (24).

| Operation | Time | Additional space | Boundary |
| --- | --- | --- | --- |
| Public repository ingestion and normalization | O(n log n + s), including deterministic date sorting and field validation | O(n + s) | Server-only, cached for 86,400 seconds |
| Exact repository index | O(n) to construct once per request; average O(1) per name lookup | O(n) references | Server, shared by metadata and detail page through React cache |
| Merge repositories and live apps | O(n + a + s), with Map/Set lookups | O(n + a + s) derived entries and normalized search text | Server; only the interactive directory receives this payload |
| Select three recent repositories | O(n), including a maximum of three comparisons per eligible item | O(1): at most four temporary references | Server; homepage renders at most three cards |
| Directory text/category search | O(n) entry checks plus substring matching cost | O(n) references in the worst case | Client; memoized for unchanged entries/query/filter |
| Directory page rendering | O(p), bounded to 24 rows | O(p) references and elements | Client; all projects remain accessible through pagination |
| Other page repository hydration | No global repository array | O(1) repository data for a detail page, none for About | Server Components render only required content |
| Daily tab refresh | O(1) timer state | O(1) | Small Client Component; asks Next.js for refreshed server content |

Substring search is **not O(1)**: it scans relevant pre-normalized text. String matching depends on query length and the engine's implementation (a conservative naive bound is O(n × maximum text length × query length)). Search normalization and per-record string allocation occur once on the server, rather than on every keystroke. Filtering reuses entry objects, and changing page does not recompute matching results.

The directory intentionally uses O(n + s) client memory for interactive, cross-field search. Other pages do not pay that cost. If the inventory grows beyond the current ingestion guard of 20 pages × 100 repositories, add server-paginated search rather than raising the guard without a payload budget. The XML and human-readable sitemaps necessarily enumerate O(n) routes on the server.

The recent-work selection accepts unsorted input and maintains a constant-size top-three list. Detail metadata and content share a request-scoped Map rather than independently scanning the list. The fixed four-item application configuration and short URL breadcrumb segments do not need extra indexes.

## Deployment metadata

Build identity generation, footer rendering, and `/api/version` use fixed-size metadata: O(1) time and space. No GitHub request or tag creation runs inside the website. GitHub Actions creates one immutable tag after successful build tests; Vercel receives the same prebuilt artifact.

## Verification

- Algorithm tests exercise a 600-repository directory, app/repository deduplication, filters, search fields, missing-name lookups, and top-three selection with unsorted, ineligible, and stale entries.
- Existing tests enforce public-only metadata, affiliation exclusions, safe links, fork attribution, and daily refresh.
- Production browser checks cover desktop/mobile navigation, search, filters, destination links, theme persistence, missing routes, content exclusions, responsive overflow, and generated sitemap/API output.
- Tailwind is compiled at build time using the official Next.js/PostCSS integration: https://tailwindcss.com/docs/installation/framework-guides/nextjs

No latency claim is inferred from Big O alone; these are algorithmic bounds, not a substitute for measuring production traffic.
