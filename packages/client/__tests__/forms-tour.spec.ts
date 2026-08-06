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

import { http } from "msw";
import type { Page } from "@playwright/test";

import { BASE_URL, API_PREFIX } from "@docspace/shared/__mocks__/e2e/utils";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { armTour, tourTooltip, walkTour } from "./helpers/tour";

// packages/client/src/store/FormsTourStore.ts
const TOUR_KEY = "forms_tour_pending";
const FORMS_URL = "/forms/filter";

// The single form space of the non-empty mock list.
const FIRST_SPACE_ID = 501;

// The empty screen's action list, which is what the closing step points into.
const EMPTY_SCREEN = '[data-testid="empty-view-body"]';

// Step titles, from public/locales/en/FormsTour.json. Steps are addressed by
// title rather than by index: which ones survive depends on the audience and
// on whether the section was stood in for, so an index would quietly point at
// a different step as those flags move.
const BLANK_FORM_STEP = "The form everyone opens";
const CREATE_FIRST_STEP = "Now make it yours";
// The closing step of anyone with no create button to be sent at — the stand-in
// is dropped the same way, but what is left under the spotlight is the bare
// empty screen rather than an action.
const EMPTY_LIST_STEP = "Your list is empty for now";

// The first stand-in space the demo puts up on an empty portal
// (FormsTour:FormsDemoOnboarding), and the three things waiting inside it
// (SRC_DIR/api/tourDemo/data — DEMO_SPACE_ITEM_IDS).
const DEMO_SPACE_TITLE = "Employee onboarding";
const DEMO_BLANK_FORM = "#file_-1102";
const DEMO_IN_PROGRESS = "#folder_-1100";
const DEMO_COMPLETE = "#folder_-1101";

// `files/rooms*` (roomListHandler) always reports rootFolderType: 14 (Rooms)
// regardless of query params, so the shared mock can't be reused as-is here:
// FormsTour's own isFormsRoot gate needs rootFolderType: 36
// (FolderType.Forms) — see TreeFoldersStore.isFormsFolder.
//
// `canCreate` is `security.Create` on the Forms root, which is what the whole
// create affordance hangs off (getSectionCreateButton → getFolderModel). The
// server answers it per role — the list fetched by somebody who only ever fills
// forms in comes back with `false` — so the runs that stand in as one have to
// say so, or the section puts up a "Create Form space" button they do not have.
const formsRoomListHandler = (
  port: string,
  { empty = false, canCreate = true } = {},
) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms*`, () => {
    const current = {
      parentId: 0,
      filesCount: 0,
      foldersCount: empty ? 0 : 1,
      new: 0,
      mute: false,
      pinned: false,
      private: false,
      indexing: false,
      denyDownload: false,
      fileEntryType: 1,
      id: 36,
      rootFolderId: 36,
      canShare: false,
      security: { Read: true, Create: canCreate },
      title: "Forms",
      access: 0,
      shared: false,
      created: "2025-01-15T12:00:00.000Z",
      updated: "2025-01-15T12:00:00.000Z",
      rootFolderType: 36,
      parentRoomType: 36,
    };

    const folders = empty
      ? []
      : [
          {
            parentId: 36,
            filesCount: 1,
            foldersCount: 0,
            new: 0,
            mute: false,
            tags: [],
            logo: {
              original: "",
              large: "",
              medium: "",
              small: "",
              color: "61C059",
            },
            pinned: false,
            roomType: 1, // RoomsType.FormRoom
            isRoom: true,
            private: false,
            indexing: false,
            denyDownload: false,
            inRoom: true,
            usedSpace: 15000,
            fileEntryType: 1,
            id: FIRST_SPACE_ID,
            rootFolderId: 36,
            canShare: true,
            security: {
              Read: true,
              Create: true,
              Delete: true,
              EditRoom: true,
            },
            title: "Customer feedback",
            access: 0,
            shared: false,
            created: "2025-01-15T12:00:00.000Z",
            updated: "2025-01-15T12:00:00.000Z",
            rootFolderType: 36,
            parentRoomType: 36,
          },
        ];

    return new Response(
      JSON.stringify({
        response: {
          files: [],
          folders,
          current,
          pathParts: [{ id: 36, title: "Forms" }],
          startIndex: 0,
          count: folders.length,
          total: folders.length,
          new: 0,
        },
      }),
    );
  });

/** Arms the tour and lands on the section that starts it by itself. */
const startTour = async (page: Page, baseUrl: string) => {
  // The first visit sets an origin so localStorage is reachable.
  await page.goto(`${baseUrl}${FORMS_URL}`);
  await armTour(page, TOUR_KEY);
  await page.goto(`${baseUrl}${FORMS_URL}`);

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

test.describe("Forms tour", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      formsRoomListHandler(TEST_PORT),
    );
  });

  test("admin (form space owner) sees the full walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    await walkTour(page, ["desktop", "forms-tour", "admin"]);
  });

  test("user (form filler) sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      formsRoomListHandler(TEST_PORT, { canCreate: false }),
    );

    await startTour(page, baseUrl);

    // Nothing that creates a space, and no Templates in the sidebar step — the
    // sidebar does not render that item for them either.
    await walkTour(page, ["desktop", "forms-tour", "user"]);
  });

  test("guest sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // A guest is invited to fill a form in and nothing else, so their
    // walkthrough is the filler's: no creating a space, no saving one as a
    // template. The list has to agree — see the user run above.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      formsRoomListHandler(TEST_PORT, { canCreate: false }),
    );

    await startTour(page, baseUrl);

    await walkTour(page, ["desktop", "forms-tour", "guest"]);
  });
});

// A portal with no form spaces of its own renders neither the quick-actions
// banner nor the filter bar, which would cut the tour down to its sidebar
// step. The section is stood in for instead (SRC_DIR/api/tourDemo), so these
// walk the same tour against a list that came from nowhere.
test.describe("Forms tour on an empty portal", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      formsRoomListHandler(TEST_PORT, { empty: true }),
    );
  });

  test("admin sees the walkthrough against a stood-in section", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    // The stand-in spaces are named after the collections people actually run,
    // which is what the opening step is about.
    await expect(
      page.getByRole("main").getByText(DEMO_SPACE_TITLE).first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "forms-tour", "empty"]);
  });

  test("walks into a stand-in space and back out again", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "admin"));

    await startTour(page, baseUrl);

    await goToStep(page, BLANK_FORM_STEP);

    // The point of the whole block: the blank form and the two folders an
    // answer travels between, which a real space only grows once someone has
    // started filling one in.
    await expect(page.locator(DEMO_BLANK_FORM)).toBeVisible();
    await expect(page.locator(DEMO_IN_PROGRESS)).toBeVisible();
    await expect(page.locator(DEMO_COMPLETE)).toBeVisible();

    // Stepping back out of the block has to return to the section, or the
    // step before it would point at an anchor that is no longer on the page.
    await page.keyboard.press("ArrowLeft");

    await expect(page.locator(DEMO_BLANK_FORM)).toBeHidden();
    await expect(
      page.getByRole("main").getByText(DEMO_SPACE_TITLE).first(),
    ).toBeVisible();
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

    // The regression this guards: the stand-in spaces outliving the tour that
    // put them there. The closing step drops them on purpose, so the user is
    // looking at their own empty portal — and at the button that fixes it —
    // while the tour is still there to explain it.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText(DEMO_SPACE_TITLE),
    ).toHaveCount(0);
  });

  test("user gets the stood-in section too, not a one-step tour", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The regression this guards: the stand-in was once admins-only, which left
    // everybody else with the sidebar step and nothing else — nothing about
    // what a space holds, and nothing about the form waiting inside it.
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      formsRoomListHandler(TEST_PORT, { empty: true, canCreate: false }),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText(DEMO_SPACE_TITLE).first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "forms-tour", "user-empty"]);
  });

  test("guest gets the stood-in section too, not a one-step tour", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "visitor"),
      formsRoomListHandler(TEST_PORT, { empty: true, canCreate: false }),
    );

    await startTour(page, baseUrl);

    await expect(
      page.getByRole("main").getByText(DEMO_SPACE_TITLE).first(),
    ).toBeVisible();

    await walkTour(page, ["desktop", "forms-tour", "guest-empty"]);
  });

  test("closes on the empty list rather than a create button they do not have", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "regular"),
      formsRoomListHandler(TEST_PORT, { empty: true, canCreate: false }),
    );

    await startTour(page, baseUrl);
    await goToStep(page, EMPTY_LIST_STEP);

    // Handed back the same way an admin's is — the stand-in spaces are gone and
    // the user is looking at their own empty portal — but the step names what
    // the empty list means instead of sending them at an action that is not
    // theirs, so "Now make it yours" never comes up for them.
    await expect(page.locator(EMPTY_SCREEN)).toBeVisible();
    await expect(
      page.getByRole("main").getByText(DEMO_SPACE_TITLE),
    ).toHaveCount(0);
    await expect(
      tourTooltip(page).getByText(CREATE_FIRST_STEP, { exact: true }),
    ).toHaveCount(0);
  });
});
