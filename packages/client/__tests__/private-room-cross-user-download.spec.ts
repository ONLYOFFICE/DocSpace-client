// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import {
  capabilitiesHandler,
  encryptedFilesHandlers,
  filesSettingsHandler,
  privacyroomAccessHandlers,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type EncryptedFilesHandlerHandle,
  type PrivacyroomAccessHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { generateIdentityKeyPair } from "@docspace/shared/services/encryption/identity";
import { encryptFile } from "@docspace/shared/services/encryption/file-keys";
import { wrapDekForRecipients } from "@docspace/shared/services/encryption/room-file-access";
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { IdentityKeyPair } from "@docspace/shared/services/encryption/types";

import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

// The hardcoded user id surfaced by selfResolver in the people/self mock —
// the same one bootstrapEncryption operates against. Bob (= "the logged-in
// user in this test") inherits this id.
const BOB_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const ALICE_ID = "11111111-1111-1111-1111-111111111111";
const ROOM_ID = 9700;
const FILE_ID = 8700;
const ORIGINAL_TEXT = "Cross-user encrypted memo. If you can read this, the unwrap path picked the right roomMemberKeys.";

function pubB64(kp: IdentityKeyPair): string {
  return arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer);
}

async function blobToUint8Array(blob: Blob): Promise<Uint8Array> {
  return new Uint8Array(await blob.arrayBuffer());
}

test.describe("Private room — cross-user file exchange", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Bob can download a file Alice uploaded — uses /privacyroom/{roomId}/access for unwrap", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // 1. Bob bootstraps his identity via the real UI. This generates a keypair
    //    in the browser; the server-side mock captures Bob's serialized public
    //    key, which we'll need to wrap the DEK for him below.
    const { keysHandle: bobKeysHandle, passphrase: bobPassphrase } =
      await bootstrapEncryption(page, mockRequest, baseUrl);
    const bobServerKey = bobKeysHandle.getKeys()[0];
    expect(bobServerKey).toBeDefined();
    const bobPublicKeyB64 = bobServerKey.publicKey;

    // 2. Alice exists only on the server-side fixture — we generate her
    //    identity in Node and never expose the private key to the browser.
    //    The browser only ever sees Alice's public key via roomMemberKeys.
    const alice = await generateIdentityKeyPair();

    // 3. Encrypt a real file with a fresh DEK, then wrap the DEK for BOTH
    //    Alice (uploader) and Bob (recipient). The wrap header embeds Alice
    //    as the sender — that's the value the client looks up in
    //    roomMemberKeys at unwrap time.
    const plainBytes = new TextEncoder().encode(ORIGINAL_TEXT);
    const { encryptedBlob, dek } = await encryptFile(plainBytes, {
      fileName: "memo.txt",
    });
    const wrapped = await wrapDekForRecipients({
      dek,
      senderIdentity: alice,
      senderUserId: ALICE_ID,
      recipients: [
        { userId: ALICE_ID, publicKey: pubB64(alice) },
        { userId: BOB_ID, publicKey: bobPublicKeyB64 },
      ],
      fileId: FILE_ID,
    });
    const encryptedBytes = await blobToUint8Array(encryptedBlob);

    // 4. Seed the room: one file, owned by Alice, with wraps for both members.
    //    Also wire up /privacyroom/{roomId}/access to return both pubkeys —
    //    this is the endpoint our Sprint 1 fix added to the download path.
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: ALICE_ID,
        initialFiles: [
          {
            id: FILE_ID,
            title: "memo.txt",
            serverTitle: "obfuscated.txt",
            size: plainBytes.byteLength,
            encrypted: true,
            fileKeys: wrapped,
            bytes: encryptedBytes,
          },
        ],
        roomUserKeys: [
          {
            id: "bob-1",
            userId: BOB_ID,
            publicKey: bobPublicKeyB64,
            privateKeyEnc: "",
            date: "2026-01-01T00:00:00.000Z",
            cryptoEngineId: "",
          },
        ],
        handle: filesHandle,
      }),
      ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
    );

    accessHandle.current!.setRoomKeys(ROOM_ID, [
      {
        id: "alice-1",
        userId: ALICE_ID,
        publicKey: pubB64(alice),
        privateKeyEnc: "",
      },
      {
        id: "bob-1",
        userId: BOB_ID,
        publicKey: bobPublicKeyB64,
        privateKeyEnc: "",
      },
    ]);

    // 5. Bob navigates into the room. Files list comes from the mocked
    //    encryptedFilesHandlers; Alice's memo should appear with its
    //    server-side (obfuscated) title.
    await page.goto(
      `${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        new RegExp(`/files/${ROOM_ID}(\\?|$)`).test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });

    // 6. Trigger download via context menu. The success criterion is layered:
    //    (a) a Playwright download event fires (= browser received a blob URL,
    //        meaning unwrap+decrypt completed without throwing), and
    //    (b) the GET /privacyroom/{roomId}/access call is observed, proving
    //        the new Sprint-1 code path is wired up (rather than the old one
    //        that passed /files/{id}/access.userKeys as roomMemberKeys).
    const roomAccessPromise = page.waitForRequest(
      (req) =>
        req.method() === "GET" &&
        new RegExp(`/privacyroom/${ROOM_ID}/access`).test(req.url()),
      { timeout: 15000 },
    );
    const downloadPromise = page.waitForEvent("download", { timeout: 20000 });

    const contextMenuButton = row.getByTestId("context-menu-button").first();
    await expect(contextMenuButton).toBeVisible({ timeout: 5000 });
    await contextMenuButton.click();

    // When a file has both download AND download-encrypted, ContextOptionsStore
    // groups them under a "Download" parent (#option_download). The submenu
    // ends up with two items: "Original format" (with decryption — what we
    // want) and "Download without decryption". The "Original format" entry
    // inherits its id from the parent (spread in ContextOptionsStore.js:2924),
    // so we target it by role+name rather than by id.
    const downloadGroup = page.locator("#option_download");
    await expect(downloadGroup).toBeVisible({ timeout: 5000 });
    await downloadGroup.hover();

    const downloadDecrypt = page.getByRole("menuitem", {
      name: "Original format",
      exact: true,
    });
    await expect(downloadDecrypt).toBeVisible({ timeout: 5000 });
    await downloadDecrypt.click();

    // Navigation between /profile/keys-management and the room route triggers
    // the visibilitychange auto-lock, so the cached identity is gone by the
    // time download starts. Re-unlock via the prompt the app shows. (If the
    // cache happened to survive in a future change, the dialog won't appear
    // and we just skip — the download will fire on its own.)
    const passphrasePrompt = page.getByRole("dialog").filter({
      hasText: "Enter passphrase",
    });
    try {
      await passphrasePrompt.waitFor({ state: "visible", timeout: 5000 });
      const passphraseField = passphrasePrompt
        .locator('input[name="passphrase"], #passphrase input')
        .first();
      await passphraseField.fill(bobPassphrase);
      // PassphraseDialog uses "Confirm" for the unlock flow (isNewPassphrase=false);
      // PassphraseModal (key generation) uses "Continue".
      await passphrasePrompt
        .getByRole("button", { name: "Confirm" })
        .click();
    } catch {
      // Cache was still valid — nothing to do.
    }

    const roomAccessRequest = await roomAccessPromise;
    expect(roomAccessRequest.method()).toBe("GET");

    const download = await downloadPromise;

    // 7. Read the downloaded bytes and verify they match Alice's plaintext.
    //    This proves end-to-end: real wraps in the mock → real download URL
    //    → real client-side unwrap+decrypt → original bytes.
    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const fs = await import("node:fs/promises");
    const buf = await fs.readFile(downloadPath as string);
    const decryptedText = new TextDecoder().decode(buf);
    expect(decryptedText).toBe(ORIGINAL_TEXT);
  });
});
