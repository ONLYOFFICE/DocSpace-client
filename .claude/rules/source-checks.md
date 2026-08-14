---
paths:
  - "packages/**"
  - "libs/ui-kit/**"
  - "common/tests/**"
  - "public/images/**"
---

# Hidden source-code checks (pre-push / CI enforced)

Rules below are enforced by `common/tests` suites (blocking pre-push gate) and
Biome plugins, but are invisible until the push fails. `libs/ui-kit` is in
scope for all of them, but it is a git submodule — violations there must be
fixed in `docspace-ui-kit-react`.

## No hardcoded hex colors — anywhere (colors.test.js)

Zero `#RRGGBB`/`#RGB` in `.js/.jsx/.ts/.tsx/.scss/.css`. It is a raw text
scan: a hex inside a comment, string, or SVG `fill=` fails just the same
(`rgba()`/`hsl()` literals are a loophole — do not exploit it). Instead use a
token from `libs/ui-kit/styles/variables/_colors.scss` or a theme entry under
a `themes/` directory. Exempt: paths containing `themes`, `.test.`,
`.stories.`, plus a short hardcoded file list.

## ASCII-only source (ascii.test.js)

`.js/.jsx/.ts/.tsx` must contain only ASCII plus the allowlist `↓ ↑ ← → ⌘ ⌥ © • —`.
Typographic quotes, ellipsis `…`, **en-dash `–`** (em-dash `—` is allowed),
emoji, NBSP and any non-Latin text in string literals or JSX fail. Lines that
*start* with `//`, `*`, `/*` are skipped — trailing comments after code are
not. `common/**`, `.test.`, `.stories.`, `mockData.` are out of scope.

## Mixed indentation (indentation.test.js)

No `.js/.jsx/.ts/.tsx` file may indent some lines with tabs and others with
spaces. A wholly tab-indented file is a style of its own and passes; only a
file using both fails. **Biome's formatter is disabled**
(`packages/shared/biome.json` sets `formatter.enabled: false`), so nothing else
catches this — a codemod that rewrites a line with a flat run of tabs inside a
space-indented file ships silently. Exempt: `.test.`, `.stories.`, `.d.ts`.
Inherited offenders are frozen in
`common/tests/test/indentation-allowlist.json`, which must only ever shrink.

## Images (images.test.js)

- Every image added under `packages/**`, `public/`, `libs/ui-kit/**` must be
  referenced by its **basename** somewhere in source — unused assets fail.
- No two different images with the same filename; no identical image under
  two names or two copies (a 1:1 mirror between `libs/ui-kit/assets/` and
  `public/images/` is the one allowed duplication, and mirrored files must
  keep the same name, relative path and content).
- Never reference images via the string literals `"/static/images`,
  `"/images`, `"static/images`, `"images/` in source.

## Dependencies (dependencies.test.js)

- Adding a dependency that is not yet imported anywhere in that workspace
  **breaks the push** (regex-based detection: `import`/`require`/`from`
  literals); same when removing the last import of a dep without dropping it
  from `package.json`.
- A package must have the **exact same version string** in every workspace
  `package.json` — never bump a dep in only one package.
- New **production** deps must have an allowlisted license (MIT/Apache/BSD/
  ISC/MPL-2.0/LGPL-3.0+…). GPL/AGPL/SSPL prod deps fail the CI licenses
  audit (`pnpm licenses-audit`); devDependencies are not checked.

## i18n Biome plugins (packages/shared/biome-plugins/*.grit)

- `no-dynamic-i18n-key`: the first argument of `t()` must be a string
  literal. `t(item.titleKey)` fails lint — suppress with
  `// biome-ignore lint/plugin/no-dynamic-i18n-key` only when a sibling
  literal makes the key findable by the locale scanner.
- `no-constants-via-i18n`: brand/const/culture keys (`t("Common:ProductName")`,
  `t("PDF")`, `t("Culture_ru")`, …) fail lint — use `getBrandName()` /
  `getConstName()` / `getCultureLabel()`.
- After editing `public/locales/.constants/*.json` run
  `pnpm biome-plugins:generate` — it regenerates **two** copies of the `.grit`
  plugin (`packages/shared/biome-plugins/` and `libs/ui-kit/biome-plugins/`;
  the ui-kit copy exists because its standalone CI can't reach
  `packages/shared`). Nothing checks their freshness. The ui-kit copy must be
  committed in the `docspace-ui-kit-react` repo.
- The plugins are declared **once** in `packages/shared/biome.json` and
  inherited by the other packages via `extends`. Gotcha: biome resolves a
  plugin's relative path against the *extending* package's directory, so the
  shared config must use `../shared/biome-plugins/…` (valid from `shared`
  itself and from every sibling) — `./biome-plugins/…` breaks every extender
  with "Cannot read file". `libs/ui-kit/biome.json` wires its own local copy.

## License headers — enforcement details (license.test.js)

Checked: `SPDX-License-Identifier: AGPL-3.0-only` within the first 2048 chars
of `.js/.jsx/.ts/.tsx`. Exempt: `*.test.*`, `*.spec.*`, `*.stories.*`,
`*.d.ts`, `*.config.*`, `mockData*`, `public/scripts/**`. The canonical
header text is read from the `licenser.*` settings in
`frontend.code-workspace` — editing them changes what every file must
contain. Fixing a header on an allowlisted file requires removing it from
`common/tests/test/license-*-allowlist.json` **in the same commit** (stale
allowlist entries fail the test).

## Advisory-only tools (not gated)

`pnpm check-circular` (madge) and `fallow` / `fallow:audit` (dead code,
unused exports; config in `.fallowrc.json`) run manually — useful before
large refactors, but nothing in lefthook/CI enforces them.
