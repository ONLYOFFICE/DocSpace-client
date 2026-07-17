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
 * modify or replace the licensing terms applicable to the Moon's
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
  roomListHandler,
  TypeRoomList,
  rootHandler,
  myDocumentsHandler,
  myHandler,
  primaryLinkHandler,
  roomPrimaryLinkHandler,
  roomLinksHandler,
  roomFilePrimaryLinkHandler,
  roomFileGetPrimaryLinkHandler,
  roomFileLinksHandler,
  roomContentHandler,
  roomMembersHandlers,
  makeRoomLink,
  selfActivationStatusHandler,
  getEmptyInvitationLink,
} from "@docspace/shared/__mocks__/handlers";
import { createLinksRouteHandler } from "@docspace/shared/__mocks__/handlers/share/link";

const BLOCKED_WARNING =
  "This link is blocked by admin and won't work for external users";

const ROOMS_URL = "/rooms/shared/";
const MY_DOCS_URL = "/rooms/personal/filter?folder=12764";

// Public Room id from roomList mock (getRoomList index 0, roomType 6)
const PUBLIC_ROOM_ID = 33;
const ROOM_FILE_ID = 200;
const ROOM_CONTENT_URL = `/rooms/shared/${PUBLIC_ROOM_ID}/filter?folder=${PUBLIC_ROOM_ID}`;

const RESTRICTED_ROOMS = {
  externalShare: false,
  externalShareApplyToDocuments: false,
  externalShareApplyToRooms: true,
  blockExistingLinksOnRestrict: true,
};

// Admin user id from settings/self mocks — used as the room owner in members
const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

// The members panel loads room links via getRoomMembers({filterType: 2}),
// so the same /share endpoint must also serve the link items
const roomOwnerMembers = (internalLink = false) =>
  roomMembersHandlers(TEST_PORT, PUBLIC_ROOM_ID, {
    initial: [{ id: ADMIN_ID, displayName: "Administrator", access: 0 }],
    links: [makeRoomLink(internalLink)],
  });


async function openRoomMembersPanel(page: Page, baseUrl: string) {
  // Navigate inside the room: fetchFiles sets infoPanelRoom from data.current
  await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
  await expect(page.getByTestId("table-body")).toBeVisible();

  // info_members_tab testid = "info_members_tab" (PrimaryTabs uses `${item.id}_tab`)
  const membersTab = page.getByTestId("info_members_tab");

  if (!(await membersTab.isVisible().catch(() => false))) {
    const infoPanelToggle = page.locator(".info-panel-toggle");
    await expect(infoPanelToggle).toBeVisible();
    await infoPanelToggle.click();
    await expect(membersTab).toBeVisible({ timeout: 10000 });
  }

  await membersTab.click();

  const membersPanel = page.getByTestId("info_panel_files_view_members");
  await expect(membersPanel).toBeVisible();

  return membersPanel;
}

test.describe("External Sharing — Rooms", () => {
  test.beforeEach(({ mockRequest }) => {
    // getEmptyInvitationLink / roomPrimaryLinkHandler must NOT be registered
    // globally: their wildcard paths break the My Documents page load
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
    );
  });

  test.describe("Room list", () => {
    test("Public Room shows (Restricted) badge", async ({
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
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      );

      await page.goto(`${baseUrl}${ROOMS_URL}`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Public Room is at row-0 in IsDefault list (roomType: 6, shared: true)
      const publicRoomRow = table.getByTestId("table-row-0");
      await expect(publicRoomRow).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "restricted-badge.png",
      ]);
    });

    test("Public Room not disabled in create room dialog when restriction applies only to documents", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: true,
          externalShareApplyToRooms: false,
          blockExistingLinksOnRestrict: true,
        }),
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      );

      await page.goto(`${baseUrl}${ROOMS_URL}`);

      await expect(page.getByTestId("table-body")).toBeVisible();

      // Open the create-room dialog with the room type chooser — the same
      // ROOM_CREATE event QuickActions tiles fire, but without startRoomType
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent("create_room", { detail: {} }));
      });

      const roomTypeList = page.getByTestId("room-type-list-item").first();
      await expect(roomTypeList).toBeVisible();

      // Public Room item must have no disabled tooltip — restriction doesn't apply to rooms
      const publicRoomItem = page
        .getByTestId("room-type-list-item")
        .filter({ hasText: "Public room" });
      await expect(publicRoomItem).not.toHaveAttribute(
        "data-tooltip-id",
        "create-room-tooltip",
      );

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "public-room-enabled-docs-only-restriction.png",
      ]);
    });

    test("Public Room disabled in create room dialog", async ({
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
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      );

      await page.goto(`${baseUrl}${ROOMS_URL}`);

      await expect(page.getByTestId("table-body")).toBeVisible();

      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent("create_room", { detail: {} }));
      });

      // Room type list should be visible
      const roomTypeList = page.getByTestId("room-type-list-item").first();
      await expect(roomTypeList).toBeVisible();

      // Public Room item must be disabled — restriction applies to rooms
      const publicRoomItem = page
        .getByTestId("room-type-list-item")
        .filter({ hasText: "Public room" });
      await expect(publicRoomItem).toHaveAttribute(
        "data-tooltip-id",
        "create-room-tooltip",
      );

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "public-room-disabled.png",
      ]);
    });
  });

  test.describe("Members panel — Rooms restricted", () => {
    test("Documents-only restriction doesn't affect rooms", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        ...roomOwnerMembers(),
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: true,
          externalShareApplyToRooms: false,
          blockExistingLinksOnRestrict: true,
        }),
        getEmptyInvitationLink(TEST_PORT),
        roomPrimaryLinkHandler(TEST_PORT, PUBLIC_ROOM_ID, false),
        roomLinksHandler(TEST_PORT, PUBLIC_ROOM_ID, false),
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
        roomContentHandler(TEST_PORT, PUBLIC_ROOM_ID, ROOM_FILE_ID),
      );

      const membersPanel = await openRoomMembersPanel(page, baseUrl);

      const addLinkButton = membersPanel.getByTestId(
        "info_panel_members_add_new_link_button",
      );
      await expect(addLinkButton).toBeVisible();

      const restrictedBar = membersPanel.getByTestId(
        "info_panel_members_restricted_bar",
      );
      await expect(restrictedBar).not.toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "docs-restriction-no-effect-on-rooms.png",
      ]);
    });

    test("Existing room link shows 'Blocked by admin'", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        ...roomOwnerMembers(),
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: false,
          externalShareApplyToRooms: true,
          blockExistingLinksOnRestrict: true,
        }),
        getEmptyInvitationLink(TEST_PORT),
        roomPrimaryLinkHandler(TEST_PORT, PUBLIC_ROOM_ID, false),
        roomLinksHandler(TEST_PORT, PUBLIC_ROOM_ID, false),
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
        roomContentHandler(TEST_PORT, PUBLIC_ROOM_ID, ROOM_FILE_ID),
      );

      const membersPanel = await openRoomMembersPanel(page, baseUrl);

      await expect(
        membersPanel.getByTestId("info_panel_members_links_block"),
      ).toBeVisible();

      const blockedLabel = membersPanel.locator('[class*="blockedByAdmin"]');
      await expect(blockedLabel).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "room-link-blocked.png",
      ]);
    });

    test("Add link button hidden when Rooms restricted", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        ...roomOwnerMembers(true),
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: false,
          externalShareApplyToRooms: true,
          blockExistingLinksOnRestrict: true,
        }),
        getEmptyInvitationLink(TEST_PORT),
        roomPrimaryLinkHandler(TEST_PORT, PUBLIC_ROOM_ID, true),
        roomLinksHandler(TEST_PORT, PUBLIC_ROOM_ID, true),
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
        roomContentHandler(TEST_PORT, PUBLIC_ROOM_ID, ROOM_FILE_ID),
      );

      const membersPanel = await openRoomMembersPanel(page, baseUrl);

      await expect(
        membersPanel.getByTestId("info_panel_members_links_block"),
      ).toBeVisible();

      const addLinkButton = membersPanel.getByTestId(
        "info_panel_members_add_new_link_button",
      );
      await expect(addLinkButton).not.toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "add-link-button-hidden.png",
      ]);
    });
  });

  test.describe("Members panel — Rooms restriction doesn't affect My Documents", () => {
    test("Rooms-only restriction doesn't affect My Documents share panel", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      // Do not re-register myDocumentsHandler here: its files/:id pattern
      // would shadow the beforeEach rootHandler and hijack files/@root
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, {
          externalShare: false,
          externalShareApplyToDocuments: false,
          externalShareApplyToRooms: true,
          blockExistingLinksOnRestrict: true,
        }),
        createLinksRouteHandler(
          TEST_PORT,
          { access: ShareAccessRights.ReadOnly, title: "External link" },
          "GET" as never,
          true,
        ),
        primaryLinkHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}${MY_DOCS_URL}`);

      // Hide toast container to prevent crashes from blocking rendering
      await page.evaluate(() => {
        const el = document.getElementById("toast-container");
        if (el) el.style.display = "none";
      });

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible({ timeout: 15000 });

      // Open info panel if closed — when closed toggle has id "info-panel-toggle--open"
      const panelClosed = await page
        .locator('[id="info-panel-toggle--open"]')
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (panelClosed) {
        await page.locator('[id="info-panel-toggle--open"]').click({ force: true });
        await page.locator('[id="info-panel-toggle--close"]').waitFor({ timeout: 5000 }).catch(() => {});
      }

      // Select docx file (row-3) — force to bypass any toast overlay
      await table.getByTestId("table-row-3").click({ force: true });

      const shareTab = page.getByTestId("info_share_tab");

      await expect(shareTab).toBeVisible();
      // Re-hide toasts that may have appeared after the first cleanup
      await page.evaluate(() => {
        const el = document.getElementById("toast-container");
        if (el) el.style.display = "none";
      });
      await shareTab.click();

      const sharePanel = page.getByTestId("info_panel_files_view_share");
      await expect(sharePanel).toBeVisible();

      // No "Blocked by admin" — rooms restriction doesn't affect My Documents
      const blockedLabel = sharePanel.locator('[class*="blockedByAdmin"]');
      await expect(blockedLabel).not.toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "rooms-restriction-no-effect-on-docs.png",
      ]);
    });
  });

  // ─── Blocked copy: room list quick button and context menu ───────────────

  test.describe("Blocked copy — room list", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, RESTRICTED_ROOMS),
        roomPrimaryLinkHandler(TEST_PORT, PUBLIC_ROOM_ID, false), // before roomListHandler to avoid wildcard intercept
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      );
    });

    test("Quick button copy link on restricted room shows error toast", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${ROOMS_URL}`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      // Hover to reveal quick action buttons
      const row = table.getByTestId("table-row-0");
      await row.hover();

      const copyLinkBtn = row.locator(".badge.copy-link").first();
      await expect(copyLinkBtn).toBeVisible();
      await copyLinkBtn.click();

      await expect(page.getByText(BLOCKED_WARNING)).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "quick-copy-link-blocked-toast.png",
      ]);
    });

    test("Context menu 'Copy shared link' on restricted room shows error toast", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${ROOMS_URL}`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const row = table.getByTestId("table-row-0");
      const contextMenuButton = row.getByTestId("context-menu-button").first();
      await expect(contextMenuButton).toBeVisible();
      await contextMenuButton.click();

      await page.getByTestId("option_copy-external-link").click();

      await expect(page.getByText(BLOCKED_WARNING)).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "context-menu-copy-link-blocked-toast.png",
      ]);
    });
  });

  test.describe("Blocked copy — files inside restricted room", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        filesSettingsHandler(TEST_PORT, RESTRICTED_ROOMS),
        getEmptyInvitationLink(TEST_PORT),
        roomFilePrimaryLinkHandler(TEST_PORT, ROOM_FILE_ID, false),
        roomFileGetPrimaryLinkHandler(TEST_PORT, ROOM_FILE_ID, false),
        roomFileLinksHandler(TEST_PORT, ROOM_FILE_ID),
        roomContentHandler(TEST_PORT, PUBLIC_ROOM_ID, ROOM_FILE_ID),
        roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      );
    });

    test("Quick button copy link on file inside restricted room shows error toast", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const row = table.getByTestId("table-row-0");
      await row.hover();

      const copyLinkBtn = row.locator(".badge.copy-link").first();
      await expect(copyLinkBtn).toBeVisible();
      await copyLinkBtn.click();

      await expect(page.getByText(BLOCKED_WARNING)).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "file-quick-copy-link-blocked-toast.png",
      ]);
    });

    test("Context menu 'Copy shared link' on file inside restricted room shows error toast", async ({
      page,
      baseUrl,
    }) => {
      await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);

      const table = page.getByTestId("table-body");
      await expect(table).toBeVisible();

      const row = table.getByTestId("table-row-0");
      const contextMenuButton = row.getByTestId("context-menu-button").first();
      await expect(contextMenuButton).toBeVisible();
      await contextMenuButton.click();

      // copy-shared-link is inside "Share" submenu for file items
      const shareGroup = page.getByTestId("share");
      if (await shareGroup.isVisible({ timeout: 1000 }).catch(() => false)) {
        await shareGroup.click();
      }

      await page.getByTestId("option_copy-shared-link").click();

      await expect(page.getByText(BLOCKED_WARNING)).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "external-sharing-rooms",
        "file-context-menu-copy-link-blocked-toast.png",
      ]);
    });
  });
});
