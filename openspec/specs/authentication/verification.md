# authentication — verification

> Written 2026-11-25 on `feature/openspec-client-specs` (base `release/v4.1.0` at `f588b7668dd`). No test was run
> for this file: an E2E or unit citation means the cited test asserts the claim, not that it passed on this commit.
> The operationIds of Purpose were checked against `../server/sdk/docspace-api-spec/docspace-backend.yaml`
> (submodule `ce37da4`) by the route each client call uses.

Every requirement and scenario of `spec.md`, with where it is shown. Paths are relative to the repository root; login
E2E paths omit `packages/login/__tests__/`, client E2E paths are given in full. Shorthands: `form` =
`packages/login/src/components/LoginForm/index.tsx`, `confirm/` = `packages/login/src/app/(root)/confirm/`, `route` =
`packages/shared/routes/Route.private.referenceUrl.test.tsx`.

Status: **E2E-CONFIRMED** (a Playwright test asserts it, mostly by screenshot), **UNIT-CONFIRMED** (a Vitest test
asserts it), **CODE-ONLY** (read from the code, no test), **SERVER-SPEC** (the server decides it; cited from
`../server/openspec/specs`).

## Requirement rows

| Claim | Source | Status |
|---|---|---|
| **Signing in with email and password** | | |
| Form; authentication failed; empty, malformed and wrong-domain email | `login.spec.ts:46, 92, 115, 131, 147` | E2E-CONFIRMED |
| Tab order | `login.spec.ts:63` | E2E-CONFIRMED |
| Remember me decides a session-only sign-in | `form:400-458` | CODE-ONLY |
| **LDAP and SSO sign-in** | | |
| LDAP option; SSO button; redirect unless skipped | `packages/login/src/components/LoginForm/sub-components/LDAPContainer.tsx`; `packages/login/src/app/(root)/page.tsx:63-96` | CODE-ONLY |
| **Third-party sign-in** | | |
| Buttons by capability and providers; failure as an error | `packages/login/src/app/(root)/page.tsx:72-84`; `form:271-330, 340-341` | CODE-ONLY |
| Linking a provider account | `../server/openspec/specs/people-and-groups/spec.md`, "Linking a third-party account" | SERVER-SPEC |
| **Captcha after repeated failures** | | |
| hCaptcha shown after 403 | `login.spec.ts:215` | E2E-CONFIRMED |
| Next attempt waits for the captcha | `form:400-406` | CODE-ONLY |
| **Requests from the login page** | | |
| Registration button; access recovery | `login.spec.ts:163, 188` | E2E-CONFIRMED |
| Password recovery dialog | `packages/login/src/components/LoginForm/sub-components/ForgotPasswordModalDialog.tsx` | CODE-ONLY |
| **Where a sign-in leads** | | |
| Room remembered for the same user; tab returns to its room; another user's page not opened | `packages/client/__tests__/relogin-return.spec.ts:107, 139, 157` | E2E-CONFIRMED |
| Reference page, same user, once | `route:118, 126, 135, 144, 161, 242` | UNIT-CONFIRMED |
| Two-factor page, portal root; `referenceUrl` only within the portal | `form:479-523` | CODE-ONLY |
| **Signing in elsewhere** | | |
| Login tab opens the portal, stays while dead; public-room popup stays | `login-elsewhere.spec.ts:53, 68, 89` | E2E-CONFIRMED |
| Logout in another tab | `packages/shared/store/AuthStore.logout.test.ts:91, 104` | UNIT-CONFIRMED |
| **Confirmation links** | | |
| Invalid, expired, paid users limit, quota; invite pages | `packages/login/src/components/ConfirmRoute.tsx:110-172` | CODE-ONLY |
| Expired password link | `passwordChange.spec.ts:132` | E2E-CONFIRMED |
| Link rules on the server | `../server/openspec/specs/portal-lifecycle/spec.md`, "Confirmation links of the lifecycle flows" | SERVER-SPEC |
| **Sign-in by a confirmation link** | | |
| Success; with reference URL; with file handler; with two-factor | `auth.spec.ts:90, 106, 128, 154` | E2E-CONFIRMED |
| Download page for a file download | `confirm/Auth/page.client.tsx:68-180` | CODE-ONLY |
| **Account activation** | | |
| Render, success, error, tariff limit, user existed, quota failed | `activation.spec.ts:76, 93, 122, 144, 161, 178` | E2E-CONFIRMED |
| **Email confirmation and change** | | |
| Email activation success and error | `emailActivation.spec.ts:64, 84` | E2E-CONFIRMED |
| Email change without a session, success, error | `emailChange.spec.ts:72, 82, 104` | E2E-CONFIRMED |
| Login page with the confirmation message; profile with the success marker | `confirm/EmailActivation/`; `confirm/EmailChange/`; `form:361-380` | CODE-ONLY |
| Email change rules | `../server/openspec/specs/people-and-groups/spec.md`, "Applying an email change from a link" | SERVER-SPEC |
| **Password change** | | |
| Render, success, error, invalid, expired, user excluded | `passwordChange.spec.ts:68, 78, 102, 115, 132, 149` | E2E-CONFIRMED |
| Login page with `ChangePasswordSuccess` | `form:382-387` | CODE-ONLY |
| **Two-factor authentication** | | |
| Setup render, success, with link data, not validated | `tfaActivation.spec.ts:74, 84, 108, 130` | E2E-CONFIRMED |
| Code render, success, not validated, room after the code | `tfaAuth.spec.ts:74, 84, 106, 128` | E2E-CONFIRMED |
| Second factor on the server | `../server/openspec/specs/access-settings/spec.md`, "Sign-in with a second-factor code" | SERVER-SPEC |
| **Profile removal confirmation** | | |
| Render and success | `profileRemove.spec.ts:64, 74` | E2E-CONFIRMED |
| Self-deletion on the server | `../server/openspec/specs/people-and-groups/spec.md`, "Closing one's own profile through the confirmation link" | SERVER-SPEC |

## Left out of the spec

| What | Why | Where |
|---|---|---|
| OAuth 2.0 sign-in, portal list and consent | Owned by `oauth2-applications` | `oauth2.spec.ts`; `oauth2Consent.spec.ts` |
| Joining by invitation; guest share approval | Owned by `invitations` | `linkInvite.spec.ts`; `empInvite.spec.ts`; `guestShareLink.spec.ts` |
| Portal suspend, continue, remove, owner change links; wizard | Owned by `portal-lifecycle` | `portalSuspend.spec.ts`; `portalContinue.spec.ts`; `portalRemove.spec.ts`; `portalOwnerChange.spec.ts`; `wizard.spec.ts` |
| Chunk retry of the login app; portal not found | Owned by `app-shell` | `chunk-retry.spec.ts`; `portalNotFound.spec.ts` |
| Phone activation page | No test and no entry point found in the client | `confirm/PhoneActivation/` |
