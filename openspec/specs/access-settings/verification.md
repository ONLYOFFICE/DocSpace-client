# access-settings — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root.
Shorthands: `ap/` = `packages/client/src/pages/PortalSettings/categories/security/access-portal/`, `int/` =
`packages/client/src/pages/PortalSettings/categories/integration/`, `server` =
`../server/openspec/specs/access-settings/spec.md`, `serverSettings` = `../server/openspec/specs/portal-settings/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, partly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **The Access portal page** | | |
| Desktop sections with descriptions and Learn more; phone list | `ap/index.js:142-373`; `ap/mobileView.js:50-146` | CODE-ONLY |
| Section page widened to a desktop goes back to the overview | `ap/tfa.js:98-102`; `ap/sessionLifetime.js:92-146` | CODE-ONLY |
| Save, success toast, unsaved changes reminder | `ap/tfa.js:209-230, 295-305` | CODE-ONLY |
| **External sharing** | | |
| Initial state; restricted options appear; save; cancel; documents only; rooms only; default link type back | `packages/client/__tests__/access-control.spec.ts:61, 87, 133, 166, 200, 237, 276` | E2E-CONFIRMED |
| **Password strength** | | |
| 8 to 30 characters; upper case, digits, special characters | `ap/passwordStrength.js:209-320` | CODE-ONLY |
| Password policy on the server | `server`, "Password policy"; "Changing the password policy" | SERVER-SPEC |
| **Two-factor authentication** | | |
| Methods offered by availability; setup page after saving | `ap/tfa.js:209-230, 270-290` | CODE-ONLY |
| Setup page returned by the server | `server`, "Changing the two-factor policy"; "Policy change with a confirmation link" | SERVER-SPEC |
| **Trusted mail domains** | | |
| Three modes; checked on leaving; malformed and repeated domains block saving | `ap/trustedMail.js:160-251, 300-338` | CODE-ONLY |
| Trusted domains on the server | `serverSettings`, "Trusted mail domains" | SERVER-SPEC |
| **Developer Tools access** | | |
| Enabled and Disabled; save | `ap/devToolsAccess.tsx:165-240` | CODE-ONLY |
| The rule on the server | `../server/openspec/specs/webhooks-and-api-keys/spec.md`, "Developer Tools access rule" | SERVER-SPEC |
| **Invitation settings** | | |
| Contacts and guests checkboxes | `ap/invitationSettings.tsx:215-335` | CODE-ONLY |
| Invitation settings on the server | `../server/openspec/specs/invitations/spec.md`, "Invitation settings" | SERVER-SPEC |
| **IP security** | | |
| Saving with Disabled clears the allowed list | `packages/client/__tests__/ip-security.spec.ts:55` | E2E-CONFIRMED |
| IPv4 check, repeated address, warning | `ap/ipSecurity.js:77-78, 190-255, 300-347` | CODE-ONLY |
| IP restrictions on the server | `server`, "Saving IP restrictions"; "Enforcing IP restrictions" | SERVER-SPEC |
| **Brute force protection** | | |
| Whole numbers of up to four digits; empty marked; Restore to default | `ap/bruteForceProtection.js:150-156, 209-280, 372-387` | CODE-ONLY |
| Limits on the server | `server`, "Failed sign-in limits"; "Range of the sign-in limits" | SERVER-SPEC |
| **Administrator message** | | |
| Enabled and Disabled; save | `ap/adminMessage.js:120-205` | CODE-ONLY |
| **Session lifetime** | | |
| Positive, at most four digits; sign-out warning | `ap/sessionLifetime.js:200-233, 250-310` | CODE-ONLY |
| Lifetime on the server | `serverSettings`, "Changing the session lifetime"; "Sessions after a lifetime change" | SERVER-SPEC |
| **Single sign-on** | | |
| Provider, certificates, mapping, users type, toggle, save and reset, metadata | `int/SingleSignOn/index.js:84-140`; `int/SingleSignOn/SubmitButton.js:54-80` | CODE-ONLY |
| Disabled with the paid badge without the feature | `int/SingleSignOn/sub-components/ToggleSSO.js:46-95`; `int/SingleSignOn/ProviderMetadata.js:116` | CODE-ONLY |
| Single sign-on on the server | `server`, "Saving single sign-on settings"; "Required single sign-on fields"; "Switching single sign-on off" | SERVER-SPEC |
| **LDAP** | | |
| Settings, manual sync with progress, scheduled sync and next run | `int/LDAP/index.js:137-152`; `int/LDAP/sub-components/SyncContainer.js:85-175` | CODE-ONLY |
| Disabled with the paid badge without the feature | `int/LDAP/sub-components/ToggleLDAP.js:70-100`; `packages/client/src/store/LdapFormStore.ts` (`isUIDisabled`) | CODE-ONLY |
| **Third-party services** | | |
| Services with keys, request block, Business plan badge | `int/ThirdPartyServicesSettings/index.js:160-250` | CODE-ONLY |
| External database: fields shown by the chosen options | `int/ThirdPartyServicesSettings/sub-components/ExternalDbModal/__tests__/ExternalDbField.utils.test.ts` | UNIT-CONFIRMED |
| Test connection of an external database | `int/ThirdPartyServicesSettings/sub-components/ExternalDbModal/ExternalDbModal.tsx` | CODE-ONLY |
| Keys on the server; external database test | `server`, "Third-party service keys"; "Testing an external database connection" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| What restricted external sharing does to links | Owned by `shared-links` | `external-sharing-share-panel.spec.ts` |
| Developer Tools and Docs Connect by user type | Owned by `webhooks-and-api-keys` | `packages/client/__tests__/dev-tools-access.spec.ts` |
| Login history and audit trail | Owned by `history-and-audit` | `packages/client/src/pages/PortalSettings/categories/security/login-history/` |
| SMTP, Document Server, plugins | Owned by `notifications`, `files-settings`, `plugins` | `int/SMTPSettings/`; `int/DocumentService/`; `int/Plugins/` |
| The fields of the user list of the security pages | Shared component of the history pages | `packages/client/src/pages/PortalSettings/categories/security/sub-components/__tests__/user-fields.test.tsx` |
