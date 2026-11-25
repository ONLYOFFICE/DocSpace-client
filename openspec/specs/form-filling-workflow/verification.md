# form-filling-workflow — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; client
E2E paths omit `packages/client/__tests__/`, editor E2E paths are given in full. Shorthands: `ctxTests/` =
`packages/client/src/store/contextOptionsStore/__tests__/`, `helpers` =
`packages/client/src/store/contextOptionsStore/actions.helpers.tsx`, `events` =
`packages/doceditor/src/hooks/useEditorEvents.ts`, `doc/` = `packages/doceditor/`, `server` =
`../server/openspec/specs/form-filling-workflow/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Filling a form outside a form room** | | |
| Fill opens the dialog for a PDF form outside a form room; a regular file opens the editor | `ctxTests/ContextOptionsStore.actions8.test.ts:76, 85` | UNIT-CONFIRMED |
| Three ways; form room or no copy right opens the editor | `packages/client/src/store/ContextOptionsStore.tsx:282-297`; `packages/client/src/components/dialogs/FillPDFDialog/FillPDFDialog.tsx` | CODE-ONLY |
| **Sharing a form to collect its data** | | |
| Room selector with create, `Common:CopyHere`, conflicts first, start or assign | `packages/client/src/components/ShareCollectSelector/ShareCollectSelector.tsx:180-315` | CODE-ONLY |
| Editor: share-to-fill-out dialog for a form outside a private room | `doc/src/hooks/__tests__/useShareDialog.test.tsx:81` | UNIT-CONFIRMED |
| Editor: copy through the file handler, start in a form room, assign in a VDR | `doc/src/hooks/useStartFillingSelectDialog.tsx:146-245` | CODE-ONLY |
| Sharing a form to fill out on the server | `server`, "Sharing a form to fill out outside a form room" | SERVER-SPEC |
| **Starting filling in a Form filling room** | | |
| Start from the list calls the start action | `ctxTests/ContextOptionsStore.actions8.test.ts:96` | UNIT-CONFIRMED |
| Public link dialog after the start | `helpers:438-451`; `packages/client/src/components/dialogs/CreatedPDFFormDialog/CreatedPDFFormDialog.tsx` | CODE-ONLY |
| Editor: renames reported before the start | `doc/src/hooks/__tests__/useEditorEvents.test.tsx:237`; `doc/__tests__/form-field-changes.spec.ts:472, 499` | UNIT-CONFIRMED |
| Editor: co-editors disconnected, back to Forms | `events:1142-1152` | CODE-ONLY |
| **Starting filling by recipients** | | |
| Opens the editor; message on a phone | `helpers:419-436` | CODE-ONLY |
| Recipients panel, add to room, Start | `packages/shared/dialogs/role-mapping/RoleMappingPanel.tsx`; `events:1133-1141` | CODE-ONLY |
| Assign now or later | `packages/shared/dialogs/assign-roles-dialog/index.tsx` | CODE-ONLY |
| Role-based filling on the server | `server`, "Role-based filling in a Virtual Data Room" | SERVER-SPEC |
| **Filling status panel** | | |
| Opened from the menu | `ctxTests/ContextOptionsStore.actions2.test.ts:75` | UNIT-CONFIRMED |
| Actions by state and rights | `packages/shared/dialogs/FillingStatusPanel/index.tsx:184-262` | CODE-ONLY |
| **Stopping and restarting filling** | | |
| Reset and start sends empty roles | `ctxTests/ContextOptionsStore.actions8.test.ts:107` | UNIT-CONFIRMED |
| Stop confirmation; form blocked while restarting | `packages/shared/dialogs/stop-filling/StopFillingDialog.tsx`; `helpers:453-485` | CODE-ONLY |
| Filling actions on the server | `server`, "Form filling actions" | SERVER-SPEC |
| **Form actions in the file list** | | |
| Options by `StartFilling`, `ResetFilling`, `StopFilling`, `FillingStatus`; edit before the start; make form | `packages/client/src/store/filesStore/contextOptions.helpers.ts:475-517, 588-589` | CODE-ONLY |
| Filling status and draft badges | `packages/shared/components/badges/Badges.test.tsx:157, 172` | UNIT-CONFIRMED |
| **Only PDF forms in a Form filling room** | | |
| Room under the Rooms address and its subfolder | `quick-actions.spec.ts:237, 255` | E2E-CONFIRMED |
| **After a form is submitted** | | |
| Submit leads to the completed form page | `events:1083-1123` | CODE-ONLY |
| Completed form, empty state, no fill result | `doc/__tests__/completed-form.spec.ts:45, 66, 88` | E2E-CONFIRMED |
| Anonymous download; member copy link, ready forms, back, fill again | `doc/src/components/completed-form/CompletedForm.tsx:109-280` | CODE-ONLY |
| Fill result on the server | `server`, "Fill result of a finished session" | SERVER-SPEC |
| **Recipient pages of a Virtual Data Room** | | |
| Start filling page and completed VDR page | `doc/__tests__/start-filling.spec.ts:45`; `doc/__tests__/completed-form.spec.ts:112` | E2E-CONFIRMED |
| Texts and actions by turn and state; empty state without access | `doc/src/components/completed-form/CompletedVDRForm.tsx:84-317`; `doc/src/app/(root)/start-filling/page.tsx` | CODE-ONLY |
| **Report of renamed form fields** | | |
| Not tracked outside the original form or in Community Edition editors | `doc/__tests__/form-field-changes.spec.ts:142`; `doc/src/hooks/__tests__/useFormFieldChanges.test.tsx:144` | E2E-CONFIRMED |
| Each rename once; undone rename; fields without id or sharing a key | `doc/__tests__/form-field-changes.spec.ts:196, 383, 412, 448`; `doc/src/hooks/__tests__/useFormFieldChanges.test.tsx:179, 259, 271, 384-447` | E2E-CONFIRMED |
| Retry with a growing wait; refused ends the session | `doc/src/hooks/__tests__/useFormFieldChanges.test.tsx:463-560`; `doc/__tests__/form-field-changes.spec.ts:526` | UNIT-CONFIRMED |
| Sent as the editor is left | `doc/__tests__/form-field-changes.spec.ts:237, 268, 295`; `doc/src/hooks/__tests__/useFormFieldChanges.test.tsx:591` | E2E-CONFIRMED |
| Report on the server | `server`, "Renamed form fields report" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Results spreadsheet and database export settings | Owned by `room-types` | `packages/client/src/components/dialogs/CreateEditRoomDialog/sub-components/FormRoomBlock/` |
| Filling access of form links | Owned by `shared-links` | `openspec/specs/shared-links/spec.md`, "Filling access for a form outside the rooms" |
| Submitting a form to the template gallery | Owned by `template-gallery` | `packages/client/src/components/dialogs/SubmitToFormGallery/` |
| Encrypted forms and the share-to-fill-out dialog in a private room | Owned by `private-rooms/editor-integration` | `doc/src/hooks/__tests__/useShareDialog.test.tsx:72`; `doc/src/components/__tests__/Editor.test.tsx:414, 426` |
| The Forms section and form rooms kept under it | Owned by `files-navigation` | `packages/client/src/helpers/__tests__/formsSectionNavigation.test.ts` |
| Starting filling from the SDK | Owned by `sdk-embedding` | `packages/sdk/src/app/(forms)/_hooks/useFormsContextMenu.ts:243` |
