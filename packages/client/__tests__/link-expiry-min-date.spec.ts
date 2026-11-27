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

import type { Locator, Page } from "@playwright/test";
import {
  filesSettingsHandler,
  makeRoomLink,
  rootHandler,
  roomContentHandler,
  roomLinksHandler,
  roomListHandler,
  roomMembersHandlers,
  roomPrimaryLinkHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeRoomList,
  TypeSettings,
  getEmptyInvitationLink,
} from "@docspace/shared/__mocks__/handlers";
import { getInvitationLink } from "@docspace/shared/__mocks__/handlers/files/roomInvite";
import { expect, test, TEST_PORT } from "./fixtures/base";

// A link's expiry may be today but never in the past. The calendar disables a
// day before the day minDate falls on, so the pickers pass minDate = now: today
// stays selectable and yesterday does not. A minDate a day back would let a
// link expire yesterday.
//
// Mid-month, so today and yesterday share the month the calendar opens on.
const NOW = new Date("2026-11-17T12:00:00");
const TODAY = 17;
const YESTERDAY = 16;

// A day button is named by luxon's DATE_FULL in the UI locale, which is en-US
// or en-GB depending on which of the user's culture or the portal's the
// picker reads.
const dayName = (day: number) =>
  new RegExp(`^(November ${day}, 2026|${day} November 2026)$`);

const expectTodayIsTheFirstSelectableDay = async (calendar: Locator) => {
  await expect(calendar).toBeVisible();

  const today = calendar.getByRole("button", { name: dayName(TODAY) });
  await expect(today).toHaveAttribute("aria-current", "date");
  await expect(today).toBeEnabled();

  await expect(
    calendar.getByRole("button", { name: dayName(YESTERDAY) }),
  ).toBeDisabled();
};

// Public Room id from the roomList mock (getRoomList index 0, roomType 6)
const PUBLIC_ROOM_ID = 33;
const ROOM_FILE_ID = 200;
const ROOM_CONTENT_URL = `/rooms/shared/${PUBLIC_ROOM_ID}/filter?folder=${PUBLIC_ROOM_ID}`;
const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

async function openRoomMembersPanel(page: Page, baseUrl: string) {
  await page.goto(`${baseUrl}${ROOM_CONTENT_URL}`);
  await expect(page.getByTestId("table-body")).toBeVisible();

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

test.describe("Link expiry date picker", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    await page.clock.setSystemTime(NOW);

    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
    );
  });

  test("Invite panel link settings: today selectable, yesterday not", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(roomListHandler(TEST_PORT, TypeRoomList.IsDefault));

    await page.goto(`${baseUrl}/rooms/shared/`);

    const table = page.getByTestId("table-body");
    await expect(table).toBeVisible();

    await table
      .getByTestId("table-row-4")
      .getByTestId("context-menu-button")
      .first()
      .click();

    mockRequest.use(getInvitationLink(TEST_PORT));
    await page.getByTestId("option_invite-users-to-room").click();

    await page.getByTestId("link-settings_icon").click();

    const settingsDialog = page
      .getByTestId("modal-dialog")
      .filter({ hasText: "Link settings" });
    await expect(settingsDialog).toBeVisible();

    // The link has no expiry yet: the picker offers to select a date.
    await settingsDialog
      .getByRole("group", { name: "Select date" })
      .getByRole("button", { name: "Select date" })
      .click();

    await expectTodayIsTheFirstSelectableDay(
      settingsDialog.getByTestId("calendar"),
    );
  });

  test("Room link settings from the info panel: today selectable, yesterday not", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    test.slow();

    mockRequest.use(
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      ...roomMembersHandlers(TEST_PORT, PUBLIC_ROOM_ID, {
        initial: [{ id: ADMIN_ID, displayName: "Administrator", access: 0 }],
        links: [makeRoomLink(false)],
      }),
      getEmptyInvitationLink(TEST_PORT),
      roomPrimaryLinkHandler(TEST_PORT, PUBLIC_ROOM_ID),
      roomLinksHandler(TEST_PORT, PUBLIC_ROOM_ID),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
      roomContentHandler(TEST_PORT, PUBLIC_ROOM_ID, ROOM_FILE_ID),
    );

    const membersPanel = await openRoomMembersPanel(page, baseUrl);

    await membersPanel
      .getByRole("button", { name: "Show link actions" })
      .first()
      .click();
    await page.getByTestId("edit-link-key_item").click();

    const picker = page.getByTestId("edit_link_panel_date_time_picker");
    await expect(picker).toBeVisible();

    // The mocked link has no expiry: the picker offers to select a date.
    await picker.getByRole("button", { name: "Select date" }).click();

    await expectTodayIsTheFirstSelectableDay(picker.getByTestId("calendar"));
  });
});
