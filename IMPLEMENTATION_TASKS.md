# Implementation Tasks for Claude Code

Run these as **separate PRs in order**. Don't bundle. Each task references specific design previews and code files.

---

## Task 1 — Zero-emoji migration (app-wide)

**Goal:** Replace every emoji with a line icon from `previews/components-icon-set.html`.

**Files to touch:**
- `lib/features/match_hub/domain/match_hub_tab.dart` — change `icon` field type from `String` to `IconData`
- `lib/features/match_hub/presentation/widgets/match_hub_tab_bar.dart` — render `Icon(tab.icon, size: 28)` instead of `Text(tab.icon)`
- `lib/features/match_hub/presentation/widgets/event_feed_section.dart` — `_iconFor(MatchEventType)` returns `Icon` widget
- `lib/features/match_hub/presentation/widgets/reaction_bar.dart` — replace emoji glyphs with custom outlined `_ReactionGlyph` widgets
- `lib/features/match_hub/presentation/screens/mode_selection_screen.dart` — `📍` → `Icon(Icons.place_outlined, size: 32)`
- `lib/features/match_hub/presentation/screens/no_match_screen.dart` — `🏉` → `Icon(Icons.sports_rugby_outlined, size: 64)`
- `lib/features/match_hub/presentation/screens/stadium_tab_screen.dart` — transport rows
- Any `Text('🏆')`, `Text('⭐')`, `Text('📊')` etc. across screens

**Icon mapping** (Material `outlined` set unless noted):
| Emoji / use | Icon |
|---|---|
| Match Hub tab — Match | `sports_rugby_outlined` |
| Match Hub tab — Stadium | `stadium_outlined` |
| Match Hub tab — TV | `tv_outlined` |
| Match Hub tab — Tactics | `menu_book_outlined` |
| Match Hub tab — Bar | `local_bar_outlined` |
| Match Hub tab — Travel | `directions_bus_outlined` |
| Match Hub tab — Fan Zone (flagship) | **Custom `FanZoneIcon`** — see Task 2 |
| Try | `sports_rugby_outlined` (filled when scored) |
| Conversion / penalty | `sports_score_outlined` |
| Yellow card | filled rect, `AppColors.warningSurface` |
| Red card | filled rect, `AppColors.errorSurface` |
| Substitution | `swap_horiz` |
| Reaction — heart | `favorite_outline` |
| Reaction — flex | custom outlined arm |
| Pulsing location | `place_outlined` |

**Acceptance:** `grep -rE '[\x{1F300}-\x{1F9FF}]|[\x{2600}-\x{27BF}]' lib/` returns zero matches.

---

## Task 2 — Build `FanZoneIcon` custom widget

**File:** `lib/shared/widgets/fan_zone_icon.dart`

**Design reference:** `previews/components-icon-set.html`, flagship cell ("Fan Zone (custom)")

**Spec:**
- `CustomPainter` extending the white-line aesthetic
- Components, all stroke-only (1.6 logical px), `StrokeCap.round`:
  - Round cage (full circle, ~22px diameter, slightly left of center)
  - 3 comma-shaped pinwheel blades inside the cage, rotated 120° apart
  - Solid hub circle in the center (~3px, **filled** — only filled element)
  - Vertical neck post below the cage
  - Trapezoidal base with 1 horizontal handle slot
  - 3 short wind/motion lines on the right side of the cage
- Constructor: `FanZoneIcon({super.key, this.size = 30, this.color, this.semanticLabel})`
- `color` defaults to `IconTheme.of(context).color`

**Used in:** `match_hub_tab_bar.dart` flagship orb (replace `Icons.wind_power`).

---

## Task 3 — Promote shared widgets

Move and update imports:

| From | To |
|---|---|
| `lib/features/match_hub/presentation/widgets/shared/section_header.dart` | `lib/shared/widgets/section_header.dart` |
| `lib/features/standings/presentation/widgets/pool_tab_bar.dart` | `lib/shared/widgets/pool_tab_bar.dart` |
| Private `_SettingsGroup` in `lib/features/profile/presentation/profile_screen.dart` | `lib/shared/widgets/settings_group.dart` |

Run `dart fix --apply` after each move.

---

## Task 4 — Match Hub light theme

**Goal:** Implement `MatchHubTheme.light` mirroring the existing dark extension.

**Reference:** `previews/colors-match-hub-light.html` and `previews/components-light-mode.html`

**Tokens** (already in `colors_and_type.css`):
- `--mh-bg-light: #F0F0F0`
- `--mh-surface-light: #FFFFFF`
- `--mh-surface-elevated-light: #FAFAFA`
- `--mh-border-light: #D0D0D6`
- `--mh-text-primary-light: #1A1A2E`
- `--mh-text-secondary-light: #5A5A6E`
- `--mh-active-light: #E63946`

**File:** `lib/features/match_hub/presentation/theme/match_hub_theme.dart`

Add `static MatchHubTheme light = MatchHubTheme(...)` and wire into `app_theme.dart`'s light `ThemeData.extensions`.

---

## Task 5 — New semantic surface tokens

Add to `lib/core/design/tokens/app_colors.dart`:

```dart
static Color successSurface(BuildContext c) =>
  Theme.of(c).brightness == Brightness.dark
    ? const Color(0xFF1B3A2E) : const Color(0xFFE8F5E9);

static Color warningSurface(BuildContext c) =>
  Theme.of(c).brightness == Brightness.dark
    ? const Color(0xFF3A2E1B) : const Color(0xFFFFF8E1);

static Color errorSurface(BuildContext c) =>
  Theme.of(c).brightness == Brightness.dark
    ? const Color(0xFF3A1B1B) : const Color(0xFFFFEBEE);

static const blue500 = Color(0xFF1565C0);

// Rename `divider` → `surfaceBorder` (deprecate divider with @Deprecated)
```

Update `app_badge.dart` to use these surfaces for tonal variants.

---

## Task 6 — Spring animation curve

Add to `lib/core/design/tokens/app_animation_tokens.dart`:

```dart
static const Cubic spring = Cubic(0.34, 1.56, 0.64, 1.0);
```

Apply to `mode_selection_screen.dart` location-pin pulse and `reaction_bar.dart` tap feedback.

---

## Conventions checklist (for every PR)

- [ ] No hardcoded hex colors — use `AppColors.*`
- [ ] No inline `TextStyle(...)` — use `AppTypography.*`
- [ ] No emoji — use `Icon(...)` widgets
- [ ] All visible strings via `context.str('key')`
- [ ] Animations gated on `!MediaQuery.of(context).disableAnimations`
- [ ] Analytics fire through service, not raw logger
- [ ] `dart format` + `flutter analyze` clean
