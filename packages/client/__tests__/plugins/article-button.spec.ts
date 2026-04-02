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
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "../fixtures/base";

const PLUGIN_REQUEST_URL = "**/plugins/article-button/plugin.js";

// Personal folder — article sidebar is visible here.
const PERSONAL_FOLDER_URL = "/rooms/personal/filter?folder=12764";

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe("Article Button Sample Plugin", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithPlugins),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      webPluginsHandler(TEST_PORT, "withArticleButtonPlugin"),
    );
  });

  // ── 1. Items visible ─────────────────────────────────────────────────────────

  test("Article button items are visible in the sidebar", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const notifyBtn = page.locator("#article-button-sample-notify-btn");
    const statusBtn = page.locator("#article-button-sample-status-btn");

    await expect(notifyBtn).toBeVisible();
    await expect(statusBtn).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-button",
      "article-button_sidebar.png",
    ]);
  });

  // ── 2. Notification button ────────────────────────────────────────────────────

  test("Notification button fires a success toast", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    await page.locator("#article-button-sample-notify-btn").click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Notification button clicked!");
  });

  // ── 3. Status button (onLoad) ─────────────────────────────────────────────────

  test("Status button is visible after onLoad resolves", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    // onLoad replaces the skeleton with an icon button — wait for it to appear.
    const statusBtn = page.locator("#article-button-sample-status-btn");
    await expect(statusBtn).toBeVisible();
  });

  test("Status button fires a success toast", async ({ page, baseUrl }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    const statusBtn = page.locator("#article-button-sample-status-btn");
    await expect(statusBtn).toBeVisible();
    await statusBtn.click();

    const toast = page.getByTestId("toast-content");
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("data-type", "success");
    await expect(toast).toContainText("Status button clicked!");
  });

  // ── 4. Collapsed article ──────────────────────────────────────────────────────
  //
  // The hide/show sidebar toggle is CSS display:none on desktop (≥ 1024 px).
  // Strategy:
  //   1. Navigate at the default desktop viewport — article starts expanded.
  //   2. Resize inline to 900 px (tablet) so the toggle becomes CSS-visible
  //      without resetting React state (showText stays true).
  //   3. Click to collapse, then verify only the first button fits in the
  //      60 px rail.

  test("First article button remains visible when the sidebar is collapsed", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}${PERSONAL_FOLDER_URL}`);
    await pluginLoaded;

    // Buttons must be visible while the article is expanded at desktop width.
    await expect(
      page.locator("#article-button-sample-notify-btn"),
    ).toBeVisible();
    await expect(
      page.locator("#article-button-sample-status-btn"),
    ).toBeVisible();

    // Resize to tablet — the hide-menu toggle gains display:flex via CSS
    // (desktop mixin no longer applies) but React showText state is unchanged.
    await page.setViewportSize({ width: 900, height: 1024 });

    // Collapse the sidebar.
    await page.locator(".article-hide-menu-container").click();

    // Article container must now report collapsed state.
    await expect(page.getByTestId("article")).toHaveAttribute(
      "data-show-text",
      "false",
    );

    // The first button (32 px) fits within the collapsed 60 px rail.
    await expect(
      page.locator("#article-button-sample-notify-btn"),
    ).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-button",
      "article-button_collapsed.png",
    ]);
  });

  // ── 5. Settings page ──────────────────────────────────────────────────────────

  test("Article button items are visible on the portal settings page", async ({
    page,
    baseUrl,
  }) => {
    const pluginLoaded = page.waitForResponse(PLUGIN_REQUEST_URL);
    await page.goto(`${baseUrl}/portal-settings/integration/plugins`);
    await pluginLoaded;

    await expect(
      page.locator("#article-button-sample-notify-btn"),
    ).toBeVisible();
    await expect(
      page.locator("#article-button-sample-status-btn"),
    ).toBeVisible();

    await page.mouse.move(0, 0);
    await expectScreenshot(page, [
      "desktop",
      "plugins-article-button",
      "article-button_settings.png",
    ]);
  });
});

