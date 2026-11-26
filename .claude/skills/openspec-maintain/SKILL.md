---
name: openspec-maintain
description: "Keeping the OpenSpec main specs of the web client (openspec/specs/*/spec.md + verification.md, openspec/deviations.md) true to the code on the branch: re-sync them after a merge or a release brings product changes, find test files no verification.md cites and capabilities with many CODE-ONLY rows, write a spec for an area no capability covers, and register a client defect or a client/server mismatch. USE FOR: re-sync the specs after a merge, update the specs for the release, which spec rows are only confirmed by code, which E2E tests no spec cites, add a capability, spec coverage report, register a deviation. DO NOT USE FOR: OpenSpec change proposals and their workflow (openspec-propose, openspec-apply-change, openspec-archive-change), private rooms specs (their own workflow in .claude/rules/private-rooms.md), fixing the defects the specs list (fix-bug)."
---

# Maintaining the OpenSpec main specs of the client

## What lives where

- `openspec/specs/<capability>/spec.md`: one product area. `## Purpose` says what the area covers, its server
  counterpart in `../server/openspec/specs/<capability>` (same name where the domain is the same), the operationIds
  the UI calls, what is out of scope and which capability owns it, and a short `Implementation:` note naming the
  modules. Requirements (`### Requirement:`, SHALL/MUST, body under 500 characters) never name classes, stores,
  functions or files; user-facing text is named by its i18n key (`Common:Key`); access rules say who does NOT get
  an action (SHALL NOT), following `.claude/rules/access-matrix.md` and `dashboard-matrix.md`. Every requirement has
  at least one `#### Scenario:` with `- **WHEN**` / `- **THEN**` (`- **AND**`).
- `openspec/specs/<capability>/verification.md`: a header (date, branch, base commit, the `../server` API submodule
  commit the operationIds were checked against, shorthands), then `Claim | Source | Status` rows grouped under a
  bold row per requirement, then a "Left out of the spec" table (`What | Why | Where`) for everything seen in the
  code or the tests that the spec does not state, with its owner.
- `openspec/deviations.md`: the register of behaviour that looks wrong (`C<n>` rows: client vs server, client vs
  product matrix, suspected client defects) with status OPEN, OPEN (product decision), FIXED <commit>, REFUTED or
  NOT A DEFECT (behaviour recorded so nobody files it); a row that is no longer open moves to "Closed".
  A requirement never describes such behaviour; it states the intended one or stays silent.
- `openspec/specs/private-rooms/*`: private rooms, maintained through changes (`.claude/rules/private-rooms.md`);
  they have no verification.md and this skill does not edit them.
- The AI agents and the AI chat are owned by the open change `ai-chat-agents-design`; their tests stay uncited
  until it is archived.

### verification.md statuses

| Status | Meaning |
|---|---|
| E2E-CONFIRMED | a Playwright test asserts it (screenshots count), cited `file:line` |
| UNIT-CONFIRMED | a Vitest test asserts it, cited `file:line` |
| CODE-ONLY | read from the code; no test. The row says why when a test cannot reach it |
| SERVER-SPEC | the server decides it; cites the requirement of `../server/openspec/specs/<capability>/spec.md` |
| MATRIX-ONLY | only the product matrix says it |

No test is run when a spec is written: a citation means the cited assertion states the claim, not that it passed.
Read the assertion, not only the test name, before citing it. Writing the specs never changes product code; a test
added for a CODE-ONLY row never changes product code either, and a suspected bug is discussed with the user first.

### Security defects

The repository is public. A defect that lets somebody read, change or delete what their rights do not allow,
hands out a key, secret, token or personal data, runs a check for the wrong account or portal, or breaks the
encryption of a private room is written into no committed file (spec, verification, deviations, test name, commit
message) before a released version fixes it. Report it to the user in the conversation only; the owner decides
where the details are kept. Full wording: the "Security defects" paragraph of `openspec/config.yaml`.

## Tools

- `node .claude/scripts/openspec/coverage.mjs [counts|uncited|stale|lint] [--e2e|--unit] [--json]`: requirements,
  scenarios and status counts per capability; test files no verification.md cites; cited lines that no longer open
  a test; requirement bodies of 500
  characters or more, control characters and a literal `\n` before a word in `openspec/**/*.md`. `uncited` only
  counts the AI chat E2E files listed by path in the script and the private rooms tests. `stale` checks that each `file:line` of an E2E-CONFIRMED or
  UNIT-CONFIRMED row still opens a test (`test(`, `it(` or `describe(` on that line or the next); a row cites the
  declaration of the test, not a line inside it. Exit 1 on a lint or stale finding.
- `$env:OPENSPEC_TELEMETRY='0'; npx -y @fission-ai/openspec@1.17.0 validate --all --strict` (the pre-push gate runs
  the same command when the pushed commits touch `openspec/**`), or `validate <name> --type spec --strict`.
- operationIds: find the route of the client call in `packages/shared/api/**`, then the path in
  `../server/sdk/docspace-api-spec/docspace-backend.yaml` (a submodule of `../server`; `git submodule update --init`
  there when it is empty). A call that builds its URL in a variable is read by hand. Backup routes are rewritten by
  nginx (`../buildtools/config/nginx/onlyoffice.conf`) from `portal/*backup*` to `backup/*`; the management app's
  `/apisystem` routes are not in that document and are named in words.
- Server behaviour comes from `../server/openspec/specs` or from the server source found through CodeGraph
  (`openspec/config.yaml`, "Server behaviour"); never from client code or mocks.

## Mode A: re-sync after a merge or a release

1. Find the product delta: `git log --no-merges --format='%h %s' <A>..<B> -- packages` for the client side and
   `git -C ../server log --format='%h %s' <C>..<D> -- openspec/specs` for the server specs the SERVER-SPEC rows cite.
2. Map each changed path to its capabilities: grep the module named in the commit in the `Implementation:` notes
   (`openspec/specs/*/spec.md`), and the changed test files in the verification.md files.
3. Update per `references/resync-brief.md`: fix a changed requirement and its scenario, keep requirement names
   stable, move rows whose cited lines moved, upgrade CODE-ONLY rows that new tests now cover, and set FIXED or
   REFUTED on the deviations the range touches.
4. `node .claude/scripts/openspec/coverage.mjs stale` (moved test lines), `lint` and `validate --all --strict`.

## Mode B: coverage

1. `node .claude/scripts/openspec/coverage.mjs counts` for the CODE-ONLY backlog per capability, and
   `uncited --e2e` for Playwright files no spec cites (AI and private rooms files are only counted, see above).
2. An uncited E2E file belongs to an existing capability (add its rows, or a "Left out" row with the owner) or
   shows a missing capability (mode C).
3. Covering CODE-ONLY rows with tests follows `.claude/rules/e2e-tests.md` and `.claude/rules/unit-tests.md`;
   the row then becomes E2E- or UNIT-CONFIRMED with `file:line`. Tests change no product code.
4. The uncited unit list is long by nature (store and helper tests of the implementation); read it for tests that
   pin an observable rule, not to cite every file.

## Mode C: a new capability

Use `references/new-spec-brief.md`. Pick the name first: the server's capability name where the domain is the
same, a client name otherwise; check the `Out of scope` lines of the neighbouring specs so that every area has one
owner, and update those lines when the new capability takes something over.

## Registering a deviation

Take the next free `C<n>` in `openspec/deviations.md`, name the requirement it touches, the evidence (`file:line`,
server spec requirement) and the status. Check the claim in the code before writing it; a security defect goes to
the user in the conversation instead.

## Commits

One capability per commit, subject `OpenSpec: <capability>: <imperative summary>` (`add client spec` for a new
one), no body needed, no AI attribution (CLAUDE.md). Never push unless the user asks.

## Traps

- PowerShell: inside double quotes a single backtick before a letter is an escape (`` `f `` is a form feed); edit
  spec files with the Edit tool or double the backtick. The lint report catches what slips through.
- A recursive `Get-ChildItem` over `packages` walks `node_modules` and times out; name the folders.
- A test's title can contradict its assertion; cite the assertion.
- Screenshot frames are evidence only for what they show; read the case that produces them
  (`dashboard-appearance.spec.ts` is a generated matrix, see `.claude/rules/dashboard-matrix.md`).
