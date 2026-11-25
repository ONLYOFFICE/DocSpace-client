# editor-integration — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to `packages/doceditor/`; E2E
paths omit `__tests__/`. Shorthands: `editor` = `src/components/Editor.tsx`, `events` =
`src/hooks/useEditorEvents.ts`, `editorTest` = `src/components/__tests__/Editor.test.tsx`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Opening a file** | | |
| `fileId`, `version`, `action`, `share`; mobile editor on a phone | `src/app/(root)/page.tsx:66-142` | CODE-ONLY |
| `*` in the tab title while unsaved | `events:910-955` | CODE-ONLY |
| **Password of a shared link** | | |
| Password form before the editor | `password-form.spec.ts:45`; `src/app/(root)/page.tsx:160-178` | E2E-CONFIRMED |
| **Errors while opening** | | |
| No catch-all for an answer without an error; cause kept off the page | `open-edit-error.spec.ts:49, 67` | E2E-CONFIRMED |
| **Creating a file and opening it** | | |
| Failure without JSON shows the error page, no React #441 | `create-file-error.spec.ts:52` | E2E-CONFIRMED |
| Empty, template, copy as; redirect to the editor; empty editor on 403 or quota; sign-in on 401 | `src/app/(root)/create/page.tsx:98-236`; `src/components/CreateFileError.tsx:58-77` | CODE-ONLY |
| **Editing rights from the viewer** | | |
| Reopen in edit mode; conversion with `Editor:DocumentConverted` | `src/utils/events.ts:83-128`; `events:232-270` | CODE-ONLY |
| **Going back and closing** | | |
| Location button rules, Forms section, default templates | `src/hooks/useGoBackAndClose.ts:44-131` | CODE-ONLY |
| Close sends pending reports first | `events:564-594`; `src/hooks/__tests__/useEditorEvents.test.tsx:210` | UNIT-CONFIRMED |
| **Renaming and favorites** | | |
| Rename attached on `security.Rename` and writes the title | `editorTest:495`; `src/utils/__tests__/events.test.ts:48` | UNIT-CONFIRMED |
| Favorite toggled | `src/hooks/__tests__/useEditorEvents.test.tsx:169` | UNIT-CONFIRMED |
| **Version history** | | |
| History events attached by the file's rights | `editorTest:398` | UNIT-CONFIRMED |
| History, diff, restore, errors inside the history, reload on close | `events:702-778, 850-908`; `src/utils/events.ts:79-81` | CODE-ONLY |
| **Save a copy** | | |
| Save as attached for a plain file | `editorTest:367` | UNIT-CONFIRMED |
| Not for a Guest | `editor:419-423` | CODE-ONLY |
| Folder, name, new tab or message; no result folders | `src/hooks/useSelectFolderDialog.ts:59-130`; `src/components/SelectFolderDialog.tsx:72-100` | CODE-ONLY |
| **New document from the editor** | | |
| Offered for a plain file | `editorTest:472` | UNIT-CONFIRMED |
| Not for a Guest or a PDF; created in the same folder and opened | `editor:424-431`; `events:634-658` | CODE-ONLY |
| **Inserting files from DocSpace** | | |
| Picked file handed over by a presigned address | `src/hooks/__tests__/useSelectFileDialog.test.tsx:161` | UNIT-CONFIRMED |
| Image, compare, mail merge, reference source | `editor:434-437` | CODE-ONLY |
| **Linked data between files** | | |
| Not for third-party files; open a linked file | `editor:445-451`; `events:144-200` | CODE-ONLY |
| **Mentions** | | |
| Mention notifies | `src/hooks/__tests__/useEditorEvents.test.tsx:294` | UNIT-CONFIRMED |
| People who can open the file; `UsersWithoutAccess` | `editor:415-417`; `events:780-848` | CODE-ONLY |
| **Sharing from the editor** | | |
| Sharing event attached for a plain file | `editorTest:524` | UNIT-CONFIRMED |
| Not for a form being filled | `editor:440-443` | CODE-ONLY |
| **Storage quota in the editor** | | |
| Room, user, portal; on opening or during editing | `src/components/Bar/index.tsx:55-127` | CODE-ONLY |
| **Session expiry** | | |
| Document kept for the user it was open for, or for anyone in a tab that never showed a user | `src/hooks/__tests__/referenceUrl.test.tsx:102, 110, 125` | UNIT-CONFIRMED |
| Session checked by its lifetime, editor closed, sign-in | `src/hooks/useSessionLifetime.ts` | CODE-ONLY |
| **The mobile app offer** | | |
| Offer rendered on phone and tablet | `deeplink.spec.ts:41` | E2E-CONFIRMED |
| Conditions, remembered choice, app-only mode | `src/hooks/useDeepLink.ts` | CODE-ONLY |
| **Recovering from a broken page load** | | |
| Retry bootstrap in the head; recovery after failures and an outage; bounded reloads | `chunk-retry.spec.ts:52, 83, 136, 197` | E2E-CONFIRMED |
| One reload on a broken stream, error page on a second | `rsc-stream-recovery.spec.ts:129, 147` | E2E-CONFIRMED |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Encrypted files: key flow, withheld events, capability check | Owned by `private-rooms/editor-integration` | `editorTest:290-460, 553-715`; `src/hooks/__tests__/useFileEncryptionKeys.test.tsx` |
| Start filling, completed form, form field reports, share to fill out | Owned by `form-filling-workflow` | `start-filling.spec.ts`; `completed-form.spec.ts`; `form-field-changes.spec.ts` |
| The OAuth editor and the SDK frame settings | Owned by `sdk-embedding` | `src/components/OAuthEditor.tsx` |
| The AI attach listener and tool bridge | Owned by the change `ai-chat-agents-design` | `editorTest:702, 715`; `src/hooks/__tests__/useEditorEvents.test.tsx:360` |
| The refresh action kept from the page address | No user-visible effect stated beyond the editor's own refresh | `src/utils/refreshFileAction.test.ts` |
