---
paths:
  - "openspec/**"
---

# OpenSpec main specs of the client

`openspec/specs/<capability>/` describes what the web client does on the branch
today, across all its apps (client, login, doceditor, management, sdk): one
`spec.md` of requirements and scenarios and one `verification.md` that ties
every claim to a Playwright test, a Vitest test, the code or a server spec.
`openspec/deviations.md` lists what looks wrong and is therefore not a
requirement. Names follow `../server/openspec/specs` where the domain is the
same, so the two sets read side by side. Layout, statuses and the change rules
are in `openspec/config.yaml`.

- **Find the governing requirement** before changing behaviour: grep
  `openspec/specs/*/spec.md` for the route, the i18n key, the operationId or the
  UI area. The `Out of scope` line of each Purpose names the owner of what the
  spec leaves out.
- **Planned work is a change** (`/opsx:propose`, `/opsx:apply`, `/opsx:archive`);
  do not write behaviour that is not on the branch into a main spec.
- **A fix that changes observable behaviour** updates the owning requirement and
  the verification.md rows that cite the touched tests, in the same commit or
  through a change.
- **Keeping the specs true** (re-sync after a merge, coverage, a new capability,
  a deviation) is the `openspec-maintain` skill; its
  `.claude/scripts/openspec/coverage.mjs` reports status counts, test files no
  spec cites, cited test lines that moved, and requirements over 500
  characters. A test change that moves a cited line updates the row.
- **Private rooms** (`openspec/specs/private-rooms/*`) keep their own workflow:
  `.claude/rules/private-rooms.md`.
- **The AI agents and chat** are specified by the open change
  `ai-chat-agents-design` until it is archived.
- **Security defects** are never written into a spec, a verification row, the
  deviations register, a test name or a commit message before a released
  version fixes them; tell the user in the conversation (`openspec/config.yaml`,
  "Security defects").
- Validate before a push that touches `openspec/**`:
  `npx -y @fission-ai/openspec@1.17.0 validate --all --strict` (the pre-push gate
  runs it too).
