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
  privacyroomKeysHandlers,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  type EncryptedFilesHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOM_ID = 9400;
const FILE_ID = 8800;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const seedUserKey = {
  id: "1",
  userId: TEST_USER_ID,
  publicKey: "BASE64_PUBLIC_KEY_FIXTURE_FOR_TEST",
  privateKeyEnc: "BASE64_PRIVATE_KEY_ENC_FIXTURE_FOR_TEST",
  date: "2026-01-01T00:00:00.000Z",
};

const seedEncryptedFile = {
  id: FILE_ID,
  title: "report.docx",
  serverTitle: "uuid-abc.docx",
  size: 100,
  encrypted: true,
  fileKeys: [
    {
      userId: TEST_USER_ID,
      publicKeyId: "key-1",
      privateKeyEnc: "WRAPPED_DEK_FIXTURE",
    },
  ],
};

function installRoomWithEncryptedFile(
  mockRequest: WorkerFixture,
  filesHandle: { current: EncryptedFilesHandlerHandle | null },
) {
  mockRequest.use(
    ...encryptedFilesHandlers(TEST_PORT, {
      roomId: ROOM_ID,
      ownerId: TEST_USER_ID,
      initialFiles: [seedEncryptedFile],
      handle: filesHandle,
    }),
  );
}

test.describe("Encrypted file UI in private room", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("shows the encrypted-file badge when user has keys configured", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
      }),
    );
    installRoomWithEncryptedFile(mockRequest, filesHandle);

    await page.goto(`${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9400(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });
    const badge = row.locator("[class*='encryptedFileIcon']").first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(badge).not.toHaveClass(/noAccessIcon/);
  });

  test("shows the no-access badge when user has NO keys", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    installRoomWithEncryptedFile(mockRequest, filesHandle);

    await page.goto(`${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9400(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });
    const badge = row.locator("[class*='encryptedFileIcon']").first();
    await expect(badge).toBeVisible({ timeout: 5000 });
    await expect(badge).toHaveClass(/noAccessIcon/);
  });

  test("context menu of an encrypted file shows Download without decryption", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
      }),
    );
    installRoomWithEncryptedFile(mockRequest, filesHandle);

    await page.goto(`${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9400(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });

    // Opening a private room prompts to unlock the device key; that modal
    // overlays the page and would intercept clicks on the file row. Dismiss
    // it — the encrypted-file context menu is available while still locked.
    const passphrasePrompt = page
      .getByRole("dialog")
      .filter({ hasText: "Enter passphrase" });
    if (await passphrasePrompt.isVisible().catch(() => false)) {
      await passphrasePrompt
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
      await expect(passphrasePrompt).toBeHidden();
    }

    await row.getByTestId("context-menu-button").first().click();

    const downloadGroup = page.locator("#option_download");
    await expect(downloadGroup).toBeVisible({ timeout: 5000 });
    await downloadGroup.hover();

    const downloadEncrypted = page.locator("#option_download-encrypted");
    await expect(downloadEncrypted).toBeVisible({ timeout: 5000 });
  });

  test("context menu of an encrypted file does NOT show Copy external link", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
      }),
    );
    installRoomWithEncryptedFile(mockRequest, filesHandle);

    await page.goto(`${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9400(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const row = page.getByTestId("table-row-0");
    await expect(row).toBeVisible({ timeout: 10000 });

    // Opening a private room prompts to unlock the device key; that modal
    // overlays the page and would intercept clicks on the file row. Dismiss
    // it — the encrypted-file context menu is available while still locked.
    const passphrasePrompt = page
      .getByRole("dialog")
      .filter({ hasText: "Enter passphrase" });
    if (await passphrasePrompt.isVisible().catch(() => false)) {
      await passphrasePrompt
        .getByRole("button", { name: "Cancel", exact: true })
        .click();
      await expect(passphrasePrompt).toBeHidden();
    }

    await row.getByTestId("context-menu-button").first().click();

    await expect(page.locator("#option_download")).toBeVisible({
      timeout: 5000,
    });

    expect(await page.locator("#option_copy-external-link").count()).toBe(0);
    expect(await page.locator("#option_copy-shared-link").count()).toBe(0);
  });
});
