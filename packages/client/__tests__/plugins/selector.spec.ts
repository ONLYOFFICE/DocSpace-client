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

import { http } from "msw";

import {
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  roomListHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";
import { successSelf } from "@docspace/shared/__mocks__/handlers/people/self";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/selector/plugin.js";

// Personal folder used in all tests (same folder as context-menu / info-panel specs).
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// Row indices in the mocked personal folder.
// row-3 = .docx file — has all five selector context menu items.
const ROW_DOCX = 3;

// Minimal group mock: two groups served by the /api/2.0/group endpoint.
const groupsMockResponse = {
  response: [
    { id: "group-1", name: "Developers" },
    { id: "group-2", name: "Designers" },
  ],
  count: 2,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Opens the three-dot context menu for the given row. */
async function openContextMenu(
  page: import("@playwright/test").Page,
  rowIndex: number,
) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();
  const row = table.getByTestId(`table-row-${rowIndex}`);
  const menuButton = row.getByTestId("context-menu-button").first();
  await expect(menuButton).toBeVisible();
  await menuButton.click();
}

/**
 * Opens context menu for the docx row, clicks the given plugin menu item,
 * and waits for the selector panel (`aside`) to become visible.
 */
async function openSelector(
  page: import("@playwright/test").Page,
  menuItemTestId: string,
) {
  await openContextMenu(page, ROW_DOCX);
  await page.getByTestId(menuItemTestId).first().click();
  await expect(page.getByTestId("aside")).toBeVisible();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Selector Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withSelectorPlugin"),
      // Inline handler returns SDK-compatible format: flat response array + top-level total.
      http.get(`http://localhost:${TEST_PORT}/api/2.0/people/filter`, () => {
        return new Response(
          JSON.stringify({
            response: [successSelf],
            count: 1,
            total: 1,
            status: 0,
            statusCode: 200,
          }),
        );
      }),
      // TODO: add a groupsHandler and use it instead of intercepting the group API here.
      http.get(`http://localhost:${TEST_PORT}/api/2.0/group`, () => {
        return new Response(JSON.stringify(groupsMockResponse));
      }),
    );
  });

  // ── 1. Base selector ─────────────────────────────────────────────────────────

  test("Base selector: selecting items updates submit button count, submit fires toast and closes selector", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-base");

    await expectScreenshot(page, [
      "desktop",
      "plugins-selector",
      "selector_base.png",
    ]);

    // Select Option A and Option B via their checkboxes.
    await page.getByTestId("selector-item-0").click();
    await page.getByTestId("selector-item-1").click();

    // Submit button shows the selection count.
    const submitBtn = page.getByTestId("selector_submit_button");
    await expect(submitBtn).toContainText("2");

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-selector",
      "selector_base-selected.png",
    ]);

    // Submit — selector closes, success toast appears.
    await submitBtn.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  test("Base selector: onSelect fires an info toast when an item is focused", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-base");

    // Click Option A — the onSelect callback fires and shows an info toast.
    await page.getByTestId("selector-item-0").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
    await expect(toast).toContainText("Focused: option-a");
  });

  // ── 2. File selector ─────────────────────────────────────────────────────────

  test("File selector: opens with header, search, footer checkbox and action buttons", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-file");

    await expect(page.getByTestId("aside-header")).toContainText(
      "File Selector",
    );
    await expect(page.getByTestId("selector_search_input")).toBeVisible();
    await expect(page.getByTestId("selector_footer_checkbox")).toBeVisible();

    await expect(page.getByTestId("selector_submit_button")).toContainText(
      "Choose",
    );
    await expect(page.getByTestId("selector_cancel_button")).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-selector",
      "selector_file-open.png",
    ]);
  });

  test("File selector: onSelect fires an info toast when a folder item is clicked", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-file");

    // Wait for the folder list to render (at least one item).
    await expect(page.getByTestId("selector-item-0")).toBeVisible();

    // Click the first item — onSelect fires with its id and shows an info toast.
    await page.getByTestId("selector-item-0").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "info");
    await expect(toast).toContainText("Navigated to:");
  });

  test("File selector: Cancel closes the selector", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-file");
    await page.getByTestId("selector_cancel_button").click();
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  // ── 3. Room selector ─────────────────────────────────────────────────────────

  test("Room selector: opens with header, search input and action buttons", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-room");

    await expect(page.getByTestId("room_selector")).toBeVisible();
    await expect(page.getByTestId("aside-header")).toContainText(
      "Room Selector",
    );
    await expect(page.getByTestId("selector_search_input")).toBeVisible();
    await expect(page.getByTestId("selector_submit_button")).toContainText(
      "Open",
    );
    await expect(page.getByTestId("selector_cancel_button")).toBeVisible();
  });

  test("Room selector: selecting a room and submitting fires toast and closes selector", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-room");

    // Wait for room items to load.
    await expect(page.getByTestId("selector-item-0")).toBeVisible();

    // Select the first room.
    await page.getByTestId("selector-item-0").click();

    // Submit — onSubmit fires with selectedIds, toast and close follow.
    await page.getByTestId("selector_submit_button").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Rooms selected:");
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  test("Room selector: Cancel closes the selector", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-room");
    await page.getByTestId("selector_cancel_button").click();
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  // ── 4. Group selector ────────────────────────────────────────────────────────

  test("Group selector: opens with header, shows mocked groups and submitting fires toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-group");

    await expect(page.getByTestId("groups_selector")).toBeVisible();
    await expect(page.getByTestId("aside-header")).toContainText(
      "Group Selector",
    );

    // Wait for mocked groups to appear.
    await expect(page.getByTestId("selector-item-0")).toBeVisible();
    await expect(page.getByTestId("selector-item-0")).toContainText(
      "Developers",
    );

    // Select the first group and submit.
    await page.getByTestId("selector-item-0").click();
    await page.getByTestId("selector_submit_button").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Groups selected:");
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  test("Group selector: close by click on overlay", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-group");
    await expect(page.getByTestId("groups_selector")).toBeVisible();

    // Close via the x header button.
    await page.mouse.click(0, 0);
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  // ── 5. User (People) selector ────────────────────────────────────────────────

  test("User selector: opens with header, Members/Groups tabs and action buttons", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-user");

    await expect(page.getByTestId("people-selector")).toBeVisible();
    await expect(page.getByTestId("aside-header")).toContainText(
      "User Selector",
    );
    await expect(page.getByTestId("0_tab")).toContainText("Members");
    await expect(page.getByTestId("1_tab")).toContainText("Groups");
    await expect(page.getByTestId("selector_submit_button")).toContainText(
      "Invite",
    );
    await expect(page.getByTestId("selector_cancel_button")).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-selector",
      "selector_user-open.png",
    ]);
  });

  test("User selector: shows Administrator user, selecting and submitting fires toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-user");

    // Wait for the Administrator user to appear.
    await expect(page.getByTestId("selector-item-0")).toBeVisible();
    await expect(page.getByTestId("selector-item-0")).toContainText(
      "Administrator",
    );

    // Select the user and submit.
    await page.getByTestId("selector-item-0").click();
    await page.getByTestId("selector_submit_button").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Users selected:");
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });

  test("User selector: Cancel closes the selector", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await openSelector(page, "selector-sample-user");
    await page.getByTestId("selector_cancel_button").click();
    await expect(page.getByTestId("aside")).not.toBeVisible();
  });
});

