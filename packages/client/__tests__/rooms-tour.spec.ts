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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { clearTourCompleted, startTour, walkTour, welcomeDialog } from "./helpers/tour";

// packages/client/src/store/RoomsTourStore.ts
const TOUR_KEY_PREFIX = "rooms_tour_completed";
// Rooms root — no `folder` query param: unlike Personal Files, the root
// listing is fetched via `files/rooms*` (roomListHandler), not by numeric
// folder id, so adding `?folder=2002` here would misroute the fetch onto the
// generic `files/:id` folder handler instead (see rooms-context-menu.spec.ts
// for the same bare-root pattern).
const ROOMS_URL = "/rooms/shared/";
// RoomsTour/index.tsx: t("RoomsTour:RoomsWelcomeTitle") — same for every audience
const WELCOME_TITLE = "Welcome to Rooms";

test.describe("Rooms tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault),
    );
  });

  test("admin (room owner) sees the full walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await clearTourCompleted(page, TOUR_KEY_PREFIX, "admin-user-id");
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(welcomeDialog(page, WELCOME_TITLE)).toBeVisible();
    await expectScreenshot(page, ["desktop", "rooms-tour", "admin-welcome.png"]);

    await startTour(page, WELCOME_TITLE);
    await walkTour(page, ["desktop", "rooms-tour", "admin"]);
  });

  test("member sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await clearTourCompleted(page, TOUR_KEY_PREFIX, "regular-user-id");
    await page.goto(`${baseUrl}${ROOMS_URL}`);

    await expect(welcomeDialog(page, WELCOME_TITLE)).toBeVisible();
    await expectScreenshot(page, ["desktop", "rooms-tour", "member-welcome.png"]);

    await startTour(page, WELCOME_TITLE);
    await walkTour(page, ["desktop", "rooms-tour", "member"]);
  });
});
