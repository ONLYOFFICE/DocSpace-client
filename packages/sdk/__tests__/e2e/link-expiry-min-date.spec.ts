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

import type { SetupServer } from "@docspace/shared/__mocks__/e2e";
import {
  getEmptyInvitationLink,
  privateRoomListHandler,
} from "@docspace/shared/__mocks__/handlers";

import { test as base, expect } from "./fixtures/base";

type THandler = Parameters<SetupServer["use"]>[number];

/**
 * Signs the session in, so the server-rendered rooms list is not treated as
 * anonymous, and installs handlers for the server render and the browser at
 * once.
 */
const test = base.extend<{
  authCookie: void;
  mockBoth: (...handlers: THandler[]) => void;
}>({
  authCookie: [
    async ({ page, baseUrl }, use) => {
      await page
        .context()
        .addCookies([
          { name: "asc_auth_key", value: "e2e-test-token", url: baseUrl },
        ]);
      await use();
    },
    { auto: true },
  ],
  mockBoth: async (
    { serverRequestInterceptor, clientRequestInterceptor },
    use,
  ) => {
    await use((...handlers) => {
      serverRequestInterceptor.use(...handlers);
      clientRequestInterceptor.use(...handlers);
    });
  },
});

// A link's expiry may be today but never in the past. The calendar disables a
// day before the day minDate falls on, so the picker passes minDate = now:
// today stays selectable and yesterday does not. A minDate a day back would
// let a link expire yesterday.
//
// Mid-month, so today and yesterday share the month the calendar opens on.
const NOW = new Date("2026-11-17T12:00:00");
const TODAY = 17;
const YESTERDAY = 16;

// A day button is named by luxon's DATE_FULL in the UI locale.
const dayName = (day: number) =>
  new RegExp(`^(November ${day}, 2026|${day} November 2026)$`);

const ROOM_TITLE = "Shared Room";

test("Invite panel link settings: today selectable, yesterday not", async ({
  page,
  baseUrl,
  port,
  mockBoth,
}) => {
  await page.clock.setSystemTime(NOW);

  mockBoth(
    privateRoomListHandler(port, {
      roomId: 7001,
      title: "Private Test Room",
      ordinaryRooms: [{ roomId: 7003, title: ROOM_TITLE }],
    }),
    getEmptyInvitationLink(port),
  );

  await page.goto(`${baseUrl}/sdk/rooms`);

  await page.getByText(ROOM_TITLE).first().click({ button: "right" });
  await page.locator("#option_invite-users-to-room").click();
  await page.getByTestId("link-settings_icon").click();

  const settingsDialog = page
    .getByRole("dialog")
    .filter({ hasText: "Link settings" });
  await expect(settingsDialog).toBeVisible();

  const picker = settingsDialog.getByRole("group", { name: "Select date" });
  await picker
    .getByRole("button", { name: "Select date" })
    .or(picker.getByTestId("selected-label"))
    .click();

  const calendar = picker.getByTestId("calendar");
  await expect(calendar).toBeVisible();

  const today = calendar.getByRole("button", { name: dayName(TODAY) });
  await expect(today).toHaveAttribute("aria-current", "date");
  await expect(today).toBeEnabled();

  await expect(
    calendar.getByRole("button", { name: dayName(YESTERDAY) }),
  ).toBeDisabled();
});
