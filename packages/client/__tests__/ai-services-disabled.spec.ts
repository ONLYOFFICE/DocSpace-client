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
  aiConfigHandler,
  peopleListHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { API_PREFIX, type WorkerFixture } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * What the portal-wide AI switch (Settings -> Customization -> AI services)
 * has to take away outside the AI section itself.
 *
 * Every ASC.AI controller is behind `[AiFeature]` and answers 403 once the
 * switch is off, so a client that still asks gets nothing but errors. The chat
 * stores hydrated on every page (Shell -> AiAgentProviders -> StoresHydrator)
 * and the AI projects list of the chat's model picker (AiPresetsBridge) are
 * both gated by Shell's `canUseAi`, and Storage management must load its own
 * data without any AI request beside it.
 *
 * Assertions are functional only, so this holds on a local run as well as in
 * Docker.
 */

const DISK_SPACE_URL = "/portal-settings/management/disk-space";

const PORTAL_CREATED_DATE = '[data-testid="portal_created_date"]';
const QUOTA_PER_ROOM_TOGGLE = '[data-testid="quota_room_button"]';
const TOAST = '[data-testid="toast-content"]';

/**
 * Every AI call the page made, by path - `ai/threads/list`, … - and the AI
 * projects list, which is a `files/rooms` read of the AI hub.
 */
const trackAiCalls = (page: Page) => {
  const calls = new Set<string>();
  const marker = `/${API_PREFIX}/`;

  page.on("request", (request) => {
    const { pathname, searchParams } = new URL(request.url());

    if (!pathname.includes(marker)) return;

    const path = pathname.slice(pathname.indexOf(marker) + marker.length);

    if (path.startsWith("ai/")) calls.add(`${request.method()} ${path}`);
    if (path === "files/rooms" && searchParams.get("searchArea") === "AiHub") {
      calls.add(`${request.method()} ${path}?searchArea=AiHub`);
    }
  });

  return calls;
};

const settle = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  // networkidle fires after 500ms of silence; give slow followers one more beat.
  await page.waitForTimeout(1000);
};

const useAiServices = (mockRequest: WorkerFixture, enabled: boolean) => {
  mockRequest.use(
    settingsHandler(
      TEST_PORT,
      TypeSettings.AuthenticatedNoStandalone,
      enabled ? undefined : { aiEnabled: false },
    ),
    selfByTypeHandler(TEST_PORT, "owner"),
    // The page asks for the accounts that take up the most space; the default
    // people handler answers with a single user instead of a list.
    peopleListHandler(TEST_PORT),
    selfActivationStatusHandler(TEST_PORT, null, false, true),
    // A portal with the switch off is normally one where AI was never set up.
    aiConfigHandler(TEST_PORT, !enabled),
  );
};

test.describe("Portal with AI services switched off", () => {
  test("storage management still loads its own data", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useAiServices(mockRequest, false);

    await page.goto(`${baseUrl}${DISK_SPACE_URL}`);

    await expect(page.locator(PORTAL_CREATED_DATE)).toContainText("2021");
    await expect(page.locator(TOAST)).toHaveCount(0);
    await expect(page.locator(QUOTA_PER_ROOM_TOGGLE)).toBeVisible();
  });

  test("no AI request is fired at all", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useAiServices(mockRequest, false);

    const aiCalls = trackAiCalls(page);

    await page.goto(`${baseUrl}${DISK_SPACE_URL}`);
    await expect(page.locator(PORTAL_CREATED_DATE)).toBeVisible();
    await settle(page);

    expect(
      [...aiCalls].sort(),
      "AI endpoints were called on a portal with AI services off; they all " +
        "answer 403. Gate the caller on Shell's `canUseAi`.",
    ).toEqual([]);
  });
});

test.describe("Portal with AI services switched on", () => {
  // The other half of the rule: the tracker must see AI requests when AI is
  // on, or the empty list above would hold on a page that never asked.
  test("the AI projects list is read on boot", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useAiServices(mockRequest, true);

    const aiCalls = trackAiCalls(page);

    await page.goto(`${baseUrl}${DISK_SPACE_URL}`);
    await expect(page.locator(PORTAL_CREATED_DATE)).toBeVisible();
    await settle(page);

    expect(
      [...aiCalls],
      "the AI projects list was not requested with AI services on",
    ).toContain("GET files/rooms?searchArea=AiHub");
  });
});
