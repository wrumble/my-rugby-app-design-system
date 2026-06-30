# Design System — My Rugby App

See @AGENTS.md for how this bundle fits the wider estate.

This repo is the **canonical design reference** for the Flutter app: design tokens (`colors_and_type.css`) plus 35 HTML preview cards (`previews/`). It is documentation and reference, **not production code** — nothing here ships directly. Default branch: `main`.

## What's here
```
colors_and_type.css   # SOURCE OF TRUTH for design *values* (colours, type, spacing, radius, animation)
DESIGN_SYSTEM.md      # full design system reference
README.md             # handoff overview + widget mapping table
previews/             # 35 preview cards; previews/_index.html is the navigable index
IMPLEMENTATION_TASKS.md  # ranked first tasks for implementing against the Flutter app
```
There is no build step or test suite — open the HTML files in a browser (`open previews/_index.html`).

## Project-specific rules
- **`colors_and_type.css` is the source of truth for design *values*; `my-rugby-app/lib/core/design/tokens/*.dart` is the source of truth for *implementation*.** Keep them in lock-step — a change here must be mirrored in the Flutter token files (and that repo's README) in the same logical change.
- **Previews are references, not code to copy.** Each card maps to an existing or to-be-created Flutter widget — see the mapping table in `README.md`. Don't treat the HTML as the implementation.
- **Never introduce one-off values.** Every colour, font size, spacing, and radius must be a token already defined in `colors_and_type.css`. If a value doesn't exist, add it as a named token — don't inline a hex/px literal.
- **Zero emoji.** The whole system uses the line-icon set in `previews/components-icon-set.html`. Do not add emoji anywhere.
- **Accessibility is a hard requirement.** Body text contrast ≥ 4.5:1; visible focus states; honour reduced-motion. See `previews/accessibility-audit.html`.

## When changing tokens
1. Edit `colors_and_type.css`.
2. Update `DESIGN_SYSTEM.md` / `README.md` if the token set or guidance changed.
3. Mirror the change into `my-rugby-app/lib/core/design/tokens/*.dart` (the implementation SOT) — they must not drift.
