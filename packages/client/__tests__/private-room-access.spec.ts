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
import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOM_ID = 9100;
const TEST_USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const seedUserKey = {
  id: "1",
  userId: TEST_USER_ID,
  publicKey: "BASE64_PUBLIC_KEY_FIXTURE_FOR_TEST",
  privateKeyEnc: "BASE64_PRIVATE_KEY_ENC_FIXTURE_FOR_TEST",
  date: "2026-01-01T00:00:00.000Z",
};

const TOAST_KEY_FRAGMENT = /Encryption keys are not configured|EncryptionKeysNotConfigured/;

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

    await page.goto(`${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);
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

    await page.goto(`${baseUrl}/rooms/shared/${ROOM_ID}/filter?folder=${ROOM_ID}`);

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
