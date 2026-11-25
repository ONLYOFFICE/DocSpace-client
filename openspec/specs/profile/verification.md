# profile — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; E2E
paths omit `packages/client/__tests__/`. Shorthands: `body/` = `packages/client/src/pages/Profile/Section/Body/`,
`sub/` = `body/sub-components/`, `dialogs/` = `packages/client/src/components/dialogs/`, `server` =
`../server/openspec/specs/people-and-groups/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Tabs of the profile** | | |
| Tab list; Authorized apps with an identity server | `body/index.tsx:205-260` | CODE-ONLY |
| Tab opened from the address; first tab for a missing portal tab | `body/__tests__/profileTabs.test.ts:47, 89, 100, 107` | UNIT-CONFIRMED |
| Interface theme, file management, notifications and authorized apps tabs open | `profile.spec.ts:190, 299, 315, 367, 391` | E2E-CONFIRMED |
| **Tabs added by plugins** | | |
| After the portal's tabs, kept apart from a same-named portal tab | `body/__tests__/ProfileTabs.test.tsx:259, 268`; `body/__tests__/profileTabs.test.ts:55` | UNIT-CONFIRMED |
| Skeleton while loading, bounded wait, unknown plugin tab to Login | `body/__tests__/ProfileTabs.test.tsx:275, 282, 302`; `body/__tests__/profileTabs.test.ts:114` | UNIT-CONFIRMED |
| **The profile block** | | |
| Photo, name, email, password, type, language | `profile.spec.ts:66` | E2E-CONFIRMED |
| Edit buttons only without SSO or LDAP; marks with tooltips; no photo editing for LDAP | `sub/main-profile/index.tsx:395-579` | CODE-ONLY |
| **Changing one's own name, email and password** | | |
| Name validated, saved with a toast | `dialogs/ChangeNameDialog/` | CODE-ONLY |
| Email validated and instructions sent; password instructions sent | `dialogs/ChangeEmailDialog/index.js:100, 197`; `dialogs/ChangePasswordDialog/index.js:75` | CODE-ONLY |
| Success toast after a confirmed email change | `body/index.tsx:160-175` | CODE-ONLY |
| Email change rules | `server`, "Who may start an email change"; "Validation of an email change" | SERVER-SPEC |
| **Unconfirmed email** | | |
| Mark, tooltip, Send again with a toast | `sub/main-profile/index.tsx:274-276, 510-559` | CODE-ONLY |
| **Interface language** | | |
| Saved and switched; same language ignored; error shown | `sub/main-profile/index.tsx:365-384` | CODE-ONLY |
| Language rules | `server`, "Interface language of a profile" | SERVER-SPEC |
| **Profile photo** | | |
| Upload and save with a toast, failure as an error | `dialogs/AvatarEditorDialog/index.js:84-111` | CODE-ONLY |
| Delete the photo | `packages/client/src/store/contacts/TargetUserStore.ts:147` | CODE-ONLY |
| Photo rules | `server`, "Uploading a photo"; "Deleting a photo" | SERVER-SPEC |
| **Deleting one's own profile** | | |
| Menu entry; Owner gets the restriction, others the email confirmation | `packages/client/src/pages/Profile/Section/Header/useProfileHeader.tsx:118-164, 212-229` | CODE-ONLY |
| Self-deletion on the server | `server`, "Asking to delete one's own profile" | SERVER-SPEC |
| **Two-factor authentication on the Login tab** | | |
| Block shown with two-factor on | `profile.spec.ts:116`; `sub/login/index.tsx:47-55` | E2E-CONFIRMED |
| Backup codes dialog | `profile.spec.ts:138` | E2E-CONFIRMED |
| Reset application dialog | `profile.spec.ts:164` | E2E-CONFIRMED |
| Reset confirmed with a toast, then the server's address | `dialogs/ResetApplicationDialog/index.js:44-54` | CODE-ONLY |
| Backup codes on the server | `../server/openspec/specs/access-settings/spec.md`, "Backup codes" | SERVER-SPEC |
| **Linked social accounts** | | |
| Block shown with providers | `profile.spec.ts:97` | E2E-CONFIRMED |
| Hidden without third-party sign-in or providers; connect, disconnect, already used | `sub/login/social-networks/index.tsx:68-172` | CODE-ONLY |
| Linking on the server | `server`, "Linking a third-party account"; "Unlinking a third-party account" | SERVER-SPEC |
| **Active sessions** | | |
| Current session marked, others closable | `sub/login/active-session/SessionsTable/TableView/SessionsTableRow.js:59-125` | CODE-ONLY |
| Close one, close all but this, close all with a password change | `sub/login/active-session/index.js:81-124`; `dialogs/LogoutAllSessionDialog/index.js:50-93` | CODE-ONLY |
| **Interface theme** | | |
| Light, dark, system; desktop label in the desktop app; saved at once | `sub/interface-theme/index.tsx:80-166` | CODE-ONLY |
| Dark theme applied | `profile.spec.ts:331` | E2E-CONFIRMED |
| Theme on the server | `server`, "Theme of an account" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Notifications tab and the Telegram channel | Owned by `notifications` | `profile.spec.ts:190-273` |
| File management tab and the default page setting | Owned by `files-settings` | `profile.spec.ts:299`; `sub/file-management/sub-components/__tests__/DefaultPageSetting.test.tsx` |
| Authorized apps tab | Owned by `oauth2-applications` | `profile.spec.ts:367, 391` |
| Keys management tab | Owned by `private-rooms/key-management` | `body/__tests__/ProfileTabs.test.tsx:186-255`; `sub/keys-management/` |
| Profile menu entries opening one tab on a middle click | Owned by `app-shell` | `profile-menu-links.spec.ts:56` |
| The language change scenario | Its E2E is commented out | `profile.spec.ts:76-95` |
