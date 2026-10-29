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
  aiProjectsHandlers,
  AI_PROJECT_WITH_SOURCES,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * Who can reach the AI Projects section by URL.
 *
 * The portal-wide AI switch (Settings -> Integration -> AI services) takes the
 * section away: the sidebar item goes with it. The address bar stays the one
 * way in - a bookmark, a link in an old e-mail, the tab the user was on when
 * an admin flipped the switch - and it has to lead somewhere sensible: not a
 * 404 (the portal is fine, only this section is off) but the page the user
 * chose as their start page.
 *
 * Done by the gate around the page (pages/AiProjects, `AiProjectsGate`),
 * which renders `DefaultPageRedirect` while the flag is off.
 *
 * Assertions are functional only, so this holds on a local run as well as in
 * Docker.
 */

const PROJECTS_URLS = [
  "/ai-projects",
  `/ai-projects/${AI_PROJECT_WITH_SOURCES.id}`,
];

const ERROR_404_PATH = "/error/404";

const pathnameOf = (page: Page) => new URL(page.url()).pathname;

test.describe("AI Projects section access", () => {
  test("is left for the user's start page once AI services are switched off", async ({
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
      ...aiProjectsHandlers(TEST_PORT),
    );

    for (const url of PROJECTS_URLS) {
      await page.goto(`${baseUrl}${url}`);

      await expect
        .poll(() => pathnameOf(page), {
          message: `${url} stayed open with AI services off`,
        })
        .not.toMatch(/^\/ai-projects/);

      // Not an error page: the portal works, only the section is off.
      expect(pathnameOf(page)).not.toBe(ERROR_404_PATH);
    }
  });

  test("stays open while AI services are on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfByTypeHandler(TEST_PORT, "owner"),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      ...aiProjectsHandlers(TEST_PORT),
    );

    for (const url of PROJECTS_URLS) {
      await page.goto(`${baseUrl}${url}`);

      await expect
        .poll(() => pathnameOf(page), {
          message: `${url} was bounced with AI services on`,
        })
        .toMatch(/^\/ai-projects/);
    }
  });
});
