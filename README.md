# Handoff: My Rugby App Design System

## Overview

This bundle is the complete design system for **My Rugby App** — a Flutter-based Premiership Rugby companion app for iOS, Android, and Web. The design system mirrors `lib/core/design/` and `lib/app/theme/` from `wrumble/my-rugby-app` (default branch `main`) and documents every shared widget, token, screen pattern, and Match Hub-specific component.

## About the Design Files

The HTML files in `previews/` are **design references** — preview cards showing intended look, spacing, and behavior of components that already exist (or should exist) in the Flutter codebase. They are *not* production code to copy.

The implementation target is the existing Flutter app at `wrumble/my-rugby-app`. Every preview card maps to either:
- An existing widget under `lib/shared/widgets/` or `lib/features/<feature>/presentation/widgets/`
- A widget that should be created/refactored as part of this handoff (flagged in `README.md` under "Promotion candidates")

CSS tokens in `colors_and_type.css` are the source of truth for design *values*; Dart files under `lib/core/design/tokens/` are the source of truth for *implementation*. The two are kept in sync via `scripts/sync_tokens.js`.

## Fidelity

**High-fidelity.** Pixel-perfect mockups with final colors, typography, spacing, radii, and elevation. Every value is a token — recreate exactly using the existing `AppColors`, `AppTypography`, `AppDimensions` Dart APIs. Do not introduce one-off hex codes, font sizes, or spacing values.

## What's in this bundle

| Path | Purpose |
|---|---|
| `README.md` | This file — handoff overview |
| `DESIGN_SYSTEM.md` | Full design system reference (copied from project root README) |
| `colors_and_type.css` | Canonical design tokens — colors, type, spacing, radius, animation |
| `previews/` | 35 HTML preview cards covering every component, color palette, and pattern |
| `previews/_index.html` | Navigable index linking every preview |
| `IMPLEMENTATION_TASKS.md` | Concrete first tasks for Claude Code, ranked by priority |

## Implementation tasks (top priority)

These are ordered for a clean PR sequence — start at task 1.

1. **Zero-emoji migration.** Replace every emoji in the app with the corresponding line icon from `previews/components-icon-set.html`. Specifically:
   - `MatchHubTab.icon` (Dart): change type `String → IconData`. Pass `Icons.sports_rugby_outlined`, `Icons.stadium_outlined`, `Icons.tv_outlined`, `Icons.menu_book_outlined`, `Icons.local_bar_outlined`, `Icons.directions_bus_outlined`. Flagship Fan Zone uses a custom `FanZoneIcon` widget (see task 2) — **not** `Icons.wind_power`.
   - `EventFeedSection`: emoji event icons → `Icon(Icons.sports_rugby_outlined, ...)` etc. Yellow/Red cards: filled rectangles with amber / red colour from `AppColors`.
   - `ReactionBar`: switch reaction glyphs to a custom outlined glyph set (heart, flex-arm, shock, sad, angry).
   - `ModeSelectionScreen`: pulsing 📍 → `Icon(Icons.place_outlined)` with the same scale-pulse.
   - `NoMatchScreen`: 🏉 hero glyph → 64pt `Icons.sports_rugby_outlined`.
   - `StadiumTabScreen` transport rows: 🚌🚂🚗☁️ → `directions_bus_outlined`, `train_outlined`, `directions_car_outlined`, `cloud_outlined`.

2. **Build `FanZoneIcon` widget** (`lib/shared/widgets/fan_zone_icon.dart`). CustomPainter matching `previews/components-icon-set.html` flagship cell: round cage + 3 comma-shaped pinwheel blades + solid hub + neck post + trapezoidal base with handle slot + 3 wind lines on the right. Stroke 1.6, rounded caps, no fills (except hub). Used inside the Match Hub tab bar's flagship orb at 30pt white.

3. **Promote shared widgets to `lib/shared/widgets/`:**
   - `SectionHeader` (currently in `match_hub/presentation/widgets/shared/`) — already used widely
   - `PoolTabBar` (currently in `standings/presentation/widgets/`) — generic enough
   - `SettingsGroup` (extract from `profile_screen.dart`) — currently a private widget

4. **Add light-mode tokens.** `colors_and_type.css` now defines a Match Hub light palette (in addition to dark). Implement `MatchHubTheme.light` mirroring the existing `MatchHubTheme.dark` extension.

5. **Implement new tokens** documented in `DESIGN_SYSTEM.md`:
   - `AppColors.successSurface` / `errorSurface` / `warningSurface` (semantic surface tints)
   - `blue500` (info accent)
   - `surfaceBorder` (renamed from `divider` for clarity)
   - `AppDimensions.springCurve` (custom cubic)

## Design Tokens (summary)

**Colors** — see `colors_and_type.css` for the full palette. Highlights:
- Brand: `#E63946` red, `#1B3A6B` navy, `#C8A44A` gold
- Match Hub dark: `#0D0D1A` bg, `#1A1A2E` surface, `#3A3A5C` border, `#FF6B78` active
- Match Hub light: `#F0F0F0` bg, `#FFFFFF` surface, `#D0D0D6` border
- Semantic: `#2E7D32` success, `#F57F17` warning, `#D32F2F` error, `#1565C0` info

**Type:**
- Display: Bebas Neue (28-72pt, +0.5-1.5px letter-spacing)
- Body: DM Sans 400/500/600/700/800
- Mono: DM Mono 400/500

**Spacing scale:** 4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48 / 64

**Radius:** 4 / 8 / 12 / 16 / 24 / 32 / 999

**Animation:**
- 120ms (taps), 200ms (hover), 300ms (transitions), 450ms (page), 900ms (pulse)
- Curves: `cubic-bezier(0.4, 0, 0.2, 1)` (default), spring (custom)

## Files to reference in the codebase

| Design system file | Mirrors |
|---|---|
| `colors_and_type.css` `:root` block | `lib/core/design/tokens/app_colors.dart`, `app_typography.dart`, `app_dimensions.dart`, `app_animation_tokens.dart` |
| `previews/components-cards.html` | `lib/shared/widgets/app_card.dart` |
| `previews/components-badges.html` | `lib/shared/widgets/app_badge.dart` |
| `previews/components-app-section.html` | `lib/shared/widgets/app_section.dart` |
| `previews/components-buttons.html` | Material button factories in `app_theme.dart` |
| `previews/components-hero-carousel.html` | `lib/shared/widgets/hero_carousel.dart` |
| `previews/components-dual-progress-bar.html` | `lib/shared/widgets/dual_progress_bar.dart` |
| `previews/components-error-loading.html` | `error_view.dart`, `loading_indicator.dart`, `offline_banner.dart` |
| `previews/components-impression-tracker.html` | `lib/shared/widgets/impression_tracker.dart` |
| `previews/components-form-patterns.html` | Form theming in `app_theme.dart` |
| `previews/components-empty-states.html` | Pattern guidance — no single widget |
| `previews/components-fan-zone.html` | `lib/features/match_hub/presentation/widgets/fan_zone/*` |
| `previews/components-live-tab.html` | `lib/features/match_hub/presentation/widgets/live/*` |
| `previews/components-standings-table.html` | `lib/features/standings/presentation/standings_screen.dart` |
| `previews/components-match-hub-tab-bar.html` | `lib/features/match_hub/presentation/widgets/match_hub_tab_bar.dart` |
| `previews/components-icon-set.html` | New canonical line-icon system — applies app-wide |

## Conventions to enforce

- **Read colors via theme-aware accessors:** `AppColors.background(context)`, `AppColors.surface(context)`. Never hardcode `Color(0xFF080808)` in widgets.
- **Use `AppTypography.displaySm/Md/Lg`, `bodyMd`, `monoSm` factories.** Never construct `TextStyle(fontFamily: 'Bebas Neue', fontSize: 36)` inline.
- **Strings:** every visible string goes through `context.str('key')`. See `lib/core/strings/app_strings_defaults.dart` for the full key namespace.
- **Animations:** respect `MediaQuery.disableAnimations`.
- **Match Hub cards:** wrap fan-zone/live cards in `AppCard` + `SectionHeader`.
- **Analytics:** fire through `MatchHubAnalyticsService`, never `AnalyticsService.logEvent` directly.
- **Zero emoji.** Anywhere. Use line icons from `previews/components-icon-set.html`.
