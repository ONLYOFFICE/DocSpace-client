# Brief: write a new OpenSpec capability of the web client

Write `openspec/specs/<NAME>/spec.md` and `openspec/specs/<NAME>/verification.md` describing the CURRENT behaviour of
the web client in the area named in the prompt, as its tests and its code show it. Edit nothing else, except the
`Out of scope` line of a neighbouring spec that names the new owner. Change no product code or tests. Do not push.

## Gather, in this order

1. Server side: the requirement headings of `../server/openspec/specs/<NAME>/spec.md` when the server has the same
   capability; read the bodies only of the requirements the client depends on.
2. Tests: the Playwright files of the area (`packages/<app>/__tests__/*.spec.ts`) and its Vitest files; list their
   test titles with line numbers first, then read only around the assertions you cite.
3. Code: the pages, dialogs and stores of the area. Collect the i18n keys (`t("Namespace:Key")`), the conditions
   that hide or disable an action (user type, room role, edition, plan, portal switches), and the API calls.
4. operationIds: the route of every API call, looked up in `../server/sdk/docspace-api-spec/docspace-backend.yaml`.
5. Neighbours: grep `openspec/specs/*/spec.md` for the area's terms to find what another capability already owns.

## spec.md

- `# <NAME> Specification`, `## Purpose`: what the area covers; `Server counterpart:` with the server capability
  and the operationIds called (or "none" and why); `Out of scope:` each excluded topic with its owner in backticks;
  `Implementation:` one or two lines naming the modules.
- `## Requirements`: one observable behaviour per `### Requirement:`, SHALL/MUST, under 500 characters, no class,
  store, function or file names, i18n keys for user-facing text, who does NOT get an action said explicitly. Each
  with at least one `#### Scenario:` of `- **WHEN**` / `- **THEN**`. Clearly wrong behaviour is not a requirement:
  report it (it becomes a `C<n>` row of `openspec/deviations.md`).

## verification.md

Header: `> Written <date> on <branch> (base <branch> at <commit>)`, that no test was run, which API document the
operationIds were checked against; then the shorthands of the paths used in the rows. Then `## Requirement rows`:
a bold row per requirement, a row per claim, status E2E-CONFIRMED, UNIT-CONFIRMED, CODE-ONLY or SERVER-SPEC (see
the skill). Then `## Left out of the spec` with `What | Why | Where`. Spell shorthands out in full paths: the
coverage script recognises a test file by its path or by its file name next to its folder name. A
CONFIRMED row cites the line that declares the test (`test(`, `it(`), which `coverage.mjs stale` checks.

## Finish

`node .claude/scripts/openspec/coverage.mjs stale` and `lint`, then
`$env:OPENSPEC_TELEMETRY='0'; npx -y @fission-ai/openspec@1.17.0 validate <NAME> --type spec --strict`. Commit
`OpenSpec: <NAME>: add client spec`. Report: requirement count, status counts, what was left out and why, suspected
defects. A suspected security defect is written into no file; report it in the conversation only.
