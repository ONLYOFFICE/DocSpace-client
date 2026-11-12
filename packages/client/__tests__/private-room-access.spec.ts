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
  type PrivacyroomHandlerHandle,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOM_ID = 9100;
const SUBFOLDER_ID = 9150;
const SUBFOLDER_TITLE = "Reports";
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const seedUserKey = {
  id: "1",
  userId: TEST_USER_ID,
  publicKey: "BASE64_PUBLIC_KEY_FIXTURE_FOR_TEST",
  privateKeyEnc: "BASE64_PRIVATE_KEY_ENC_FIXTURE_FOR_TEST",
  date: "2026-01-01T00:00:00.000Z",
};

const TOAST_KEY_FRAGMENT = /Set it up in your profile|EncryptionKeysNotConfigured/;

test.describe("Private room — entry warning toast", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("warns when entering a private room without configured keys", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9100(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const toast = page
      .getByTestId("toast-content")
      .filter({ hasText: TOAST_KEY_FRAGMENT });
    await expect(toast).toBeVisible({ timeout: 10000 });
  });

  test("does NOT warn when keys are configured", async ({
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
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9100(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    const toast = page
      .getByTestId("toast-content")
      .filter({ hasText: TOAST_KEY_FRAGMENT });
    await expect(toast).toBeHidden();
  });
});

test.describe("Entering a private room without keys warns", () => {
  const LOAD_FAILED = "Could not load your encryption keys";

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Key list could not be loaded, then Retry succeeds", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    const keysHandle: { current: PrivacyroomHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
        listFails: true,
        handle: keysHandle,
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    const toasts = page.getByTestId("toast-content");
    const loadFailed = toasts.filter({ hasText: LOAD_FAILED });
    await expect(loadFailed).toBeVisible({ timeout: 15000 });
    await expect(toasts.filter({ hasText: TOAST_KEY_FRAGMENT })).toBeHidden();
    await expect(page.getByTitle(/No access/i)).toHaveCount(0);

    keysHandle.current!.setListFails(false);
    await loadFailed.getByText("Try again").click();

    await expect(loadFailed).toBeHidden();
    await expect(
      page.locator('input[name="passphrase"], #passphrase input').first(),
    ).toBeVisible({ timeout: 10000 });
  });

  test("Retry fails", async ({ page, mockRequest, baseUrl }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
        listFails: true,
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    const toasts = page.getByTestId("toast-content");
    const loadFailed = toasts.filter({ hasText: LOAD_FAILED });
    await expect(loadFailed).toBeVisible({ timeout: 15000 });

    const secondRead = page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        res.url().endsWith("/privacyroom/keys") &&
        res.status() === 500,
    );
    await loadFailed.getByText("Try again").click();
    await secondRead;

    // The closed toast leaves while the new one is raised.
    await expect(loadFailed).toHaveCount(1, { timeout: 10000 });
    await expect(loadFailed).toBeVisible();
    await expect(toasts.filter({ hasText: TOAST_KEY_FRAGMENT })).toBeHidden();
  });
});

test.describe("A locked key is shown in a private room", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Prompt cancelled on entry, then Unlock from the bar cancelled", async ({
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
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    const passphrase = page
      .locator('input[name="passphrase"], #passphrase input')
      .first();
    const bar = page.getByTestId("private_room_locked_bar");
    const cancel = page.getByRole("button", { name: "Cancel" });

    // Entry prompt open
    await expect(passphrase).toBeVisible({ timeout: 15000 });
    await expect(bar).toHaveCount(0);

    await cancel.click();

    await expect(passphrase).toBeHidden();
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("Your encryption key is locked");

    await page.getByTestId("private_room_locked_bar_unlock").click();

    await expect(passphrase).toBeVisible();

    await cancel.click();

    await expect(passphrase).toBeHidden();
    await expect(bar).toBeVisible();
  });

  test("Subfolder after a cancelled prompt", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        folders: [{ id: SUBFOLDER_ID, title: SUBFOLDER_TITLE }],
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    const passphrase = page
      .locator('input[name="passphrase"], #passphrase input')
      .first();
    const bar = page.getByTestId("private_room_locked_bar");

    await expect(passphrase).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "Cancel" }).click();
    await expect(bar).toBeVisible();

    const folderOpened = page.waitForResponse(
      (res) =>
        new RegExp(`/files/${SUBFOLDER_ID}(\\?|$)`).test(res.url()) &&
        res.request().method() === "GET",
    );
    await page.getByText(SUBFOLDER_TITLE, { exact: true }).first().dblclick();
    await folderOpened;

    await expect(page).toHaveURL(new RegExp(`folder=${SUBFOLDER_ID}`));
    await expect(bar).toBeVisible();
    await expect(passphrase).toBeHidden();
  });

  test("User without a key", async ({ page, mockRequest, baseUrl }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };

    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);

    await expect(
      page.getByTestId("toast-content").filter({ hasText: TOAST_KEY_FRAGMENT }),
    ).toBeVisible({ timeout: 15000 });
    await expect(page.getByTestId("private_room_locked_bar")).toHaveCount(0);
  });
});

test.describe("Private room — upload without a key", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Uploader without a key: the file is refused and no bytes are sent", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
      current: null,
    };
    mockRequest.use(
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        handle: filesHandle,
      }),
    );

    const sessionRequests: string[] = [];
    page.on("request", (req) => {
      if (new RegExp(`/files/${ROOM_ID}/session`).test(req.url())) {
        sessionRequests.push(req.url());
      }
    });

    await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);
    await page.waitForResponse(
      (res) =>
        res.request().method() === "GET" &&
        /\/files\/9100(\?|$)/.test(res.url()) &&
        res.ok(),
      { timeout: 15000 },
    );

    await page.locator("#customFileInput").first().setInputFiles({
      name: "secret.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("must never leave the browser"),
    });

    const refusal = page.getByTestId("toast-content").filter({
      hasText:
        /Set up your encryption keys in Profile before uploading files to a private room|EncryptionKeysRequiredForUpload/,
    });
    await expect(refusal).toBeVisible({ timeout: 10000 });
    expect(sessionRequests).toEqual([]);
    expect(filesHandle.current!.getFiles()).toHaveLength(0);
  });
});
