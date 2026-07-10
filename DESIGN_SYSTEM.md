# My Rugby App — Design System

## Overview

**My Rugby App** is a Flutter-based Premiership Rugby companion app for iOS, Android, and Web. It is a multi-team platform: each rugby team gets its own themed experience (colours, logo) served from a Wagtail CMS backend. The app is **dark-first** with a clean, sports-data aesthetic.

### Products / Surfaces

| Surface | Stack | Notes |
|---|---|---|
| **Mobile App** (iOS & Android) | Flutter | Bottom nav, fullscreen Match Hub, team-themed |
| **Web App** | Flutter Web | Top nav bar, constrained 1200px max-width, responsive breakpoints |
| **CMS Backend** | Wagtail/Django | Per-team config, REST API — no UI relevance here |
| **CMS Admin** | React (separate repo) | Internal use only |

### Source Repositories

- **Main app**: `wrumble/my-rugby-app` (Flutter, private)
- **CMS backend**: `wrumble/my-rugby-app-cms` (Wagtail, private)
- **CMS admin**: `wrumble/my-rugby-app-admin` (React, private)

Design system code lives primarily in:
- `lib/core/design/` — tokens (`app_colors.dart`, `app_typography.dart`, `app_dimensions.dart`, `app_animation_tokens.dart`), theme extension (`app_theme_extension.dart`)
- `lib/app/theme/app_theme.dart` — full Material 3 theme builder
- `lib/app/theme/app_colors.dart` — static brand + semantic colour constants
- `lib/shared/widgets/` — shared components (`AppCard`, `AppBadge`, `AppSection`, etc.)

---

## Content Fundamentals

### Tone & Voice

- **Direct and confident** — sports fans want facts fast. No fluff.
- **Lowercase labels, uppercase display** — nav labels are sentence-case ("News", "Tables"); score displays and badge labels are ALL-CAPS ("LIVE", "HT", "FT").
- **Compact copy** — article category labels use slug-style: `match_report`, `interview`, converted to "Match Report", "Interview" for display.
- **Zero-emoji policy.** No emoji anywhere in the UI — every glyph is a 24px line icon (1.6pt stroke, rounded caps), sourced from Material Symbols Outlined where one fits, custom otherwise. See `preview/components-icon-set.html` for the canonical set + migration list. Legacy emoji on `MatchHubTab.icon`, `EventFeedSection`, `ReactionBar`, `ModeSelectionScreen`, `NoMatchScreen`, and `StadiumTabScreen` transport rows must all be replaced.
- **"Your team" framing** — personalisation is central; the app is themed per team. Copy references "your team" implicitly.
- **Accessibility-conscious** — semantic labels are added to score banners: `"Bath 24 – 17 Saracens, Full Time"`.

### Specific Examples

- Nav tabs: "News", "Tables", "Videos", "Profile"
- Score: `"24 – 17"` (en-dash, monospaced)
- Phase chips: "LIVE", "HT", "FT", "PRE"
- Squad dropdown: "All Squads", "1st XV", "Academy"
- Match Hub mode selection: "Ground" vs "TV" — two modes for stadium-goers vs home viewers
- Error states: concise sentence, no exclamation marks
- Offline banner: brief, factual — "You're offline"

---

## Visual Foundations

### Colour System

**Brand (team fallback)**
- Rugby Blue: `#1B3A6B` — primary/app bar (light mode); tinted surfaces (dark mode)
- Rugby Gold: `#C8A44A` — accent, category badges, call-to-actions

**Dark palette** (primary experience)
- Scaffold background: `#080808`
- Card surface: `#111111`
- Elevated surface (inputs, chips): `#1A1A1A`
- Border / divider: `#2A2A2A`
- Text primary: `#F0F0F0` (w600, +0.3 letter-spacing in dark mode)
- Text secondary: `#888888`
- Text tertiary / disabled: `#444444`

**Match Hub** (deeper navy palette — Match Hub feature only; now theme-aware)

*Dark (primary):*
- bg: `#0D0D1A` — scaffold
- surface: `#1A1A2E` — score banner / sections
- surfaceElevated: `#2A2A44` — modals, raised cards, input fills
- surfaceBorder: `#3A3A5C` — divider / hairline
- textPrimary: `#E0E0F0`, textSecondary: `#8888AA`, textMuted: `#556677`

*Light (new — was previously dark-only):*
- bg: `#F5F5F5`, surface: `#FFFFFF`, surfaceElevated: `#E8E8EC`
- surfaceBorder: `#D0D0D6`
- textPrimary: `#0D0D1A`, textSecondary: `#555566`, textMuted: `#8A8A99`

**Semantic**
- Live: `#D32F2F` (red, with pulsing dot animation)
- Success: `#2E7D32` (green); successSurface: `#0D2B0E` (tinted backdrop)
- errorSurface: `#2B0A0A`; warningSurface: `#2B1D00` (tinted backdrops); neutralLabel: `#737373`
- Warning: `#F57F17` (amber, black text on top)
- Info / Blue: `#1565C0` (`AppColors.colorBlue500`)
- White: `#FFFFFF` (`AppColors.colorWhite`)
- Accent/highlight: `#E63946` (brighter red for Match Hub chips)
- Amber: `#FFB74D` (half-time chip)

**Light palette** (secondary, available but less prominent)
- Background: `#F5F5F5`
- Cards: white
- Text: follows Material 3 defaults

### Typography

Three-font system on a 4pt grid:

| Role | Font | Example sizes |
|---|---|---|
| **Display / Hero** | Bebas Neue | 36, 48, 64pt + 1–2pt letter-spacing |
| **Body / UI** | DM Sans | 11–28pt; w400–w700 |
| **Mono / Stats** | DM Mono | 12, 16, 24pt; w400–w500 |

Dark mode global: w600 weight, +0.3 letter-spacing, `#F0F0F0` colour applied to all text roles.

Article body follows Apple HIG: 17pt (Body), 22pt (H2), 28pt (H1).

### Spacing

8pt grid:

| Token | Value | Usage |
|---|---|---|
| xxs | 4pt | Icon-label gaps, badge padding |
| xs | 8pt | Chip padding, related element gaps |
| sm | 12pt | Card internal vertical padding |
| md | 16pt | Screen edge padding, section gaps |
| lg | 20pt | Detail screens, article content |
| xl | 24pt | Form screens, major section separation |
| xxl | 32pt | Splash screen horizontal padding |
| xxxl | 40pt | Hero sections, major heading gaps |

### Border Radius

| Token | Value | Usage |
|---|---|---|
| xs | 4pt | Status badges (LIVE chip), small pills |
| sm | 10pt | Images, content blocks |
| md | 16pt | Cards |
| lg | 24pt | Bottom sheets, dialogs |
| pill | 32pt | Buttons, inputs |

### Cards

- Three variants: **filled** (elevation 1), **outlined** (no elevation, 1pt border in `#2A2A2A`), **flat** (no elevation, `surfaceContainerLowest`)
- Radius: 16pt on all corners
- Tappable cards: press-down scale animation to 0.97 (100ms ease-out down, 180ms ease-out up) + haptic `lightImpact`
- Card colour dark: `#111111`

### Buttons

- **Filled**: pill shape (radius 32), horizontal padding 24pt, vertical 12pt
- **Outlined**: same shape, no fill, border from scheme
- Press state: scale 0.97 (via `_PressScaleWrapper`)
- No custom shadow on buttons

### Backgrounds

- Mobile: flat dark `#080808` scaffold — no images, textures, or gradients in the scaffold
- Match Hub: navy `#0D0D1A` scaffold, giving a distinct "night game" feel
- No full-bleed background images; team logos appear in app bar only
- No gradients in the general UI; phase chips use flat solid fills

### Animation

| Token | Duration | Curve | Usage |
|---|---|---|---|
| fast | 150ms | easeInOut | Micro-interactions |
| medium | 300ms | easeInOut | Standard transitions |
| slow | 500ms | easeInOut | Slower reveals |
| entrance | 600ms | easeInOut | Page entrances |
| press down | 100ms | easeOut | Card/button press |
| press up | 180ms | easeOut | Card/button release |
| tab fade | 240ms | easeOut | Tab body cross-fade |
| squad menu | 180ms | easeOutCubic | Dropdown slide+fade |
| spring | — | elasticOut | `AppCurves.spring` — overshoot bounce; use sparingly for celebratory reveals |

- LIVE badge pulsing dot: 900ms repeat, easeInOut, opacity 1.0→0.25
- Stadium Doors transition: custom reveal animation on Match Hub entry
- `MediaQuery.disableAnimations` respected everywhere

### Hover / Press States

- Cards: scale 0.97 on press (no hover state; Flutter mobile-first)
- Buttons: standard Material 3 ink ripple on tap
- Bottom nav: primary-colour indicator pill (opacity 30/255) behind icon

### Shadows / Elevation

- elevation 0: flat (app bars, nav, table headers)
- elevation 1: default cards
- elevation 4: interactive cards, dropdowns
- elevation 8: FABs, modals
- No custom box shadows; uses Material elevation

---

## Shared Components

Components live in `lib/shared/widgets/` (barrel: `widgets.dart`). Always reach for these before hand-rolling layout:

### Layout / structure

| Component | Purpose | Notes |
|---|---|---|
| `AppCard` | Standard tappable card | Variants: `AppCard()` filled (elev 1), `AppCard.outlined()`, `AppCard.flat()`. Press-scale to 0.97 + `lightImpact` haptic when `onTap` is set. Padding presets: `paddingSm`/`Md`/`Lg`. Always `Clip.antiAlias`. |
| `AppSection` | Section wrapper used on every screen | Renders an UPPERCASE Bebas Neue display-sm heading + optional trailing widget + slotted child. Default horizontal padding 16pt; `paddingTop: 16, paddingBottom: 8` injected automatically. **Use this for any new top-level section** so spacing/typography stay consistent. |
| `AppBadge` | Status pills | `AppBadge.live()` (red + pulsing dot), `AppBadge.status(label, color, onColor)`. `AppCategoryBadge(label)` reads accent from theme and snake_case-formats the label (`match_report` → "Match Report"). |

### Feedback / state

| Component | Purpose | Notes |
|---|---|---|
| `LoadingIndicator` | Platform-aware spinner | Uses `CupertinoActivityIndicator` on iOS, `CircularProgressIndicator` elsewhere via `useCupertino`. Wrapped in `Semantics(liveRegion: true)` with i18n a11y label `shared.loading_a11y`. |
| `ErrorView` | Standard error state | 48pt `error_outline` icon (in `colorScheme.error`), centered message, optional retry `FilledButton`. Uses i18n keys `shared.error_icon_a11y`, `shared.retry_hint_a11y`, `shared.retry_button`. |
| `OfflineBanner` | Slim top-of-screen offline strip | Subscribes to `connectivity_plus`; renders only when offline. Background uses `colorScheme.error` (theme-driven, **not** a fixed red). Copy: `"No internet connection"` with `wifi_off` 14pt icon. Place at the top of a `Column` above main content. |

### Content patterns

| Component | Purpose | Notes |
|---|---|---|
| `HeroCarousel<T>` | Auto-advancing hero slider | Aspect ratio 0.56 of screen height. Auto-advances every 5s using a `_virtualCount = 100000` page controller for infinite loop. Auto-scroll pauses when the user swipes. Dot indicators bottom-left: active = 20×3 white pill, inactive = 8×3 white @ 45% alpha, 250ms morph. Respects `MediaQuery.disableAnimations`. |
| `DualProgressBar` | Side-by-side animated bar | Two values 0–1; auto-normalised so `left + right ≤ 1`. Animates with `AppDurations.slow` + `AppCurves.standard`. End caps rounded 3pt; default height 6pt. Pass `semanticLabel` for screen readers; otherwise marked `ExcludeSemantics`. |
| `SquadDropdown` | Filter by InternalTeam (1st XV / Academy / etc.) | Wired to `SelectedInternalTeamCubit` and emits `squadFilterChanged` analytics on every change. `allSquadsLabelKey` is mandatory and i18n'd; `showAllSquadsOption: false` for screens that require a concrete selection. |
| `ImpressionTracker` | Fires `onImpression` once when child ≥ 50% visible for 300ms | Built on `visibility_detector`. Use for analytics on list items — **do not** use for triggering UI state. Keys are `Key('impression_$id')`. |

### Skeletons

Loading-state shimmer placeholders matching real layouts. All built on `ShimmerBox`:

- `MatchSkeleton` — match list row
- `NewsSkeleton` — news grid card
- `PlayerSkeleton` — player profile/list row
- `StandingsSkeleton` — table row
- `VideoSkeleton` — video grid card
- `ShimmerBox` — primitive: solid neutral box that pulses; build your own composite from this.

Render skeletons during `loading` states instead of a full-screen spinner — the `LoadingIndicator` is reserved for sub-second async actions inside containers.

### Imagery

- Team logos: remote URLs via `CachedNetworkImage`, rendered at 52px height in app bar, `BoxFit.contain`
- Player avatars: 40pt radius circle
- Team avatars: 20pt radius circle
- Article hero images: 220pt height fixed
- No grain, no duotone — clean, unfiltered imagery
- Image corners: sm=10pt radius on article cards

### Iconography

Uses **Material Icons** exclusively for UI chrome (no custom icon font, no icon sprite sheet, no SVG icon library). The two emoji exceptions above (match events, reactions) are **content**, not icons — never use emoji as a substitute for a Material Icon.

Key icons in use:
- `article_outlined` / `article` — News tab
- `leaderboard_outlined` / `leaderboard` — Tables tab
- `play_circle_outline` / `play_circle` — Videos tab
- `account_circle_outlined` / `account_circle` — Profile tab
- `expand_more_rounded` — squad dropdown chevron
- `check_rounded` — squad menu selected item
- `circle` — LIVE pulsing dot

No emoji used. No Unicode character icons.

---

---

## Accessibility

### WCAG AA Compliance (all verified)

| Token | Old value | Old contrast | New value | New contrast |
|---|---|---|---|---|
| `textTertiary` on bg-dark | #444444 | 2.1:1 ❌ | **#7E7E7E** | 4.9:1 ✅ |
| `textTertiary` on surface-dark | #444444 | 1.9:1 ❌ | **#7E7E7E** | 4.7:1 ✅ |
| `navy textMuted` on navy700 | #556677 | 2.9:1 ❌ | **#7A8FA3** | 5.1:1 ✅ |
| `red tab active` on navy700 | #E63946 | 4.1:1 ❌ | **#FF6B78** | 6.2:1 ✅ |

All other tokens already passed AA. `textPrimary` and `navyTextPrimary` are AAA (13–18:1).

### Colorblind Safety (WCAG 1.4.1)

Never use colour alone to convey meaning. Every semantic colour is always paired with:
- **LIVE** → red + pulsing dot animation + "LIVE" text label
- **Success** → green + ✓ checkmark icon + label
- **Warning** → amber + ⚠ triangle icon + label
- **Error** → always includes descriptive text, never just a red border

The primary action colour (Rugby Blue #1B3A6B) is a blue, safe for all common forms of colour blindness.

### Typography for Readability

- Dark mode: globally `font-weight: 600`, `letter-spacing: +0.3px` — increases legibility at small sizes
- Line heights: body 1.6×, headings 1.35×, captions 1.5× — meets WCAG 1.4.12
- Minimum font size: 11px floor (timestamps) — no smaller text anywhere
- All-caps labels: always `font-weight: 700` + `letter-spacing: 0.5px` to compensate for condensed letterforms

### High-Contrast Mode

Available as a user toggle in the app (`AccessibilityCubit`). Overrides:
- Background: `#000000`, surface `#0D0D0D`
- Text primary: `#FFFFFF` (21:1), secondary: `#E0E0E0` (16:1), muted: `#BBBBBB` (9:1)
- Accent: `#FFD700` (gold bumped brighter → 12.6:1 on black)
- All semantic colours brightened to maintain distinction

### OS/System Preferences

- `prefers-reduced-motion`: all animations disabled (LIVE pulsing dot, card press-scale, tab fades)
- `prefers-contrast: more`: secondary/muted text bumped automatically via CSS media query
- Haptic feedback: user-toggleable (`AccessibilityCubit.hapticFeedback`)
- Bold text: user-toggleable (bumps all font weights by one step)
- Minimum tap target: 44px everywhere (Apple HIG / WCAG 2.5.5)

---

## Feature widgets — audit and promotion candidates

Each feature directory in `lib/features/<name>/presentation/widgets/` carries its own widgets. Most are feature-specific and should stay local. A few are reusable enough that **Claude Code should consider promoting them to `lib/shared/widgets/`** before building anything new on top.

### Audit by feature

| Feature | Where it lives | Notable widgets | Reusable? |
|---|---|---|---|
| **auth** | `auth/presentation/` | `LoginScreen`, `SignupScreen`, `_ForgotPasswordDialog` (private) | No — keep local. The dialog should stay private. |
| **onboarding** | `onboarding/presentation/team_selection_screen.dart` | thin wrapper around teams BLoC | No — single use. |
| **profile** | `profile/presentation/profile_screen.dart` | `_LanguageSection` (private), inline `SwitchListTile` blocks | No — but the **labelled-section + AppCard(padding:zero) + Divider stack** is repeated and worth lifting. See *Settings group* below. |
| **teams** | `teams/presentation/` | team picker, search, `TeamCard` | Possibly — `TeamCard` could become shared if used outside onboarding. |
| **player_profiles** | `player_profiles/presentation/` | `PlayerListScreen` (forwards/backs tab), `PlayerDetailScreen` | No — but the position-grouped tab pattern is unique. |
| **standings** | `standings/presentation/` | `_PoolTabBar`, `_LeagueSelector`, `_StandingsTable` (all private) | **Yes — promote `PoolTabBar`** as a generic underline-tab strip. The current copy is in `standings_screen.dart` only. |
| **team_news** | `team_news/presentation/` | `news_feed_screen.dart`, `article_detail_screen.dart` (29kB each — both have inline private widgets) | **Audit needed** — inline `_ArticleHero`, `_CategoryChip`, etc. Several look like AppCard variants. |
| **videos** | `videos/presentation/` | `video_feed_screen.dart`, `video_player_screen.dart` | **Audit needed** — likely has a `VideoCard` worth promoting. |
| **home** | `home/presentation/home_screen.dart` (37kB) | huge — contains hero, carousels, news rows | Already uses `HeroCarousel`, `AppSection`. Inline widgets are home-specific. |
| **match_hub/widgets/fan_zone** | 8 cards: POTM, score prediction, reactions, try scorer, card decision, crowd momentum, other scores | `_SmallChip`, `SectionHeader` (shared/) | Keep feature-local — they all read Match Hub blocs directly. |
| **match_hub/widgets/live** | 18 widgets: countdown, momentum, event feed, H2H, lineup preview, key matchups, ratings, POTM grid, results banner, etc. | `MomentumBar` already wraps shared `DualProgressBar` ✅ | Keep feature-local. |
| **match_hub/widgets/shared** | `SectionHeader`, `ClubThemeWrapper` | `SectionHeader` is **already used widely** | **Promote `SectionHeader` to `lib/shared/widgets/`** — currently imported via deep relative path from anything inside Match Hub. |

### Promotion candidates (recommended order)

1. **`SectionHeader`** — currently in `match_hub/presentation/widgets/shared/`. Used by every Match Hub card. Move to `lib/shared/widgets/section_header.dart` and re-export from the barrel; update Match Hub imports. *(Note: `AppSection` is the section-with-a-screen-level-heading wrapper; `SectionHeader` is the bare uppercase Bebas Neue heading you put inside an `AppCard`. They're complementary, not duplicates.)*
2. **`PoolTabBar`** (currently `_PoolTabBar` in `standings_screen.dart`) — generic underline-tab strip. Promote and reuse for any future pool/group/category navigation.
3. **`SettingsGroup`** — extract the *labelled-section + AppCard(padding:zero) + Divider* pattern from `ProfileScreen`. Used 3× in profile already; will be used again on any future settings-style screen.
4. **`VideoCard`** — audit `video_feed_screen.dart` first; if the card markup is non-trivial, promote.

### Out of scope for promotion

- Anything that reads a feature-specific BLoC inline (POTM, predictions, fan engagement).
- Match Hub-styled wrappers — they assume the navy palette context.
- Auth screens and dialogs — single-use, validation logic is intentionally co-located.

---

## Internationalisation

All user-facing copy goes through the `StringsCubit` (CMS-overridable) with compile-time fallbacks in `lib/core/strings/app_strings_defaults.dart`. **Never hard-code a string in a widget** — even single words like "Vote" — use `context.str('key')` or `context.strRead('key')`.

### How it works

- CMS-first: strings come from the API at runtime
- Local cache survives app restarts
- `app_strings_defaults.dart` is the cold-start fallback — every key referenced in code MUST exist here
- Locale switching: `LocaleCubit` + `StringsCubit.switchLocale(code)`. Active locales come from the API.
- Templated strings use `{name}` placeholders, replaced with `String.replaceAll('{name}', value)` at the call site (see `match_hub.reaction_dominant`, `teams.no_results`).

### Key namespaces (current count: ~190 keys)

| Namespace | Purpose |
|---|---|
| `auth.*` | Login, signup, forgot-password, validation messages |
| `profile.*` | Settings screen — appearance, accessibility, language |
| `teams.*` | Team picker / search |
| `match_hub.*` | All Match Hub copy — tabs, modes, fan zone, live tab, predictions, POTM, ratings, watch tab, stadium, spoiler shield |
| `news.*` | News feed search + empty state |
| `videos.*` | Video feed + player |
| `players.*` | Player list, positions (`players.position.fly_half` etc.), tab labels |
| `standings.*` | Table column headers, empty states |
| `home.*`, `league_hub.*`, `layout.*` | Home tabs, league hub tabs, dashboard section titles |
| `category.*` | Article category display labels (`match_report` → "Match Report") |
| `splash.*` | Splash screen |
| `shared.*` | Cross-cutting: retry button, loading a11y, time-ago formatters, "not found" strings |

### A11y string convention

A11y/screen-reader-only strings end in `_a11y` (e.g. `auth.signing_in_a11y`, `shared.loading_a11y`, `news.read_hint_a11y`). They are wrapped in `Semantics(label: ...)` and never visible.

### Adding a new string

1. Add the key to `app_strings_defaults.dart` (compile-time fallback).
2. Use `context.str('your.new_key')` in the widget.
3. CMS team adds the same key to the Wagtail backend at their end (a missing CMS key falls back to the default — safe to ship without it).

---

## Do / Don't

Quick anti-pattern reference for Claude Code. When in doubt, **prefer the existing pattern over inventing a new one**.

### Layout & structure

| ✅ Do | ❌ Don't |
|---|---|
| Wrap every top-level screen block in `AppSection` | Hand-roll a `Column` + `Padding` + `Text(style: displaySm)` heading |
| Put settings rows in `AppCard(padding: EdgeInsets.zero)` with `Divider(indent:16, endIndent:16)` between | Use `Card` directly, or skip the divider, or pad the children differently |
| Use `SizedBox(height: AppDimensions.spaceMd)` | Use raw `SizedBox(height: 16)` numerics |
| Use `AppCard` for tappable cards (gets press-scale + haptic for free) | Wrap a `Card` in a `GestureDetector` and reimplement the press animation |
| Use `LoadingIndicator` (platform-aware) | Use `CircularProgressIndicator` directly |
| Use a skeleton (`MatchSkeleton`, `NewsSkeleton`, etc.) for list/grid loading | Show a full-screen spinner during list loads |

### Colour

| ✅ Do | ❌ Don't |
|---|---|
| Read colours via `AppColors.background(context)` / `surface(context)` etc. (theme-aware) | Hard-code `Color(0xFF080808)` in widgets |
| Use `colorScheme.error` for error/offline UI | Hard-code red `#D32F2F` for errors |
| Pair semantic colour with an icon AND text label | Use red border alone to mean "error" |
| Use Match Hub navy tokens **only inside Match Hub** | Use `AppColors.navy*` outside Match Hub feature |
| Brighten reds/ambers for High Contrast via `AccessibilityCubit` | Hard-code one red across all themes |

### Typography

| ✅ Do | ❌ Don't |
|---|---|
| Use `AppTypography.displaySm/Md/Lg`, `bodyMd`, `monoSm` factories | Construct `TextStyle(fontFamily: 'Bebas Neue', fontSize: 36)` inline |
| Reserve Bebas Neue for in-content section titles + numeric scoreboards | Use Bebas Neue for `titleSmall` settings labels — those are `DM Sans` w600 |
| Use `monoSm` for any number that needs to align in a column | Use `bodyMd` for stats/scores — they wobble |
| Keep article body 17pt (Apple HIG) | Drop to 14pt to fit more text |

### Animation

| ✅ Do | ❌ Don't |
|---|---|
| Respect `MediaQuery.disableAnimations` in any custom timing | Always run the same duration regardless of OS preference |
| Use `AppCurves.spring` (`elasticOut`) sparingly — celebratory reveals only | Use spring for routine micro-interactions |
| Use `AppDurations.tabFade` for tab cross-fade (240ms easeOut) | Hand-roll new tab transition timings |

### Strings

| ✅ Do | ❌ Don't |
|---|---|
| Use `context.str('key')` for every visible string | Hard-code English text, even temporarily |
| Add the key to `app_strings_defaults.dart` first | Reference a key that doesn't exist in defaults |
| End screen-reader-only strings in `_a11y` | Mix visible + a11y strings under the same key |

### Match Hub

| ✅ Do | ❌ Don't |
|---|---|
| Wrap fan-zone/live cards in `AppCard` + `SectionHeader` | Build bespoke card chrome for one-off Match Hub widgets |
| Fire analytics through `MatchHubAnalyticsService` | Call `AnalyticsService.logEvent` directly with hand-typed event names |
| Use `🏉✅🎯🟨🟥` only as match-event icons | Add new emoji elsewhere in the app |
| Use `MatchHubTabBar` (custom flagship-centre bar) inside Match Hub | Reuse the app's bottom `NavigationBar` — Match Hub has its own |
| Drive tab list via `tabsForMode(mode, phase:)` + `fanZoneIndexFor(mode)` | Hard-code a tab array per screen — phase swap (Pre→Post Match) breaks |
| Enter the hub through `ModeSelectionScreen` (GPS → confirm → manual) on first open | Force a mode silently or skip the prompt |

### Match Hub navigation

The Match Hub does **not** use the app's bottom `NavigationBar`. It has its own custom tab bar with a flagship Fan Zone centre tab that overflows above the bar.

**`MatchHubTabBar`** (`features/match_hub/presentation/widgets/match_hub_tab_bar.dart`)

- Material elevation 3 over `AppColors.surface(context)`, height **64pt**, respects bottom `SafeArea`
- Side tabs flex-distributed in two rows around a fixed `SizedBox(width: 88)` centre slot
- Flagship Fan Zone tab positioned `top: -28` over the bar — 64×64 radial-gradient orb (`#1A1A2E → AppColors.red500`) with `BoxShadow(0,5,10, 25%)`, total height 96pt
- Selected side tab: red label (`#FF6B78`) + 24×2 underline pill animated `AppDurations.medium` (300ms) easeInOutCubic
- Selected flagship: 3pt red ring around the orb + red label
- Tab list comes from `tabsForMode(mode, phase:)`:
  - **Ground** (5 tabs): Live · Stadium · ★Fan Zone · Pre-Match/Post-Match · Programme — Pre/Post swap on `MatchPhase.fullTime`. `fanZoneIndex = 2`.
  - **TV** (3 tabs): Live · ★Fan Zone · Watch — phase ignored. `fanZoneIndex = 1`.
- Each tab has a `🏉🏟️🎯📺📖🍺🚌` icon and an i18n label key (`match_hub.tab_*`). The flagship icon is `Icons.wind_power` rendered white inside the orb.

**`ModeSelectionScreen`** (`features/match_hub/presentation/screens/mode_selection_screen.dart`) — three-step entry flow on first open of a match:

1. **GPS check** — `LocationService.detectMode()` runs while a 📍 emoji pulses (1.0→1.2 scale, 900ms reverse). Result branches: near stadium → step 2, far/denied → step 3.
2. **Confirm** — "Are you at the match?" with two pill buttons: primary red ("Yes, I'm at the match") writes `MatchMode.ground`; outlined ("No, watching at home") writes `MatchMode.tv`.
3. **Manual select** — two `_ModeCard`s side by side comparing the tabs each mode shows (Live, Stadium, Fan Zone, Pre-Match, Programme vs. Live, Fan Zone, Watch, Programme), checkmark bullets in `AppColors.green500`.

Selection persists per-`matchId` via `ModeBloc`. Users can swap any time from the app-bar action — `_MatchHubScaffold` dispatches `ModeModeSelected`, `MatchHubTabBar` rebuilds with the new tab list, and the scaffold clamps `_tabIndex` if the new list is shorter.

**i18n keys**: `match_hub.tab_live`, `tab_fan_zone`, `tab_stadium`, `tab_watch`, `tab_programme`, `tab_pre_match`, `tab_post_match`, `mode_ground`, `mode_tv`, `gps_checking`, `gps_confirm_title`, `gps_confirm_yes`, `gps_confirm_no`.

---

## Out of scope for this design system

- **`my-rugby-app-admin` (React/Vite, separate repo)** — internal CMS admin UI. Different stack, different audience (3 admins vs 100k fans), different visual conventions. **Do not** apply this design system to it; it has its own (whatever the Vite starter ships with). If we ever decide to harmonise, that's a separate project.
- **`my-rugby-app-cms` (Wagtail/Django)** — backend only; no UI surface relevant to designers.
- **Email templates beyond `brand-email-template.html`** — that one is the canonical reference; transactional emails inherit from it. Marketing emails are not in scope.

---

## Files in This Design System

| File | Description |
|---|---|
| `README.md` | This file — overview, foundations, manifest |
| `colors_and_type.css` | CSS custom properties for all colour + type tokens |
| `fonts/BebasNeue-Regular.ttf` | Display font (Bebas Neue) |
| `fonts/DMSans-Regular.ttf` | Body font (DM Sans) |
| `fonts/DMMono-Regular.ttf` | Mono font (DM Mono) |
| `SKILL.md` | Agent skill definition |
| `preview/` | Design system card previews (registered in Design System tab) |
| `ui_kits/mobile_app/` | Mobile app UI kit (iOS/Android) |

---

## UI Kits

| Kit | Path | Description |
|---|---|---|
| Mobile App | `ui_kits/mobile_app/index.html` | Core screens: Home, News, Match Hub, Profile |

---

## Recent additions (synced from `wrumble/my-rugby-app@main`)

- **Match Hub light palette** — was previously dark-only; now theme-aware via `AppColors.background(context)` etc. New tokens: bg `#F5F5F5`, surface `#FFFFFF`, surfaceElevated `#E8E8EC`, surfaceBorder `#D0D0D6`, textPrimary `#0D0D1A`, textSecondary `#555566`, textMuted `#8A8A99`.
- **New core colours**: `successSurface` `#0D2B0E`, `colorBlue500` `#1565C0`, `colorWhite`.
- **`AppCurves.spring`** — `Curves.elasticOut` for celebratory overshoot reveals.
- **New shared widgets**: `HeroCarousel`, `DualProgressBar`, `ImpressionTracker`, `LoadingIndicator` (platform-aware), `ErrorView`, full skeleton set. See *Shared Components* above.
- **`AppSection`** — formalised standard for section headings (uppercase Bebas Neue display-sm, optional trailing widget). Use it for any new top-level block.
- **OfflineBanner** copy is `"No internet connection"` (not "You're offline"); background uses `colorScheme.error`.
- **Match Hub tab bar + mode entry documented** — `MatchHubTabBar` (custom flagship-centre bar, 64pt + 88pt orb overflow, Ground 5-tab / TV 3-tab) and `ModeSelectionScreen` (GPS → confirm → manual flow). Preview card: `components-match-hub-tab-bar`.
- **Emoji policy clarified** — emoji are used in match-event icons (🏉✅🎯🟨🟥⬇️📌) and reactions (🔥💪😱😢😡) only. Previous "no emoji" wording was incorrect.
- **i18n section** — full namespace map + a11y key convention documented; `app_strings_defaults.dart` is the source of truth.
- **Feature widget audit** — `SectionHeader`, `PoolTabBar`, and a `SettingsGroup` extraction flagged as promotion candidates to `lib/shared/widgets/`.
- **Do / Don't** anti-pattern table added.
- **CMS admin scope note** — `my-rugby-app-admin` (React/Vite) is explicitly out of scope.
- **New preview cards**: form patterns, empty states, standings table, fan zone widgets, live tab widgets.
