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

import { ShareAccessRights } from "@docspace/shared/enums";
import {
  filesSettingsHandler,
  roomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// A third-party folder id: a string, never a number.
const THIRD_PARTY_FOLDER_ID = "box-821";

test.describe("Create from a password-protected file", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu, {
        access: ShareAccessRights.RoomManager,
      }),
    );
  });

  // The editor sends the user back with ?createError when the source file
  // needs a password. The retry dialog read the folder as
  // Number(parentId), which is NaN for a third-party folder, and reopened
  // /doceditor/create?parentId=NaN; the server answered "Selector '' not
  // found".
  test("should retry in the same third-party folder", async ({
    page,
    baseUrl,
  }) => {
    const createError = JSON.stringify({
      fileInfo: {
        title: "Form",
        extension: "pdf",
        templateId: "5",
        parentId: THIRD_PARTY_FOLDER_ID,
        id: "-1",
        open: "true",
      },
    });

    let retryUrl: URL | undefined;
    await page.route(/\/doceditor\/create\?/, (route) => {
      retryUrl = new URL(route.request().url());
      return route.fulfill({ contentType: "text/html", body: "" });
    });

    await page.goto(
      `${baseUrl}/rooms/shared/filter?createError=${encodeURIComponent(createError)}`,
    );

    const accept = page.locator("#convert-password-dialog_button-accept");
    await expect(accept).toBeVisible();

    // SimulatePassword masks a plain text input as the user types.
    await page
      .getByRole("textbox", { name: "Enter password" })
      .pressSequentially("secret");
    await accept.click();

    await expect.poll(() => retryUrl?.searchParams.get("parentId")).toBe(
      THIRD_PARTY_FOLDER_ID,
    );
  });
});
