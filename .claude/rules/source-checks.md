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

Lines inside a multi-line template literal are skipped: leading whitespace
there is string content (embedded SVG and CSS keep their own indentation), so
re-indenting it would change what the code produces. Any script that fixes
indentation in bulk must skip those lines too, and verify that every template
literal is byte-identical afterwards.

`common/tests/test/indentation-allowlist.json` holds the two remaining
offenders, both in the `libs/ui-kit` submodule — fix them in
`docspace-ui-kit-react`. The list must only ever shrink.

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
  committed in the `docspace-ui-kit-react` repo. Full procedure and the other
  checked-in generated files: `.claude/rules/generated-artifacts.md`.
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

## Menu labels live in Vitest snapshots, not in the spec (test:client)

Nine `.snap` files sit under `packages/client/src/store/**/__tests__/__snapshots__/`.
Three of them record **i18n keys**, because their harness mocks `t` as an
identity function (`testHarness.ts`: `const t = (key: string) => key`), so every
`t("Common:NewFolder")` is frozen into the snapshot verbatim:

| Snapshot | Freezes the model built by |
|----------|---------------------------|
| `ContextOptionsStore.models.test.ts.snap` | `contextOptionsStore/folderModel.helpers.ts` (the "+ New" menu) |
| `ContextOptionsStore.filesContextOptions.test.ts.snap` | `contextOptionsStore/filesContextOptions.helpers.ts` |
| `FilesActionsStore.headerMenu.test.ts.snap` | `filesActionsStore/menu.helpers.ts` |

So **swapping the key at a `t()` call site in those three helpers breaks
`pnpm test:client`** — a locale-only change that never touches a test file
still fails the pre-push gate. `common/tests` and `pnpm test` (shared) stay
green, which makes it look safe right up to the push.

Grepping the `.test.ts` file for the key proves nothing: the strings are in the
sibling `__snapshots__/*.snap`, not in the spec. Before renaming a key at a call
site, grep the snapshots too:

```bash
grep -rn --include='*.snap' 'Common:NewFolder' packages/client/src
```

These are characterization snapshots — they exist to make the menu shape
visible, not to pin the wording. When the diff is only the labels you meant to
change and the keys, order and separators are untouched, updating is the right
fix, and the untouched structure is the evidence that only wording moved:

```bash
cd packages/client && pnpm exec vitest run src/store/contextOptionsStore -u
git diff -- 'packages/client/src/**/__snapshots__/*'  # review before committing
```

Never run a bare `vitest -u` across the whole package: it rewrites all nine
snapshots and silently absorbs regressions in the six that have nothing to do
with the change.

## Advisory-only tools (not gated)

`pnpm check-circular` (madge) and `fallow` / `fallow:audit` (dead code,
unused exports; config in `.fallowrc.json`) run manually — useful before
large refactors, but nothing in lefthook/CI enforces them.
