# Putting this design system on GitHub

## Recommended repo layout

You have two reasonable options. **Option A is preferred.**

### Option A: monorepo — design system inside the app

```
my-rugby-app/                  # existing repo
├── lib/                       # Flutter app (already exists)
├── design/                    # NEW — the contents of this project
│   ├── README.md              # design system reference
│   ├── colors_and_type.css    # canonical CSS tokens
│   ├── preview/               # 35 HTML preview cards
│   ├── scripts/               # token sync scripts
│   └── ...
└── ...
```

**Pros:** tokens and code live together, design changes ship in the same PR as the implementation, single CI, no drift.
**Cons:** none meaningful for a one-person team.

### Option B: sibling repo

```
github.com/wrumble/my-rugby-app
github.com/wrumble/my-rugby-app-design
```

**Pros:** cleaner separation if multiple designers eventually contribute.
**Cons:** has to be cloned alongside the app; sync scripts need cross-repo paths.

---

## First commit (Option A — recommended)

From inside your local `my-rugby-app` clone:

```bash
# 1. Download this project as a zip from the chat (use the download card below).
# 2. Unzip it to a temp location, then:
mv ~/Downloads/my-rugby-app-design-system my-rugby-app/design
cd my-rugby-app

# 3. Verify nothing collides with existing Flutter folders
ls design/

# 4. Commit
git checkout -b feat/design-system
git add design/
git commit -m "Add design system reference

- HTML preview cards for every shared widget, color palette, and Match Hub component
- Canonical CSS tokens (colors_and_type.css) mirroring lib/core/design/tokens/
- Implementation roadmap in design/handoff/IMPLEMENTATION_TASKS.md
- See design/README.md for system overview"

git push -u origin feat/design-system
```

Open a PR with the body referencing `design/README.md` and `design/handoff/IMPLEMENTATION_TASKS.md`.

---

## First commit (Option B — sibling repo)

```bash
# 1. Download project zip, unzip
cd ~/Downloads/my-rugby-app-design-system
git init -b main
git add .
git commit -m "Initial commit: My Rugby App design system

Mirrors design tokens from wrumble/my-rugby-app:lib/core/design/tokens/.
35 HTML preview cards documenting every shared widget and Match Hub component.
See README.md for system overview."

# 2. Create the GitHub repo (gh CLI)
gh repo create wrumble/my-rugby-app-design --public --source=. --push

# Or via web: github.com/new, then:
git remote add origin git@github.com:wrumble/my-rugby-app-design.git
git push -u origin main
```

---

## Suggested .gitignore additions

If you don't already have these in the design folder/repo:

```gitignore
.DS_Store
node_modules/
.idea/
.vscode/
*.log
```

---

## Keeping it in sync with the Flutter code

After tokens change in `colors_and_type.css`:

```bash
node scripts/sync_tokens.js   # writes lib/core/design/tokens/*.dart
flutter analyze
git add lib/core/design/tokens/ design/colors_and_type.css
git commit -m "Sync design tokens"
```

Wire this into a pre-commit hook (e.g. via `lefthook` or `husky`) once the team is more than one person.

---

## Don't bother with Figma yet

For a solo developer with a CSS-mirrors-Dart workflow, Figma adds maintenance overhead without a clear consumer. Revisit when:

1. A non-engineer designer joins the project, or
2. You need to do extensive flow exploration that's faster in a vector tool than HTML.

Until then: the repo *is* the design system.
