---
name: error-reports
description: Classify DocSpace client error reports from the Firebase RTDB export (personal-onlyoffice-com-default-rtdb-export.json) — overview of a release against a baseline (new / grown / gone signatures) or a deep report on one signature. Use when asked to analyse user error reports, look for problems after a release, or dig into one recurring client error.
argument-hint: "[EXPORT.json] [--target <ver>] [--baseline <ver,ver>] | --signature <query>"
---

# Analyse DocSpace error reports

The client posts every caught error (`errorMessage`, `errorStack`, `errorUrl`,
`userAgent`, `version`, `localStorage`, …) to the Firebase RTDB
`personal-onlyoffice-com-default-rtdb`. A JSON export of it is ~100 MB and
15k+ reports — **never Read it, cat it or load it into context**. Everything
goes through the script; read only its Markdown output.

Script (run from the repo root): `.claude/scripts/error-reports/analyze_reports.py`
(Python 3, stdlib only, run with `python3 -I`).

The export holds portal hosts and user ids. Output goes to
`docspace-error-reports/` **next to the export**, never into the repo; do not
paste portal hosts or user ids into commits, bug reports or public text.

## Step 1 — find the export

`$ARGUMENTS` may start with the path. Otherwise look for
`~/Desktop/*rtdb-export*.json` / `~/Downloads/*rtdb-export*.json`; if none or
several, ask. Check its top level only (`head -c 300`), it must be
`{"reports": {"<push id>": {...}}}`.

## Step 2 — pick the target and baseline

Target defaults to `4.0.0`, baseline to `3.7.0,3.7.1`. For another release,
take the target from the user and the baseline from the previous one or two
versions that have a meaningful number of reports — the overview prints the
target's report count and time range, so rerun if the baseline is too thin.
The release date is in git (`git tag -l 'v<ver>*' --format='%(refname:short) %(creatordate:short)'`).

## Step 3 — overview

```bash
python3 -I .claude/scripts/error-reports/analyze_reports.py EXPORT.json --target 4.0.0 --baseline 3.7.0,3.7.1
```

Writes `report.md` (categories / app / browser shares vs baseline; **New**,
**Grown**, **Top**, **Gone** signature tables; user-written descriptions;
daily volume), `signatures.csv` (every signature × version) and
`target.jsonl` (target reports without `localStorage`). Read `report.md`.

## Step 4 — drill into a signature

```bash
python3 -I .claude/scripts/error-reports/analyze_reports.py EXPORT.json --signature "EditRoom"
```

`QUERY` is an exact signature, a report push id, a raw error message, or a
case-insensitive regex/substring. If it matches several, the script lists
them with counts and exits 2 — rerun with the exact one (anchor it: `"^Connection closed"`).
`--samples N` sets how many stacks to include (default 5).

Writes `signature-<slug>.md` (versions with share of each version's reports,
timeline, raw message variants, app / route / top frame / browser /
platform / language / portal, user descriptions, errors the same user hit
within ±5 min, sample stacks) and `signature-<slug>.jsonl`.

## Step 5 — interpret

- **Time** comes from the push id, not `reportTime` (locale-dependent formats).
- **Volume ≠ impact.** Rank by users and portals; check the concentration line —
  one user retrying can produce dozens of reports (e.g. OneDrive "Item is trashed").
- **Small target samples** right after a release: say how many reports and
  hours the conclusion rests on, and suggest rerunning on a later export.
  A category or browser missing from the target is not a fix until it stays
  missing on a bigger sample.
- **Backend messages** (`Object reference not set…`, `Sequence contains…`,
  `API returned an error [...]`) shown by doceditor's `page.js` are server
  errors rendered by the editor's error page — they belong to the server repo
  (`../server`), the client only displays them.
- **Chunk-load** and **DOM removeChild/insertBefore** are mostly stale tabs
  after a deploy and browser translators/extensions; treat growth, not presence,
  as a signal.
- **Minified React error #N** — look the code up at react.dev/errors/N
  (#412 is "Connection closed.", the same RSC stream failure that older builds
  reported in plain text).
- **Locate the code**: the top frame names the bundle (`InfoPanel.<hash>.js`,
  `doceditor/.../create/page.js`); grep the property from the message in that
  area — e.g. `undefined deref: .EditRoom` → the one `security.EditRoom` without
  `?.`. Minified function names are useless; property names and routes are not.
- New signatures that look like a product gap (server refusing an action the
  UI offered) are worth reporting even with one user.

## Step 6 — report

Write the summary by [report-template.md](report-template.md), keeping its
structure and style, in the language of the request that started the skill.
Save it as `summary.md` in the output directory and print it in the reply
between `---` lines, then add one line with the absolute path of the output
directory and an offer to file bugs (`fix-bug`) or fix the client-side ones.

Content rules:

- **No portal hosts, user ids or report ids** — say "1 portal", "one user".
- Every item: the error text in code, where it happens (app / route / UI area),
  reports · users/portals · versions, and why it matters (new, ×N vs baseline,
  long-standing and mass). For client items add the suspected `file:line`.
- One item per root cause: merge signatures that are the same failure
  (e.g. React #412 and `Connection closed.`), and collapse one user's retry
  storm into one line ("all from one user").
- Long-standing mass errors that are still present in the target belong in the
  summary even though they are not new.
- Group backend items separately — the client only displays them.
- State the sample size and time window in the first line; if it is small, say
  the conclusions are preliminary and when to rerun.
- Absent signatures go under "so far" with the caveat about sample size and
  any browser that has no reports yet.
