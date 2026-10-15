# My Rugby App — agent guide (design-system)

Cross-tool context for AI agents. Estate map, data flow, contracts, `rugby-ci`, and the test memory guard live in the workspace-root `CLAUDE.md` (the parent directory of this repo); do not restate them here.

**This repo:** `my-rugby-app-design-system` — canonical design tokens (`colors_and_type.css`) and 35 HTML preview cards in `previews/`. Reference only; ref branch `main`.

## Token parity

- `colors_and_type.css` is the source of truth for design *values*; `my-rugby-app/lib/core/design/tokens/*.dart` (`app_colors`, `app_typography`, `app_dimensions`, `app_animation_tokens`) is the source of truth for *implementation*. Change both in the same logical change.
- tvOS mirrors the values in `my-rugby-app-tvos/MyRugbyAppTV/Shared/DesignTokens.swift` (parity table in the tvOS README).
- `rugby-ci design-drift` checks hex colour values only: any Flutter or tvOS value absent from the CSS is drift. Token names and non-colour values are not checked.
- Each `previews/*.html` card maps to a Flutter widget listed in `README.md`.

## Contracts and tests

No vendored contracts here (see `CONTRACTS.md`), so no `contract-drift` gate. No test suite and no build step.
