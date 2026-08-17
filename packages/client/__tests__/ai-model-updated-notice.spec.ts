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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiConfigHandler,
  aiChatStoreHandlers,
  AiActionType,
  AI_CHAT_ASSIGNED,
  AI_CHAT_AUTO_PICKED,
  rootHandler,
  filesSettingsHandler,
  recentHandler,
  agentFolderChatHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The agent room's chat, which is where the composer — and with it the model
 * picker the notice is anchored to — lives. `folder=2` is what scopes the
 * section to the mock agent room (`agentFolderChatHandler`); without it the
 * app lands on My documents and no chat is mounted at all.
 */
const AGENT_CHAT_URL = "/ai-agents/2/chat?folder=2";

/** A location that is not an agent room — nothing here should raise the notice. */
const RECENT_URL = "/recent/filter?folder=28934";

// SRC_DIR/pages/Home/View/ModelUpdatedBanner — the dismissal flag, keyed by
// account. Spelled out rather than imported: the point of these tests is that
// the key on disk keeps its shape, since it lives in users' browsers.
const dismissedKey = (userId: string) =>
  `ai_chat_model_updated_bar_dismissed_${userId}`;

/** The signed-in account of the `selfByTypeHandler` mocks. */
const USER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const notice = (page: Page) => page.getByTestId("ai-model-updated-tooltip");

const modelPicker = (page: Page) => page.getByTestId("model-selector");

const readFlag = (page: Page, userId: string) =>
  page.evaluate(
    (key) => window.localStorage.getItem(key),
    dismissedKey(userId),
  );

const seedFlag = (page: Page, userId: string) =>
  page.evaluate(
    (key) => window.localStorage.setItem(key, "true"),
    dismissedKey(userId),
  );

/**
 * How long the notice is given to appear once the picker is up.
 *
 * The notice is raised only after the profiles store has settled and joyride
 * has resolved the picker as its target, so a check that runs the moment the
 * picker is visible can read "not there" while it is still coming. Every
 * absence assertion waits this out first.
 */
const NOTICE_SETTLE_MS = 2000;

test.describe("AI model updated notice", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, true, true),
      selfByTypeHandler(TEST_PORT),
      aiConfigHandler(TEST_PORT),
      agentFolderChatHandler(TEST_PORT),
    );
  });

  test("names the model the chat fell back to when the agent has none", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The marker the notice exists for: the portal has models, the agent is
    // bound to none of them, and the composer picks the first chat-capable one
    // by itself.
    mockRequest.use(...aiChatStoreHandlers(TEST_PORT, { assignments: {} }));

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);

    await expect(notice(page)).toBeVisible();
    await expect(notice(page)).toContainText("Model updated");
    await expect(notice(page)).toContainText(AI_CHAT_AUTO_PICKED.name);
    // The picker is what the text sends the user to, so it has to be on screen
    // beside the card rather than behind a backdrop the card put up.
    await expect(modelPicker(page)).toBeVisible();

    // Let the card and the spotlight cutout finish positioning against the
    // picker before capturing — joyride lays both out from a measurement that
    // lands a frame after the card itself.
    await page.waitForTimeout(300);
    await expectScreenshot(page, [
      "desktop",
      "ai-model-updated-notice",
      "notice-over-model-picker.png",
    ]);
  });

  test("stays away when the agent has a model of its own", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      ...aiChatStoreHandlers(TEST_PORT, {
        assignments: { [AiActionType.Chat]: AI_CHAT_ASSIGNED.id },
      }),
    );

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);

    await expect(modelPicker(page)).toBeVisible();
    await page.waitForTimeout(NOTICE_SETTLE_MS);

    await expect(notice(page)).toHaveCount(0);

    // Deliberately no screenshot here, and no assertion on which model the
    // picker ends up showing: with an assignment in play the composer's label
    // is not deterministic. When the assignment read is slower than the
    // profiles list (~800ms is enough) the picker settles on the automatic
    // pick and never adopts the room's assigned model — a chat-library race
    // this branch neither introduces nor can fix. The undimmed counterpart of
    // the shot above is taken in the dismissal test instead, where nothing is
    // assigned and the label is always the automatic pick.
  });

  test("waits for the assignment read before it says anything", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // Until the map has been read the slots answer for nothing, and "nothing
    // assigned" is exactly what the notice is raised on — so it must sit out
    // the read rather than report the gap as a missing assignment.
    const readDelay = 3000;
    mockRequest.use(
      ...aiChatStoreHandlers(TEST_PORT, { assignments: {}, delayMs: readDelay }),
    );

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);
    await expect(notice(page)).toHaveCount(0);

    // …and once it lands empty, the notice is due after all.
    await expect(notice(page)).toBeVisible({ timeout: readDelay + 5000 });
  });

  test("stays away outside an agent room", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // Same empty assignment map, so the only thing keeping the notice down is
    // the location not being an agent room.
    mockRequest.use(
      recentHandler(TEST_PORT, true),
      ...aiChatStoreHandlers(TEST_PORT, { assignments: {} }),
    );

    await page.goto(`${baseUrl}${RECENT_URL}`);
    await page.waitForTimeout(NOTICE_SETTLE_MS);

    await expect(notice(page)).toHaveCount(0);
  });

  test("closing it is final for that account", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(...aiChatStoreHandlers(TEST_PORT, { assignments: {} }));

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);
    await expect(notice(page)).toBeVisible();

    await notice(page).getByRole("button", { name: "Close" }).click();
    await expect(notice(page)).toBeHidden();

    // The counterpart of the shot above, same run and same room: backdrop and
    // spotlight gone, the composer's suggestions no longer covered.
    await expectScreenshot(page, [
      "desktop",
      "ai-model-updated-notice",
      "chat-after-notice-dismissed.png",
    ]);

    // Under the account's own key, so the next visit is silent.
    expect(await readFlag(page, USER_ID)).toBe("true");

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);
    await expect(modelPicker(page)).toBeVisible();
    await page.waitForTimeout(NOTICE_SETTLE_MS);

    await expect(notice(page)).toHaveCount(0);
  });

  test("picking a model in the composer takes it away", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The card sends the user to the picker, so using the picker is the notice
    // being acted on. An entity-scoped pick stays session-local, so nothing in
    // the assignments the notice watches ever changes — the card used to sit
    // over a picker the user had already answered.
    mockRequest.use(...aiChatStoreHandlers(TEST_PORT, { assignments: {} }));

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);
    await expect(notice(page)).toBeVisible();
    await expect(notice(page)).toContainText(AI_CHAT_AUTO_PICKED.name);

    await modelPicker(page).click();
    await page.getByRole("menuitem", { name: AI_CHAT_ASSIGNED.name }).click();

    await expect(notice(page)).toBeHidden();
    // Final, like every other way out of the card: the agent still has no
    // assignment of its own, so an unremembered close would put the notice back
    // up on the next visit to a picker the user has already dealt with.
    expect(await readFlag(page, USER_ID)).toBe("true");
  });

  test("Esc closes it the same way the button does", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(...aiChatStoreHandlers(TEST_PORT, { assignments: {} }));

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);
    await expect(notice(page)).toBeVisible();

    await page.keyboard.press("Escape");

    await expect(notice(page)).toBeHidden();
    expect(await readFlag(page, USER_ID)).toBe("true");
  });

  test("a flag left by another account does not silence it", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    // The regression this guards: the flag used to be one per browser, so the
    // first person to close the card closed it for everybody else on that
    // machine.
    mockRequest.use(...aiChatStoreHandlers(TEST_PORT, { assignments: {} }));

    // A first visit, only to reach an origin localStorage can be written on.
    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);
    await seedFlag(page, "somebody-else");

    await page.goto(`${baseUrl}${AGENT_CHAT_URL}`);

    await expect(notice(page)).toBeVisible();
  });
});
