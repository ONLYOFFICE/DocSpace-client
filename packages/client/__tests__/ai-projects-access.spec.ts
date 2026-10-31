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
  aiConfigHandler,
  aiSectionsHandlers,
  AI_HUB_ROOMS,
  AI_PROJECT_WITH_SOURCES,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The two AI sections sit behind the portal's AI switch: "AI rooms" on the
 * nested `/ai-rooms/*` paths and "AI Projects" on `/ai-projects/*`, the
 * lists and a room in each. With AI off every one of them sends the user to
 * their start page, never to an error page.
 */

const [HUB_ROOM] = AI_HUB_ROOMS;

const SECTION_URLS = [
  "/ai-rooms/filter",
  `/ai-rooms/${HUB_ROOM.id}/filter?folder=${HUB_ROOM.id}`,
  "/ai-projects",
  `/ai-projects/${AI_PROJECT_WITH_SOURCES.id}/filter?folder=${AI_PROJECT_WITH_SOURCES.id}`,
];

const SECTION_PATH = /^\/ai-(rooms\/|projects)/;

const ERROR_404_PATH = "/error/404";

const pathnameOf = (page: Page) => new URL(page.url()).pathname;

test.describe("AI sections access", () => {
  test("are left for the user's start page once AI services are switched off", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone, {
        aiEnabled: false,
      }),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      // The portal's AI is not set up either, which is the state a portal with
      // the switch off is normally in.
      aiConfigHandler(TEST_PORT, true),
      ...aiSectionsHandlers(TEST_PORT),
    );

    for (const url of SECTION_URLS) {
      await page.goto(`${baseUrl}${url}`);

      await expect
        .poll(() => pathnameOf(page), {
          message: `${url} stayed open with AI services off`,
        })
        .not.toMatch(SECTION_PATH);

      // Not an error page: the portal works, only the sections are off.
      expect(pathnameOf(page)).not.toBe(ERROR_404_PATH);
    }
  });

  test("stay open while AI services are on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiSectionsHandlers(TEST_PORT),
    );

    for (const url of SECTION_URLS) {
      await page.goto(`${baseUrl}${url}`);

      await expect
        .poll(() => pathnameOf(page), {
          message: `${url} was bounced with AI services on`,
        })
        .toMatch(SECTION_PATH);
    }
  });
});
