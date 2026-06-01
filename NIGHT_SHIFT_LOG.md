# 🌙 NIGHT_SHIFT_LOG — Sprint 11 — 2026-06-01

**Branch:** `night-shift/sprint-11-20260601` (off `main` @ 2ecbfa7)
**Mode:** NIGHT_SHIFT_MODE=true (local-only, no push to main, mock adapters)
**Theme:** F6 PDF upload (mock-first)

## Budget
- Max stories: 5 + sprint-close
- Mock-first: PDF extraction (MockPdfExtractor) + AI (MockAiAdapter); pdf-parse is local (no cost) but lazy-loaded only in real adapter, never in night-shift
- No migration: ingest is transient, reuses existing `MindMap.sourceType='pdf'` enum

## Stories

- [x] S11-01 — Ingest domain (39c7b50) — 31 tests
- [x] S11-02 — PDF extractor port + adapters (0391530) — 2 tests
- [x] S11-03 — IngestService + createFromIngest (ac4d36f, + biome chore) — 13 tests
- [x] S11-04 — IngestController + module + app wiring (c9d6992) — 2 tests
- [x] S11-05 — FE upload UI + client validation (e8342d5) — 7 web tests

## Checkpoints

- S11-01..04: API suite 147 → **194** pass; `tsc --noEmit` clean.
- S11-05: web suite 6 → **13** pass; web `tsc` clean; `next build` OK (19 pages, `/upload` new).
- All commits on `night-shift/sprint-11-20260601`. No push to main, no deploy, mock adapters only.
- ✅ DONE — see NIGHT_SHIFT_REPORT.md
