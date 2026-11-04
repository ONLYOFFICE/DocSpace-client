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

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Share tab renders its links and members through
 * `@docspace/shared/components/share/sub-components/List`, a virtualized list
 * that measures the info panel's scroll container. It finds that container
 * through ui-kit's ScrollbarContext, provided by Section.InfoPanelBody, and
 * renders nothing while the context has no scroller.
 *
 * pnpm installs ui-kit once per peer set, and client and shared resolve
 * different ones. Unless the bundler dedupes the package (`config/resolve.ts`),
 * the list imported through shared reads a second ScrollbarContext that is
 * never provided: the tab shows the "Share this document" bar above an empty
 * area, with no way to create a link. The wrapper (`shared-links`) still
 * renders, so these tests assert on the rows inside the list.
 */

const MY_DOCS_FOLDER_ID = 12764;
const MY_DOCS_URL = `/rooms/personal/filter?folder=${MY_DOCS_FOLDER_ID}`;

async function openSharePanel(page: Page) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  const openToggle = page.locator('[id="info-panel-toggle--open"]');
  if (await openToggle.isVisible()) {
    await openToggle.click();
  }

  await table.getByTestId("table-row-3").click();

  const shareTab = page.getByTestId("info_share_tab");
  await expect(shareTab).toBeVisible();
  await shareTab.click();

  const sharePanel = page.getByTestId("info_panel_files_view_share");
  await expect(sharePanel).toBeVisible();

  return sharePanel;
}

test.describe("Info panel — Share tab list", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    // Selecting a new file marks it as read. Without a response the app reads
    // `res[0]` of undefined and shows a persistent error toast over the tabs.
    await page.route(/\/files\/fileops\/markasread$/, (route) =>
      route.fulfill({ json: { response: [] } }),
    );

    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
      primaryLinkHandler(TEST_PORT),
    );
  });

  test("file without links offers to create one", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      createLinksRouteHandler(TEST_PORT, [], "GET" as never, true),
    );

    await page.goto(`${baseUrl}${MY_DOCS_URL}`);
    const sharePanel = await openSharePanel(page);

    await expect(
      sharePanel.getByTestId("info_panel_members_list_item_0"),
    ).toBeVisible();
    await expect(
      sharePanel.getByTestId("info_panel_share_create_and_copy_link").first(),
    ).toBeVisible();
  });

  test("file with a link lists it", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      createLinksRouteHandler(
        TEST_PORT,
        { access: ShareAccessRights.ReadOnly, title: "Shared link" },
        "GET" as never,
        true,
      ),
    );

    await page.goto(`${baseUrl}${MY_DOCS_URL}`);
    const sharePanel = await openSharePanel(page);

    await expect(
      sharePanel
        .getByTestId("info_panel_members_list_item_1")
        .getByText("Shared link", { exact: true }),
    ).toBeVisible();
  });
});
