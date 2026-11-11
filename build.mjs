#!/usr/bin/env node
// Design-token build: DTCG JSON in tokens/ -> dist/ via Style Dictionary.
//
//   node build.mjs           regenerate dist/
//   node build.mjs --check   build to a temp dir and fail (exit 1) unless it is
//                            byte-identical to the committed dist/
//
// Outputs (all deterministic: no timestamps, fixed source order):
//   dist/css/tokens.css               CSS custom properties, themed aliases
//   dist/tailwind/theme.css           Tailwind v4 `@theme inline` mapping
//   dist/json/tokens.json             flat resolved values, for drift gates
//   dist/contrast-report.json         WCAG contrast ratio of every pair in contrast.json
//   dist/manifest.json                version, source hash, per-file hashes
//
// Held (generated, not committed yet; `node build.mjs --include-held` writes
// them with the rest to build/all/):
//   dart/design_tokens.g.dart         Flutter constants
//   swift/DesignTokens.generated.swift   tvOS constants (tv.* subset)
//
// The build fails when a pair in contrast.json is below its minimum and is not
// marked `knownFailure`, or is marked `knownFailure` and now passes.

import StyleDictionary from 'style-dictionary';
import { createHash } from 'node:crypto';
import {
  existsSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(fileURLToPath(import.meta.url));
const CHECK = process.argv.includes('--check');
const INCLUDE_HELD = process.argv.includes('--include-held');
if (CHECK && INCLUDE_HELD) {
  throw new Error('design-tokens build: --check covers dist/ only; do not combine it with --include-held');
}

// Fixed order: it decides the order of every generated file.
const SOURCES = [
  'tokens/color.json',
  'tokens/dimension.json',
  'tokens/font.json',
  'tokens/motion.json',
  'tokens/density.json',
  'tokens/tv.json',
];
// A token path may carry one mode segment. Each axis becomes a data attribute
// in CSS; the first mode of an axis is the default. An axis with a `group`
// only applies under that top-level group (breakpoint.compact is not a mode).
const AXES = [
  { attr: 'data-theme', modes: ['light', 'dark', 'hc'] },
  { attr: 'data-density', modes: ['comfortable', 'compact'], group: 'density' },
];
const MODES = AXES.flatMap((a) => a.modes);

const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

const sourceHash = (() => {
  const h = createHash('sha256');
  for (const s of [...SOURCES, 'contrast.json']) {
    h.update(s);
    h.update('\0');
    h.update(readFileSync(join(ROOT, s)));
    h.update('\0');
  }
  return h.digest('hex');
})();

const HEADER_LINES = [
  'GENERATED FILE - DO NOT EDIT.',
  'Source: my-rugby-app-design-system tokens/*.json (DTCG), built by Style Dictionary.',
  `Token set version: ${pkg.version}`,
  `Source sha256: ${sourceHash}`,
  'To change a token: edit tokens/*.json, run `npm run build`, commit dist/.',
];
const header = (prefix) => HEADER_LINES.map((l) => `${prefix} ${l}`).join('\n');
const cssHeader = `/*\n${header(' *')}\n */`;

// ── Naming ───────────────────────────────────────────────────────────────────

const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const camel = (segs) => segs.map((s, i) => (i === 0 ? s : cap(s))).join('');
const cssVar = (path) => `--ds-${path.map(kebab).join('-')}`;

/** Index of the theme-mode segment in a token path, or -1. */
const modeIndex = (path) =>
  path.findIndex(
    (s, i) => i > 0 && AXES.some((a) => a.modes.includes(s) && (!a.group || a.group === path[0])),
  );
const withoutMode = (path) => {
  const i = modeIndex(path);
  return i < 0 ? path : path.filter((_, k) => k !== i);
};

// ── Value rendering ──────────────────────────────────────────────────────────

const val = (t) => (t.$value !== undefined ? t.$value : t.value);
const typ = (t) => t.$type ?? t.type;

function fail(msg) {
  throw new Error(`design-tokens build: ${msg}`);
}

function hex(t) {
  const v = val(t);
  if (typeof v !== 'string' || !/^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(v)) {
    fail(`${t.path.join('.')}: colour must be #RRGGBB or #RRGGBBAA, got ${JSON.stringify(v)}`);
  }
  return v.toUpperCase();
}

function unit(t, v, allowed) {
  if (!v || typeof v.value !== 'number' || !allowed.includes(v.unit)) {
    fail(`${t.path.join('.')}: expected { value: number, unit: ${allowed.join('|')} }, got ${JSON.stringify(v)}`);
  }
  return v;
}

const num = (n) => String(n);

function cssValue(t) {
  const v = val(t);
  switch (typ(t)) {
    case 'color':
      return hex(t);
    case 'dimension': {
      const d = unit(t, v, ['px', 'rem']);
      return `${num(d.value)}${d.unit}`;
    }
    case 'duration': {
      const d = unit(t, v, ['ms', 's']);
      return `${num(d.value)}${d.unit}`;
    }
    case 'cubicBezier':
      return `cubic-bezier(${v.map(num).join(', ')})`;
    case 'fontFamily':
      return (Array.isArray(v) ? v : [v])
        .map((f) => (/^[a-z-]+$/.test(f) ? f : `'${f}'`))
        .join(', ');
    case 'fontWeight':
    case 'number':
      return num(v);
    case 'shadow': {
      const px = (d) => `${num(unit(t, d, ['px']).value)}${d.value === 0 ? '' : 'px'}`;
      return `${px(v.offsetX)} ${px(v.offsetY)} ${px(v.blur)} ${px(v.spread)} ${v.color.toUpperCase()}`;
    }
    default:
      fail(`${t.path.join('.')}: unsupported $type ${typ(t)}`);
  }
}

function dartDecl(t, name) {
  const v = val(t);
  switch (typ(t)) {
    case 'color': {
      const h = hex(t).slice(1);
      const argb = h.length === 8 ? h.slice(6) + h.slice(0, 6) : `FF${h}`;
      return `static const Color ${name} = Color(0x${argb});`;
    }
    case 'dimension':
      return `static const double ${name} = ${num(unit(t, v, ['px']).value)};`;
    case 'number':
      return `static const double ${name} = ${num(v)};`;
    case 'duration': {
      const d = unit(t, v, ['ms']);
      const one = `static const Duration ${name} = Duration(milliseconds: ${num(d.value)});`;
      // Match `dart format`: it splits the argument list past 80 columns.
      return one.length + 2 <= 80
        ? one
        : `static const Duration ${name} = Duration(\n    milliseconds: ${num(d.value)},\n  );`;
    }
    case 'cubicBezier':
      return `static const Cubic ${name} = Cubic(${v.map(num).join(', ')});`;
    case 'fontFamily':
      return `static const String ${name} = '${Array.isArray(v) ? v[0] : v}';`;
    case 'fontWeight':
      return `static const FontWeight ${name} = FontWeight.w${v};`;
    case 'shadow':
      return null; // web only
    default:
      fail(`${t.path.join('.')}: unsupported $type ${typ(t)} for Dart`);
  }
}

function swiftDecl(t, name) {
  const v = val(t);
  switch (typ(t)) {
    case 'color': {
      const h = hex(t).slice(1);
      const ch = (i) => `${parseInt(h.slice(i, i + 2), 16)}.0 / 255.0`;
      const a = h.length === 8 ? ch(6) : '1.0';
      return `static let ${name} = Color(.sRGB, red: ${ch(0)}, green: ${ch(2)}, blue: ${ch(4)}, opacity: ${a}) // #${h}`;
    }
    case 'dimension':
      return `static let ${name}: CGFloat = ${num(unit(t, v, ['px']).value)}`;
    case 'number':
      return `static let ${name}: CGFloat = ${num(v)}`;
    case 'fontFamily':
      return `static let ${name} = "${Array.isArray(v) ? v[0] : v}"`;
    default:
      fail(`${t.path.join('.')}: unsupported $type ${typ(t)} for Swift`);
  }
}

// ── Formats ──────────────────────────────────────────────────────────────────

function formatCss({ dictionary }) {
  const root = [];
  const aliases = Object.fromEntries(MODES.map((m) => [m, []]));
  const explicit = new Set(dictionary.allTokens.map((t) => cssVar(t.path)));
  for (const t of dictionary.allTokens) {
    const name = cssVar(t.path);
    root.push(`  ${name}: ${cssValue(t)};`);
    const i = modeIndex(t.path);
    if (i >= 0) {
      const alias = cssVar(withoutMode(t.path));
      if (explicit.has(alias)) fail(`themed alias ${alias} collides with a token of the same name`);
      aliases[t.path[i]].push(`  ${alias}: var(${name});`);
    }
  }
  const block = (selector, lines, indent = '') =>
    `${indent}${selector} {\n${lines.map((l) => indent + l).join('\n')}\n${indent}}`;
  return [
    cssHeader,
    '',
    '/* Every token, fully qualified. Themed tokens keep their mode segment here. */',
    block(':root', root),
    '',
    '/* Themed aliases: the same name resolves per theme. Light is the default. */',
    block(':root,\n[data-theme="light"]', aliases.light),
    '',
    block('[data-theme="dark"]', aliases.dark),
    '',
    '@media (prefers-color-scheme: dark) {',
    block(':root:not([data-theme])', aliases.dark, '  '),
    '}',
    '',
    '/* High contrast only overrides the groups that define an hc set. */',
    block('[data-theme="hc"]', aliases.hc),
    '',
    '/* Density. Comfortable is the default; compact is for pointer-driven surfaces. */',
    block(':root,\n[data-density="comfortable"]', aliases.comfortable),
    '',
    block('[data-density="compact"]', aliases.compact),
    '',
  ].join('\n');
}

/**
 * Tailwind v4 mapping.
 * Every utility key is prefixed `ds-` so nothing collides with Tailwind's
 * default palette or scales (our neutral-100 is white, Tailwind's is not).
 */
function tailwindEntries(dictionary) {
  const seen = new Set();
  const out = [];
  for (const t of dictionary.allTokens) {
    const p = withoutMode(t.path);
    const id = p.join('.');
    if (seen.has(id)) continue;
    seen.add(id);
    const key = (segs) => `ds-${segs.map(kebab).join('-')}`;
    const ref = `var(${cssVar(p)})`;
    const [a, b] = p;
    if (a === 'color') out.push({ ns: 'color', key: key(p.slice(1)), value: ref });
    else if (a === 'space') out.push({ ns: 'spacing', key: key(p.slice(1)), value: ref });
    else if (a === 'density' && b === 'fontSize') out.push({ ns: 'text', key: 'ds-density', value: ref });
    else if (a === 'density') out.push({ ns: 'spacing', key: key(p), value: ref });
    else if (a === 'radius') out.push({ ns: 'radius', key: key(p.slice(1)), value: ref });
    else if (a === 'shadow') out.push({ ns: 'shadow', key: key(p.slice(1)), value: ref });
    // Breakpoints must be literal: media queries cannot read custom properties.
    else if (a === 'breakpoint') out.push({ ns: 'breakpoint', key: key(p.slice(1)), value: cssValue(t) });
    else if (a === 'font' && b === 'family') out.push({ ns: 'font', key: key(p.slice(2)), value: ref });
    else if (a === 'font' && b === 'size') out.push({ ns: 'text', key: key(p.slice(2)), value: ref });
    else if (a === 'font' && b === 'weight') out.push({ ns: 'font-weight', key: key(p.slice(2)), value: ref });
    else if (a === 'font' && b === 'lineHeight') out.push({ ns: 'leading', key: key(p.slice(2)), value: ref });
    else if (a === 'font' && b === 'letterSpacing') out.push({ ns: 'tracking', key: key(p.slice(2)), value: ref });
    else if (a === 'motion' && typ(t) === 'cubicBezier')
      out.push({ ns: 'ease', key: key(p.slice(1).filter((s) => s !== 'ease')), value: ref });
    else if (a === 'motion' && typ(t) === 'duration')
      out.push({ ns: 'duration', key: key(p.slice(1).filter((s) => s !== 'duration')), value: ref });
  }
  return out;
}

function formatTailwindTheme({ dictionary }) {
  // Tailwind v4 has no theme namespace for durations; use
  // `duration-(--ds-motion-duration-fast)`.
  const lines = tailwindEntries(dictionary)
    .filter((e) => e.ns !== 'duration')
    .map((e) => `  --${e.ns}-${e.key}: ${e.value};`);
  return [
    cssHeader,
    '',
    '/* Tailwind v4. Import after tokens.css:',
    ' *   @import "tailwindcss";',
    ' *   @import "./tokens.css";',
    ' *   @import "./theme.css";',
    ' */',
    `@theme inline {\n${lines.join('\n')}\n}`,
    '',
  ].join('\n');
}

function formatDart({ dictionary }) {
  const groups = new Map();
  for (const t of dictionary.allTokens) {
    const decl = dartDecl(t, camel(t.path.slice(1)));
    if (decl === null) continue;
    // The app format-checks the vendored file, so the output must already be
    // `dart format` clean. Only the Duration split is implemented; fail loudly
    // on any other over-long declaration instead of emitting unformatted Dart.
    if (decl.split('\n').some((l, i) => l.length + (i === 0 ? 2 : 0) > 80)) {
      fail(`${t.path.join('.')}: Dart declaration exceeds 80 columns; shorten the token name`);
    }
    const cls = `Ds${cap(t.path[0])}`;
    if (!groups.has(cls)) groups.set(cls, []);
    groups.get(cls).push(`  /// \`${t.path.join('.')}\`\n  ${decl}`);
  }
  const classes = [...groups].map(
    ([cls, decls]) => `abstract final class ${cls} {\n${decls.join('\n\n')}\n}`,
  );
  return [
    header('//'),
    '',
    '// ignore_for_file: lines_longer_than_80_chars, public_member_api_docs',
    '',
    "import 'dart:ui' show Color, FontWeight;",
    '',
    "import 'package:flutter/animation.dart' show Cubic;",
    '',
    classes.join('\n\n'),
    '',
  ].join('\n');
}

function formatSwift({ dictionary }) {
  const decls = dictionary.allTokens.map(
    (t) => `    /// \`${t.path.join('.')}\`\n    ${swiftDecl(t, camel(t.path.slice(1)))}`,
  );
  return [
    header('//'),
    '',
    'import SwiftUI',
    '',
    '/// TV subset of the design tokens (`tv.*`).',
    `enum DSTokens {\n${decls.join('\n\n')}\n}`,
    '',
  ].join('\n');
}

function formatJson({ dictionary }) {
  const flat = {};
  for (const t of dictionary.allTokens) {
    flat[t.path.join('.')] = { type: typ(t), value: val(t) };
  }
  return `${JSON.stringify({ version: pkg.version, sourceSha256: sourceHash, tokens: flat }, null, 2)}\n`;
}

// ── Contrast ─────────────────────────────────────────────────────────────────

/** WCAG 2.x relative luminance of an opaque #RRGGBB colour. */
function luminance(hexColour) {
  const lin = (i) => {
    const c = parseInt(hexColour.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(1) + 0.7152 * lin(3) + 0.0722 * lin(5);
}

function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/**
 * Evaluate every pair in contrast.json against the resolved tokens.
 * `knownFailure` is the baseline: such a pair must still fail, so the flag
 * cannot outlive the fix.
 */
function contrastReport(tokens) {
  const config = JSON.parse(readFileSync(join(ROOT, 'contrast.json'), 'utf8'));
  const colour = (name) => {
    const t = tokens[name];
    if (!t || t.type !== 'color') fail(`contrast.json: ${name} is not a colour token`);
    if (!/^#[0-9A-Fa-f]{6}$/.test(t.value)) fail(`contrast.json: ${name} must be opaque, got ${t.value}`);
    return t.value.toUpperCase();
  };
  const pairs = [];
  const problems = [];
  for (const p of config.pairs) {
    const fg = colour(p.fg);
    const bg = colour(p.bg);
    // Truncate, never round up: 4.496 must not be reported as passing 4.5.
    const ratio = Math.floor(contrastRatio(fg, bg) * 100) / 100;
    const pass = ratio >= p.min;
    const knownFailure = p.knownFailure === true;
    pairs.push({ fg: p.fg, bg: p.bg, fgValue: fg, bgValue: bg, use: p.use, min: p.min, ratio, pass, knownFailure });
    if (!pass && !knownFailure) problems.push(`${p.fg} on ${p.bg}: ${ratio} is below ${p.min} (${p.use})`);
    if (pass && knownFailure) problems.push(`${p.fg} on ${p.bg}: ${ratio} now passes ${p.min}; remove knownFailure`);
  }
  return { pairs, problems };
}

// ── Build ────────────────────────────────────────────────────────────────────

const OUTPUTS = [
  { destination: 'css/tokens.css', format: 'ds/css' },
  { destination: 'tailwind/theme.css', format: 'ds/tailwind-theme' },
  { destination: 'dart/design_tokens.g.dart', format: 'ds/dart', held: true },
  {
    destination: 'swift/DesignTokens.generated.swift',
    format: 'ds/swift',
    filter: (t) => t.path[0] === 'tv',
    held: true,
  },
  { destination: 'json/tokens.json', format: 'ds/json' },
];
// `held` outputs are generated but not committed yet: the estate pre-commit
// hook refuses Dart and Swift in this repo until the harness policy declares
// them (see TOKENS.md). `--include-held` writes everything to build/all/ so the
// generators can be inspected; dist/ and --check cover the rest.
const activeOutputs = () => OUTPUTS.filter((o) => INCLUDE_HELD || !o.held);

function listFiles(dir, base = dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .sort()
    .flatMap((name) => {
      const p = join(dir, name);
      return statSync(p).isDirectory() ? listFiles(p, base) : [relative(base, p)];
    });
}

async function build(outDir) {
  const sd = new StyleDictionary({
    source: SOURCES.map((s) => join(ROOT, s)),
    usesDtcg: true,
    log: { warnings: 'error', verbosity: 'verbose' },
    hooks: {
      transforms: {
        'name/ds-path': {
          type: 'name',
          transform: (token) => token.path.join('-'),
        },
      },
      formats: {
        'ds/css': formatCss,
        'ds/tailwind-theme': formatTailwindTheme,
        'ds/dart': formatDart,
        'ds/swift': formatSwift,
        'ds/json': formatJson,
      },
    },
    platforms: {
      all: {
        transforms: ['name/ds-path'],
        buildPath: `${outDir}/`,
        files: activeOutputs().map(({ held, ...file }) => file),
      },
    },
  });
  await sd.hasInitialized;
  await sd.buildAllPlatforms();

  const { tokens } = JSON.parse(readFileSync(join(outDir, 'json/tokens.json'), 'utf8'));
  const contrast = contrastReport(tokens);
  writeFileSync(
    join(outDir, 'contrast-report.json'),
    `${JSON.stringify({ version: pkg.version, sourceSha256: sourceHash, pairs: contrast.pairs }, null, 2)}\n`,
  );
  if (contrast.problems.length) {
    fail(`contrast check failed:\n  ${contrast.problems.join('\n  ')}`);
  }

  const files = {};
  for (const f of [...activeOutputs().map((o) => o.destination), 'contrast-report.json'].sort()) {
    const p = join(outDir, f);
    if (!existsSync(p)) fail(`expected output was not written: ${f}`);
    files[f] = sha256(readFileSync(p));
  }
  writeFileSync(
    join(outDir, 'manifest.json'),
    `${JSON.stringify({ name: pkg.name, version: pkg.version, sourceSha256: sourceHash, files }, null, 2)}\n`,
  );
}

const DIST = join(ROOT, 'dist');

if (CHECK) {
  const tmp = mkdtempSync(join(tmpdir(), 'ds-tokens-check-'));
  let problems = [];
  try {
    await build(tmp);
    const fresh = listFiles(tmp);
    const committed = listFiles(DIST);
    for (const f of fresh) {
      if (!committed.includes(f)) problems.push(`missing from dist/: ${f}`);
      else if (!readFileSync(join(tmp, f)).equals(readFileSync(join(DIST, f)))) {
        problems.push(`stale: dist/${f}`);
      }
    }
    for (const f of committed) {
      if (!fresh.includes(f)) problems.push(`not produced by the build: dist/${f}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
  if (problems.length) {
    console.error('design-tokens check: FAIL');
    for (const p of problems) console.error(`  ${p}`);
    console.error('Run `npm run build` and commit dist/.');
    process.exit(1);
  }
  console.log(`design-tokens check: OK (dist/ matches tokens/, source sha256 ${sourceHash.slice(0, 12)})`);
} else {
  const out = INCLUDE_HELD ? join(ROOT, 'build', 'all') : DIST;
  rmSync(out, { recursive: true, force: true });
  await build(out);
  console.log(
    `design-tokens build: wrote ${listFiles(out).length} files to ${relative(ROOT, out)}/ (source sha256 ${sourceHash.slice(0, 12)})`,
  );
}
