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
  usersByType,
  aiConfigHandler,
  aiChatStoreHandlers,
  aiChatAssistantMessage,
  aiChatAttachmentsGetHandler,
  aiChatCreatedDocumentPart,
  aiChatFileAttachmentPart,
  aiChatGeneratedImagePart,
  aiChatImageAttachmentPart,
  aiChatMessageId,
  aiChatThreadId,
  aiChatThreadsHandlers,
  aiChatUserMessage,
  aiCopyToRoomHandlers,
  aiProjectMock,
  AiProjectMockAccess,
  aiSectionsHandlers,
  rootHandler,
  filesSettingsHandler,
  roomListHandler,
  TypeRoomList,
} from "@docspace/shared/__mocks__/handlers";
import type {
  AiChatContentPart,
  AiChatMessageMock,
  AiChatThreadMock,
  AiCopyRequest,
} from "@docspace/shared/__mocks__/handlers";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The messages of a conversation (`ai-chat-messages`): no logo beside
 * a reply, on an agent or on the default one, the attachments above the
 * user's own message, an image a reply generated drawn without a card, and
 * the card of a document a reply created with its "Save to room...".
 *
 * Rounds and conversations come from the stateful threads mock
 * (`aiChatThreadsHandlers`), the stored pictures from `ai/attachments/get`
 * (`aiChatAttachmentsGetHandler`) and the copy into a room from the Files API
 * (`aiCopyToRoomHandlers`).
 */

const ROOMS_URL = "/rooms/shared/";
const DESKTOP = { width: 1440, height: 1024 };

const agentUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

const OWNER_ID = usersByType.owner.id;
const ROOM_ADMIN_ID = usersByType.roomAdmin.id;

/** A 1x1 PNG: the stored picture of every image here. */
const PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

const AGENT_NAME = "Legal Reviewer";

/**
 * The agent the chats run on, built fresh for every test: the project
 * handlers change the projects they are given.
 */
const legalReviewer = (
  access: (typeof AiProjectMockAccess)[keyof typeof AiProjectMockAccess],
) =>
  aiProjectMock({
    id: 777420,
    title: AGENT_NAME,
    color: "FF6680",
    access,
  });

/** The chart a reply generates, saved as a portal file. */
const CHART = {
  ref: "cccccccc-0000-4000-8000-000000000001",
  title: "Revenue chart.png",
  fileId: 880201,
};

/** The document a reply creates. */
const PROPOSAL = {
  id: 880101,
  title: "Proposal for Acme Corp.docx",
  fileExst: ".docx",
};

const chartReply = (): AiChatContentPart[] => [
  aiChatGeneratedImagePart({
    ref: CHART.ref,
    prompt: "Revenue by quarter as a bar chart",
  }),
  { type: "text", text: "Here is the revenue chart." },
];

const proposalReply = (): AiChatContentPart[] => [
  aiChatCreatedDocumentPart({
    files: [PROPOSAL],
    task: "Write a proposal for Acme Corp",
    summary: "The proposal is saved.",
  }),
  { type: "text", text: "The proposal for Acme Corp is ready." },
];

const chartAttachments = () =>
  aiChatAttachmentsGetHandler(TEST_PORT, {
    [CHART.ref]: { title: CHART.title, base64: PNG, entryId: CHART.fileId },
  });

/** A message of a stored conversation, `n` seconds into it. */
const at = (n: number) =>
  new Date(Date.parse("2026-11-17T09:00:00.000Z") + n * 1000).toISOString();

/**
 * A chat without a remembered model raises the "Model updated" notice over
 * the picker; it has nothing to do with the messages, so it is marked as
 * already dismissed for the account (ModelUpdatedBanner's per-account flag).
 */
const dismissModelUpdatedNotice = (page: Page, userId: string) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, `ai_chat_model_updated_bar_dismissed_${userId}`);

/**
 * A document opens in a new tab (`window.open`); the tab is not opened here,
 * the URLs it was asked for are kept for the test to read.
 */
const recordOpenedTabs = (page: Page) =>
  page.addInitScript(() => {
    const opened: string[] = [];
    (window as unknown as { __openedTabs: string[] }).__openedTabs = opened;
    window.open = ((url?: string | URL) => {
      opened.push(String(url));
      return null;
    }) as typeof window.open;
  });

const openedTabs = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __openedTabs?: string[] }).__openedTabs ?? [],
  );

const historyButton = (page: Page) =>
  page.getByRole("button", { name: "Chat history" }).first();

const chatList = (page: Page) => page.getByTestId("chat-list");

const send = async (page: Page, text: string) => {
  await page.getByTestId("composer-input").fill(text);
  await page.getByTestId("send-button").click();
};

/** The chat panel of the Rooms list: the default agent. */
const openDefaultChat = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${ROOMS_URL}`);
  await page.getByTestId("ai-chat-button").click();
  await expect(page.getByTestId("ai-chat-slot")).toHaveAttribute(
    "data-open",
    "true",
  );
};

/** The agent's page, its chat filling the section. */
const openAgentChat = async (page: Page, baseUrl: string, id: number) => {
  await page.goto(`${baseUrl}${agentUrl(id)}`);
  await expect(page.getByTestId("ai-project-intro")).toBeVisible();
};

const openConversation = async (page: Page, threadId: string) => {
  await historyButton(page).click();
  await expect(chatList(page)).toBeVisible();
  await chatList(page).locator(`[data-thread-id="${threadId}"]`).click();
};

const baseHandlers = (userType: "owner" | "roomAdmin") => [
  rootHandler(TEST_PORT),
  filesSettingsHandler(TEST_PORT),
  settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
  selfActivationStatusHandler(TEST_PORT, null, false, true),
  selfByTypeHandler(TEST_PORT, userType, "en-US"),
  aiConfigHandler(TEST_PORT),
  ...aiChatStoreHandlers(TEST_PORT),
];

test.describe("AI chat messages: no logo beside replies", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-chat-messages, "No logo beside replies"
  test("Conversation with an agent: the replies carry no logo", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const agent = legalReviewer(AiProjectMockAccess.Member);
    const threadId = aiChatThreadId(11);
    const messages: AiChatMessageMock[] = [
      aiChatUserMessage("Is clause 7 enforceable?", {
        id: aiChatMessageId(11),
        createdAt: at(0),
      }),
      aiChatAssistantMessage("Clause 7 is enforceable as written.", {
        id: aiChatMessageId(12),
        createdAt: at(5),
      }),
      aiChatUserMessage("And clause 9?", {
        id: aiChatMessageId(13),
        createdAt: at(60),
      }),
      aiChatAssistantMessage("Clause 9 needs a cap on liability.", {
        id: aiChatMessageId(14),
        createdAt: at(65),
      }),
    ];
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("roomAdmin"));
    mockRequest.use(
      ...aiSectionsHandlers(TEST_PORT, [agent]),
      ...aiChatThreadsHandlers(TEST_PORT, {
        threads: [
          { threadId, title: "Clause review", agentId: agent.id, messages },
        ],
      }),
    );
    await dismissModelUpdatedNotice(page, ROOM_ADMIN_ID);

    await openAgentChat(page, baseUrl, agent.id);
    await openConversation(page, threadId);

    const replies = page.getByTestId("assistant-message");
    await expect(replies).toHaveCount(2);
    await expect(replies.nth(1)).toContainText(
      "Clause 9 needs a cap on liability.",
    );
    await expect(page.getByTestId("assistant-message-logo")).toHaveCount(0);
  });

  // Spec: ai-chat-messages, "No logo beside replies"
  test("Default agent: the replies carry no logo", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("owner"));
    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      ...aiChatThreadsHandlers(TEST_PORT, {
        reply: { text: "You have three rooms.", title: "Rooms" },
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openDefaultChat(page, baseUrl);
    await send(page, "How many rooms do I have?");

    await expect(page.getByTestId("assistant-message-content")).toContainText(
      "You have three rooms.",
    );
    await expect(page.getByTestId("assistant-message-logo")).toHaveCount(0);
  });
});

test.describe("AI chat messages: attachments above the user's message", () => {
  const IMAGE = {
    ref: "cccccccc-0000-4000-8000-000000000011",
    title: "Whiteboard notes.jpg",
  };
  const DOCUMENT = {
    ref: "cccccccc-0000-4000-8000-000000000012",
    title: "Service agreement v3.docx",
    fileId: 880301,
    // c_oAscFileType of .docx, which the chip draws its icon from.
    type: 65,
  };

  /**
   * One conversation of the default agent whose first message was sent with
   * an attachment: the message as the storage keeps it, the text first and
   * the attachment's ref after it.
   */
  const sentWith = (
    threadId: string,
    text: string,
    attachment: AiChatContentPart,
  ): AiChatThreadMock => ({
    threadId,
    title: text,
    messages: [
      {
        ...aiChatUserMessage(text, { id: aiChatMessageId(21), createdAt: at(0) }),
        content: [{ type: "text", text }, attachment],
      },
      aiChatAssistantMessage("Done.", {
        id: aiChatMessageId(22),
        createdAt: at(5),
      }),
    ],
  });

  test.beforeEach(async ({ page, mockRequest }) => {
    await page.setViewportSize(DESKTOP);
    mockRequest.use(
      ...baseHandlers("owner"),
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      aiChatAttachmentsGetHandler(TEST_PORT, {
        [IMAGE.ref]: { title: IMAGE.title, base64: PNG },
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);
  });

  // Spec: ai-chat-messages, "Attachments above the user's message"
  test("Image: the picture stands above the bubble of the text", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const text = "Turn these notes into a task list";
    const threadId = aiChatThreadId(21);
    mockRequest.use(
      ...aiChatThreadsHandlers(TEST_PORT, {
        threads: [
          sentWith(threadId, text, aiChatImageAttachmentPart(IMAGE)),
        ],
      }),
    );

    await openDefaultChat(page, baseUrl);
    await openConversation(page, threadId);

    const message = page.getByTestId("user-message-content");
    await expect(message).toContainText(text);
    // The bubble holds the text alone.
    await expect(message.getByTestId("user-message-attachments")).toHaveCount(
      0,
    );
    const attachments = page
      .getByTestId("user-message")
      .getByTestId("user-message-attachments");
    const preview = attachments.locator("img");
    await expect(preview).toHaveAttribute("src", PNG);

    // The picture, then the bubble under it.
    const previewBox = await preview.boundingBox();
    const bubbleBox = await message.boundingBox();
    expect(previewBox!.y + previewBox!.height).toBeLessThanOrEqual(
      bubbleBox!.y,
    );
  });

  // Spec: ai-chat-messages, "Attachments above the user's message"
  test("Document: a chip with the document icon and its name stands above the bubble of the text", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const text = "Compare it with the previous version";
    const threadId = aiChatThreadId(22);
    mockRequest.use(
      ...aiChatThreadsHandlers(TEST_PORT, {
        threads: [
          sentWith(
            threadId,
            text,
            aiChatFileAttachmentPart({
              ref: DOCUMENT.ref,
              title: DOCUMENT.title,
              entryId: DOCUMENT.fileId,
              type: DOCUMENT.type,
            }),
          ),
        ],
      }),
    );

    await openDefaultChat(page, baseUrl);
    await openConversation(page, threadId);

    const message = page.getByTestId("user-message-content");
    await expect(message).toContainText(text);
    // The bubble holds the text alone.
    await expect(message.getByTestId("file-item")).toHaveCount(0);
    const chip = page
      .getByTestId("user-message")
      .getByTestId("user-message-attachments")
      .getByTestId("file-item");
    await expect(chip).toContainText(DOCUMENT.title);
    await expect(chip.locator("svg, img").first()).toBeVisible();

    // The chip, then the bubble under it.
    const chipBox = await chip.boundingBox();
    const bubbleBox = await message.boundingBox();
    expect(chipBox!.y + chipBox!.height).toBeLessThanOrEqual(bubbleBox!.y);
  });
});

test.describe("AI chat messages: a generated image", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-chat-messages, "Generated image without a card"; ai-chat-messages,
  // "Generated files are never shown as unsaved"
  test("Chart: the picture is drawn in the reply as it is, with no card and no Not saved mark", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("owner"));
    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      chartAttachments(),
      ...aiChatThreadsHandlers(TEST_PORT, {
        reply: { content: chartReply(), title: "Revenue chart" },
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openDefaultChat(page, baseUrl);
    await send(page, "Draw the revenue by quarter as a chart");

    const reply = page.getByTestId("assistant-message");
    const image = reply.getByTestId("tool-call-generated-image");
    await expect(image).toBeVisible();
    await expect(image).toHaveAttribute("src", PNG);
    // No card around the picture: no file name line and no buttons of its own.
    await expect(page.getByTestId("generated-image-card")).toHaveCount(0);
    await expect(
      reply.getByRole("button", { name: "Save to room..." }),
    ).toHaveCount(0);
    // Nothing marks the picture as unsaved or asks for a save first.
    await expect(reply).not.toContainText(/not saved/i);
  });
});

test.describe("AI chat messages: Save to room", () => {
  const MARKETING = { id: 5101, title: "Design for Marketing", canCreate: true };
  const BOARD = { id: 5102, title: "Board minutes", canCreate: false };

  const picker = (page: Page) =>
    page.getByTestId("aside").filter({ hasText: "Copy here" }).first();

  const pickerItem = (page: Page, title: string) =>
    picker(page)
      .locator('[data-testid^="selector-item-"]')
      .filter({ hasText: title })
      .first();

  /**
   * A round on the agent that creates the proposal, then "Save to room..." on
   * its card: the folder selector, opened on the portal's roots.
   */
  const openSaveToRoom = async (
    page: Page,
    baseUrl: string,
    mockRequest: WorkerFixture,
    copies: AiCopyRequest[],
  ) => {
    const agent = legalReviewer(AiProjectMockAccess.Owner);
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("owner"));
    mockRequest.use(
      ...aiSectionsHandlers(TEST_PORT, [agent]),
      ...aiCopyToRoomHandlers(TEST_PORT, [MARKETING, BOARD], copies),
      ...aiChatThreadsHandlers(TEST_PORT, {
        reply: { content: proposalReply(), title: "Acme proposal" },
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openAgentChat(page, baseUrl, agent.id);
    await send(page, "Write a proposal for Acme Corp");

    const card = page.getByTestId("created-document-card");
    await expect(card).toBeVisible();
    await card.getByTestId("created-document-save-to-room").click();
    await expect(picker(page)).toBeVisible();
    await pickerItem(page, "Rooms").click();
    return card;
  };

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-chat-messages, "Save to room"
  test("Copy to a room: a copy of the document goes to the picked room and the card stays as it was", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const copies: AiCopyRequest[] = [];
    const card = await openSaveToRoom(page, baseUrl, mockRequest, copies);

    await pickerItem(page, MARKETING.title).click();
    const copyHere = picker(page).getByRole("button", { name: "Copy here" });
    await expect(copyHere).toBeEnabled();
    await copyHere.click();

    await expect.poll(() => copies.length).toBe(1);
    expect(copies[0]).toMatchObject({
      fileIds: [PROPOSAL.id],
      folderIds: [],
      destFolderId: MARKETING.id,
      deleteAfter: false,
    });

    // The first copy stays where it is, and so does its card.
    await expect(picker(page)).toHaveCount(0);
    await expect(card).toBeVisible();
    await expect(card).toContainText(PROPOSAL.title);
  });

  // Spec: ai-chat-messages, "Save to room"
  test("Room the user only reads: the selector does not let a Viewer confirm it as the target", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const copies: AiCopyRequest[] = [];
    await openSaveToRoom(page, baseUrl, mockRequest, copies);

    await pickerItem(page, BOARD.title).click();
    await expect(
      picker(page).getByRole("button", { name: "Copy here" }),
    ).toBeDisabled();
    expect(copies).toHaveLength(0);
  });
});

test.describe("AI chat messages: a created document", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(DESKTOP);
    await recordOpenedTabs(page);
  });

  const documentCard = (page: Page) =>
    page.getByTestId("created-document-card");

  const expectOpensProposal = async (page: Page) => {
    await documentCard(page).getByTestId("created-document-open").click();
    await expect
      .poll(() => openedTabs(page))
      .toEqual([expect.stringContaining(`/doceditor?fileId=${PROPOSAL.id}`)]);
  };

  // Spec: ai-chat-messages, "Generated document card"
  test("Document from an agent: a card with the document icon, its name and created by the agent, which opens the document", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const agent = legalReviewer(AiProjectMockAccess.Owner);
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("owner"));
    mockRequest.use(
      ...aiSectionsHandlers(TEST_PORT, [agent]),
      ...aiChatThreadsHandlers(TEST_PORT, {
        reply: { content: proposalReply(), title: "Acme proposal" },
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openAgentChat(page, baseUrl, agent.id);
    await send(page, "Write a proposal for Acme Corp");

    const card = documentCard(page);
    await expect(card).toBeVisible();
    await expect(card).toContainText(PROPOSAL.title);
    await expect(card.locator("svg").first()).toBeVisible();
    await expect(card.getByTestId("created-document-author")).toHaveText(
      `created by ${AGENT_NAME}`,
    );
    // No page count.
    await expect(card).not.toContainText(/\bpages?\b/i);

    await expectOpensProposal(page);
  });

  // Spec: ai-chat-messages, "Generated document card"
  test("Document from the default agent: the card shows the icon and the name, with no created by line", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("owner"));
    mockRequest.use(
      roomListHandler(TEST_PORT, TypeRoomList.ContextMenu),
      ...aiChatThreadsHandlers(TEST_PORT, {
        reply: { content: proposalReply(), title: "Acme proposal" },
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openDefaultChat(page, baseUrl);
    await send(page, "Write a proposal for Acme Corp");

    const card = documentCard(page);
    await expect(card).toBeVisible();
    await expect(card).toContainText(PROPOSAL.title);
    await expect(card.locator("svg").first()).toBeVisible();
    await expect(card.getByTestId("created-document-author")).toHaveCount(0);
  });

  // Spec: ai-chat-messages, "Cards stay with the conversation"
  test("Reopened conversation: the reply still shows the document card, and a click opens the document", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const agent = legalReviewer(AiProjectMockAccess.Owner);
    const threadId = aiChatThreadId(31);
    // A later use() goes first: the threads storage overrides
    // the empty thread list of aiChatStoreHandlers.
    mockRequest.use(...baseHandlers("owner"));
    mockRequest.use(
      ...aiSectionsHandlers(TEST_PORT, [agent]),
      ...aiChatThreadsHandlers(TEST_PORT, {
        threads: [
          {
            threadId,
            title: "Acme proposal",
            agentId: agent.id,
            // Yesterday's conversation.
            lastEditDate: Date.now() - 24 * 60 * 60 * 1000,
            messages: [
              aiChatUserMessage("Write a proposal for Acme Corp", {
                id: aiChatMessageId(31),
                createdAt: at(0),
              }),
              aiChatAssistantMessage(proposalReply(), {
                id: aiChatMessageId(32),
                createdAt: at(30),
              }),
            ],
          },
        ],
      }),
    );
    await dismissModelUpdatedNotice(page, OWNER_ID);

    await openAgentChat(page, baseUrl, agent.id);
    await openConversation(page, threadId);

    const card = documentCard(page);
    await expect(card).toBeVisible();
    await expect(card).toContainText(PROPOSAL.title);
    await expect(card.getByTestId("created-document-author")).toHaveText(
      `created by ${AGENT_NAME}`,
    );
    await expect(page.getByTestId("assistant-message-logo")).toHaveCount(0);

    await expectOpensProposal(page);
  });
});
