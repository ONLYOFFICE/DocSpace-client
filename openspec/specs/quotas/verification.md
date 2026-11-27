# quotas — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `sm/` = `packages/client/src/pages/PortalSettings/categories/storage-management/`, `bar/` =
`packages/client/src/components/MainBar/`, `form` = `packages/shared/components/quota-form/QuotaForm.test.tsx`,
`server` = `../server/openspec/specs/quotas/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it), **UNIT-CONFIRMED** (a Vitest test asserts it),
**CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Storage management page** | | |
| Page loads its data, creation date and the room quota switch shown | `packages/client/__tests__/ai-services-disabled.spec.ts:119` | E2E-CONFIRMED |
| Active users, region on SaaS, used and total storage, sections diagram | `sm/index.js:79-90`; `sm/MainInfo.js:56-64`; `sm/StorageSpaceUsed.js:121-168`; `sm/sub-components/Diagram.js` | CODE-ONLY |
| Recalculation started when never done, busy while the server runs it, page reloaded when it ends, error shown | `packages/client/src/store/__tests__/StorageManagement.test.ts:141, 163, 179` | UNIT-CONFIRMED |
| Recalculate button busy and started by hand | `sm/sub-components/RecalculateButton.js:59-98` | CODE-ONLY |
| Recalculation on the server | `server`, "Quota recalculation" | SERVER-SPEC |
| **Quotas and statistics are a paid feature** | | |
| No top lists asked for on a free SaaS plan, asked for on a server installation | `packages/client/src/store/__tests__/StorageManagement.test.ts:126, 133` | UNIT-CONFIRMED |
| Paid badge, disabled switches | `sm/Quotas.js:83-85`; `sm/Statistics.js:104-128`; `sm/sub-components/QuotaPerItem.js:149-160` | CODE-ONLY |
| **Default quota of users and rooms** | | |
| Switch opens the form, save applies, off removes | `sm/sub-components/QuotaPerItem.js:75-105`; `sm/sub-components/QuotaPerUser.js:52-64`; `sm/sub-components/QuotaPerRoom.js:51-60` | CODE-ONLY |
| No room quota and no rooms top list while Rooms is off | `sm/Quotas.js:74`; `sm/Statistics.js:60` | CODE-ONLY |
| Settings need the portal-settings right | `server`, "Default user quota of the portal"; "Default room quota and default AI agent quota of the portal" | SERVER-SPEC |
| **Top lists of Storage management** | | |
| Rooms and users asked for by used space, largest first, one more than the five shown | `packages/client/src/store/__tests__/StorageManagement.test.ts:108` | UNIT-CONFIRMED |
| Five shown; Show more opens the sorted list | `sm/sub-components/UsersList.js:66-118`; `sm/sub-components/RoomsList.js:68-123` | CODE-ONLY |
| **Portal-wide quota of a server installation** | | |
| Manage link without a quota; total and menu with one; dialog needs a size | `sm/StorageSpaceUsed.js:74-165`; `packages/shared/dialogs/change-storage-quota/index.tsx:67-93, 144-172` | CODE-ONLY |
| Tenant quota on the server | `server`, "Portal-wide quota of a Standalone installation" | SERVER-SPEC |
| **The quota size form** | | |
| Empty for an unset quota; zero kept but not saved; unlimited; unchanged blocks Save; Enter; Cancel resets | `form:61, 70, 84, 109, 125, 140, 153, 163, 173` | UNIT-CONFIRMED |
| **Storage quota of accounts** | | |
| Owner and DocSpace admins with the statistics feature only | `packages/shared/store/CurrentQuotaStore.storageInfo.test.ts:70, 77, 81` | UNIT-CONFIRMED |
| Sort by storage where shown; quota filter only while a default is set; none in the guests filter | `packages/client/src/pages/Home/Section/Filter/__tests__/useContacts.options.test.tsx:114, 159, 168` | UNIT-CONFIRMED |
| Column and info panel | `packages/client/src/pages/Home/Section/ContactsBody/Users/RowView/UserContent.tsx:193`; `packages/client/src/pages/Home/InfoPanel/Body/views/Users/index.tsx:338` | CODE-ONLY |
| One account: nothing to change without a default; change opens the dialog; set to default only for a custom quota; disable; toasts; error | `packages/client/src/components/SpaceQuota/__tests__/SpaceQuota.test.tsx:95, 101, 110, 123, 135, 147` | UNIT-CONFIRMED |
| Group actions; the quota dialog | `packages/client/src/store/contacts/HeaderMenuStore.ts:212-236`; `packages/client/src/components/dialogs/ChangeQuotaDialog/index.js:74-83` | CODE-ONLY |
| Custom quota on the server | `server`, "Custom quota of an account" | SERVER-SPEC |
| **Storage column of the Rooms list** | | |
| Column, sort, quota filter | `packages/client/src/pages/Home/Section/Body/TableView/sub-components/RoomsRowData.js:216`; `packages/client/src/pages/Home/Section/Filter/index.js:1454-1456, 1635` | CODE-ONLY |
| **Limit bars** | | |
| Who sees which bar, one at a time, closed for good | `bar/Bar.js:145-219, 264-345, 400-525` | CODE-ONLY |
| Admin links to the tariff page or Storage management; others asked to contact an administrator | `bar/Bar.js:221-244`; `bar/QuotasBar.js:65-230` | CODE-ONLY |
| What each type is told of the portal quota | `server`, "Payment quota information trimmed by user type" | SERVER-SPEC |
| **Paid users limit** | | |
| Message with Billing or Payments, no link for a Room admin or on Community Edition | `packages/client/src/components/PaidQuotaLimitError/__tests__/PaidQuotaLimitError.test.tsx:75, 87, 93` | UNIT-CONFIRMED |
| Shown when a type or status change is refused over the limit | `packages/client/src/components/GlobalEvents/ChangeUserTypeEvent.tsx:112-120`; `packages/client/src/components/dialogs/ChangeUserStatusDialog/index.tsx:108-120` | CODE-ONLY |
| Limits on the server | `server`, "Count limits of the tariff" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Quota of a single room; quota warning on restore | Owned by `room-types` | `packages/client/src/store/FilesActionsStore.ts:771` |
| Quota warning and error pages of invitations | Owned by `invitations` | `packages/client/src/components/dialogs/InviteQuotaWarningDialog/` |
| Wallet low balance bar | Owned by `billing` | `bar/Bar.js:149-153, 401-407` |
| Quota warning of the data import | Owned by `data-import` | `packages/client/src/pages/PortalSettings/categories/data-import/components/SelectFileStep.tsx:455` |
| The combined rooms-and-storage bars return only after being closed | Suspected defect, `deviations.md` C4 | `bar/Bar.js:292-297` |
| Every failed type or status change reported as the paid users limit | Suspected defect, `deviations.md` C5 | `packages/client/src/components/GlobalEvents/ChangeUserTypeEvent.tsx:112-120` |
| Analytics events when a limit is reached | Not user-visible | `bar/Bar.js:529-544` |
