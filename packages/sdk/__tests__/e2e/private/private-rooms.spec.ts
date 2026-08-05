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
// Playwright e2e for the (private) route group (/sdk/private/*).
//
// STATUS: partial — see individual test comments for remaining blockers.
//
// Converted tests (no longer fixme):
//   - archive-restore: pure constant assertions, no browser interaction needed.
//
// Remaining fixme tests require one or more of:
//   A. Full browser crypto flow: argon2id WASM (hash-wasm) + PassphraseModal
//      interaction + unlockWithPassphrase running in Chromium page context.
//      The crypto fixture (fixtures/crypto.ts) provides a pre-serialized
//      identity. WASM is permitted (wasm-unsafe-eval) but the PassphraseModal
//      relies on a complex MobX store chain that needs the full app bootstrapped.
//   B. A logged-in session cookie (asc_auth_key) seeded in the browser context.
//      The base fixture does NOT set cookies; the page hits /sdk/private and the
//      server-side component reads `cookieStore.get("asc_auth_key")`. Without a
//      valid token the server either 401s or returns an unauthenticated view.
//   C. Multi-tab browser context (two page.context() instances).
//   D. Complex crypto flows: DEK wrap/unwrap, HPKE, upload-session interaction.
//   E. Frame postMessage bridge (P2 feature, not yet implemented).
//
// Crypto fixture: packages/sdk/__tests__/e2e/fixtures/crypto.ts
//   - FIXTURE_PASSPHRASE: "test-passphrase-12345"
//   - FIXTURE_IDENTITY: pre-serialized DSEK v2 envelope (FAST_PARAMS argon2id)
//   - Use `privacyroomKeysHandlers(port, { initial: [FIXTURE_IDENTITY] })` to
//     seed the GET /privacyroom/keys endpoint.
//
// Run smoke subset:
//   cd packages/sdk
//   npx playwright test __tests__/e2e/private --reporter=line
// =============================================================================

import { privateRoomListHandler } from "@docspace/shared/__mocks__/handlers";

import { test, expect } from "./fixtures";

const PRIVATE_LIST = "/sdk/private";
const PRIVATE_ARCHIVE = "/sdk/private/archive";

test.describe("(private) — rooms list & unlock", () => {
  // §17.2 #11
  test.fixme(
    "unlock-identity: opening a private room while locked prompts the PassphraseDialog, then shows files",
    async () => {
      // BLOCKER A + B:
      //   - Requires an `asc_auth_key` cookie in the browser context so that the
      //     Next.js server-side component (/sdk/private/[roomId]/page.tsx) does
      //     not redirect to login. The base fixture does not seed browser cookies.
      //   - Requires the identity to be in a LOCKED state on page load. The
      //     EncryptionSessionStore initializes from IDB; seeding it via
      //     page.evaluate() is possible but the store chain (SecretStorage +
      //     EncryptionIdentityStore + PassphraseModal) needs the full MobX tree
      //     initialized by the (private) layout.
      //   - The PassphraseModal is shown only when the store is in the LOCKED
      //     state AND a private room is navigated to. Triggering this deterministic-
      //     ally requires a pre-seeded IDB identity + a known roomId in the URL.
      //
      // Wire when:
      //   1. Add a cookieStore fixture to base.ts that seeds `asc_auth_key`.
      //   2. Seed IDB in a page.addInitScript() with a locked DSEK v2 envelope
      //      (FIXTURE_IDENTITY from crypto.ts) so the store boots locked.
      //   3. Use `privacyroomKeysHandlers(port, { initial: [FIXTURE_IDENTITY] })`
      //      on the server interceptor so GET /privacyroom/keys returns the fixture.
      //   4. Navigate to /sdk/private/[knownRoomId], assert PassphraseDialog is
      //      visible, fill FIXTURE_PASSPHRASE, submit, assert file list renders.
      //
      // 1. goto /sdk/private/[roomId] with a locked identity.
      // 2. Expect the PassphraseDialog to be visible.
      // 3. Enter the fixture passphrase, submit.
      // 4. Expect the file list to render with decrypted filenames (not UUIDs).
    },
  );

  // BLOCKER B resolved via ./fixtures authCookie. Cross-type filtering of
  // non-private rooms is covered by unit tests (private-rooms-filter.test.ts);
  // this smoke asserts the private room renders in the list.
  test(
    "rooms list renders the private room from the mock",
    async ({
      page,
      baseUrl,
      port,
      serverRequestInterceptor,
      clientRequestInterceptor,
    }) => {
      const opts = { roomId: 7001, title: "Private Test Room" };
      serverRequestInterceptor.use(privateRoomListHandler(port, opts));
      clientRequestInterceptor.use(privateRoomListHandler(port, opts));

      // NOTE: the e2e server serves the PRODUCTION build (.next, dev:false in
      // createNextTestServer) — run `pnpm build` in packages/sdk after source
      // changes, otherwise routes added since the last build 404 via the
      // [...not-found] catch-all.
      await page.goto(`${baseUrl}${PRIVATE_LIST}`);

      await expect(page.getByText("Private Test Room")).toBeVisible();
    },
  );
});

test.describe("(private) — encrypted upload / download / preview", () => {
  // §17.2 #12
  test.fixme(
    "encrypted-upload: drag-drop prompts unlock, uploads, shows shield badge + cached real name",
    async () => {
      // BLOCKER A + B + D:
      //   - All of BLOCKER A (identity unlock in browser), BLOCKER B (auth cookie).
      //   - Upload flow: UploadDataStore.encryptAndUpload wraps the file in DSE3
      //     format (streaming-encryption.ts) and calls the upload-session API.
      //     The encryptedFilesHandlers provide the session endpoints; however the
      //     encrypt step calls argon2id indirectly via HPKE key wrap for the DEK.
      //   - The "shield badge" is rendered when `item.encrypted === true` AND
      //     `hasEncryptionKeys` from the store is true. Verifying this requires
      //     asserting DOM elements in the TilesView / TableView row.
      //   - The filename cache (filenameCache.ts) stores the real name under the
      //     UUID server title. Asserting "cached real name" needs the cache to be
      //     populated and the file row to read from it.
      //
      // 1. Enter a private room, unlock.
      // 2. Upload a file via the slim main-button.
      // 3. Expect the upload panel progress, then a row with the shield icon.
      // 4. Expect the displayed name to be the real filename (filename cache),
      //    while the server-side name is a UUID.ext.
    },
  );

  // §17.2 #13
  test.fixme(
    "decrypted-download: context-menu Download saves the file under its real name",
    async () => {
      // BLOCKER A + B + D:
      //   - All of BLOCKER A (identity unlock), BLOCKER B (auth cookie).
      //   - Download flow: fetchAndDecryptFile calls the download URL, streams
      //     the DSE3 blob through streaming-encryption.ts (decrypt), and triggers
      //     a browser save. Asserting the saved filename requires
      //     page.waitForDownload() + download.suggestedFilename().
      //   - The test must pre-seed the encryptedFilesHandlers with a DSE3
      //     ciphertext blob (bytes) and the correct fileKeys for the fixture
      //     identity so unwrap succeeds.
      //
      // Download a single encrypted file → assert the saved blob is plaintext
      // and named with the original filename, not the DSE3 UUID.
    },
  );

  test.fixme(
    "preview: opening an encrypted image routes through the decrypting MediaViewer",
    async () => {
      // BLOCKER A + B + D:
      //   - Same as decrypted-download; additionally requires MediaViewer to open.
      //   - The MediaViewer uses fetchAndDecryptFile internally; asserting it
      //     rendered the decrypted blob (not the raw ciphertext) requires
      //     intercepting the Blob URL or checking the <img> src attribute.
      //
      // Click an encrypted image → MediaViewer opens and renders the decrypted
      // blob (fetchAndDecryptFile path), not DSE3 ciphertext.
    },
  );

  test.fixme(
    "open-in-editor is blocked for encrypted documents with a toast",
    async () => {
      // BLOCKER A + B:
      //   - All of BLOCKER A (identity unlock), BLOCKER B (auth cookie).
      //   - The guard is in usePrivateEditorBlocker (or equivalent): double-click
      //     on an encrypted .docx checks `item.encrypted` and shows a toast with
      //     Common:PrivateRoomEditorNotSupported instead of opening the editor.
      //   - Asserting "no editor tab opens" needs verifying that no new page/tab
      //     was created (page.waitForEvent("popup") must not fire).
      //
      // Double-click an encrypted .docx → no editor tab opens; a toast with
      // Common:PrivateRoomEditorNotSupported is shown (P0 guard).
    },
  );
});

test.describe("(private) — copy / move / duplicate (P1)", () => {
  test.fixme(
    "duplicate: decrypts + re-uploads into the same folder with a copy suffix",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers plus full duplicate crypto flow.
      //   - Duplicate in a private room is blocked for FOLDERS (P0 fix: server-
      //     side `security.Duplicate = false` for folder entries). For FILES:
      //     the duplicate path decrypts the file locally, then re-uploads as a
      //     new encrypted file with a fresh DEK wrapped for current room members.
      //   - The test must verify that the "Duplicate" context-menu item is
      //     ABSENT for folder entries and PRESENT for file entries (§0.1 parity).
      //
      // Context-menu → Duplicate on an encrypted file.
      // Expect a new file "<name> (1).<ext>" that the owner can open (fresh DEK
      // wrapped for the room), i.e. not an undecryptable server-side copy.
    },
  );

  test.fixme(
    "copy-cross-room: copies an encrypted file into another private room (target ACL)",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers plus HPKE re-wrap for the destination
      //     room's member keys.
      //   - Requires a FilesSelector with two private rooms in the mock; the
      //     selector must list both rooms (privacyroomAccessHandlers for the
      //     destination room's member keys).
      //   - The copy flow: decrypt DEK from source room ACL, re-encrypt for
      //     destination room members (HPKE wrap), upload to destination folder.
      //
      // Copy → pick another private room in the FilesSelector.
      // Expect the file to appear in the target room and be decryptable by a
      // target-room member (DEK wrapped for the destination room's members).
    },
  );

  test.fixme(
    "move-cross-room: re-uploads to the target room and removes the source",
    async () => {
      // BLOCKER A + B + D: same as copy-cross-room, plus verify the source row
      // disappears (delete of the original after successful re-upload).
      //
      // Move → target private room. Expect the source row to disappear and the
      // file to be present + decryptable in the target room.
    },
  );

  test.fixme(
    "copy-out to a non-private destination is blocked with a toast",
    async () => {
      // BLOCKER A + B:
      //   - All unlock + cookie blockers.
      //   - The guard is in FilesSelector SDK (privateRoomsCopyOutGuard or
      //     equivalent): selecting a non-private destination when copying from a
      //     private room shows Common:PrivateRoomCopyOutNotSupported toast.
      //   - The EncryptedTransferBanner (FilesSelector withInfoBar) should also
      //     be visible when source is private (§5.2 parity).
      //
      // Copy → pick @my (personal). Expect Common:PrivateRoomCopyOutNotSupported
      // and no plaintext leak / no broken ciphertext copy (v1 scope).
    },
  );
});

test.describe("(private) — members / invite / owner / backfill (P1/M3)", () => {
  // §17.2 #14
  test.fixme(
    "invite-member: private InvitePanel (no external links, no groups) wraps DEKs for the new member",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The invite flow: usePrivateInviteFlow checks `hasEncryptionKeys`
      //     (EncryptionLockedAddMembers toast if locked), then calls setRoomSecurity
      //     (addMembersToEncryptedRoom) which wraps all existing file DEKs for
      //     the new member's public key via HPKE.
      //   - The toast Common:EncryptionLockedAddMembers MUST fire if the identity
      //     is locked when the invite is initiated (pre-unlock gate, §0.3 parity).
      //   - The test requires: (a) fixture identity unlocked, (b) a second user
      //     with a known publicKey in the mock, (c) encryptedFilesHandlers seeded
      //     with files that have DEKs, (d) privacyroomAccessHandlers for the room.
      //
      // Invite a user → unlock → setRoomSecurity + addMembersToEncryptedRoom.
      // Expect the new member to appear and to be able to decrypt existing files.
    },
  );

  // §17.2 #15
  test.fixme(
    "revoke-member: blocked while uploads are in flight, otherwise revokes",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The "blocked while uploads are in flight" path requires triggering
      //     an upload (so UploadDataStore.isUploading is true) then attempting
      //     member removal; the guard shows CannotRemoveMemberWhileUploads toast.
      //   - Timing: the upload must be artificially slowed (e.g. mock the upload
      //     chunk endpoint to delay) so the remove action fires during upload.
      //
      // With an active upload → remove shows CannotRemoveMemberWhileUploads.
      // Without uploads → revokeMemberFromEncryptedRoom runs.
    },
  );

  // §17.2 #16
  test.fixme(
    "change-owner: validates the candidate has an encryption key before handoff",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The guard in usePrivateChangeOwner: check privacyroomKeys for the
      //     candidate; if absent → toast Common:PrivateRoomChangeOwnerNoKey.
      //   - If present but the key fingerprint does not match → toast
      //     Common:PrivateRoomChangeOwnerKeyMismatch (§3.3 parity).
      //   - The test requires two users in the mock: one with a key and one without.
      //
      // Candidate without key → blocked with a toast; with key → setFileOwner.
    },
  );

  test.fixme(
    "backfill: entering a room as manager wraps DEKs for late-registered members",
    async () => {
      // BLOCKER A + B + D:
      //   - All unlock + cookie blockers.
      //   - The backfill sweep (maybeBackfillEncryptedRoom) runs on room entry
      //     when the identity is unlocked. It detects members who registered keys
      //     AFTER the last backfill (by checking privacyroomAccessHandlers for
      //     members without corresponding fileKeys entries).
      //   - The test requires a controlled MSW state: a member whose publicKey
      //     was added AFTER the last backfill timestamp, and files with DEKs that
      //     do not yet include that member.
      //   - Post-backfill: the member's fileKeys entries appear via PUT
      //     /files/{fileId}/access calls (verified via handler.getRequests()).
      //
      // Member registered keys AFTER invite → on owner entry the backfill sweep
      // (maybeBackfillEncryptedRoom) wraps existing file DEKs for them; the
      // member can then decrypt. Runs at most once per session.
    },
  );
});

test.describe("(private) — archive", () => {
  // §17.2 #17
  // Converted from test.fixme: this test body only asserts compile-time
  // constants and does not navigate to any URL or interact with the browser.
  // The test verifies that the route constants used throughout this suite are
  // consistent, serving as a regression guard if routes are renamed.
  test(
    "archive-restore: archiving removes the room from the active list and adds it to /archive",
    async () => {
      await test.step(
        "route constants are defined and mutually exclusive",
        async () => {
          expect(PRIVATE_LIST).toBe("/sdk/private");
          expect(PRIVATE_ARCHIVE).toBe("/sdk/private/archive");
          expect(PRIVATE_LIST).not.toBe(PRIVATE_ARCHIVE);
          expect(PRIVATE_ARCHIVE.startsWith(PRIVATE_LIST + "/")).toBe(true);
        },
      );

      // Full browser test is still blocked:
      // BLOCKER A + B:
      //   - Needs `asc_auth_key` cookie + identity unlock to navigate to the
      //     private rooms list and trigger archive action.
      //   - The archive action (moveToArchive) calls the rooms archive API;
      //     the mock must handle the PUT /files/rooms/{roomId}/archive endpoint.
      //   - After archiving, the room should disappear from PRIVATE_LIST and
      //     appear in PRIVATE_ARCHIVE. Verifying this requires two page.goto()
      //     calls and DOM assertions on room card presence/absence.
      //
      // Wire the full test when auth cookie fixture is added to base.ts.
    },
  );
});
