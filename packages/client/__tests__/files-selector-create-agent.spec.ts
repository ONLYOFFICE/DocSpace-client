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


import { http, HttpResponse } from "msw";
import type { Locator, Page } from "@playwright/test";

import { BASE_URL, API_PREFIX } from "@docspace/shared/__mocks__/e2e/utils";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  filesSettingsHandler,
  aiAgentsHandler,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiChatProfilesListHandler,
} from "@docspace/shared/__mocks__/handlers";
import {
  PATH_AI_AGENTS,
  aiAgentsResolver,
} from "@docspace/shared/__mocks__/handlers/ai/agents";
import { roomTagsHandler } from "@docspace/shared/__mocks__/handlers/rooms/tags";
import { expect, test, TEST_PORT } from "./fixtures/base";

// The Files selector of Move / Copy lists the AI agents next to the rooms. In
// the agents root it offers "New agent", which opens the host's create dialog
// over the selector; the selector stays open on the list, and the agent the
// dialog creates arrives over the socket.

const SCREENSHOTS = ["desktop", "files-selector-create-agent"];

// public/locales/en/Common.json
const EMPTY_HEADER = "No AI agents available";
const CAN_CREATE_DESCRIPTION =
  "Create a new agent to add files to its knowledge base.";
const NO_PROVIDER_DESCRIPTION =
  "Agents can be created once an AI provider is connected in the settings.";
const NEW_AGENT = "New agent";

// The agent the list mock holds, and the one the create dialog makes.
const LISTED_AGENT = "AI agent";
const NEW_AGENT_ID = 251400;
const NEW_AGENT_TITLE = "Contracts assistant";
const AGENTS_ROOT_ID = 224866;

const FILES_URL = "/rooms/personal/filter?folder=12764";
const STILL_ON_FILES = /\/rooms\/personal\/filter\?folder=12764/;

const filesHandlers = () => [
  // The create dialog offers the portal's tags. First: the folder handlers
  // below match any files/<segment>, "tags" included.
  roomTagsHandler(TEST_PORT),
  rootHandler(TEST_PORT),
  filesSettingsHandler(TEST_PORT),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
  myHandler(TEST_PORT, true),
  myDocumentsHandler(TEST_PORT, true),
];

// The agent the create dialog returns, shaped as the list mock's own entry.
const newAgent = async () => {
  const body = await aiAgentsResolver({ withListCreate: true }).json();
  return {
    ...body.response.folders[0],
    id: NEW_AGENT_ID,
    title: NEW_AGENT_TITLE,
  };
};

const createAgentHandlers = () => [
  http.post(
    `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${PATH_AI_AGENTS}`,
    async () => HttpResponse.json({ response: await newAgent() }),
  ),
  // What the selector reads for a room announced over the socket.
  http.get(
    `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/files/rooms/${NEW_AGENT_ID}`,
    async () => HttpResponse.json({ response: await newAgent() }),
  ),
];

const openAgentsInSelector = async (
  page: Page,
  baseUrl: string,
  action: "move" | "copy" = "move",
): Promise<Locator> => {
  await page.goto(`${baseUrl}${FILES_URL}`);

  const row = page.getByTestId("table-body").getByTestId("table-row-3");
  await expect(row).toBeVisible();
  await row.getByTestId("context-menu-button").click();

  await page.getByTestId("option_move-or-copy").hover();
  await page.getByTestId(`option_${action}-to`).click();

  const selector = page.getByTestId("aside").first();
  await expect(selector).toBeVisible();

  // It opens on the file's own folder: up to the root, then into the agents.
  await selector.getByText("Apps", { exact: true }).click();
  await expect(selector.getByText("Rooms", { exact: true })).toBeVisible();
  // The root cannot take the files itself, so its label is greyed out and
  // covers the text span; the row is still the way in.
  await selector
    .getByTestId("text")
    .filter({ hasText: /^AI agents$/ })
    .click();

  return selector;
};

test.describe("Files selector: AI agents on SaaS", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      ...filesHandlers(),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT, { assignments: {} }),
    );
  });

  test("empty list offers New agent and says what it is for", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiAgentsHandler(TEST_PORT, { withCreate: true }));

    const selector = await openAgentsInSelector(page, baseUrl);

    await expect(selector.getByText(EMPTY_HEADER)).toBeVisible();
    await expect(selector.getByText(CAN_CREATE_DESCRIPTION)).toBeVisible();
    await expect(selector.getByText(NEW_AGENT, { exact: true })).toBeVisible();

    await expectScreenshot(page, [...SCREENSHOTS, "saas-empty-can-create.png"]);
  });

  test("New agent heads a list that has agents", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiAgentsHandler(TEST_PORT, { withListCreate: true }));

    const selector = await openAgentsInSelector(page, baseUrl);

    const newAgentRow = selector.getByText(NEW_AGENT, { exact: true });
    const agentRow = selector.getByText(LISTED_AGENT, { exact: true });
    await expect(newAgentRow).toBeVisible();
    await expect(agentRow).toBeVisible();

    const [newAgentBox, agentBox] = await Promise.all([
      newAgentRow.boundingBox(),
      agentRow.boundingBox(),
    ]);
    expect(newAgentBox?.y).toBeLessThan(agentBox?.y ?? 0);

    await expectScreenshot(page, [...SCREENSHOTS, "saas-list-can-create.png"]);
  });

  test("without the right to create there is neither New agent nor a call to create", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      aiAgentsHandler(TEST_PORT, { withCreate: true, canCreate: false }),
    );

    const selector = await openAgentsInSelector(page, baseUrl);

    await expect(selector.getByText(EMPTY_HEADER)).toBeVisible();
    await expect(selector.getByText(NEW_AGENT, { exact: true })).toHaveCount(0);
    await expect(selector.getByText(CAN_CREATE_DESCRIPTION)).toHaveCount(0);

    await expectScreenshot(page, [...SCREENSHOTS, "saas-empty-no-right.png"]);
  });

  test("Copy offers New agent too", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(aiAgentsHandler(TEST_PORT, { withCreate: true }));

    const selector = await openAgentsInSelector(page, baseUrl, "copy");

    await expect(selector.getByText(NEW_AGENT, { exact: true })).toBeVisible();
  });

  test("New agent opens the create dialog over the selector, and Escape closes only the dialog", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiAgentsHandler(TEST_PORT, { withCreate: true }));

    const selector = await openAgentsInSelector(page, baseUrl);
    await selector.getByText(NEW_AGENT, { exact: true }).click();

    const save = page.getByTestId("create_agent_dialog_save");
    await expect(save).toBeVisible();
    await expect(selector).toBeVisible();

    await expectScreenshot(page, [...SCREENSHOTS, "saas-create-dialog.png"]);

    await page.keyboard.press("Escape");

    await expect(save).toHaveCount(0);
    await expect(selector).toBeVisible();
    await expect(selector.getByText(NEW_AGENT, { exact: true })).toBeVisible();
  });
});

test.describe("Files selector: AI agents on standalone", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(...filesHandlers(), aiConfigHandler(TEST_PORT));
  });

  test("without an AI provider it says why no agent can be created", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      // Ahead of the store handlers, whose own list would answer first.
      aiChatProfilesListHandler(TEST_PORT, { profiles: [] }),
      ...aiChatStoreHandlers(TEST_PORT, { assignments: {} }),
      aiAgentsHandler(TEST_PORT, { withCreate: true }),
    );

    const selector = await openAgentsInSelector(page, baseUrl);

    await expect(selector.getByText(EMPTY_HEADER)).toBeVisible();
    await expect(selector.getByText(NO_PROVIDER_DESCRIPTION)).toBeVisible();
    // Nothing that would leave for the settings page.
    await expect(selector.getByText(NEW_AGENT, { exact: true })).toHaveCount(0);
    await expect(page).toHaveURL(STILL_ON_FILES);

    await expectScreenshot(page, [
      ...SCREENSHOTS,
      "standalone-empty-no-provider.png",
    ]);
  });

  test("creating an agent keeps the page and the selector, and lists the agent", async ({
    page,
    baseUrl,
    mockRequest,
    wsMock,
  }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      ...aiChatStoreHandlers(TEST_PORT, { assignments: {} }),
      aiAgentsHandler(TEST_PORT, { withListCreate: true }),
      ...createAgentHandlers(),
    );
    await wsMock.setupWebSocketMock();

    const selector = await openAgentsInSelector(page, baseUrl);
    await expect(
      selector.getByText(LISTED_AGENT, { exact: true }),
    ).toBeVisible();

    await selector.getByText(NEW_AGENT, { exact: true }).click();
    await page.getByTestId("create_edit_agent_input").fill(NEW_AGENT_TITLE);

    const save = page.getByTestId("create_agent_dialog_save");
    await expect(save).toBeEnabled();
    await save.click();
    await expect(save).toHaveCount(0);

    // No jump into the new agent's chat: the move is still under way here.
    await expect(page).toHaveURL(STILL_ON_FILES);
    await expect(selector).toBeVisible();

    wsMock.emitModifyFolder({
      cmd: "create",
      id: NEW_AGENT_ID,
      type: "folder",
      data: JSON.stringify({
        id: NEW_AGENT_ID,
        title: NEW_AGENT_TITLE,
        parentId: AGENTS_ROOT_ID,
        roomType: 9,
      }),
    });

    // Below New agent, above the agents already listed -- none of them lost.
    const created = selector.getByText(NEW_AGENT_TITLE, { exact: true });
    const listed = selector.getByText(LISTED_AGENT, { exact: true });
    await expect(created).toBeVisible();
    await expect(listed).toBeVisible();

    const [newAgentBox, createdBox, listedBox] = await Promise.all([
      selector.getByText(NEW_AGENT, { exact: true }).boundingBox(),
      created.boundingBox(),
      listed.boundingBox(),
    ]);
    expect(newAgentBox?.y).toBeLessThan(createdBox?.y ?? 0);
    expect(createdBox?.y).toBeLessThan(listedBox?.y ?? 0);

    await expectScreenshot(page, [
      ...SCREENSHOTS,
      "standalone-agent-created.png",
    ]);

    wsMock.closeConnection();
  });
});
