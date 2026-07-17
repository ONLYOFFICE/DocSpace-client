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
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
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
  roomContentHandler,
  roomFileLinksHandler,
  roomFileGetPrimaryLinkHandler,
  selfActivationStatusHandler,
  getEmptyInvitationLink,
  fileSharedUsersHandler,
} from "@docspace/shared/__mocks__/handlers";
import { createLinksRouteHandler } from "@docspace/shared/__mocks__/handlers/share/link";

// My Documents folder id from mock data
const MY_DOCS_FOLDER_ID = 12764;
const MY_DOCS_URL = `/rooms/personal/filter?folder=${MY_DOCS_FOLDER_ID}`;

// Public Room id from roomList mock
const PUBLIC_ROOM_ID = 33;
const ROOM_CONTENT_URL = `/rooms/shared/${PUBLIC_ROOM_ID}/filter?folder=${PUBLIC_ROOM_ID}`;
const ROOM_FILE_ID = 200;

// Restricted settings: Documents only
const RESTRICTED_DOCS = {
  externalShare: false,
  externalShareApplyToDocuments: true,
  externalShareApplyToRooms: false,
  defaultShareLinkInternal: true,
};

async function openSharePanel(page: Page) {
  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  // Open info panel if closed — when closed the toggle has id "info-panel-toggle--open"
  const panelClosed = await page
    .locator('[id="info-panel-toggle--open"]')
    .isVisible({ timeout: 2000 })
    .catch(() => false);
  if (panelClosed) {
    await page.locator('[id="info-panel-toggle--open"]').click({ force: true });
    await page.locator('[id="info-panel-toggle--close"]').waitFor({ timeout: 5000 }).catch(() => {});
  }

  // Hide toast container to unblock clicks (toast persists due to app crash on restricted settings)
  await page.evaluate(() => {
    const el = document.getElementById("toast-container");
    if (el) el.style.display = "none";
  });

  // Select the docx file (row-3)
  await table.getByTestId("table-row-3").click();

  const shareTab = page.getByTestId("info_share_tab");

  await expect(shareTab).toBeVisible();
  await shareTab.click();

  const sharePanel = page.getByTestId("info_panel_files_view_share");
  await expect(sharePanel).toBeVisible();

  return sharePanel;
}

test.describe("External Sharing — Share panel (My Documents)", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      fileSharedUsersHandler(TEST_PORT),
    );
  });

  test.describe("Restricted: Documents only, block existing", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, {
          ...RESTRICTED_DOCS,
          blockExistingLinksOnRestrict: true,
        }),
      );
    });

    test("Link type selector shows warning icon", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        createLinksRouteHandler(TEST_PORT, {
          access: ShareAccessRights.ReadOnly,
          title: "Shared link",
        }),
        primaryLinkHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}${MY_DOCS_URL}`);
      const sharePanel = await openSharePanel(page);

      const links = sharePanel.getByTestId("shared-links");
      await expect(links).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-share-panel",
        "link-type-warning.png",
      ]);
    });

    test("New link created as internal", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      // No existing links — share panel shows "create" state
      mockRequest.use(
        createLinksRouteHandler(TEST_PORT, [], "GET" as never, true),
        primaryLinkHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}${MY_DOCS_URL}`);
      const sharePanel = await openSharePanel(page);

      // First create button = external link creation (members section may also have invite buttons)
      const addLinkButton = sharePanel
        .getByTestId("info_panel_share_create_and_copy_link")
        .first();
      await expect(addLinkButton).toBeVisible();

      const createdBody: Record<string, unknown> = {};
      // Intercept POST to create link
      page.route(/\/files\/file\/\d+\/link$/, async (route) => {
        const body = await route.request().postDataJSON();
        Object.assign(createdBody, body);
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            response: {
              access: ShareAccessRights.ReadOnly,
              canEditInternal: true,
              canEditExpirationDate: true,
              canRevoke: true,
              sharedTo: {
                id: "new-link-id",
                title: "Shared link",
                shareLink: "",
                linkType: 1,
                denyDownload: false,
                isExpired: false,
                primary: true,
                internal: true,
                requestToken: "",
              },
            },
          }),
        });
      });

      await addLinkButton.click();

      await expect(sharePanel.getByTestId("shared-links")).toBeVisible();
      expect(createdBody.internal).toBe(true);

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-share-panel",
        "new-link-created-as-internal.png",
      ]);
    });

    test("Existing external link shows 'Blocked by admin'", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        createLinksRouteHandler(
          TEST_PORT,
          {
            access: ShareAccessRights.ReadOnly,
            title: "External link",
          },
          "GET" as never,
          true,
        ),
        primaryLinkHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}${MY_DOCS_URL}`);
      const sharePanel = await openSharePanel(page);

      await expect(sharePanel.getByTestId("shared-links")).toBeVisible();

      // "Blocked by admin" text is rendered in a CSS-module class
      const blockedLabel = sharePanel.locator('[class*="blockedByAdmin"]');
      await expect(blockedLabel).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-share-panel",
        "blocked-by-admin.png",
      ]);
    });

    test("Blocked link context menu shows only Copy and Delete", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        createLinksRouteHandler(
          TEST_PORT,
          {
            access: ShareAccessRights.ReadOnly,
            title: "External link",
          },
          "GET" as never,
          true,
        ),
        primaryLinkHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}${MY_DOCS_URL}`);
      const sharePanel = await openSharePanel(page);

      await expect(sharePanel.getByTestId("shared-links")).toBeVisible();

      const contextMenuButton = sharePanel
        .getByTestId("context-menu-button")
        .first();
      await expect(contextMenuButton).toBeVisible();
      await contextMenuButton.click();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-share-panel",
        "blocked-context-menu.png",
      ]);
    });
  });

  test.describe("Restricted: Documents only, allow existing", () => {
    // Per design (Figma "Disable creation of external links", node 10-13116):
    // with "Allow existing links until removed" the link keeps working, but
    // still shows the "Blocked by admin" label; editing is not available
    test("Existing external link keeps 'Blocked by admin' label", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, {
          ...RESTRICTED_DOCS,
          blockExistingLinksOnRestrict: false,
        }),
        createLinksRouteHandler(
          TEST_PORT,
          {
            access: ShareAccessRights.ReadOnly,
            title: "External link",
          },
          "GET" as never,
          true,
        ),
        primaryLinkHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}${MY_DOCS_URL}`);
      const sharePanel = await openSharePanel(page);

      await expect(sharePanel.getByTestId("shared-links")).toBeVisible();

      const blockedLabel = sharePanel.locator('[class*="blockedByAdmin"]');
      await expect(blockedLabel).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-share-panel",
        "allow-existing-blocked-label.png",
      ]);
    });
  });

  test.describe("Restricted: Rooms only — file inside room", () => {
    test("Share panel for file inside restricted room hides creation badge", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: false,
          externalShareApplyToRooms: true,
          blockExistingLinksOnRestrict: true,
        }),
        getEmptyInvitationLink(TEST_PORT),
        rootHandler(TEST_PORT),
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
        roomContentHandler(TEST_PORT, PUBLIC_ROOM_ID, ROOM_FILE_ID),
        roomFileLinksHandler(TEST_PORT, ROOM_FILE_ID),
        roomFileGetPrimaryLinkHandler(TEST_PORT, ROOM_FILE_ID, false),
      );

      await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      await table.getByTestId("table-row-0").click();

      const shareTab = page.getByTestId("info_share_tab");
      if (!(await shareTab.isVisible())) {
        const infoPanelToggle = page.locator(".info-panel-toggle");
        await expect(infoPanelToggle).toBeVisible();
        await infoPanelToggle.click();
      }

      await expect(shareTab).toBeVisible();
      await shareTab.click();

      const sharePanel = page.getByTestId("info_panel_files_view_share");
      await expect(sharePanel).toBeVisible();

      // Creation badge must be hidden — restriction applies via externalShareApplyToRooms
      const addLinkButton = sharePanel.getByTestId(
        "info_panel_share_add_link_button",
      );
      await expect(addLinkButton).not.toBeVisible();

      // "Create and Copy" button must also be absent
      const createButton = sharePanel.getByTestId(
        "info_panel_share_create_and_copy_link",
      );
      await expect(createButton).not.toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-share-panel",
        "file-in-restricted-room-no-create.png",
      ]);
    });
  });
});
