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
| A change shows the unsaved changes reminder and Cancel takes it back; Save reports the success message; a refused save reports an error and stays unsaved; each section keeps its own choice marked | `packages/client/__tests__/access-portal-settings.spec.ts:117, 140, 174, 195, 232, 253, 273` | E2E-CONFIRMED |
| **External sharing** | | |
| Initial state; restricted options appear; save; cancel; documents only; rooms only; default link type back | `packages/client/__tests__/access-control.spec.ts:61, 87, 133, 166, 200, 237, 276` | E2E-CONFIRMED |
| **Password strength** | | |
| 8 to 30 characters; upper case, digits, special characters | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/passwordStrength.test.tsx:99, 106` | UNIT-CONFIRMED |
| Password policy on the server | `server`, "Password policy"; "Changing the password policy" | SERVER-SPEC |
| **Two-factor authentication** | | |
| By app saved goes to the server's confirmation link; Disabled saved stays on the page; Cancel restores; an unavailable app method offered disabled | `packages/client/__tests__/access-portal-settings.spec.ts:117, 140` | E2E-CONFIRMED |
| By SMS not offered | `ap/tfa.js:278` (the option is commented out) | CODE-ONLY |
| Setup page returned by the server | `server`, "Changing the two-factor policy"; "Policy change with a confirmation link" | SERVER-SPEC |
| **Trusted mail domains** | | |
| Three modes; checked on leaving; malformed and repeated domains block saving; well-formed ones saved | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/trustedMail.test.tsx:92, 100, 119, 133, 145` | UNIT-CONFIRMED |
| Trusted domains on the server | `serverSettings`, "Trusted mail domains" | SERVER-SPEC |
| **Developer Tools access** | | |
| Disabled saved as limited access for users | `packages/client/__tests__/access-portal-settings.spec.ts:174` | E2E-CONFIRMED |
| The rule on the server | `../server/openspec/specs/webhooks-and-api-keys/spec.md`, "Developer Tools access rule" | SERVER-SPEC |
| **Invitation settings** | | |
| Contacts and guests checkboxes saved; Cancel restores them | `packages/client/__tests__/access-portal-settings.spec.ts:195` | E2E-CONFIRMED |
| Invitation settings on the server | `../server/openspec/specs/invitations/spec.md`, "Invitation settings" | SERVER-SPEC |
| **IP security** | | |
| Saving with Disabled clears the allowed list | `packages/client/__tests__/ip-security.spec.ts:55` | E2E-CONFIRMED |
| Warning when enabled; IPv4 check and repeated address block saving; saved with a toast; Disabled saved without the list | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/ipSecurity.test.tsx:97, 107, 118, 129, 147` | UNIT-CONFIRMED |
| IP restrictions on the server | `server`, "Saving IP restrictions"; "Enforcing IP restrictions" | SERVER-SPEC |
| **Brute force protection** | | |
| Whole numbers of up to four digits; an empty attempts count, check period or blocking time (or a zero one) marked and blocking saving; a refused save reported with the fields editable again; saved as numbers; Restore to default, disabled at the defaults | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/bruteForceProtection.test.tsx:128, 138, 152, 162, 177, 192, 209, 225` | UNIT-CONFIRMED |
| Limits on the server | `server`, "Failed sign-in limits"; "Range of the sign-in limits" | SERVER-SPEC |
| **Administrator message** | | |
| Enabled saved | `packages/client/__tests__/access-portal-settings.spec.ts:232` | E2E-CONFIRMED |
| **Session lifetime** | | |
| Sign-out warning; positive whole number of at most four digits; empty marked and blocking saving; saved; Disabled keeps the server's minutes | `packages/client/src/pages/PortalSettings/categories/security/access-portal/__tests__/sessionLifetime.test.tsx:94, 102, 116, 128, 144` | UNIT-CONFIRMED |
| Lifetime on the server | `serverSettings`, "Changing the session lifetime"; "Sessions after a lifetime change" | SERVER-SPEC |
| **Single sign-on** | | |
| Switching on opens the provider settings; saving waits for the entity ID and the sign-on and sign-out addresses, then sends them with the field mapping; Default settings resets at once with SSO off and after a confirmation with SSO on, which turns it off | `packages/client/__tests__/sso-settings.spec.ts:230, 281, 299` | E2E-CONFIRMED |
| Provider from its metadata address (a malformed address marked, a failed load reported) or XML file (another type not sent), filling the addresses and the signing certificate; provider and service certificates validated, listed, refused a second time, removed, a generated one saved; type of new users among the types the administrator may grant; with SSO on the metadata shown and downloaded in a new tab | `packages/client/__tests__/sso-settings.spec.ts:330, 380, 413, 470, 511, 534` | E2E-CONFIRMED |
| Disabled with the paid badge without the feature | `packages/client/__tests__/sso-settings.spec.ts:203` | E2E-CONFIRMED |
| Single sign-on on the server | `server`, "Saving single sign-on settings"; "Required single sign-on fields"; "Switching single sign-on off" | SERVER-SPEC |
| **LDAP** | | |
| Switching on and saving waits for the server and the user DN, then sends them without the protocol; Sync users shows the progress to the end; Auto sync shows the next run in UTC and saves the schedule | `packages/client/__tests__/ldap-settings.spec.ts:207, 247, 275` | E2E-CONFIRMED |
| Group membership makes its fields editable, marks them when empty and blocks saving, then sends them; authentication blocks saving without the login and password, then sends them; a certificate to confirm shows its details and errors, and confirming saves again with the certificate and its hash accepted | `packages/client/__tests__/ldap-settings.spec.ts:301, 351, 388` | E2E-CONFIRMED |
| Disabled with the paid badge without the feature | `packages/client/__tests__/ldap-settings.spec.ts:185` | E2E-CONFIRMED |
| **Third-party services** | | |
| A service with keys and one fixed by the installation shown on, the fixed one locked; switching on waits for every key and sends them without spaces; switching off clears the keys; without the feature the paid services follow the Business plan heading with the paid badge and stay off in the cloud, while a server installation can still switch them on | `packages/client/__tests__/third-party-services.spec.ts:196, 223, 252, 273, 317` | E2E-CONFIRMED |
| Request for a missing integration mails the support address | `int/ThirdPartyServicesSettings/index.js:156, 198` | CODE-ONLY |
| External database: fields shown by the chosen options | `int/ThirdPartyServicesSettings/sub-components/ExternalDbModal/__tests__/ExternalDbField.utils.test.ts` | UNIT-CONFIRMED |
| External database: the fields of its type; a failed Test connection reported and blocking Enable; saved after a successful test, with only the fields of its type | `packages/client/__tests__/third-party-services.spec.ts:354, 427` | E2E-CONFIRMED |
| Keys on the server; external database test | `server`, "Third-party service keys"; "Testing an external database connection" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| What restricted external sharing does to links | Owned by `shared-links` | `external-sharing-share-panel.spec.ts` |
| Developer Tools and Docs Connect by user type | Owned by `webhooks-and-api-keys` | `packages/client/__tests__/dev-tools-access.spec.ts` |
| Login history and audit trail | Owned by `history-and-audit` | `packages/client/src/pages/PortalSettings/categories/security/login-history/` |
| SMTP, Document Server, plugins | Owned by `notifications`, `files-settings`, `plugins` | `int/SMTPSettings/`; `int/DocumentService/`; `int/Plugins/` |
| Adding and deleting a field from the keyboard in the trusted domains and allowed IP lists | Keyboard of the shared field list, not a setting | `packages/client/src/pages/PortalSettings/categories/security/sub-components/__tests__/user-fields.test.tsx` |
