# Brief: bring existing client specs up to date with a range of commits

Update the OpenSpec main specs named in the prompt for the commits `<A>..<B>` of the client (and `<C>..<D>` of
`../server/openspec/specs` when SERVER-SPEC rows may be affected). Specs describe the CURRENT behaviour on the branch.
Edit only `openspec/specs/<your specs>/spec.md` and `verification.md`, and `openspec/deviations.md` when a deviation
changes status. Change no product code or tests. Do not push.

## Find what changed

- `git log --no-merges --format='%h %s' <A>..<B> -- <paths of the area>`, `git show --stat <hash>`, and
  `git diff <A>..<B> -- <one file>` one file at a time; never print the diff of a whole folder.
- Test files changed in the range: `git diff --name-only <A>..<B> -- 'packages/*/__tests__' '**/__tests__/**'`.
  Grep the verification.md files for each name: a cited line may have moved or the assertion changed.
- Server specs: `git -C ../server diff <C>..<D> -- openspec/specs/<capability>/spec.md` for the capabilities your
  SERVER-SPEC rows cite; a renamed requirement means the row's citation changes.

## What to change

- Behaviour that changed: fix the requirement and its scenario; keep the requirement name unless the behaviour is
  a different one; keep the body under 500 characters.
- New behaviour in an area you own: a new requirement with a scenario and its rows.
- Rows: move cited line numbers to where the assertion is now; upgrade a CODE-ONLY row to E2E- or UNIT-CONFIRMED
  when a new test asserts it; downgrade a row whose test was removed.
- `Out of scope` and `Left out`: keep the owners right when an area moved.
- Deviations the range touches: FIXED <commit> or REFUTED with one line of reason; a new one takes the next free
  `C<n>` after you checked it in the code.
- Add a line under the header of each verification.md you changed: `Revision <date> (<A>..<B>)`.

## Finish

`node .claude/scripts/openspec/coverage.mjs lint` and
`$env:OPENSPEC_TELEMETRY='0'; npx -y @fission-ai/openspec@1.17.0 validate --all --strict`. One commit per capability,
`OpenSpec: <capability>: <what changed>`. Report per spec what changed, rows upgraded, deviation verdicts, what you
did not verify. A suspected security defect is written into no file; report it in the conversation only.
