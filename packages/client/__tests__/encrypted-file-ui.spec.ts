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
    await row.getByTestId("context-menu-button").first().click();

    await expect(page.locator("#option_download")).toBeVisible({
      timeout: 5000,
    });

    expect(await page.locator("#option_copy-external-link").count()).toBe(0);
    expect(await page.locator("#option_copy-shared-link").count()).toBe(0);
  });
});
