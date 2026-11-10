# Tasks

## 1. Other changes

- [x] 1.1 With `/opsx:update private-rooms-server-hardening`: rename its REMOVED header "No recovery, offboarding or file-key audit endpoints" to "No recovery or offboarding endpoints"; give its MODIFIED "Private room creation requires keys" the statement of this change (without the AI agent clause, which its scenario keeps) while keeping its "Public or form-filling room created as private" scenario; give its MODIFIED "Server-side copy out of a private room is refused" the 403 "Access denied" wording of this change (design decisions 3 and 4). Verify: `npx -y @fission-ai/openspec@latest validate private-rooms-server-hardening --strict` (`OPENSPEC_TELEMETRY=0`)

## 2. Integration

- [x] 2.1 `npx -y @fission-ai/openspec@latest validate --all --strict` (`OPENSPEC_TELEMETRY=0`) green. Verify: the validate summary

## Workflow follow-up

- The client types, the E2E mocks and their contract tests are brought to the same server with `/opsx:update private-rooms-server-contract-sync` before this change is archived; that update also fixes the contract case that still expects "You don't have enough permission to move the file".
- Archive with `/opsx:archive private-rooms-server-contract-sync` once those tasks are done too.
