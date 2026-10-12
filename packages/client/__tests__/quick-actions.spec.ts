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
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  roomListHandler,
  TypeRoomList,
  filesSettingsHandler,
  showQuickActionsHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

const ROOMS_URL = "/rooms/shared/";
const PROFILE_URL = "/profile/file-management";

const BANNER = "quick-actions";
const CLOSE = "quick-actions-close";
const TOAST = ".Toastify__toast";
const PROFILE_TOGGLE = "show_quick_actions_toggle_button";

/**
 * Hiding the banner is a portal setting, not a page state: the choice follows
 * the user everywhere and is only reversible from the toast or the profile.
 * These cases walk that round trip, which the screenshot matrices cannot -
 * they pin what the banner looks like, never what closing it does.
 */
test.describe("Quick actions visibility", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      // The banner only offers what the signed-in user may create, so an
      // audience that can create nothing has no banner to hide.
      selfByTypeHandler(TEST_PORT, "admin"),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("hides the banner and offers it back from the toast", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    const banner = page.getByTestId(BANNER);
    await expect(banner).toBeVisible();

    await banner.getByTestId(CLOSE).click();

    await expect(banner).toBeHidden();

    const toast = page.locator(TOAST);
    await expect(toast).toContainText("Quick actions hidden");

    // Undo is the only way back that does not go through the profile, so the
    // toast has to be the thing that restores it.
    await toast.getByRole("button", { name: "Undo" }).click();

    await expect(page.getByTestId(BANNER)).toBeVisible();
  });

  test("restores the banner from the keyboard", async ({ page, baseUrl }) => {
    // The Undo link is a bare anchor with no href: without a role and a
    // tabIndex of its own it is neither announced nor reachable, and five
    // seconds is not long enough to go looking for a mouse.
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    const banner = page.getByTestId(BANNER);
    await expect(banner).toBeVisible();

    await banner.getByTestId(CLOSE).click();
    await expect(banner).toBeHidden();

    const undo = page.locator(TOAST).getByRole("button", { name: "Undo" });
    await undo.focus();
    await expect(undo).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(page.getByTestId(BANNER)).toBeVisible();
  });

  test("keeps the banner away for a user who turned it off", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      filesSettingsHandler(TEST_PORT, { showQuickActions: false }),
    );

    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(page.getByTestId("table-body")).toBeVisible();
    await expect(page.getByTestId(BANNER)).toBeHidden();
  });

  test("puts the banner back when the portal refuses the change", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(showQuickActionsHandler(TEST_PORT, 500));

    await page.goto(`${baseUrl}${ROOMS_URL}`);

    const banner = page.getByTestId(BANNER);
    await expect(banner).toBeVisible();

    await banner.getByTestId(CLOSE).click();

    // Hiding is optimistic, so the banner does go away first - it has to come
    // back, or the setting would read as saved while the portal still has it on
    // and the next reload would bring the banner back unexplained.
    await expect(page.getByTestId(BANNER)).toBeVisible();
  });

  test("mirrors the setting in the profile toggle", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      filesSettingsHandler(TEST_PORT, { showQuickActions: false }),
    );

    await page.goto(`${baseUrl}${PROFILE_URL}`);

    const toggle = page.getByTestId(PROFILE_TOGGLE);
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.getByTestId("toggle-button-container").click();

    await expect(toggle).toHaveAttribute("aria-checked", "true");
  });
});
