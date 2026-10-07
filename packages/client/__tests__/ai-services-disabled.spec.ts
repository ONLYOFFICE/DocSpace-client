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
 * switch is off, so a client that still asks gets nothing but errors. Two
 * places used to ask anyway:
 *
 * - the chat stores hydrated on every page (Shell -> AiAgentProviders ->
 *   StoresHydrator, gated by `canUseAi`), which filled the console with 403s;
 * - Storage management, which asked for the AI agents list inside the same
 *   `Promise.all` as its own data - one 403 rejected the lot and left the page
 *   empty behind an error toast (the workspace date and the employee count
 *   never arrived).
 *
 * The AI agent quota block and the agents statistic go with it, and so does
 * the quota page's own URL - the mobile list links to it, so it is reachable
 * by hand as well.
 *
 * Assertions are functional only, so this holds on a local run as well as in
 * Docker.
 */

const DISK_SPACE_URL = "/portal-settings/management/disk-space";
const AI_AGENT_QUOTA_URL = `${DISK_SPACE_URL}/quota-per-ai-agent`;

const PORTAL_CREATED_DATE = '[data-testid="portal_created_date"]';
const QUOTA_PER_ROOM_TOGGLE = '[data-testid="quota_room_button"]';
const QUOTA_PER_AI_AGENT_TOGGLE = '[data-testid="quota_ai_agent_button"]';
const TOAST = '[data-testid="toast-content"]';

const pathnameOf = (page: Page) => new URL(page.url()).pathname;

/** Every AI call the page made, by path - `ai/agents`, `ai/threads/list`, … */
const trackAiCalls = (page: Page) => {
  const calls = new Set<string>();
  const marker = `/${API_PREFIX}/`;

  page.on("request", (request) => {
    const { pathname } = new URL(request.url());

    if (!pathname.includes(marker)) return;

    const path = pathname.slice(pathname.indexOf(marker) + marker.length);

    if (path.startsWith("ai/")) calls.add(`${request.method()} ${path}`);
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

    // The page's own requests must survive the AI section being unreachable:
    // this text is the tail of the same Promise.all the agents list was in.
    await expect(page.locator(PORTAL_CREATED_DATE)).toContainText("2021");
    await expect(page.locator(TOAST)).toHaveCount(0);

    // The quotas that remain are still offered - only the AI one is gone.
    await expect(page.locator(QUOTA_PER_ROOM_TOGGLE)).toBeVisible();
    await expect(page.locator(QUOTA_PER_AI_AGENT_TOGGLE)).toHaveCount(0);
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
        "answer 403. Gate the caller on `aiServicesEnabled` (see Shell's " +
        "`canUseAi` and StorageManagement.basicRequests).",
    ).toEqual([]);
  });

  test("the AI agent quota page is closed by URL", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useAiServices(mockRequest, false);

    await page.goto(`${baseUrl}${AI_AGENT_QUOTA_URL}`);

    // The mobile quota list links here, so the address survives the block
    // being hidden - and must not open a page the portal cannot serve. The
    // guard sends the visitor back to the settings root, which lands on its
    // own first section.
    await expect
      .poll(() => pathnameOf(page), {
        message: "the AI agent quota page stayed open with AI services off",
      })
      .not.toBe(AI_AGENT_QUOTA_URL);

    expect(pathnameOf(page)).toContain("/portal-settings");
  });
});

test.describe("Portal with AI services switched on", () => {
  // The other half of each rule: what is taken away must be there to begin
  // with, or the assertions above would hold on a page that never had it.
  test("storage management offers the AI agent quota and asks for the agents", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useAiServices(mockRequest, true);

    const aiCalls = trackAiCalls(page);

    await page.goto(`${baseUrl}${DISK_SPACE_URL}`);

    await expect(page.locator(QUOTA_PER_AI_AGENT_TOGGLE)).toBeVisible();
    await settle(page);

    expect(
      [...aiCalls].some((call) => call.startsWith("GET ai/agents")),
      "the agents list was not requested with AI services on",
    ).toBe(true);
  });

  test("the AI agent quota page opens by URL", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useAiServices(mockRequest, true);

    await page.goto(`${baseUrl}${AI_AGENT_QUOTA_URL}`);

    await expect
      .poll(() => pathnameOf(page), {
        message: "the AI agent quota page was bounced with AI services on",
      })
      .toBe(AI_AGENT_QUOTA_URL);
  });
});
