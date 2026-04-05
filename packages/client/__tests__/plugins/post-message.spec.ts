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
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  webPluginsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/post-message/plugin.js";
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Opens the profile-avatar dropdown. */
async function openProfileMenu(
  page: import("@playwright/test").Page,
): Promise<void> {
  const btn = page.getByTestId("profile_user_icon_button");
  await expect(btn).toBeVisible();
  await btn.click();
}

/** Opens the profile menu and clicks the plugin item. */
async function clickOpenPanelItem(
  page: import("@playwright/test").Page,
): Promise<void> {
  await openProfileMenu(page);
  await page.getByTestId("post-message-open-panel").click();
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("PostMessage Plugin — IPostMessagePlugin via profile menu", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withPostMessagePlugin"),
    );
  });

  // ── 1. Modal body contains the embedded iframe ────────────────────────────

  test("Modal body contains the embedded iframe", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickOpenPanelItem(page);

    const dialog = page.getByTestId("modal-dialog");
    await expect(dialog).toBeVisible();

    const iframe = dialog.locator("iframe[name='post-message-frame']");
    await expect(iframe).toBeVisible();
  });

  // ── 2. postMessage from page triggers a success toast ─────────────────────
  //
  // Simulates what the embedded iframe does:
  //   window.parent.postMessage(JSON.stringify({ source: "post-message-plugin", data: "work" }), "*")
  // The plugin's `window.parent.addEventListener("message", ...)` (installed at
  // module level) catches it and calls `postMessageCallback` with Actions.showToast.

  test("Dispatching a postMessage event triggers a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    // Simulate a postMessage from the embedded iframe (sent as a JSON string).
    await page.evaluate(() => {
      window.postMessage(
        JSON.stringify({ source: "post-message-plugin", data: "work" }),
        "*",
      );
    });

    // onClick fires a success toast.
    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
  });

  // ── 3. Clicking the iframe button triggers a toast ────────────────────────
  //
  // Verifies the real end-to-end flow: button inside the dialog iframe fires
  // window.parent.postMessage(JSON.stringify({...}), "*"), which the plugin's
  // module-level listener on the portal window catches.

  test("Clicking the 'Send Message' button inside the iframe triggers a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await clickOpenPanelItem(page);

    const dialog = page.getByTestId("modal-dialog");
    await expect(dialog).toBeVisible();

    // Access the button inside the sandboxed iframe and click it.
    const sendBtn = page
      .frameLocator("iframe[name='post-message-frame']")
      .getByRole("button", { name: "Send Message" });
    await expect(sendBtn).toBeVisible();
    await sendBtn.click();

    // onClick fires a success toast.
    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
  });
});

