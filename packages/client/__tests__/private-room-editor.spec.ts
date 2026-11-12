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
import type { Page } from "@playwright/test";
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
  cryptoEngineId: "{DC522726-5E0E-43E5-AA02-8EA156BECBC5}",
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

// The seeded key is a fixture, so name recovery asks for the passphrase once
// the list is in; opening does not depend on it.
const openRoomList = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/private/${ROOM_ID}/filter?folder=${ROOM_ID}`);
  const row = page.getByTestId("table-row-0");
  await expect(row).toBeVisible({ timeout: 15000 });

  const passphrasePrompt = page
    .getByRole("dialog")
    .filter({ hasText: "Enter passphrase" });
  await passphrasePrompt.waitFor({ timeout: 5000 }).catch(() => {});
  if (await passphrasePrompt.isVisible()) {
    await passphrasePrompt
      .getByRole("button", { name: "Cancel", exact: true })
      .click();
    await expect(passphrasePrompt).toBeHidden();
  }
  return row;
};

// The client E2E server serves the Vite client only: the doceditor app is
// not there, so the open is asserted on the navigation it starts.
test.describe("Private room editor", () => {
  const filesHandle: { current: EncryptedFilesHandlerHandle | null } = {
    current: null,
  };

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      capabilitiesHandler(TEST_PORT, true),
      filesSettingsHandler(TEST_PORT),
      ...privacyroomKeysHandlers(TEST_PORT, {
        initial: [seedUserKey],
        userId: TEST_USER_ID,
      }),
      ...encryptedFilesHandlers(TEST_PORT, {
        roomId: ROOM_ID,
        ownerId: TEST_USER_ID,
        currentUserId: TEST_USER_ID,
        callerKeys: [seedUserKey],
        initialFiles: [seedEncryptedFile],
        handle: filesHandle,
      }),
    );
  });

  test("Open from the list: an encrypted file opens the editor page by its id", async ({
    page,
    baseUrl,
  }) => {
    const row = await openRoomList(page, baseUrl);

    const popupPromise = page.waitForEvent("popup", { timeout: 15000 });
    await row.dblclick();
    const editorPage = await popupPromise;

    const editorUrl = new URL(editorPage.url());
    expect(editorUrl.pathname).toBe("/doceditor");
    expect(editorUrl.searchParams.get("fileId")).toBe(String(FILE_ID));
    expect(editorUrl.searchParams.get("action")).toBeNull();
    await editorPage.close();
  });

  test("Capability absent: an encrypted file of the list is refused with a notice and no editor page", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      filesSettingsHandler(TEST_PORT, { docServiceEncryptionSupported: false }),
    );
    const row = await openRoomList(page, baseUrl);

    let popups = 0;
    page.on("popup", () => {
      popups += 1;
    });
    await row.dblclick();

    await expect(
      page.getByText("Encrypted files cannot be opened in this editor."),
    ).toBeVisible({ timeout: 10000 });
    expect(popups).toBe(0);
    expect(new URL(page.url()).pathname).toBe(`/private/${ROOM_ID}/filter`);
  });
});
