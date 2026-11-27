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
| 8 to 30 characters; upper case, digits, special characters | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/passwordStrength.test.tsx:99, 106` | UNIT-CONFIRMED |
| Password policy on the server | `server`, "Password policy"; "Changing the password policy" | SERVER-SPEC |
| **Two-factor authentication** | | |
| Methods offered by availability; setup page after saving | `ap/tfa.js:209-230, 270-290` | CODE-ONLY |
| Setup page returned by the server | `server`, "Changing the two-factor policy"; "Policy change with a confirmation link" | SERVER-SPEC |
| **Trusted mail domains** | | |
| Three modes; checked on leaving; malformed and repeated domains block saving; well-formed ones saved | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/trustedMail.test.tsx:92, 100, 119, 133, 145` | UNIT-CONFIRMED |
| Trusted domains on the server | `serverSettings`, "Trusted mail domains" | SERVER-SPEC |
| **Developer Tools access** | | |
| Enabled and Disabled; save | `ap/devToolsAccess.tsx:165-240` | CODE-ONLY |
| The rule on the server | `../server/openspec/specs/webhooks-and-api-keys/spec.md`, "Developer Tools access rule" | SERVER-SPEC |
| **Invitation settings** | | |
| Contacts and guests checkboxes | `ap/invitationSettings.tsx:215-335` | CODE-ONLY |
| Invitation settings on the server | `../server/openspec/specs/invitations/spec.md`, "Invitation settings" | SERVER-SPEC |
| **IP security** | | |
| Saving with Disabled clears the allowed list | `packages/client/__tests__/ip-security.spec.ts:55` | E2E-CONFIRMED |
| Warning when enabled; IPv4 check and repeated address block saving; saved with a toast; Disabled saved without the list | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/ipSecurity.test.tsx:97, 107, 118, 129, 147` | UNIT-CONFIRMED |
| IP restrictions on the server | `server`, "Saving IP restrictions"; "Enforcing IP restrictions" | SERVER-SPEC |
| **Brute force protection** | | |
| Whole numbers of up to four digits; an empty attempts count marked and, with an empty check period, blocking saving; saved as numbers; Restore to default, disabled at the defaults | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/bruteForceProtection.test.tsx:124, 134, 148, 158, 175, 191` | UNIT-CONFIRMED || Limits on the server | `server`, "Failed sign-in limits"; "Range of the sign-in limits" | SERVER-SPEC |
| **Administrator message** | | |
| Enabled and Disabled; save | `ap/adminMessage.js:120-205` | CODE-ONLY |
| **Session lifetime** | | |
| Sign-out warning; positive whole number of at most four digits; empty marked and blocking saving; saved; Disabled keeps the server's minutes | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/sessionLifetime.test.tsx:94, 102, 116, 128, 144` | UNIT-CONFIRMED |
| Lifetime on the server | `serverSettings`, "Changing the session lifetime"; "Sessions after a lifetime change" | SERVER-SPEC |
| **Single sign-on** | | |
| Switching on opens the provider settings; saving waits for the entity ID and the sign-on and sign-out addresses, then sends them with the field mapping; Default settings resets at once with SSO off and after a confirmation with SSO on, which turns it off | `packages/client/__tests__/sso-settings.spec.ts:158, 209, 227` | E2E-CONFIRMED |
| Provider from its metadata file or address, certificates, users type, metadata download | `int/SingleSignOn/index.js:84-140`; `int/SingleSignOn/sub-components/UploadXML.js`; `int/SingleSignOn/Certificates.js` | CODE-ONLY |
| Disabled with the paid badge without the feature | `packages/client/__tests__/sso-settings.spec.ts:131` | E2E-CONFIRMED |
| Single sign-on on the server | `server`, "Saving single sign-on settings"; "Required single sign-on fields"; "Switching single sign-on off" | SERVER-SPEC |
| **LDAP** | | |
| Switching on and saving waits for the server and the user DN, then sends them without the protocol; Sync users shows the progress to the end; Auto sync shows the next run in UTC and saves the schedule | `packages/client/__tests__/ldap-settings.spec.ts:167, 207, 235` | E2E-CONFIRMED |
| Group membership, authentication, certificate confirmation | `int/LDAP/sub-components/GroupMembership.js`; `int/LDAP/sub-components/AuthenticationContainer.js`; `int/LDAP/sub-components/CertificateDialog.js` | CODE-ONLY |
| Disabled with the paid badge without the feature | `packages/client/__tests__/ldap-settings.spec.ts:145` | E2E-CONFIRMED |
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
| Adding and deleting a field from the keyboard in the trusted domains and allowed IP lists | Keyboard of the shared field list, not a setting | `packages/client/src/pages/PortalSettings/categories/security/sub-components/__tests__/user-fields.test.tsx` |
| An empty blocking time does not block saving; a failed save leaves the brute force page busy | Suspected defects, `deviations.md` C6, C7 | `ap/bruteForceProtection.js:154, 246, 271-273` |
