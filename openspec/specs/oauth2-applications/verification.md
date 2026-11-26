# oauth2-applications — verification

> Written 2026-11-26 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call of `packages/shared/api/oauth` uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root;
login E2E paths omit `packages/login/__tests__/`. Shorthands: `store` = `packages/client/src/store/OAuthStore.ts`,
`oauth/` = `packages/client/src/pages/PortalSettings/categories/developer-tools/OAuth/`, `apps/` =
`packages/client/src/pages/Profile/Section/Body/sub-components/authorized-apps/`, `server` =
`../server/openspec/specs/oauth2-applications/spec.md`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, mostly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Applications list** | | |
| List, empty screen, row and group actions; token actions off for a disabled application | `oauth/index.tsx`; `oauth/sub-components/EmptyScreen.tsx`; `store:670-935` | CODE-ONLY |
| Which applications a user sees | `server`, "Which clients a caller sees"; "Guests hold no clients" | SERVER-SPEC |
| **Registering and editing an application** | | |
| Fields, scopes, PKCE, support and legal addresses; client ID and secret on edit | `oauth/sub-components/ClientForm/components/BasicBlock.tsx`; `.../ScopesBlock.tsx`; `.../SupportBlock.tsx`; `.../ClientBlock.tsx` | CODE-ONLY |
| Addresses without spaces, query or fragment; short name | `oauth/sub-components/ClientForm/ClientForm.utils.ts:38-66`; `oauth/sub-components/ClientForm/components/MultiInputGroup.tsx:92-139` | CODE-ONLY |
| Focus back to the field after adding from the keyboard | `oauth/sub-components/ClientForm/components/__tests__/MultiInputGroup.test.tsx:62` | UNIT-CONFIRMED |
| Field rules on the server | `server`, "Client field validation on create"; "Updating a client" | SERVER-SPEC |
| **Resetting the secret, disabling and deleting** | | |
| Reset warning and new secret in the form; disable and delete confirmations | `oauth/sub-components/ResetDialog.tsx:58-75`; `store:486-499`; `oauth/sub-components/DisableDialog.tsx`; `oauth/sub-components/DeleteDialog.tsx` | CODE-ONLY |
| Secret, activation and deletion on the server | `server`, "Regenerating a client secret"; "Activating and deactivating a client"; "Deleting a client" | SERVER-SPEC |
| **Developer token** | | |
| Generate with scopes and expiry, copy, revoke, invalid token | `oauth/sub-components/GenerateDeveloperTokenDialog.tsx`; `oauth/sub-components/RevokeDeveloperTokenDialog.tsx` | CODE-ONLY |
| **Authorized applications in the profile** | | |
| List, empty screen, open site, info, revoke one or several | `apps/index.tsx`; `apps/sub-components/RevokeDialog.tsx`; `store:755-797, 896-906` | CODE-ONLY |
| Consents on the server | `server`, "Listing a user's consents"; "Revoking a consent" | SERVER-SPEC |
| **Signing in for an application** | | |
| Login page; portal list; back from the list | `oauth2.spec.ts:42, 52, 77` | E2E-CONFIRMED |
| Consent loader while the signature is pending; consent with and without a pending redirect | `oauth2Consent.spec.ts:50, 70, 91` | E2E-CONFIRMED |
| Allow, Deny, sign in as another user | `packages/login/src/app/(root)/consent/page.client.tsx:166-250` | CODE-ONLY |
| Authorization and consent on the server | `server`, "Authorization request"; "Submitting a consent" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| Who reaches Developer Tools and the effect of the restriction on applications | Owned by `webhooks-and-api-keys`; server side in `server`, "Developer tools setting gates applications" | `packages/client/__tests__/dev-tools-access.spec.ts` |
| OAuth token of an embedded frame | Owned by `sdk-embedding` | `packages/shared/store/AuthStore.oauth.test.ts` |
