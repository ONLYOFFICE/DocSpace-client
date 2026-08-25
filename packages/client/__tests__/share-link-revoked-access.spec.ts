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

import type { Page } from "@playwright/test";
import { ShareAccessRights } from "@docspace/shared/enums";
import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  primaryLinkHandler,
  rootHandler,
  roomListHandler,
  TypeRoomList,
  selfActivationStatusHandler,
  fileSharedUsersHandler,
} from "@docspace/shared/__mocks__/handlers";
import { createLinksRouteHandler } from "@docspace/shared/__mocks__/handlers/share/link";

// My Documents folder id from mock data
const MY_DOCS_FOLDER_ID = 12764;
const MY_DOCS_URL = `/rooms/personal/filter?folder=${MY_DOCS_FOLDER_ID}`;

// "ONLYOFFICE Resume Sample.pdf" (id 12). Its mocked availableShareRights offer
// only Editing, FillForms and None to external links — Read is not among them.
// A plain "read only" link on that file is therefore exactly the state Bug 82049
// is about: the access stored on the link is missing from the available rights.
const PDF_TITLE = "ONLYOFFICE Resume Sample";

async function openSharePanel(page: Page) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  // Toasts unrelated to sharing pop up on this page, and the container stays on
  // top and swallows clicks. Hide it for the whole test, not just once, so a
  // toast arriving later cannot block an interaction.
  await page.addStyleTag({
    content: "#toast-container { display: none !important; }",
  });

  // The info panel must be open before a row is selected: opened afterwards it
  // does not pick up the selection and never renders the share tab.
  //
  // Its toggle keeps the id "info-panel-toggle--open" in both states, so the
  // toggle cannot tell us whether the panel is open - clicking it blindly
  // closes an already open panel. The panel header is the actual state signal.

  await page.locator("#info-panel-toggle--open").first().click({ force: true });
  const panelHeader = page.getByTestId("info_panel_aside_header");
  await expect(panelHeader).toBeVisible();

  // Match by title rather than by row index, which depends on sort order.
  // The file table renders the name without the extension.
  const file = table
    .locator('[data-testid^="table-row-"]')
    .filter({ hasText: PDF_TITLE })
    .first();

  const icon = file.getByTestId("room-icon");

  await icon.click();

  const checkBox = file.getByRole("checkbox");

  await checkBox.check();

  const shareTab = page.getByTestId("info_share_tab");
  await expect(shareTab).toBeVisible();
  await shareTab.click();

  const sharePanel = page.getByTestId("info_panel_files_view_share");
  await expect(sharePanel).toBeVisible();

  return sharePanel;
}

test.describe("Share link whose access is no longer available (Bug 82049)", () => {
  test.beforeEach(({ mockRequest }) => {
    // Each test boots the app, opens the info panel and drills into a dropdown,
    // which exceeds the default 30s budget on a loaded machine.
    test.slow();

    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
      createLinksRouteHandler(
        TEST_PORT,
        {
          access: ShareAccessRights.ReadOnly,
          title: "Shared link",
        },
        "GET",
        true,
      ),
      primaryLinkHandler(TEST_PORT),
    );
  });

  test("Link settings panel keeps the current access selected and disabled", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${MY_DOCS_URL}`);

    const sharePanel = await openSharePanel(page);
    await expect(sharePanel.getByTestId("shared-links")).toBeVisible();

    await sharePanel.getByTestId("context-menu-button").first().click();
    await page.getByTestId("edit-link-key_item").click();

    // The aside wrapper itself stays pointer-events:none, so assert on the
    // panel content rather than on the modal root.
    await expect(page.getByTestId("edit_link_panel_modal")).toBeAttached();

    // Regression guard: the role selector used to render empty here, or to
    // silently fall back to the last available role ("Filling").
    const roleSelect = page.getByTestId("edit_link_panel_role_access_select");
    await expect(roleSelect).toBeVisible();
    await expect(roleSelect).toContainText("Read only");

    await roleSelect.click();

    // The access the link still carries is listed, but cannot be picked again.
    const currentAccess = page.getByTestId("access_right_option_viewing");
    await expect(currentAccess).toBeVisible();
    await expect(currentAccess).toHaveAttribute("aria-disabled", "true");

    // A right that is still available stays selectable.
    const availableAccess = page.getByTestId("access_right_option_editing");
    await expect(availableAccess).toBeVisible();
    await expect(availableAccess).not.toHaveAttribute("aria-disabled", "true");
  });

  test("Share tab combobox keeps the current access selected and disabled", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${MY_DOCS_URL}`);

    const sharePanel = await openSharePanel(page);
    await expect(sharePanel.getByTestId("shared-links")).toBeVisible();

    // The link row holds two comboboxes without their own test ids: the link
    // type selector first, the access selector second. Pin that order so a
    // layout change fails here instead of silently shifting the assertions.
    const comboboxes = sharePanel.getByTestId("combobox");
    await expect(comboboxes).toHaveCount(2);
    await expect(
      comboboxes.nth(0).locator('svg[data-src*="universe.react.svg"]'),
    ).toBeVisible();

    const accessCombobox = comboboxes.nth(1);

    // Regression guard: with no option matching the link access the combobox
    // fell back to an empty selection and rendered no icon at all. The eye
    // icon is the one of the "viewing" option the link still carries.
    await expect(
      accessCombobox.locator('svg[data-src*="eye.react.svg"]'),
    ).toBeVisible();

    await accessCombobox.click();

    // The access the link still carries is listed, but cannot be picked again.
    const currentAccess = page.getByTestId("drop_down_item_viewing");
    await expect(currentAccess).toBeVisible();
    await expect(currentAccess).toHaveAttribute("aria-disabled", "true");

    // A right that is still available stays selectable.
    const availableInRow = page.getByTestId("drop_down_item_editing");
    await expect(availableInRow).toBeVisible();
    await expect(availableInRow).not.toHaveAttribute("aria-disabled", "true");
  });
});

