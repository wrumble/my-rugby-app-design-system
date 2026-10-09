# Design System — My Rugby App

See @AGENTS.md for repo facts and the estate pointer.

Canonical design reference: design tokens (`colors_and_type.css`) plus 35 HTML preview cards (`previews/`). Reference, not production code — nothing here ships. Ref branch: `main`.

## Layout
```
colors_and_type.css      # SOURCE OF TRUTH for design values (colour, type, spacing, radius, animation)
DESIGN_SYSTEM.md         # full reference
README.md                # handoff overview + widget mapping
index.html               # root handoff page linking the docs and previews
previews/                # 35 cards (no _index.html; navigate via root index.html)
IMPLEMENTATION_TASKS.md  # ranked Flutter implementation tasks
CONTRACTS.md             # states this repo consumes no contracts
GIT_SETUP.md             # historical repo-layout notes
```
No build step, no tests, no CI. View with `open index.html`. GitHub Actions is dead estate-wide; the only machine check touching this repo is `rugby-ci design-drift`.

## Rules
- **Values here, implementation in `my-rugby-app/lib/core/design/tokens/*.dart`.** Change one, change the other in the same logical change. tvOS mirrors the values in `my-rugby-app-tvos/MyRugbyAppTV/Shared/DesignTokens.swift`.
- Previews are references, not code to copy; each maps to a Flutter widget in `README.md`.
- No one-off values: every colour, size, spacing and radius is a named token in `colors_and_type.css`; add a token rather than inline a literal.
- Zero emoji; use the line-icon set in `previews/components-icon-set.html`.
- Accessibility is hard: body contrast >= 4.5:1, visible focus, honour reduced-motion (`previews/accessibility-audit.html`).

## Changing tokens
1. Edit `colors_and_type.css`.
2. Update `DESIGN_SYSTEM.md` / `README.md` if the token set or guidance changed.
3. Mirror into the Flutter token files and tvOS `DesignTokens.swift`.
4. Run `rugby-ci design-drift`.
