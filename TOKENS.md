# Design tokens: single source

`tokens/*.json` holds the design tokens in the W3C Design Tokens (DTCG) format. Style Dictionary builds them into one output per consumer under `dist/`. The values are the app's staging truth: every token was read from `my-rugby-app` at `develop`, not from `colors_and_type.css`.

This is slice 1. No consumer reads `dist/` yet, and `colors_and_type.css` and the previews are unchanged. The rollout order is in the estate master plan amendment (`afk-board/MASTER-PLAN-AMENDMENT-PROPOSED-2026-11-11-DESIGN-SYSTEM.md`).

## Commands

```
npm ci
npm run build    # regenerate dist/ from tokens/, and run the contrast check
npm run check    # fail unless dist/ is byte-identical to a fresh build
```

Node 22 or newer. `npm run check` is a codegen check, not a test: it runs locally before every PR, the same way the app runs `generate_tokens.mjs --check`.

## Source files

| File | Top-level groups |
|---|---|
| `tokens/color.json` | `color` (brand, neutral, primitives, `chrome`, `navy`, `semantic`, `status`, `focus`, `entrance`, `matchHub`, `fanZone`) |
| `tokens/dimension.json` | `space`, `radius`, `elevation`, `shadow`, `breakpoint`, `focus`, `size` |
| `tokens/font.json` | `font` (family, size, weight, lineHeight, letterSpacing) |
| `tokens/motion.json` | `motion` (duration, ease, fanZone) |
| `tokens/density.json` | `density` (comfortable, compact) |
| `tokens/tv.json` | `tv` (the 10-foot subset: colour, font, space, focus, size) |
| `contrast.json` | not tokens: the colour pairs the build checks |

Value forms: colours are `#RRGGBB` or `#RRGGBBAA` hex strings; dimensions and durations are `{ "value": n, "unit": "px" | "ms" }`; easings are four-number arrays; aliases are `{group.path}` references. The build rejects anything else.

## Modes: theme and density

A token that varies by mode carries one mode segment in its path. There are two axes:

| Axis | Modes (default first) | CSS attribute |
|---|---|---|
| theme | `light`, `dark`, `hc` | `data-theme` |
| density | `comfortable`, `compact` | `data-density` |

`color.navy.dark.bg` and `color.navy.light.bg` are two tokens. Never use `light`, `dark` or `hc` as an ordinary token name. `comfortable` and `compact` are modes only inside the `density` group, so `breakpoint.compact` is an ordinary token.

- Dart and Swift get every token under its full name (`DsColor.navyDarkBg`, `DsDensity.compactRowHeight`); the consumer picks, as the app does today by brightness.
- CSS gets the full names on `:root`, plus an alias with the mode segment removed (`--ds-color-navy-bg`, `--ds-density-row-height`) that resolves per mode. Theme: light by default, dark under `[data-theme="dark"]` or `prefers-color-scheme: dark` when no `data-theme` is set, high contrast under `[data-theme="hc"]`. Density: comfortable by default, compact under `[data-density="compact"]`.
- Tailwind maps the aliases, so `bg-ds-navy-bg` and `h-ds-density-row-height` follow the active modes.

`density.comfortable` is the app's touch sizing (44px targets). `density.compact` is new in this change and proposed, not app truth: 32px controls and rows for pointer-driven surfaces such as admin. It is below the 44px touch target, so it must not be used on touch UIs.

Three gaps are deliberate, because the app has no token there today:

- `color.chrome.light` has only `bg` and `text2`. The app derives the rest of its light chrome from Material `ColorScheme.fromSeed`. `color.navy` is complete in both modes.
- Only `color.fanZone` has an `hc` set. The app computes its other high-contrast colours at runtime.
- There is no team-accent token. The accent is set at runtime from CMS team config.

## Outputs

| File | Consumer | Shape |
|---|---|---|
| `dist/css/tokens.css` | admin, any web surface | `--ds-*` custom properties and mode aliases |
| `dist/tailwind/theme.css` | admin (Tailwind v4, CSS-first) | `@theme inline` block mapping `--ds-*` to utilities |
| `dart/design_tokens.g.dart` (held, see below) | Flutter app | `DsColor`, `DsSpace`, `DsRadius`, `DsElevation`, `DsBreakpoint`, `DsFocus`, `DsSize`, `DsFont`, `DsMotion`, `DsDensity`, `DsTv` |
| `swift/DesignTokens.generated.swift` (held, see below) | tvOS | `enum DSTokens`, the `tv.*` subset only |
| `dist/json/tokens.json` | drift gates | flat map of resolved values |
| `dist/contrast-report.json` | reviewers, admin parity work | WCAG ratio, minimum and pass or fail for every pair |
| `dist/manifest.json` | drift gates | version, source hash, sha256 of each output |

Admin wiring (Tailwind v4):

```css
@import "tailwindcss";
@import "./tokens.css";
@import "./theme.css";
```

Every Tailwind key is prefixed `ds-`. Without the prefix our names would silently replace Tailwind defaults: our `neutral-100` is white and Tailwind's is not.

| Tailwind namespace | From | Example utility |
|---|---|---|
| `--color-ds-*` | `color.*` | `bg-ds-navy-surface`, `text-ds-navy-text1`, `border-ds-navy-border` |
| `--spacing-ds-*` | `space.*` | `p-ds-md`, `gap-ds-xs` |
| `--spacing-ds-density-*` | `density.*` | `h-ds-density-control-height`, `px-ds-density-cell-padding-x` |
| `--radius-ds-*` | `radius.*` | `rounded-ds-pill` |
| `--shadow-ds-*` | `shadow.*` | `shadow-ds-low` |
| `--breakpoint-ds-*` | `breakpoint.*` | `ds-expanded:grid-cols-3` |
| `--font-ds-*` | `font.family.*` | `font-ds-display` |
| `--text-ds-*` | `font.size.*`, `density.*.fontSize` | `text-ds-body`, `text-ds-density` |
| `--font-weight-ds-*` | `font.weight.*` | `font-ds-semi-bold` |
| `--leading-ds-*` | `font.lineHeight.*` | `leading-ds-body` |
| `--tracking-ds-*` | `font.letterSpacing.*` | `tracking-ds-caps` |
| `--ease-ds-*` | `motion.*.ease.*` | `ease-ds-standard` |

Breakpoints are emitted as literal pixel values because media queries cannot read custom properties. Tailwind v4 has no theme namespace for durations; use `duration-(--ds-motion-duration-fast)`. `shadow` tokens are web-only and are not emitted for Dart or Swift; Flutter renders the `elevation` steps itself.

### Held outputs: Dart and Swift

The Dart and Swift generators are in `build.mjs`, but their outputs are not committed to `dist/` yet. The estate's pre-commit hook refuses both in this repo:

- `.dart`: the hook format-checks and analyses staged Dart with the pinned Flutter SDK and stops with `required Flutter SDK pin delegate missing`, because this repo has no `tool/flutter_sdk_version.sh`.
- `.swift`: `no checker examined selected source files (fix the toolchain or add a reviewed declared_unchecked policy entry)`.

The hook names its own remedy: a reviewed entry in the harness policy (`my-rugby-app-harness/ci/deterministic-hook-policy.json`) declaring `dist/dart/*.dart` and `dist/swift/*.swift` in this repo as generated outputs that are checked in their consumers. Renaming the files to get past the hook would defeat it, so they stay out until that entry lands.

To inspect them now:

```
node build.mjs --include-held    # writes every output to build/all/ (gitignored)
```

To release them once the policy entry exists: delete `held: true` from the two entries in `OUTPUTS` in `build.mjs`, run `npm run build`, and commit `dist/`. The Dart generator emits `dart format` clean output and fails the build on a declaration it cannot format.

## Contrast check

`npm run build` computes the WCAG 2.x contrast ratio of every pair in `contrast.json` and writes `dist/contrast-report.json`. Minimums are 4.5 for text and 3 for non-text UI. Ratios are truncated to two decimals, never rounded up.

The build fails when a pair is below its minimum, unless the pair is marked `"knownFailure": true`. That flag is the baseline for colours that fail in the app today. A flagged pair that starts passing also fails the build, so the flag is removed in the same change as the fix. To use a colour in a new foreground and background combination, add the pair first.

## Versioning and pinning

`package.json` `version` is the token set version, and every generated file carries it with the sha256 of the token sources and `contrast.json`. Bump it on every change to `tokens/`: patch for a value change, minor for an added token, major for a renamed or removed one.

Consumers do not install this repo as a package. They vendor the one output they need and pin the commit it came from, the same way the estate pins CMS contracts: a `.design-tokens-sha` file, a sync script that copies from that commit, and a drift gate that fails when the vendored file differs from the pinned commit's output. Vendored token files are never edited by hand.

## Changing a token

1. Edit `tokens/*.json` and bump `version` in `package.json`.
2. `npm run build`, then `npm run check`.
3. Commit `tokens/` and `dist/` together.
4. Roll the new commit out to each consumer by moving its pin.
