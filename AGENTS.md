# My Rugby App — agent guide (ecosystem map)

> Cross-tool context for AI agents (Claude Code, Cursor, and others). It describes
> how the **My Rugby App** repos fit together. Each repo's `CLAUDE.md` imports this
> file via `@AGENTS.md`. Keep the shared map here; keep repo-specific rules in `CLAUDE.md`.

**This repo:** `my-rugby-app-design-system` — the canonical design tokens (CSS) and 35 HTML preview cards. Design *references* that mirror the Flutter app's design layer; **not** production code to copy.

## The repos (cloned as siblings under one parent directory)

| Repo | Role |
|---|---|
| `my-rugby-app` | Flutter app (iOS/Android/Web). The product. Consumes contracts + design tokens. |
| `my-rugby-app-cms` | Django + Wagtail CMS. **Source of truth** for content, the cross-repo data contracts, and the primary database. |
| `my-rugby-app-admin` | Next.js admin panel. Editors' dashboard; consumes the contracts. |
| `my-rugby-app-content-api` | FastAPI read API — news, players, standings, ads, videos, watch venues, strings (local port 8002). |
| `my-rugby-app-rugby-api` | FastAPI read API — matches, competitions, teams, live scores (local port 8001). |
| `my-rugby-app-design-system` | Canonical design tokens (CSS) + 35 preview cards. Mirrors the Flutter design layer. |
| `my-rugby-app-ios-certs` | fastlane `match` certificate/profile store (encrypted). Never hand-edited. |

(Wider estate, not always cloned locally: `my-rugby-app-tvos`, `my-rugby-app-screens` — the Fan Zone kiosk.)

## How data flows

```
Editors → CMS (Django/Wagtail, primary Postgres) ─┬─ Postgres read replica ─→ content-api / rugby-api ─→ Flutter app
                                                   └─ Redis pub/sub (cache invalidation) ─→ content-api / rugby-api
CMS → Firestore (signals + live-match plane) ─→ Flutter app + admin + tvOS
```

- **CMS owns the data.** The two FastAPI services are read-only views over a Postgres replica; Redis pub/sub drives their cache invalidation.
- **Firestore is a signal bus by default** — producers write a signal; consumers re-fetch from REST.
  Sanctioned exception: the live-match ephemeral plane (`matches/*`, `league_scores/*`, `weather/*`) — see `my-rugby-app-cms/docs/adr-firestore-signal-bus.md`.

## Design tokens — this repo's job

`colors_and_type.css` here is the source of truth for design *values*; `my-rugby-app/lib/core/design/tokens/*.dart` is the source of truth for *implementation*. The two are kept in lock-step — changing one means changing the other (and the README) in the same PR. The `previews/*.html` cards show the intended look of widgets that already exist (or should exist) in the Flutter app; each maps to a widget listed in `README.md`.

## Cross-repo data contracts

The CMS is the single source of truth for shared enums and shapes (event types, match statuses, article categories, ad placements, locales, notification kinds, `TeamRef`). They are codegen'd from `my-rugby-app-cms/apps/contracts/` and vendored into each consumer at a pinned SHA, gated by a `contract-drift.yml` CI job. This repo holds no contract code, but UI work downstream depends on those enums.

## Cross-repo safety — memory guard

Every code repo runs its tests through a `safe-test.sh` wrapper (`tools/safe-test.sh`; the Flutter app uses `tool/safe-test.sh`) that holds a **machine-wide lock** and caps memory. Two agent worktrees running tests at once once exhausted RAM and shut the laptop down. Always test through `make test` / the wrapper — never a raw `pytest`, `flutter test`, or `jest`.
