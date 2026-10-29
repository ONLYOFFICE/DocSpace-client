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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiChatSendWithStreamHandler,
  aiChatServiceLimitExceededEvent,
  rootHandler,
  filesSettingsHandler,
  agentFolderChatHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The chat error box when a round is refused by an AI spending limit, in an
 * agent room's AI Chat tab.
 *
 * The AI gateway relays the accounting service's 403 inside the stream, the
 * chat library turns it into a generic "auth" error, and Shell's
 * formatChatError swaps that for a message naming when the limit resets. Only
 * admins can change the limit, so they get a button to AI settings -> Limits;
 * everyone else is pointed to the Full admin and gets no button at all (a
 * Retry would only hit the same limit again).
 */

/** `folder=2` scopes the section to the mock agent room (agentFolderChatHandler). */
const AGENT_CHAT_URL = "/ai-agents/2/chat?folder=2";
const LIMITS_URL = "/portal-settings/ai-settings/limits";
const DESKTOP = { width: 1440, height: 1024 };

/** The reset instant as the accounting service writes it. */
const RESET_AT = "2026-10-23 23:59:59Z";
/** The same instant the standard way, for an en-US account in UTC. */
const RESET_AT_SHOWN = "10/23/2026 11:59 PM";

/** Ids of the selfByTypeHandler accounts the two tests sign in as. */
const OWNER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";
const REGULAR_USER_ID = "regular-user-id";

const errorBox = (page: Page) => page.getByTestId("chat-error");

/**
 * The agent has no model of its own, which raises the "Model updated" notice
 * over the picker; it has nothing to do with the limit, so it is marked as
 * already dismissed for the account (ModelUpdatedBanner's per-account flag).
 */
const dismissModelUpdatedNotice = (page: Page, userId: string) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, `ai_chat_model_updated_bar_dismissed_${userId}`);

const openAgentChatAndSend = async (page: Page, baseUrl: string) => {
  await page.setViewportSize(DESKTOP);
  await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);

  await page.getByTestId("composer-input").fill("Summarize this room");
  await page.getByTestId("send-button").click();

  await expect(errorBox(page)).toBeVisible();
};

/**
 * Waits until the locator stops moving: the message list lays the error box
 * out over a few frames after it first appears.
 */
const waitToSettle = async (page: Page, locator: Locator) => {
  let previous = await locator.boundingBox();

  for (let attempt = 0; attempt < 30; attempt++) {
    await page.waitForTimeout(100);
    const current = await locator.boundingBox();

    if (
      previous &&
      current &&
      previous.x === current.x &&
      previous.y === current.y &&
      previous.width === current.width &&
      previous.height === current.height
    ) {
      return;
    }

    previous = current;
  }
};

/** The whole desktop window: navigation, the agent room and its chat. */
const shootDesktop = async (page: Page, name: string) => {
  await waitToSettle(page, errorBox(page));
  await expectScreenshot(page, ["desktop", "ai-chat-service-limit", name]);
};

test.describe("AI chat: spending limit reached", () => {
  // The reset time is rendered in the portal's timezone, which the mocked
  // settings leave unset, so the browser's own zone decides it.
  test.use({ timezoneId: "UTC" });

  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      aiConfigHandler(TEST_PORT),
      agentFolderChatHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
      aiChatSendWithStreamHandler(TEST_PORT, [
        aiChatServiceLimitExceededEvent(RESET_AT),
      ]),
    );
  });

  test("an admin is told when it resets and is sent to the limits", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "owner", "en-US"));
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openAgentChatAndSend(page, baseUrl);

    await expect(page.getByTestId("chat-error-title")).toHaveText(
      "AI spending limit reached",
    );
    await expect(page.getByTestId("chat-error-description")).toHaveText(
      `AI requests are paused until ${RESET_AT_SHOWN}. Raise the limit in the AI settings to continue now.`,
    );

    // The host's Button drops the library's data-testid, so the box's buttons
    // are found by role: the override replaces Retry rather than adding to it.
    const action = errorBox(page).getByRole("button");
    await expect(action).toHaveCount(1);
    await expect(action).toHaveText("Change AI limit");

    await shootDesktop(page, "admin-change-limit.png");

    await action.click();
    await expect(page).toHaveURL(new RegExp(`${LIMITS_URL}$`));
  });

  test("a user is told when it resets and to contact the Full admin", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular", "en-US"));
    await dismissModelUpdatedNotice(page, REGULAR_USER_ID);

    await openAgentChatAndSend(page, baseUrl);

    await expect(page.getByTestId("chat-error-title")).toHaveText(
      "AI spending limit reached",
    );
    await expect(page.getByTestId("chat-error-description")).toHaveText(
      `AI requests are paused until ${RESET_AT_SHOWN}. Contact the Full admin to raise the limit.`,
    );

    await expect(errorBox(page).getByRole("button")).toHaveCount(0);

    await shootDesktop(page, "user-contact-admin.png");
  });
});
