/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified sources of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// =============================================================================
// Security & host-sync e2e for (private).
//
// STATUS: all tests remain fixme — see per-test blocker comments.
//
// Common infrastructure blockers:
//   B. `asc_auth_key` cookie not seeded in the base fixture browser context.
//      The base.ts fixture does not set cookies; page.context().addCookies() must
//      be called before goto(), or a `cookieFixture` helper must be added.
//   C. CSP headers are set by packages/sdk/src/proxy.ts (the custom server.js),
//      NOT by createNextTestServer(). The test harness uses createNextTestServer
//      which bypasses proxy.ts entirely — CSP headers are absent on responses.
//      To test CSP: run `pnpm test:build && pnpm test:start` (port 5112) and
//      make direct HTTP requests via fetch/got in a non-browser test.
//   F. Multi-context (broadcast-lock): Playwright's `browser.newContext()` is
//      available but the base fixture creates a single page; a two-context test
//      needs a custom fixture that creates two pages in the same worker.
// =============================================================================

import { test } from "../fixtures/base";

test.describe("(private) — security headers (§17.3)", () => {
  test.fixme(
    "csp-headers: /sdk/private/* responds with wasm-unsafe-eval, no unsafe-eval, COOP/CORP/HSTS",
    async () => {
      // BLOCKER C:
      //   Content-Security-Policy headers are applied by packages/sdk/src/proxy.ts
      //   (the custom Next.js server that wraps Nginx CSP directives). The test
      //   harness (`createNextTestServer`) bypasses proxy.ts and creates a bare
      //   Next.js HTTP server — CSP response headers are absent.
      //
      //   To enable this test:
      //   1. Build the SDK: `pnpm test:build` (sets E2E_TEST=true).
      //   2. Start the custom server: `pnpm test:start` (port 5112).
      //   3. Replace the `createNextTestServer` fixture with a direct HTTP client
      //      that points at port 5112.
      //   4. Fetch GET /sdk/private and assert response.headers["content-security-policy"].
      //
      //   Alternatively, extract the CSP-building logic from proxy.ts into a pure
      //   function and unit-test it directly (no browser needed).
      //
      // GET /sdk/private and assert Content-Security-Policy contains
      // "script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'", NO 'unsafe-eval'
      // (prod), connect-src 'self' (no wildcard https:), frame-ancestors 'self',
      // Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Resource-Policy:
      // same-origin, Strict-Transport-Security present, X-Content-Type-Options:
      // nosniff. Reflects the accepted unsafe-inline decision (SECURITY.md §10).
    },
  );
});

test.describe("(private) — lock cleanup (§17.3)", () => {
  test.fixme(
    "abort-on-lock-upload: lock mid-upload aborts in-flight uploads within 500ms",
    async () => {
      // BLOCKER A + B:
      //   - Needs `asc_auth_key` cookie + identity unlock + an active upload.
      //   - The upload chunk endpoint (POST /files/{folderId}/session/{id}/upload)
      //     must be slowed down (introduce a deliberate delay in the MSW handler)
      //     so there is time to trigger a lock event before the chunk completes.
      //   - Lock must be triggered either via visibilitychange event
      //     (page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')))
      //     with document.hidden = true) or via the encryption store's lock() action.
      //   - After lock: verify UploadDataStore.uploading is empty within 500ms.
      //     This requires reading MobX store state via page.evaluate() or checking
      //     that no further POST chunk requests arrive (via handler.getRequests()).
      //
      // Start an encrypted upload, lock (visibilitychange:hidden or explicit
      // lock) → AbortOnLockEffect fans out abortAllCryptoOperations → 0 active
      // operations, no orphan upload session.
    },
  );

  test.fixme(
    "abort-on-lock-download: lock mid-download aborts the decrypt pipeline",
    async () => {
      // BLOCKER A + B:
      //   - Same auth/unlock prerequisites as abort-on-lock-upload.
      //   - The download chunk is streamed via ReadableStream; the abort signal
      //     from abortAllCryptoOperations cancels the stream controller.
      //   - Asserting abort requires either: (a) the download GET handler on MSW
      //     not receiving further reads after lock (via request log timing), or
      //     (b) page.evaluate() reading the encryption store's operationsCount.
      //   - The mock download handler must return a slow stream (use a
      //     ReadableStream-based Response with artificial delays between chunks).
      //
      // Analogous to upload — the download controller's signal aborts.
    },
  );

  test.fixme(
    "401-mid-upload: a 401 triggers lock + abortAll (+ BE session abort once available)",
    async () => {
      // BLOCKER A + B:
      //   - All unlock + cookie blockers.
      //   - The axios interceptor in the encryption layer calls lock() + abortAll()
      //     on a 401 response. To trigger this: configure the upload chunk handler
      //     to return 401 on the second chunk request.
      //   - Asserting that lock() was called requires reading the store state or
      //     checking that the PassphraseDialog appears (which is the locked UI).
      //   - "BE session abort" is not yet implemented (noted as future work).
      //
      // Mock a 401 during an upload chunk → axios interceptor lock() + abortAll.
    },
  );
});

test.describe("(private) — multi-tab & storage (§17.3)", () => {
  test.fixme(
    "broadcast-lock: lock in tab A locks tab B (same user) within 200ms",
    async () => {
      // BLOCKER B + F:
      //   - Needs two browser contexts (tab A and tab B) both authenticated with
      //     the same `asc_auth_key` cookie (same userId).
      //   - The BroadcastChannel name is `docspace-encryption-lock:${userId}`.
      //     Tab A posts a lock message; tab B's BroadcastChannel listener calls
      //     lock() on its own EncryptionSessionStore within 200ms.
      //   - To implement: create two Page instances from the same BrowserContext
      //     (same origin → same BroadcastChannel), both navigate to /sdk/private,
      //     unlock identity in tab A, lock via page.evaluate() in tab A,
      //     assert locked state in tab B.
      //
      // Two contexts, same user, both unlocked → lock A → B auto-locks via the
      // user-scoped BroadcastChannel.
    },
  );

  test.fixme(
    "broadcast-user-scope: User A lock does NOT lock User B's tab",
    async () => {
      // BLOCKER B + F:
      //   - Requires two browser contexts with DIFFERENT `asc_auth_key` values
      //     (different userId). Since BroadcastChannel is same-origin, two pages
      //     from different contexts but the same origin WILL receive each other's
      //     messages. The isolation is by channel name: `docspace-encryption-lock:${userId}`.
      //   - User A locks → User B's tab (different userId channel) must NOT lock.
      //   - Implementation: two BrowserContext instances (different cookies),
      //     both with MSW mocked to return different user IDs from GET /people/@self,
      //     both navigate to /sdk/private.
      //
      // Channel name is docspace-encryption-lock:${userId} — cross-user isolation.
    },
  );

  test.fixme(
    "auto-lock-tamper: an externally-written non-preset auto-lock value falls back to default",
    async () => {
      // BLOCKER B:
      //   - Needs `asc_auth_key` cookie + page navigation.
      //   - Before navigating, seed a bogus localStorage value via
      //     page.addInitScript() or page.evaluate():
      //     localStorage.setItem("auto-lock-preference:userId", "99999")
      //   - Navigate to /sdk/private; on boot the auto-lock preference store reads
      //     localStorage and rejects values not in the whitelist (AUTO_LOCK_PRESETS
      //     from auto-lock-preference.ts), falling back to the default preset.
      //   - Assert: the auto-lock selector in the settings shows the default value,
      //     not "99999". Requires the settings panel to be open (if it's accessible
      //     without unlock, otherwise also needs BLOCKER A).
      //
      // Write a bogus localStorage auto-lock value → read-time whitelist rejects
      // it and uses the default preset.
    },
  );

  test.fixme(
    "tofu-migration: existing v1 TOFU IDB entries do not raise spurious KeyChange dialogs",
    async () => {
      // BLOCKER A + B:
      //   - All unlock + cookie blockers.
      //   - v1 TOFU entries are stored in IndexedDB under a different schema than
      //     v2. Seeding v1 entries requires page.evaluate() to open the IDB and
      //     write the v1 format before the store initializes.
      //   - On room entry with the v2 identity unlocked, the TOFU store reads the
      //     IDB. If the v1 migration is correctly handled, the KeyChangeDialog
      //     must NOT appear (no spurious mismatch).
      //   - Assert: KeyChangeDialog is not visible within 2000ms of page load.
      //   - The TOFU store migration path is in tofu-store.ts; unit tests exist
      //     in __tests__/tofu-store.test.ts. This e2e test adds browser-context
      //     IDB validation on top of the unit tests.
      //
      // Seed the per-user TOFU IDB, enter (private) → no KeyChangeDialog.
    },
  );
});

test.describe("(private) — host frame-bridge sync (P2)", () => {
  test.fixme(
    "onNavigate: switching to archive inside the iframe updates the host ?section",
    async () => {
      // BLOCKER B + E (P2 feature — usePrivateFrameBridge not yet fully wired):
      //   - Needs `asc_auth_key` cookie.
      //   - The frame-bridge (usePrivateFrameBridge) posts postMessage events to
      //     the parent window when the iframe router navigates. This requires
      //     embedding /sdk/private in a parent <iframe> inside the Playwright page.
      //   - Implementation: use page.setContent() to create a parent HTML page
      //     with an <iframe src="/sdk/private">, then navigate inside the iframe
      //     to /sdk/private/archive, and listen for postMessage on the parent.
      //   - The bridge is a P2 feature tracked separately; this test should be
      //     enabled once usePrivateFrameBridge is implemented and merged.
      //
      // Embed /sdk/private in a parent page, navigate to /sdk/private/archive
      // inside the iframe → parent receives postMessage onEventReturn /
      // onNavigate with section:"archive". (usePrivateFrameBridge.)
    },
  );

  test.fixme(
    "navigateSection: parent posting {section:'archive'} routes the iframe without remount",
    async () => {
      // BLOCKER B + E (P2 feature — usePrivateFrameBridge not yet fully wired):
      //   - Same as onNavigate above.
      //   - The "without remount" assertion: check that the iframe's contentWindow
      //     identity (or a sentinel value set in page.addInitScript) persists
      //     across the navigation. In Playwright: record iframe.contentWindow before
      //     postMessage and assert it equals iframe.contentWindow after navigation.
      //   - Requires the SDK router to use router.replace() (not a full reload)
      //     when receiving the navigateSection postMessage.
      //
      // Parent posts navigateSection → iframe router.replace('/private/archive')
      // WITHOUT reloading the SDK (unlocked identity preserved). Asserts the
      // iframe element is not re-created and the encryption session survives.
    },
  );

  test.fixme(
    "onAppReady fires exactly once for the whole (private) group",
    async () => {
      // BLOCKER B + E (P2 feature):
      //   - Same frame-bridge prerequisites as above.
      //   - Count postMessage events with type === "onAppReady" across multiple
      //     in-iframe navigations (list → room → archive). Assert count === 1.
      //   - The bridge must be mounted at the persistent shell level (layout.tsx)
      //     so it survives route changes within the (private) group.
      //
      // Navigate list → room → archive within the iframe; the parent receives
      // onAppReady only once (bridge mounted at the persistent shell level).
    },
  );
});
