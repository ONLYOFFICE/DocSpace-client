---
name: bugs-audit
description: Audit the open DocSpace Bugzilla backlog (all components — client, server, API, AI, SDK) — close fixed/obsolete bugs with a comment, raise priority + whiteboard on quick fixes, sort suggestions into a document, report the result (dry-run first, writes only after an explicit OK)
argument-hint: "[sample=20 | batch=N | ids=1,2] [components=Files,Rooms,…] [lang=ru|en] [agents=2..10]"
---

# Audit the Bugzilla backlog

Review open bugs in every DocSpace component, decide per bug against the code of
the repo that owns it, and turn the decisions into Bugzilla changes through a
gated dry-run → apply cycle.

Script (run from the repo root): `.claude/scripts/bugzilla/audit.mjs`
Config/setup: `.claude/scripts/bugzilla/README.md` (on Windows: `BZ_API_KEY`).

This is the **only** procedure allowed to write to Bugzilla. `/fix-bug` and
everything else stay read-only.

Each `export` creates a run folder `.claude/scripts/bugzilla/runs/<date-time>[-name]/`
(git-ignored, never committed) holding `index.json`, `bugs.json`,
`decisions.json`, `actions.json`, `apply-log.json`, `suggestions.md` and
`report.md`. The other commands default to the latest run; in this skill always
pass `--dir <run>` (the path `export` printed) so a parallel run is never
picked up by mistake. `<dir>` below is that run folder.

**Comment language.** Text posted to Bugzilla (comments, the whiteboard
estimate such as `~2ч` / `~2h`) is in the language the user picks: `lang=ru` or
`lang=en`. If the arguments do not set it, ask in Step 1 **with the
AskUserQuestion tool** — a choice dialog, not a plain-text question — with two
options, "Русский" (first, marked recommended) and "English". Never assume.
The suggestions document and the report stay in Russian whatever the choice.

## Step 1 — field values and scope

```bash
node .claude/scripts/bugzilla/audit.mjs fields
```

Shows the severity/priority/status/resolution values of this instance and the
DocSpace components. The scope is **all components** (omit `--components`)
unless the user narrows it with `components=…`. Agreed defaults: a suggestion
is severity `enhancement`; "fixed" with a commit → `FIXED`, fixed in code
without a commit → `WORKSFORME`, feature/screen removed or "works as designed"
→ `WONTFIX`. These three are the only resolutions `plan` accepts (`DUPLICATE`
and others need extra fields, so a duplicate is left to a human via
`needs-info`). Re-confirm only if `fields` shows these values have changed. The
comment language is the one thing to ask each run when `lang=` is not given.

### Where each component's code lives

Sibling repos are looked up in the folder that holds the `DocSpace` folder
(paths below are relative to the client root); a missing repo only means its
bugs get lower confidence, never a guess.

| Component | Repo (relative to the client root) | Read on |
|---|---|---|
| Files, Rooms, Accounts, Settings, Plugins, Forms, Billing, Campaign, Developer Tools | this repo, `packages/client`, `packages/shared` | working tree |
| DocEditor | `packages/doceditor`; editor/Docs side: `../../server` (ONLYOFFICE/server) | working tree / `origin/master` |
| SDK | `packages/sdk`; JS library: `../../docspace-sdk-js` | working tree / `origin/master` |
| API, Server | `../server` (DocSpace-server) | working tree (`release/*`) |
| AI | server: `../server/products/ASC.AI`, `../server/common/ASC.AI.Integration`, Node service `../server/common/ASC.AI.Chat` (`app/controllers`, `app/routes.ts`); agent UI: `../../onlyoffice-ai-chat` | working tree / `origin/develop` |
| ui-kit UI defects | `../../docspace-ui-kit-react` | `origin/release/*` or `origin/master` |
| Docs Admin Panel | `../../server-admin-panel` | `origin/master` |

**Never switch branches in a sibling repo** — its working tree is the user's
work in progress (often a feature branch). When it is not on its main line, read
the main line without touching the checkout:

```bash
git -C <repo> grep -n "<pattern>" origin/<main> -- <path>
git -C <repo> show origin/<main>:<path/to/file>
```

Remote-tracking refs are as fresh as the last fetch; say so in `evidence` when it
matters, and ask before running `git fetch`.

`export` searches `Bug <ID>` commits in all of these repos at once (labelled
`DocSpace/client`, `DocSpace/server`, `onlyoffice-ai-chat`, …).

## Step 2 — export

```bash
node .claude/scripts/bugzilla/audit.mjs export --sample 20 --name <label>
node .claude/scripts/bugzilla/audit.mjs export --components "API,Server" --sample 20 --name <label>
```

The last line of the output, `run: <folder>`, names the run folder — use that
folder as `<dir>`.

`--sample N` (pilot: a mix of bugs with `Bug <ID>` commits, suggestions and the
longest idle), `--ids 1,2`, or `--batch N` for the next chunk — one of them,
never two. `--sample` and `--batch` leave out every open bug whose **last**
comment is an audit comment (found in Bugzilla by its footer, so runs made on
another machine count too) and every bug of a run marked files-only (Step 5).
A later batch thus never comments twice or re-raises a priority, while a bug
someone answered after the audit comment (a `needs-info` reply, say), or one
that hit a `conflict`, an error or a rejected decision, comes back. The output
says how many were left out. `--skip <file,...>` adds decisions files (a
missing one is an error); `--include-reviewed` turns the filter off — only on
the user's request. `--ids` is never filtered. `index.json` holds every open bug in scope with signals;
`bugs.json` holds the selected ones with description and the last comments.

Signals per bug: `kind` (bug/suggestion), `ageDays`, `idleDays`, `commits`
(commits in any of the repos above whose subject mentions the bug id — every id
of "Bug 71360, 71316", each with `revert: true` when the subject starts with
"Revert" — `Revert "Revert …"` puts the fix back and is not one) and `fixReverted` (the latest of those commits is a revert).

## Step 3 — review every exported bug

For each bug in `bugs.json`, from the current code of the repo that owns its
component (table above), not from memory:

- Read the description and comments. Open attachments with `/bug <id>` only
  when the text is not enough.
- Check `commits`: a `Fix Bug <ID>` commit is strong evidence, but confirm it
  is on the main line (`git -C <repo> branch -a --contains <hash>`, `<repo>`
  being the one the commit's `repo` field names) and that the code it
  touched still behaves as fixed. A commit with `revert: true`, or any bug with
  `fixReverted: true`, is **not** evidence of a fix — the fix was taken back.
  A revert whose subject has no bug id is not flagged, so still read the code.
- Grep the code for the screen/string/endpoint the report names. For an
  `/api/2.0/...` route, find its controller in `../server` (or `ASC.AI.Chat`
  `app/routes.ts` for `/ai/*`) before judging the client.
- Server, API and AI bugs often reproduce only on a stand. If the code does not
  settle it, use `needs-info` or `confidence: medium` rather than closing.

Verdicts:

| verdict | when | evidence required |
|---|---|---|
| `fixed` | the described behaviour is gone | a commit on the main line, or the code path that now handles it |
| `obsolete` | the feature/screen/version no longer exists, or idle > 1 year and the described code is gone | what was removed, or why it cannot occur |
| `quickfix` | still valid, cause located, fix ≲ 1 day | `file:line` of the cause |
| `valid` | still valid, not quick | where it lives |
| `needs-info` | cannot judge from code and report | what is missing |

`confidence: high` only with concrete evidence. Only `high` becomes an action;
everything else lands in "needs a human". When in doubt, lower the confidence —
a wrongly closed bug costs more than one left open.

Write `<dir>/decisions.json` — an array:

```json
{
  "id": 12345, "side": "client", "verdict": "fixed", "confidence": "high",
  "evidence": "commit abc1234 on release/v4.1.0; packages/client/src/…:42",
  "resolution": "FIXED",
  "comment": "Исправлено в коммите abc1234 (…). Закрыто по итогам аудита бэклога.",
  "estimate": "2ч", "area": "Files",
  "complexity": "M", "value": "high", "rationale": "…"
}
```

`comment` (in the chosen language) is **required for every decision**: every reviewed bug gets a comment, whatever
the verdict, so it is visible in Bugzilla that it was reviewed. `plan` appends
the "— Generated with Claude Code (<model>)" line itself; do not write it in
`comment`. `estimate` goes into the whiteboard, so write it in the same
language (`2ч` / `2h`). The comment must match what actually happens to the bug:

| Decision | What `apply` does | What `comment` says (ru / en) |
|---|---|---|
| `fixed`/`obsolete`, `high` | closes + comment | «Закрываю по итогам аудита бэклога…» / "Closing after the backlog audit…" + the evidence |
| `quickfix`, `high` | priority/whiteboard + comment | where the cause is (`file:line`) and what to change |
| `valid` | comment only | that it is still relevant, where it lives, what blocks it |
| `needs-info` | comment only | what is missing and who should re-check it |
| `fixed`/`obsolete`/`quickfix`, not `high` | comment only (no field change) | the finding as a proposal: «Предлагаю закрыть, если…» / "Suggest closing if…" — never «Закрываю» / "Closing" |

`side` — **where the fix belongs, as found in the review**, not the Bugzilla
component: `client` (this repo), `server` (DocSpace-server, incl. API and AI
service), `editors` (Docs / ONLYOFFICE server), `ai-chat`, `ui-kit`, `other`
(build, nginx, installers). A bug filed under Accounts whose message comes from
the API is `server`. Set it on every decision; when omitted, the script falls
back to the component (API/Server/AI → `server`, the rest → `client`). The
report and the suggestions document are split into sections by `side`.

Other fields: `resolution` for `fixed`/`obsolete`; `estimate` + `area` for
`quickfix` (whiteboard becomes `[quickfix] ~<estimate>, <area>`; priority goes
one step up the instance scale, P1 stays P1, an unset `---` becomes the step
above the middle — P2 on P1..P5; a bug whose whiteboard already has
`[quickfix]` keeps its priority, so it is never raised twice);
`complexity` (S/M/L/XL) + `value` (high/medium/low) + `rationale` for
`valid` suggestions. Whether a bug is a suggestion is not part of the decision:
the script takes it from the export (`kind` in `bugs.json`, by severity), so it
cannot be mistyped; a `kind` left in a decision is ignored.

### Parallel review (`agents=N`)

Without `agents=`, review sequentially yourself, as above. Never start agents
on your own: an explicit `agents=N` (2–10) from the user **is** the consent to
run them, so do not ask again; without it, parallel review needs a separate yes.

1. Split the run so each agent stays in one repo:

   ```bash
   node .claude/scripts/bugzilla/audit.mjs split --dir <dir> --parts <N>
   ```

   It writes `part-<k>.json` and prints the layout. A component goes to one
   part; one bigger than a part's share is cut into chunks (`Files#1`,
   `Files#2`), so even a single-component run uses every agent. It can still
   come out with fewer parts than `N` — with few bugs, or when the chunks round
   up (5 bugs of one component, `--parts 4`: chunks of 2, so 3 parts) — so
   start exactly as many agents as parts it lists. A rerun replaces the old
   `part-<k>.json` files, but refuses once any `decisions.part-<k>.json` exists:
   a new layout would not match decisions written for the old one.

2. Start one `general-purpose` agent per part with the Agent tool, **all in one
   message** so they run in parallel. Each prompt carries everything the agent
   needs — it sees nothing of this conversation:
   - the absolute paths of its `part-<k>.json` and of its output file (the
     `output` field of the part);
   - this SKILL.md's path, with the instruction to follow "Where each
     component's code lives" and "Step 3" exactly: verdicts, evidence, `side`,
     the `comment` table, the decision schema;
   - the comment language (`ru`/`en`) and the agreed resolutions;
   - the limits: read-only — no edits in any repo, no branch switching, no
     `git fetch`, no `audit.mjs plan`/`apply`, no Bugzilla writes (`bz.mjs
     --show` to read attachments is fine); write only its output file, a JSON
     array with exactly one decision per bug of its part; when unsure, lower
     `confidence` instead of closing;
   - the reply it must return: the count by verdict and the ids it could not
     settle — not the decisions themselves (they are in the file).

3. When all agents are done:

   ```bash
   node .claude/scripts/bugzilla/audit.mjs merge --dir <dir>
   ```

   It refuses a bug decided twice and lists bugs no part covered — review those
   yourself, write them to `<dir>/decisions.part-0.json` and run `merge` again.
   Never edit `decisions.json` by hand in this mode: every `merge` rebuilds it
   from the part files.

4. **Verify before Step 4.** Agents misjudge confidence more often than a single
   reviewer. Re-check yourself every decision that will change a field — each
   `fixed`/`obsolete`/`quickfix` with `confidence: high`: open its evidence (the
   commit on the main line, the `file:line`) and confirm it. Anything you cannot
   confirm goes down to `medium` (comment only) **and its `comment` is rewritten
   as a proposal** («Предлагаю закрыть, если…» / "Suggest closing if…") — the
   agent wrote «Закрываю…», and that text must not reach a bug that stays open
   (`plan` rejects it anyway). Make the change in the part file and run `merge`
   again. Spot-check a few `valid` ones too. Tell the user how many decisions
   you downgraded.

`--model` in Step 4 is the model that reviewed; subagents inherit yours unless
the agent definition says otherwise — if any part ran on another model, name
both (`"Claude Opus 5.5 + Claude Sonnet 5.5"`).

## Step 4 — dry-run plan

```bash
node .claude/scripts/bugzilla/audit.mjs plan --dir <dir> --model "<your model>" --lang <ru|en>
```

Always pass `--lang` with the language chosen in Step 1: when the script does
not run in a terminal (as from this skill) it refuses to plan without it; in a
terminal it would ask on the console instead. The language is checked against
every comment: a Russian run rejects
a comment without Cyrillic, an English run rejects one with it (rephrase a
quoted Russian UI string rather than pasting it). Such decisions show up as
"invalid decisions".

`--model` is required: it is the model that did the review, written into every
comment's signature (`— Generated with Claude Code (<model>)`) and the report.
Pass your own exact model name as the system prompt gives it (e.g.
`"Claude Opus 5.5"`), never a guess or a default.

Validates the decisions against the instance fields and prints every change
(status/resolution/priority/whiteboard and the comment text). A bug decided
more than once is rejected as a whole — keep one decision. Fix any
"invalid decisions" and rerun. Show the preview to the user and **wait for an
explicit OK**. A question or silence is not an OK.

## Step 5 — apply (after the OK)

```bash
node .claude/scripts/bugzilla/audit.mjs apply --dir <dir> --only <one id> --confirm
node .claude/scripts/bugzilla/bz.mjs --show <that id>
node .claude/scripts/bugzilla/audit.mjs apply --dir <dir> --confirm
```

If the user declines to write the run to Bugzilla (a files-only run), mark it
instead, so the next batch moves on rather than picking the same bugs again:

```bash
node .claude/scripts/bugzilla/audit.mjs files-only --dir <dir>
```

Apply one bug first and check it with `bz.mjs --show`. Each bug is re-read
before writing. It is a `conflict`, and skipped, only when something that can
overturn the decision happened after the export: status, resolution, priority,
whiteboard or assignee changed, or someone other than the audit commented
(counted from the number of comments seen at export, not by clock). A new CC
or keyword is not a conflict;
an action whose fields and comment are both already in place is `skipped` (the
comment is matched by its exact text, so a rerun never posts it twice). A bug
already `applied` in `apply-log.json` is not read again, so a later conflict or
read error cannot erase that record. Without `--confirm` apply only prints.

## Step 6 — suggestions document and report

```bash
node .claude/scripts/bugzilla/audit.mjs suggestions --dir <dir>
node .claude/scripts/bugzilla/audit.mjs report --dir <dir>
```

Give the user the report in the chat (as returned, plus a few lines on
patterns noticed) and the full paths of `suggestions.md` and `report.md`.

## Scaling past the pilot

After the pilot, ask how to continue: further `batch=` runs reviewed by you, or
the same with `agents=N` — the latter only when the user passes it or says yes,
since it spends several times the tokens. Suggest 2–4 agents; split by side or
component, not evenly by count. Every batch goes through the same
plan → OK → apply cycle.
