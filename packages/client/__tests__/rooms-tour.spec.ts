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

import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  roomListHandler,
  roomMembersHandlers,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip, walkTour } from "./helpers/tour";

// packages/client/src/store/RoomsTourStore.ts
const TOUR_KEY = "rooms_tour_pending";
// Rooms root — no `folder` query param: unlike Personal Files, the root
// listing is fetched via `files/rooms*` (roomListHandler), not by numeric
// folder id, so adding `?folder=2002` here would misroute the fetch onto the
// generic `files/:id` folder handler instead (see rooms-context-menu.spec.ts
// for the same bare-root pattern).
const ROOMS_URL = "/rooms/shared/";

// First room of the mock list (getRoomList index 0) — the one the member step
// opens the info panel on.
const FIRST_ROOM_ID = 33;
// Admin user id from the settings/self mocks, used as that room's owner.
const ADMIN_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

// The info panel's outer wrapper, mounted only while the panel is open.
const INFO_PANEL = ".info-panel";
// The empty screen's action list, which is what the closing step points into.
const EMPTY_SCREEN = '[data-testid="empty-view-body"]';

// Step titles, from public/locales/en/RoomsTour.json. Steps are addressed by
// title rather than by index: which ones survive depends on the audience and
// on settings (the grouping row only renders when room grouping is on), so an
// index would quietly point at a different step as those flags move.
const MEMBERS_STEP = "Work together";
const CREATE_FIRST_STEP = "Now make it yours";
// The closing step of anyone with no create button to be sent at — the stand-in
// is dropped the same way, but what is left under the spotlight is the bare
// empty screen rather than an action.
const EMPTY_LIST_STEP = "Your list is empty for now";

const roomOwnerMembers = () =>
  roomMembersHandlers(TEST_PORT, FIRST_ROOM_ID, {
    initial: [{ id: ADMIN_ID, displayName: "Administrator", access: 0 }],
  });

/** Arms the tour and lands on the section that starts it by itself. */
const startTour = async (page: Page, baseUrl: string) => {
  // The first visit sets an origin so localStorage is reachable.
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await armTour(page, TOUR_KEY);
  await page.goto(`${baseUrl}${ROOMS_URL}`);

  await expect(tourTooltip(page)).toBeVisible();
};

/** Walks forward with the keyboard until the step titled `title` is up. */
const goToStep = async (page: Page, title: string, maxSteps = 12) => {
  const tooltip = tourTooltip(page);

  for (let i = 0; i < maxSteps; i += 1) {
    if (await tooltip.getByText(title, { exact: true }).isVisible()) return;
    await page.keyboard.press("ArrowRight");
    await expect(tooltip).toBeVisible();
  }

  throw new Error(`step "${title}" never came up`);
};

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
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"), ...roomOwnerMembers());

    await startTour(page, baseUrl);

    await walkTour(page, ["desktop", "rooms-tour", "admin"]);
  });

  test("user (room member) sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      // The list has to come back the way the server would answer it for
      // somebody who cannot create rooms, or the section puts up a "New room"
      // button this walkthrough is specifically about not having.
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault, { canCreate: false }),
      ...roomOwnerMembers(),
    );

    await startTour(page, baseUrl);

    await walkTour(page, ["desktop", "rooms-tour", "user"]);
  });

  test("guest sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // A guest only ever works inside rooms somebody let them into: no creating,
    // and an info panel that lists the members rather than managing them. The
    // tour's own gate is `getTourAudience` (visitor → "guest"), and the list has
    // to agree with it — see the user run above.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      roomListHandler(TEST_PORT, TypeRoomList.IsDefault, { canCreate: false }),
      ...roomOwnerMembers(),
    );

    await startTour(page, baseUrl);

    await walkTour(page, ["desktop", "rooms-tour", "guest"]);
  });

  test("opens the info panel for the member step and puts it away afterwards", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "admin"),
      ...roomOwnerMembers(),
    );

    await startTour(page, baseUrl);

    // The panel belongs to the user, not to the tour: it starts closed, the
    // step borrows it, and stepping off has to hand it back.
    await expect(page.locator(INFO_PANEL)).toBeHidden();

    await goToStep(page, MEMBERS_STEP);

    await expect(page.locator(INFO_PANEL)).toBeVisible();
    await expect(
      page.locator(INFO_PANEL).getByText("Administrator").first(),
    ).toBeVisible();

    await page.keyboard.press("ArrowLeft");

    await expect(page.locator(INFO_PANEL)).toBeHidden();
  });
});

// A portal that has no rooms of its own renders neither the quick-actions
// banner nor the filter bar, which would cut the tour down to its sidebar
// steps. The section is stood in for instead (SRC_DIR/api/tourDemo), so these
// walk the same tour against a list that came from nowhere.
test.describe("Rooms tour on an empty portal", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      // No list type — the handler answers with an empty room list.
      roomListHandler(TEST_PORT),
    );
  });

  test("admin sees the walkthrough against a stood-in section", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    // The stand-in rooms are named after their own types, which is also what
    // the first step is about.
    await expect(
      page.getByRole("main").getByText("Collaboration room").first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "rooms-tour", "empty"]);
  });

  test("hands the section back before the closing step", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    await expect(page.locator(EMPTY_SCREEN)).toBeHidden();

    await goToStep(page, CREATE_FIRST_STEP);

    // The regression this guards: the stand-in rooms outliving the tour that
    // put them there. The closing step drops them on purpose, so the user is
    // looking at their own empty portal — and at the button that fixes it —
    // while the tour is still there to explain it.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Collaboration room"),
    ).toHaveCount(0);
  });

  test("user gets the stood-in section too, not a one-step tour", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The regression this guards: the stand-in was once admins-only, which left
    // everybody else with the sidebar step and nothing else — no row, no member
    // list, which is the whole of what the section is for to them.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      roomListHandler(TEST_PORT, undefined, { canCreate: false }),
      ...roomOwnerMembers(),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText("Collaboration room").first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "rooms-tour", "user-empty"]);
  });

  test("guest gets the stood-in section too, not a one-step tour", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      roomListHandler(TEST_PORT, undefined, { canCreate: false }),
      ...roomOwnerMembers(),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText("Collaboration room").first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "rooms-tour", "guest-empty"]);
  });

  test("closes on the empty list rather than a create button they do not have", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      roomListHandler(TEST_PORT, undefined, { canCreate: false }),
      ...roomOwnerMembers(),
    );

    await startTour(page, baseUrl);
    await goToStep(page, EMPTY_LIST_STEP);

    // Handed back the same way an admin's is — the stand-in rooms are gone and
    // the user is looking at their own empty portal — but the step names what
    // the empty list means instead of sending them at an action that is not
    // theirs, so "Now make it yours" never comes up for them.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText("Collaboration room"),
    ).toHaveCount(0);
    await expect(
      tourTooltip(page).getByText(CREATE_FIRST_STEP, { exact: true }),
    ).toHaveCount(0);
  });
});
