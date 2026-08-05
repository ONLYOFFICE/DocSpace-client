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
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { BASE_URL, API_PREFIX } from "@docspace/shared/__mocks__/e2e/utils";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { clearTourCompleted, startTour, walkTour, welcomeDialog } from "./helpers/tour";

// packages/client/src/store/FormsTourStore.ts
const TOUR_KEY_PREFIX = "forms_tour_completed";
const FORMS_URL = "/forms/filter";
// FormsTour/index.tsx: t("FormsTour:FormsWelcomeTitle") — same for every audience
const WELCOME_TITLE = "Welcome to Forms";

// `files/rooms*` (roomListHandler) always reports rootFolderType: 14 (Rooms)
// regardless of query params, so the shared mock can't be reused as-is here:
// FormsTour's own welcomeVisible/isFormsRoot gate needs rootFolderType: 36
// (FolderType.Forms) — see TreeFoldersStore.isFormsFolder. This handler
// stands in a single form room so the list isn't empty either.
const formsRoomListHandler = (port: string) =>
  http.get(`${BASE_URL}:${port}/${API_PREFIX}/files/rooms*`, () => {
    const current = {
      parentId: 0,
      filesCount: 0,
      foldersCount: 1,
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
      security: { Read: true, Create: true },
      title: "Forms",
      access: 0,
      shared: false,
      created: "2025-01-15T12:00:00.000Z",
      updated: "2025-01-15T12:00:00.000Z",
      rootFolderType: 36,
      parentRoomType: 36,
    };

    return new Response(
      JSON.stringify({
        response: {
          files: [],
          folders: [
            {
              parentId: 36,
              filesCount: 1,
              foldersCount: 0,
              new: 0,
              mute: false,
              tags: [],
              logo: { original: "", large: "", medium: "", small: "", color: "61C059" },
              pinned: false,
              roomType: 1, // RoomsType.FormRoom
              isRoom: true,
              private: false,
              indexing: false,
              denyDownload: false,
              inRoom: true,
              usedSpace: 15000,
              fileEntryType: 1,
              id: 501,
              rootFolderId: 36,
              canShare: true,
              security: { Read: true, Create: true, Delete: true, EditRoom: true },
              title: "Customer feedback",
              access: 0,
              shared: false,
              created: "2025-01-15T12:00:00.000Z",
              updated: "2025-01-15T12:00:00.000Z",
              rootFolderType: 36,
              parentRoomType: 36,
            },
          ],
          current,
          pathParts: [{ id: 36, title: "Forms" }],
          startIndex: 0,
          count: 1,
          total: 1,
          new: 0,
        },
      }),
    );
  });

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

    await page.goto(`${baseUrl}${FORMS_URL}`);
    await clearTourCompleted(page, TOUR_KEY_PREFIX, "admin-user-id");
    await page.goto(`${baseUrl}${FORMS_URL}`);

    await expect(welcomeDialog(page, WELCOME_TITLE)).toBeVisible();
    await expectScreenshot(page, ["desktop", "forms-tour", "admin-welcome.png"]);

    await startTour(page, WELCOME_TITLE);
    await walkTour(page, ["desktop", "forms-tour", "admin"]);
  });

  test("filler sees the reduced, role-appropriate walkthrough", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

    await page.goto(`${baseUrl}${FORMS_URL}`);
    await clearTourCompleted(page, TOUR_KEY_PREFIX, "regular-user-id");
    await page.goto(`${baseUrl}${FORMS_URL}`);

    await expect(welcomeDialog(page, WELCOME_TITLE)).toBeVisible();
    await expectScreenshot(page, ["desktop", "forms-tour", "filler-welcome.png"]);

    await startTour(page, WELCOME_TITLE);
    await walkTour(page, ["desktop", "forms-tour", "filler"]);
  });
});
