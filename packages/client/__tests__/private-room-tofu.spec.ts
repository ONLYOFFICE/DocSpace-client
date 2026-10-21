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
  appsHandler,
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
import { arrayBufferToBase64 } from "@docspace/shared/services/encryption/utils";
import type { Page } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { bootstrapEncryption } from "./fixtures/encryption-helpers";

const ROOM_ID = 9450;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const CAROL_ID = "33333333-3333-3333-3333-333333333333";

const carolKey = async (id: string) => {
  const kp = await generateIdentityKeyPair();
  return {
    id,
    userId: CAROL_ID,
    publicKey: arrayBufferToBase64(kp.publicKey.buffer as ArrayBuffer),
    privateKeyEnc: "",
    date: "2026-01-01T00:00:00.000Z",
    cryptoEngineId: "",
  };
};

const unlockIfPrompted = async (page: Page, passphrase: string) => {
  const prompt = page
    .getByRole("dialog")
    .filter({ hasText: "Enter passphrase" });
  if (await prompt.isVisible().catch(() => false)) {
    await prompt
      .locator('input[name="passphrase"], #passphrase input')
      .first()
      .fill(passphrase);
    await prompt.getByRole("button", { name: "Confirm" }).click();
  }
};

test.describe("Private room — member key checked on upload", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      // Private rooms open under their Rooms addresses only while the Private
      // section is off.
      appsHandler(TEST_PORT, { disabled: ["e2e-rooms"] }),
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Member key mismatch on upload: the key-change dialog appears and a refused member gets no wrap", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();
    const { keysHandle, passphrase } = await bootstrapEncryption(
      page,
      mockRequest,
      baseUrl,
    );
    const ownKey = keysHandle.getKeys()[0];
    const carolPinned = await carolKey("carol-1");
    const carolSwapped = await carolKey("carol-2");

    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const accessHandle: { current: PrivacyroomAccessHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
      ...privacyroomAccessHandlers(TEST_PORT, { handle: accessHandle }),
    );
    const own = { ...ownKey, userId: TEST_USER_ID };
    accessHandle.current!.setRoomKeys(ROOM_ID, [own, carolPinned]);

    // In-app navigation keeps the identity unlocked after the key setup.
    await page.evaluate(
      (url) =>
        (window as unknown as { DocSpace: { navigate: (u: string) => void } }).DocSpace.navigate(url),
      `/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`,
    );
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        new URL(res.url()).pathname.endsWith(`/files/${ROOM_ID}`) &&
        res.ok(),
      { timeout: 15000 },
    );

    const upload = async (name: string) => {
      await page.locator("#customFileInput").first().setInputFiles({
        name,
        mimeType: "text/plain",
        buffer: Buffer.from(`content of ${name}`),
      });
      await unlockIfPrompted(page, passphrase);
    };
    const storedWraps = (title: string) =>
      filesHandle
        .current!.getFiles()
        .find((f) => f.title === title)
        ?.fileKeys.map((k) => String(k.userId))
        .sort();

    // First upload: Carol's key is seen for the first time and gets pinned.
    await upload("first.txt");
    await expect
      .poll(() => filesHandle.current!.getFiles().length, { timeout: 30000 })
      .toBe(1);
    const firstTitle = filesHandle.current!.getFiles()[0].title;
    await expect
      .poll(() => storedWraps(firstTitle), { timeout: 30000 })
      .toEqual([CAROL_ID, TEST_USER_ID].sort());

    // The server now lists a different key under Carol's id.
    accessHandle.current!.setRoomKeys(ROOM_ID, [own, carolSwapped]);
    await upload("second.txt");

    const dialog = page
      .getByRole("dialog")
      .filter({ hasText: "Security key changed" });
    await expect(dialog).toBeVisible({ timeout: 30000 });
    await dialog.getByRole("button", { name: "Don't trust" }).click();

    await expect(
      page.getByTestId("toast-content").filter({ hasText: /Not shared with/ }),
    ).toBeVisible({ timeout: 15000 });
    const secondTitle = filesHandle
      .current!.getFiles()
      .find((f) => f.title !== firstTitle)!.title;
    await expect
      .poll(() => storedWraps(secondTitle), { timeout: 15000 })
      .toEqual([TEST_USER_ID]);
  });
});
