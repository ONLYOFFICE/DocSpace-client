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
// SCAFFOLDING — Playwright e2e for the (private) route group (/sdk/private/*).
//
// Every test here is `test.fixme(...)`: it is INERT (skipped, never executed)
// until the prerequisites below are wired. This is deliberate — these specs
// describe the §17.2 acceptance scenarios from
// docs/encryption/SDK_PRIVATE_PLAN.md but cannot pass without crypto fixtures
// that do not yet exist in the mock harness. Do NOT remove `.fixme` until the
// prerequisites are in place, or CI will go falsely red.
//
// PREREQUISITES (tracked in SDK_PRIVATE_DASHBOARD_PLAN.md, P3 backlog):
//   1. Private MSW handlers in @docspace/shared/__mocks__/handlers:
//        - GET  privacyroom/keys                 → current user's envelope
//        - GET  privacyroom/{roomId}/access      → room members' public keys
//        - GET  files/file/{fileId}/access       → { userKeys, fileKeys }
//        - PUT  files/file/{fileId}/access       → setFileEncryptionKeys
//        - upload-session create/chunk/finalize  (encrypted=true)
//        - room list / folder handlers returning rooms with `private:true`
//   2. Deterministic crypto fixtures: a fixed passphrase
//        ("test-passphrase-12345") + a fixed serialized identity envelope, so
//        unlockWithPassphrase / HPKE wrap+unwrap are reproducible. WebCrypto
//        runs natively in Chromium; hash-wasm loads inline (wasm-unsafe-eval
//        is allowed by Playwright by default).
//   3. A logged-in session cookie (asc_auth_key) consistent with the other
//        SDK e2e fixtures.
//
// When wired, convert `test.fixme` → `test` one scenario at a time.
// =============================================================================

import { test, expect } from "../fixtures/base";

const PRIVATE_LIST = "/sdk/private";
const PRIVATE_ARCHIVE = "/sdk/private/archive";

test.describe("(private) — rooms list & unlock", () => {
  // §17.2 #11
  test.fixme(
    "unlock-identity: opening a private room while locked prompts the PassphraseDialog, then shows files",
    async () => {
      // 1. goto /sdk/private/[roomId] with a locked identity.
      // 2. Expect the PassphraseDialog to be visible.
      // 3. Enter the fixture passphrase, submit.
      // 4. Expect the file list to render with decrypted filenames (not UUIDs).
    },
  );

  test.fixme(
    "rooms list renders only CustomRoom rooms with private:true",
    async () => {
      // goto PRIVATE_LIST → assert every rendered room card has the lock badge,
      // and public/custom non-private rooms from the same mock are filtered out.
    },
  );
});

test.describe("(private) — encrypted upload / download / preview", () => {
  // §17.2 #12
  test.fixme(
    "encrypted-upload: drag-drop prompts unlock, uploads, shows shield badge + cached real name",
    async () => {
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
      // Download a single encrypted file → assert the saved blob is plaintext
      // and named with the original filename, not the DSE3 UUID.
    },
  );

  test.fixme(
    "preview: opening an encrypted image routes through the decrypting MediaViewer",
    async () => {
      // Click an encrypted image → MediaViewer opens and renders the decrypted
      // blob (fetchAndDecryptFile path), not DSE3 ciphertext.
    },
  );

  test.fixme(
    "open-in-editor is blocked for encrypted documents with a toast",
    async () => {
      // Double-click an encrypted .docx → no editor tab opens; a toast with
      // Common:PrivateRoomEditorNotSupported is shown (P0 guard).
    },
  );
});

test.describe("(private) — copy / move / duplicate (P1)", () => {
  test.fixme(
    "duplicate: decrypts + re-uploads into the same folder with a copy suffix",
    async () => {
      // Context-menu → Duplicate on an encrypted file.
      // Expect a new file "<name> (1).<ext>" that the owner can open (fresh DEK
      // wrapped for the room), i.e. not an undecryptable server-side copy.
    },
  );

  test.fixme(
    "copy-cross-room: copies an encrypted file into another private room (target ACL)",
    async () => {
      // Copy → pick another private room in the FilesSelector.
      // Expect the file to appear in the target room and be decryptable by a
      // target-room member (DEK wrapped for the destination room's members).
    },
  );

  test.fixme(
    "move-cross-room: re-uploads to the target room and removes the source",
    async () => {
      // Move → target private room. Expect the source row to disappear and the
      // file to be present + decryptable in the target room.
    },
  );

  test.fixme(
    "copy-out to a non-private destination is blocked with a toast",
    async () => {
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
      // Invite a user → unlock → setRoomSecurity + addMembersToEncryptedRoom.
      // Expect the new member to appear and to be able to decrypt existing files.
    },
  );

  // §17.2 #15
  test.fixme(
    "revoke-member: blocked while uploads are in flight, otherwise revokes",
    async () => {
      // With an active upload → remove shows CannotRemoveMemberWhileUploads.
      // Without uploads → revokeMemberFromEncryptedRoom runs.
    },
  );

  // §17.2 #16
  test.fixme(
    "change-owner: validates the candidate has an encryption key before handoff",
    async () => {
      // Candidate without key → blocked with a toast; with key → setFileOwner.
    },
  );

  test.fixme(
    "backfill: entering a room as manager wraps DEKs for late-registered members",
    async () => {
      // Member registered keys AFTER invite → on owner entry the backfill sweep
      // (maybeBackfillEncryptedRoom) wraps existing file DEKs for them; the
      // member can then decrypt. Runs at most once per session.
    },
  );
});

test.describe("(private) — archive", () => {
  // §17.2 #17
  test.fixme(
    "archive-restore: archiving removes the room from the active list and adds it to /archive",
    async () => {
      await test.step("placeholder", async () => {
        expect(PRIVATE_LIST).toBe("/sdk/private");
        expect(PRIVATE_ARCHIVE).toBe("/sdk/private/archive");
      });
    },
  );
});
