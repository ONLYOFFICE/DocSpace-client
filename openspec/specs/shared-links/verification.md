# shared-links — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`, 2026-11-13) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
E2E paths omit `packages/client/__tests__/`. Shorthands: `useShare` =
`packages/shared/components/share/hooks/useShare.tsx`, `LinkRow` =
`packages/shared/components/share/sub-components/LinkRow.tsx`, `helpers` =
`packages/shared/components/share/Share.helpers.tsx`, `EditLinkPanel` =
`packages/shared/dialogs/EditLinkPanel/index.tsx`, `Members` =
`packages/client/src/pages/Home/InfoPanel/Body/views/Members/index.tsx`, `MembersLinkRow` = its
`sub-components/LinkRow.tsx`, `actions` = `packages/client/src/store/contextOptionsStore/actions.helpers.tsx`,
`service` = `packages/shared/services/share-link.service.ts`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Where link controls appear** | | |
| Share tab only when `canShare`; otherwise the info panel falls back to Details | `useShare:105, 138-146`; `packages/shared/components/share/index.tsx:84, 127` | CODE-ONLY |
| Room links block only for non-private Public, Custom and Form filling rooms, with `EditAccess`, not for templates, not while searching | `Members:173-178, 499-502` | CODE-ONLY |
| Viewer of a Public room gets no links block | `Members:175` (`security.EditAccess`) | CODE-ONLY |
| **Creating the first link** | | |
| File without links: `Common:CreateAndCopy` row; activating creates, lists and copies the link | `share-panel-list.spec.ts:116-134`; `useShare:164-210, 595-606` | E2E-CONFIRMED |
| Create row is a Tab stop pressed by Enter; the new row takes the focus | `share-panel-list.spec.ts:136-171`; `packages/shared/components/share/hooks/__tests__/useShare.focus.test.tsx:104, 136` | E2E-CONFIRMED |
| Room without a link: `Files:CreateNewLink` row, link created, copied, `Files:LinkSuccessfullyCreatedAndCopied` | `Members:125-151, 275-299` | CODE-ONLY |
| Creation failure: server message as error toast, list emptied back | `useShare:186-203` | CODE-ONLY |
| **Default access of a new link** | | |
| Read by default; FFR form Filling; other form Editing else Filling; FFR folder Filling | `service:86-139` | CODE-ONLY |
| **Default audience of a new link** | | |
| File/folder link internal only from the default internal-link setting | `service:146-261` (`internal` argument), `packages/client/src/pages/Home/InfoPanel/Body/views/Share/index.tsx:142` | CODE-ONLY |
| Default on: the created file link is requested with `internal: true` | `external-sharing-share-panel.spec.ts:160-214` (the run also has documents restricted) | E2E-CONFIRMED |
| Room link from Members: internal when restricted or default, never in a Public room | `Members:125-141` | CODE-ONLY |
| Public room links always for anyone on the server side | `../server/openspec/specs/shared-links/spec.md`, "A fixed \"who has access\" value silently skips the update" | SERVER-SPEC |
| **Adding more links and the link limit** | | |
| Add button absent when `shareSettings.ExternalLink` is 0, disabled with `Common:MaximumNumberOfExternalLinksCreated` at the limit (files: all links > additional + primary − 1; rooms: additional ≥ that count) | `useShare:536-584`; `Members:163-223` | CODE-ONLY |
| The limits themselves | `../server/openspec/specs/shared-links/spec.md`, "Link count limits" | SERVER-SPEC |
| **Contents of a link row** | | |
| Title, copy button, expiration line, audience and access selectors, actions menu; locked mark for a password | `LinkRow:159-240` | CODE-ONLY |
| File with a link is listed | `share-panel-list.spec.ts:228-250` | E2E-CONFIRMED |
| Copy button is a Tab stop and copies once per activation | `share-panel-list.spec.ts:173-226`; `packages/shared/components/share/sub-components/LinkTitle.tsx:58-63` | E2E-CONFIRMED |
| Audience selector static without `canEditInternal`; access selector static with one option | `packages/shared/components/share/sub-components/LinkTypeSelector.tsx:80-82`; `AccessRightSelector.tsx:80-94` | CODE-ONLY |
| **Access offered for a link** | | |
| Only `availableShareRights` (primary list for the primary link); file labels vs room labels with descriptions | `helpers:115-200, 245-310`; `packages/shared/components/share/Share.helpers.test.ts:63, 78, 149` | UNIT-CONFIRMED |
| **Changing a link from its row** | | |
| Access, audience, expiration saved at once and copied with the toast | `useShare:280-302, 304-351, 414-434`; `MembersLinkRow:212-302` | CODE-ONLY |
| None removes with `Common:LinkRemoved`; Deny access keeps with `Common:LinkAccessDenied` | `useShare:319-326` | CODE-ONLY |
| Expired link changed: expiration set to now + 7 days | `useShare:281-284, 308-311`; `MembersLinkRow:213-216` | CODE-ONLY |
| **Filling access for a form outside the rooms** | | |
| Filling outside the rooms opens the form sharing panel; the change runs on its confirmation | `useShare:335-348`; `packages/client/src/components/panels/ShareFormPanel/index.js:52-76` | CODE-ONLY |
| **A current access that is no longer available** | | |
| Kept selected and disabled in the row | `share-link-revoked-access.spec.ts:231-275`; `helpers:245-283`; `Share.helpers.test.ts:92, 104, 116, 132, 160` | E2E-CONFIRMED |
| Settings panel: selected and disabled, `Common:RoleForLinkNotAvailable`, Save disabled | `share-link-revoked-access.spec.ts:146-200`; `packages/shared/dialogs/EditLinkPanel/EditLinkPanel.test.tsx:208, 227, 243` | E2E-CONFIRMED |
| Picking an available role enables Save | `share-link-revoked-access.spec.ts:202-229`; `EditLinkPanel.test.tsx:262` | E2E-CONFIRMED |
| **Link expiration in the row** | | |
| Menu 12 hours / 1 day / 7 days / Unlimited / Custom; `Common:NoTimeLimit` without `canEditExpirationDate` | `packages/shared/components/share/sub-components/LinkExpiration.tsx:68-79`; `ExpiredComboBox.tsx:75-171`; `helpers:331-381`; `Share.helpers.test.ts:50` (digits of the period labels) | CODE-ONLY |
| Primary Public room link has no expiration | `../server/openspec/specs/shared-links/spec.md`, scenario "Primary room link does not expire" | SERVER-SPEC |
| Expired: `Common:LinkExpired` + `Common:ReactivateLink`, re-saved with now + 7 days | `ExpiredComboBox.tsx:106-108, 175-193`; `useShare:353-386`; `MembersLinkRow:250-276` | CODE-ONLY |
| **Copying a link** | | |
| Copies the address; `Common:LinkCopiedToClipboard` naming audience, access, password, restriction, expiration | `helpers:536-627` | CODE-ONLY |
| Expired link: nothing copied, `Common:LinkExpired` | `useShare:436-440`; `LinkRow:189-193` | CODE-ONLY |
| **Copying the shared link from the file list** | | |
| Quick button and `Common:CopySharedLink` copy the primary link with the toast and the manage link | `packages/client/src/HOCs/withQuickButtons.js:105-134`; `actions:324-377, 739-785`; `shared-with-me.spec.ts:313` | E2E-CONFIRMED |
| Toast link opens the info panel on the item | `shared-with-me.spec.ts:366`; `packages/client/src/store/contextOptionsStore/headerOptions.helpers.ts:196-206`; `helpers:514-534` | E2E-CONFIRMED |
| Expired primary link refused from the context menu | `actions:331-335, 751-754` | CODE-ONLY |
| **Link actions menu** | | |
| Link settings, Copy shared link, Embed, then Revoke (`canRevoke`) or Delete | `useShare:473-529`; `MembersLinkRow:146-210` | CODE-ONLY |
| Room link: `Files:CopyLinkPassword` enabled only with a password, `Common:PasswordSuccessfullyCopied` | `MembersLinkRow:107-112, 185-191` | CODE-ONLY |
| Embed disabled without the Embed right / for an expired room link | `useShare:516`; `MembersLinkRow:197` | CODE-ONLY |
| Archived room: no actions menu, access and expiration controls disabled | `LinkRow:230-239`; `AccessRightSelector.tsx:115`; `LinkExpiration.tsx:85` | CODE-ONLY |
| **Revoking and deleting a link** | | |
| Revoke replaces the link, `Common:GeneralLinkRevokedAndCreatedSuccessfully`; Delete removes, `Common:LinkRemoved` | `useShare:353-386` | CODE-ONLY |
| Room links ask in the delete-link dialog first | `MembersLinkRow:123-130` | CODE-ONLY |
| A revoked primary link is not recreated on read | `../server/openspec/specs/files-settings/spec.md`, "Revoked primary link stays revoked on read" | SERVER-SPEC |
| **Link settings panel** | | |
| Role block only with several options (or an unavailable current one) | `EditLinkPanel.test.tsx:188, 198`; `EditLinkPanel:553-566` | UNIT-CONFIRMED |
| Name, audience (`canEditInternal`), password, download restriction (not in FFR; locked when `canEditDenyDownload` false), time limit (`canEditExpirationDate`, otherwise a room note) | `EditLinkPanel:426-449, 503-618` | CODE-ONLY |
| **Saving the link settings** | | |
| Save needs changes, a name, an available role, a future date; password checked | `EditLinkPanel:282-310, 488-501` | CODE-ONLY |
| Save closes the panel | `EditLinkPanel.test.tsx:274` | UNIT-CONFIRMED |
| Failure keeps the panel open with the error | `EditLinkPanel.test.tsx:322` | UNIT-CONFIRMED |
| Enter on a control stays with the control; Enter with nothing focused saves | `EditLinkPanel.test.tsx:292, 307` | UNIT-CONFIRMED |
| **External links blocked by the administrator** | | |
| Restricted area: rooms for items under Rooms, documents otherwise | `packages/client/src/store/FilesSettingsStore.ts:276-304` | CODE-ONLY |
| `Common:BlockedByAdmin`, no expiration line, static access, menu Copy link + Delete/Revoke | `external-sharing-share-panel.spec.ts:222-291`; `external-sharing-rooms.spec.ts:293-327`; `LinkRow:166-229`; `useShare:473-496` | E2E-CONFIRMED |
| Label kept when existing links are allowed | `external-sharing-share-panel.spec.ts:297-333` | E2E-CONFIRMED |
| Rooms-only restriction leaves My documents links unmarked | `external-sharing-rooms.spec.ts:369-441` | E2E-CONFIRMED |
| **Copying a blocked link** | | |
| Room quick button and context menu refused with `Common:LinkBlockedByAdminWarning` | `external-sharing-rooms.spec.ts:452, 478` | E2E-CONFIRMED |
| File inside a restricted room, quick button and context menu | `external-sharing-rooms.spec.ts:517, 542` | E2E-CONFIRMED |
| From the link row; copied as usual when existing links are allowed | `useShare:436-470`; `MembersLinkRow:304-310`; `FilesSettingsStore.ts:296-304` | CODE-ONLY |
| **New links while external sharing is restricted** | | |
| "Anyone with the link" disabled with `Common:ExternalLinksDisabledByAdmin` (row) | `external-sharing-share-panel.spec.ts:134-158`; `LinkRow:99-113` | E2E-CONFIRMED |
| Same in the settings panel | `EditLinkPanel:163-175` | CODE-ONLY |
| No add button in a restricted Public room | `external-sharing-rooms.spec.ts:329-366`; `Members:190-192` | E2E-CONFIRMED |
| No creation for a file inside a Public room when existing links are blocked | `external-sharing-share-panel.spec.ts:336-388`; `useShare:547-550, 596` | E2E-CONFIRMED |
| Restriction bar `Common:ExternalLinksDisabledForGuests` for a room with external links; absent for a documents-only restriction | `external-sharing-rooms.spec.ts:254-291`; `Members:227-242` | E2E-CONFIRMED |
| **Public rooms while external sharing is restricted for rooms** | | |
| Public room type disabled in the create-room dialog; not for a documents-only restriction | `external-sharing-rooms.spec.ts:165, 209`; `packages/client/src/components/dialogs/CreateEditRoomDialog/sub-components/RoomTypeList/index.tsx:98, 207, 222`; `packages/client/src/components/GlobalEvents/CreateRoomEvent.tsx:396-397` | E2E-CONFIRMED |
| Restricted badge on a Public room with external links | `external-sharing-rooms.spec.ts:134-163`; `packages/shared/utils/getRoomBadgeUrl.tsx:94`; `packages/client/src/HOCs/withFileActions.js:395-405` | E2E-CONFIRMED |
| **Opening a room link in the browser** | | |
| Key validated; Ok shows contents, signed-in user taken to the room; Invalid/Expired error page; ExternalAccessDenied to sign-in with return | `packages/client/src/pages/PublicRoom/index.js:70-139`; `packages/client/src/store/PublicRoomStore.ts:371-409` | CODE-ONLY |
| Password form: empty refused, wrong password `Common:IncorrectPassword`, success continues | `packages/shared/pages/PublicRoom/PublicRoomPasswordForm/PublicRoomPasswordForm.test.tsx:110, 123, 147, 173`; `packages/client/src/pages/PublicRoom/sub-components/RoomPassword.js:40` | UNIT-CONFIRMED |
| Statuses returned for a key and the password check | `../server/openspec/specs/files-settings/spec.md` (`applyExternalSharePassword`), `../server/openspec/specs/file-sharing/spec.md` (`getExternalShareData`) | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| The quick copy-link button copies an expired primary link | Looks like a gap rather than a design: the row and the context menu refuse an expired link | `openspec/deviations.md` C1 |
| "Blocked by admin" shown while existing links are allowed | By design (decided with the design team); written into the spec as current behaviour | `openspec/deviations.md` C2 |
| The editor's share dialog (same component, editor variant) | Owned by `editor-integration` | `packages/doceditor/src/components/ShareDialog/ShareDialog.tsx` |
| The embed panel opened from Embed | Owned by `sdk-embedding` | `packages/client/src/components/panels/EmbeddingPanel` |
| Room link pages in the editor and the SDK (`/sdk/public-room/*`) | Owned by `editor-integration` and `sdk-embedding` | `packages/doceditor/src/app/(root)/page.tsx:161-170`; `packages/sdk/src/utils/middleware/handlePublicRoomValidation.ts` |
