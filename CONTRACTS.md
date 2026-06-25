# Cross-repo data contracts

This repo holds design tokens, preview cards, and reference markup for the My Rugby App design system. It does **not** currently consume cross-repo data contracts — there is no vendored copy of canonical enums (match status, ad placement, article category, event type) or shared schemas here, and there is no Dart/TS code in this repo that needs to stay in lockstep with the CMS.

If that changes — for example, if we promote a "match status pill", a "fixture card", or any other contract-aware shared component into this repo — follow the pattern documented in the data-contracts kit so the consumer stays pinned to a single CMS source of truth.

## Source of truth

Canonical contracts live in [`my-rugby-app-cms`](https://github.com/wrumble/my-rugby-app-cms) under `apps/contracts/`. Every other repo that needs them vendors a generated copy alongside a SHA pin and a sync script. The Flutter app, the admin web app, the content API, the rugby API, the tvOS app, and the screens (Next.js web) repo are the current consumers.

## Future pattern for contract-aware components

If a future component in this repo needs canonical enum values or shared types:

1. Add a `tools/sync-contracts.<sh|mjs>` script and a `.cms-contracts-sha` (or `.cms_contracts_sha`) pin file at the repo root, matching the pattern used in `my-rugby-app`, `my-rugby-app-admin`, `my-rugby-app-tvos`, `my-rugby-app-screens`, `my-rugby-app-content-api`, and `my-rugby-app-rugby-api`.
2. Vendor the generated contracts under a `generated/contracts/` directory in whatever language the component is authored in.
3. Add a `contract-drift` GitHub Actions workflow that re-runs the sync script on every PR touching contract-related files and fails the build if the vendored output drifts from the pinned CMS SHA.
4. Bump the SHA pin whenever the CMS contracts change; reviewers can rerun the sync script locally to confirm the regenerated files match.

The kit that introduced this pattern across the other repos lives at `~/Desktop/data-contracts-kit/` on the author's machine and is the place to look for the exact wiring (workflow YAML, script shape, drift check semantics).
