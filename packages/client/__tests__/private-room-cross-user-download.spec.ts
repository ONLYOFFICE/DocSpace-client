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
    const { keysHandle: bobKeysHandle, passphrase: bobPassphrase } =
      await bootstrapEncryption(page, mockRequest, baseUrl);
    const bobServerKey = bobKeysHandle.getKeys()[0];
    expect(bobServerKey).toBeDefined();
    const bobPublicKeyB64 = bobServerKey.publicKey;

    const alice = await generateIdentityKeyPair();

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

    // Entering the private room prompts to unlock the device key; that modal
    // overlays the page and would intercept the context-menu click. Dismiss it
    // — the download-decrypt flow below re-prompts for the passphrase.
    const entryPrompt = page
      .getByRole("dialog")
      .filter({ hasText: "Enter passphrase" });
    if (await entryPrompt.isVisible().catch(() => false)) {
      await entryPrompt
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
      await expect(entryPrompt).toBeHidden();
    }

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

    const downloadGroup = page.locator("#option_download");
    await expect(downloadGroup).toBeVisible({ timeout: 5000 });
    await downloadGroup.hover();

    const downloadDecrypt = page.getByRole("menuitem", {
      name: "Original format",
      exact: true,
    });
    await expect(downloadDecrypt).toBeVisible({ timeout: 5000 });
    await downloadDecrypt.click();

    const passphrasePrompt = page.getByRole("dialog").filter({
      hasText: "Enter passphrase",
    });
    try {
      await passphrasePrompt.waitFor({ state: "visible", timeout: 5000 });
      const passphraseField = passphrasePrompt
        .locator('input[name="passphrase"], #passphrase input')
        .first();
      await passphraseField.fill(bobPassphrase);
      await passphrasePrompt
        .getByRole("button", { name: "Confirm" })
        .click();
    } catch {}

    const roomAccessRequest = await roomAccessPromise;
    expect(roomAccessRequest.method()).toBe("GET");

    const download = await downloadPromise;

    const downloadPath = await download.path();
    expect(downloadPath).toBeTruthy();
    const fs = await import("node:fs/promises");
    const buf = await fs.readFile(downloadPath as string);
    const decryptedText = new TextDecoder().decode(buf);
    expect(decryptedText).toBe(ORIGINAL_TEXT);
  });
});
