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
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  roomListHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/event-listener/plugin.js";

// Personal folder — used for the CREATE event test.
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// Shared rooms — used for the ROOM_CREATE event test.
// The ArticleMainButton renders a "Create New Room" button here (isRoomsFolder = true).
const ROOMS_URL = "/rooms/shared/";

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Event Listener Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withEventListenerPlugin"),
    );
  });

  // ── 1. CREATE event ───────────────────────────────────────────────────────────
  // Open the main-button dropdown and click "New Document".
  // This dispatches Events.CREATE exactly as the real app does, triggering
  // the plugin's eventHandler which shows an info toast.

  test("CREATE event fires an info toast", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const mainButton = page.getByTestId("main-button");
    await expect(mainButton).toBeVisible();
    await mainButton.click();

    // "New Document" item — key "docx" becomes data-testid via ContextMenu's SubMenu
    await page.getByTestId("docx").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
    await expect(toast).toContainText("File created!");
  });

  // ── 2. ROOM_CREATE event ──────────────────────────────────────────────────────
  // On the shared rooms section the ArticleMainButton renders a single
  // "Create New Room" button.  Clicking it dispatches Events.ROOM_CREATE,
  // triggering the plugin's eventHandler which shows a success toast.

  test("ROOM_CREATE event fires a success toast", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // Override the default empty room list so the rooms table renders, which
    // signals that the article has finished loading (showArticleLoader = false).
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await pluginLoaded;

    await expect(page.getByTestId("table-body")).toBeVisible();

    const createRoomBtn = page.getByTestId("create_new_room_button");
    await expect(createRoomBtn).toBeVisible();
    await createRoomBtn.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Room created!");
  });
});

