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
 * The interactive user interfaces in modified versions of the Program
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
// SCAFFOLDING — security & host-sync e2e for (private). All `test.fixme` until
// the prerequisites in private-rooms.spec.ts are wired. See §17.3 of
// docs/encryption/SDK_PRIVATE_PLAN.md and the P2 frame-bridge in
// SDK_PRIVATE_DASHBOARD_PLAN.md.
//
// NOTE on CSP tests: the response-header CSP comes from packages/sdk/src/proxy.ts
// (the custom server), not from the Next test server used by createNextTestServer.
// The csp-headers test must run against `test:start` (server.js) or assert via a
// direct request to the proxy — wire this before un-fixme-ing it.
// =============================================================================

import { test } from "../fixtures/base";

test.describe("(private) — security headers (§17.3)", () => {
  test.fixme(
    "csp-headers: /sdk/private/* responds with wasm-unsafe-eval, no unsafe-eval, COOP/CORP/HSTS",
    async () => {
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
      // Start an encrypted upload, lock (visibilitychange:hidden or explicit
      // lock) → AbortOnLockEffect fans out abortAllCryptoOperations → 0 active
      // operations, no orphan upload session.
    },
  );

  test.fixme(
    "abort-on-lock-download: lock mid-download aborts the decrypt pipeline",
    async () => {
      // Analogous to upload — the download controller's signal aborts.
    },
  );

  test.fixme(
    "401-mid-upload: a 401 triggers lock + abortAll (+ BE session abort once available)",
    async () => {
      // Mock a 401 during an upload chunk → axios interceptor lock() + abortAll.
    },
  );
});

test.describe("(private) — multi-tab & storage (§17.3)", () => {
  test.fixme(
    "broadcast-lock: lock in tab A locks tab B (same user) within 200ms",
    async () => {
      // Two contexts, same user, both unlocked → lock A → B auto-locks via the
      // user-scoped BroadcastChannel.
    },
  );

  test.fixme(
    "broadcast-user-scope: User A lock does NOT lock User B's tab",
    async () => {
      // Channel name is docspace-encryption-lock:${userId} — cross-user isolation.
    },
  );

  test.fixme(
    "auto-lock-tamper: an externally-written non-preset auto-lock value falls back to default",
    async () => {
      // Write a bogus localStorage auto-lock value → read-time whitelist rejects
      // it and uses the default preset.
    },
  );

  test.fixme(
    "tofu-migration: existing v1 TOFU IDB entries do not raise spurious KeyChange dialogs",
    async () => {
      // Seed the per-user TOFU IDB, enter (private) → no KeyChangeDialog.
    },
  );
});

test.describe("(private) — host frame-bridge sync (P2)", () => {
  test.fixme(
    "onNavigate: switching to archive inside the iframe updates the host ?section",
    async () => {
      // Embed /sdk/private in a parent page, navigate to /sdk/private/archive
      // inside the iframe → parent receives postMessage onEventReturn /
      // onNavigate with section:"archive". (usePrivateFrameBridge.)
    },
  );

  test.fixme(
    "navigateSection: parent posting {section:'archive'} routes the iframe without remount",
    async () => {
      // Parent posts navigateSection → iframe router.replace('/private/archive')
      // WITHOUT reloading the SDK (unlocked identity preserved). Asserts the
      // iframe element is not re-created and the encryption session survives.
    },
  );

  test.fixme(
    "onAppReady fires exactly once for the whole (private) group",
    async () => {
      // Navigate list → room → archive within the iframe; the parent receives
      // onAppReady only once (bridge mounted at the persistent shell level).
    },
  );
});
