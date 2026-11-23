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
  aiChatStoreHandlers,
  aiChatAssistantMessage,
  aiChatMessageId,
  aiChatRequestLog,
  aiChatThreadId,
  aiChatThreadsHandlers,
  aiChatUserMessage,
  aiSectionsHandlers,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  rootHandler,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import type { AiChatThreadMock } from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * A successful chat round and the conversations it lands in, over the
 * stateful threads mock (`aiChatThreadsHandlers`): the round streams a reply
 * into a new conversation of the scope it was sent in, and a history lists
 * the conversations of its own scope only.
 *
 * It is also the smallest working example of that mock for the chat specs
 * that build on it (messages, the agent menu, an agent's conversations).
 */

const ROOMS_URL = "/rooms/shared/";
const DESKTOP = { width: 1440, height: 1024 };

const agentUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

/** The selfByTypeHandler owner both tests sign in as. */
const OWNER_ID = "66faa6e4-f133-11ea-b126-00ffeec8b4ef";

const AGENT = AI_PROJECT_WITH_SOURCES;
const OTHER_AGENT = AI_PROJECTS[1];

const AT = Date.parse("2026-11-18T09:00:00.000Z");

/** The agent's conversation the second test opens, with its two messages. */
const PIPELINE = {
  threadId: aiChatThreadId(1),
  title: "Q3 pipeline review",
  question: "Which deals close this quarter?",
  answer: "Three deals close this quarter: Acme, Globex and Initech.",
};

/**
 * Three conversations with the agent, one with another agent and one with
 * the default agent.
 */
const THREADS: AiChatThreadMock[] = [
  {
    threadId: PIPELINE.threadId,
    title: PIPELINE.title,
    agentId: AGENT.id,
    lastEditDate: AT,
    messages: [
      aiChatUserMessage(PIPELINE.question, {
        id: aiChatMessageId(1),
        createdAt: "2026-11-18T09:00:00.000Z",
      }),
      aiChatAssistantMessage(PIPELINE.answer, {
        id: aiChatMessageId(2),
        createdAt: "2026-11-18T09:00:05.000Z",
      }),
    ],
  },
  {
    threadId: aiChatThreadId(2),
    title: "Follow-up to Acme",
    agentId: AGENT.id,
    lastEditDate: AT - 60_000,
  },
  {
    threadId: aiChatThreadId(3),
    title: "Pricing questions",
    agentId: AGENT.id,
    lastEditDate: AT - 120_000,
  },
  {
    threadId: aiChatThreadId(4),
    title: "Clause 7 review",
    agentId: OTHER_AGENT.id,
    lastEditDate: AT,
  },
  {
    threadId: aiChatThreadId(5),
    title: "Plan my week",
    lastEditDate: AT,
  },
];

const AGENT_TITLES = THREADS.filter((t) => t.agentId === AGENT.id).map(
  (t) => t.title,
);
const OTHER_TITLES = THREADS.filter((t) => t.agentId !== AGENT.id).map(
  (t) => t.title,
);

/**
 * A chat without a remembered model raises the "Model updated" notice over
 * the picker; it has nothing to do with the round, so it is marked as
 * already dismissed for the account (ModelUpdatedBanner's per-account flag).
 */
const dismissModelUpdatedNotice = (page: Page) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, `ai_chat_model_updated_bar_dismissed_${OWNER_ID}`);

/**
 * The chat toolbar's history button. ui-kit's ActionButton drops no test id
 * of its own, so it is found by its label (`Common:ChatHistory`).
 */
const historyButton = (page: Page) =>
  page.getByRole("button", { name: "Chat history" }).first();

const chatList = (page: Page) => page.getByTestId("chat-list");

const send = async (page: Page, text: string) => {
  await page.getByTestId("composer-input").fill(text);
  await page.getByTestId("send-button").click();
};

test.describe("AI chat: a round and the history", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "owner", "en-US"),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
    );
    await dismissModelUpdatedNotice(page);
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-agent-conversations, "History of the default agent"
  test("a round on the default agent streams the reply into a new conversation listed in its history", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const log = aiChatRequestLog();
    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      ...aiChatThreadsHandlers(TEST_PORT, {
        threads: THREADS,
        reply: {
          text: "You have three rooms: Marketing, Sales and Legal.",
          title: "Rooms summary",
        },
        log,
      }),
    );

    await page.goto(`${baseUrl}${ROOMS_URL}`);
    await page.getByTestId("ai-chat-button").click();
    await expect(page.getByTestId("ai-chat-slot")).toHaveAttribute(
      "data-open",
      "true",
    );

    await send(page, "Summarize my rooms");

    await expect(page.getByTestId("user-message-content")).toContainText(
      "Summarize my rooms",
    );
    await expect(page.getByTestId("assistant-message-content")).toContainText(
      "You have three rooms: Marketing, Sales and Legal.",
    );

    // One round, for a new conversation of no agent.
    expect(log.send).toHaveLength(1);
    expect(log.send[0].threadId).toBeUndefined();
    expect(log.send[0].entityId).toBeUndefined();

    // The history of the default agent lists the new conversation beside
    // the earlier one of no agent, and none of an agent's.
    await historyButton(page).click();
    await expect(chatList(page)).toBeVisible();
    await expect(chatList(page)).toContainText("Rooms summary");
    await expect(chatList(page)).toContainText("Plan my week");
    for (const title of AGENT_TITLES) {
      await expect(chatList(page)).not.toContainText(title);
    }
  });

  // Spec: ai-agent-conversations, "History of an agent"
  test("an agent's history lists only its conversations, and one opens on its messages and takes a follow-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const log = aiChatRequestLog();
    mockRequest.use(
      ...aiSectionsHandlers(TEST_PORT, [...AI_PROJECTS]),
      ...aiChatThreadsHandlers(TEST_PORT, {
        threads: THREADS,
        reply: { text: "Acme signs on Friday." },
        log,
      }),
    );

    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await expect(page.getByTestId("ai-project-intro")).toBeVisible();

    await historyButton(page).click();
    await expect(chatList(page)).toBeVisible();
    const items = chatList(page).getByTestId("chat-item");
    await expect(items).toHaveCount(AGENT_TITLES.length);
    for (const title of AGENT_TITLES) {
      await expect(chatList(page)).toContainText(title);
    }
    for (const title of OTHER_TITLES) {
      await expect(chatList(page)).not.toContainText(title);
    }
    // The agent's history was asked for by its scope.
    expect(log.list.map((request) => request.entityId)).toContain(
      String(AGENT.id),
    );

    await chatList(page)
      .locator(`[data-thread-id="${PIPELINE.threadId}"]`)
      .click();

    await expect(page.getByTestId("user-message-content")).toContainText(
      PIPELINE.question,
    );
    await expect(page.getByTestId("assistant-message-content")).toContainText(
      PIPELINE.answer,
    );
    expect(log.readMessages.map((request) => request.threadId)).toContain(
      PIPELINE.threadId,
    );

    // A follow-up goes to the open conversation, in the agent's scope.
    await send(page, "When does Acme sign?");
    await expect(
      page.getByTestId("assistant-message-content").last(),
    ).toContainText("Acme signs on Friday.");

    expect(log.send).toHaveLength(1);
    expect(log.send[0].threadId).toBe(PIPELINE.threadId);
    expect(log.send[0].entityId).toBe(String(AGENT.id));
  });
});
