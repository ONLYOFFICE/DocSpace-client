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
  aiChatMessageId,
  aiChatThreadId,
  aiChatThreadsHandlers,
  aiChatUserMessage,
  aiSectionsHandlers,
  aiThreadFilesHandlers,
  AI_PROJECTS,
  AI_PROJECT_WITH_SOURCES,
  rootHandler,
  filesSettingsHandler,
} from "@docspace/shared/__mocks__/handlers";
import type {
  AiChatThreadMock,
  AiThreadFilesMock,
} from "@docspace/shared/__mocks__/handlers";

import { expectElementScreenshot } from "@docspace/shared/__mocks__/e2e";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Content tab of the Info panel on an agent's page: the files of the
 * conversation on screen, its Artifacts and its Attachments
 * (`files/rooms/{id}/threads/{threadId}/artifacts|attachments`), each row
 * with Download and "Save to room...", and "Download all" over more than one
 * artifact. The conversation is opened from the agent's history, over the
 * stateful threads mock.
 */

const DESKTOP = { width: 1440, height: 1024 };

const AGENT = AI_PROJECT_WITH_SOURCES;
const agentUrl = (id: number) => `/ai-rooms/${id}/filter?folder=${id}`;

const AT = Date.parse("2026-11-18T09:00:00.000Z");

const REPORT = {
  threadId: aiChatThreadId(11),
  title: "Quarterly report",
  question: "Chart the quarter's sales and use the attached brief.",
  answer: "Here are the two charts of the quarter.",
};

const DELETED = {
  threadId: aiChatThreadId(12),
  title: "Old draft",
};

const THREADS: AiChatThreadMock[] = [
  {
    threadId: REPORT.threadId,
    title: REPORT.title,
    agentId: AGENT.id,
    lastEditDate: AT,
    messages: [
      aiChatUserMessage(REPORT.question, {
        id: aiChatMessageId(11),
        createdAt: "2026-11-18T09:00:00.000Z",
      }),
      aiChatAssistantMessage(REPORT.answer, {
        id: aiChatMessageId(12),
        createdAt: "2026-11-18T09:00:05.000Z",
      }),
    ],
  },
  {
    threadId: DELETED.threadId,
    title: DELETED.title,
    agentId: AGENT.id,
    lastEditDate: AT - 60_000,
    messages: [
      aiChatUserMessage("Draft the intro.", {
        id: aiChatMessageId(13),
        createdAt: "2026-11-18T08:59:00.000Z",
      }),
    ],
  },
];

const SALES_CHART = { id: 880001, title: "Sales chart.png", fileExst: ".png" };
const REGIONS_CHART = { id: 880002, title: "Regions chart.png", fileExst: ".png" };
const BRIEF = { id: 880101, title: "Brief.docx", fileExst: ".docx" };
const SUMMARY = { id: 880003, title: "Summary.docx", fileExst: ".docx" };

const FILES: Record<string, AiThreadFilesMock> = {
  [REPORT.threadId]: {
    artifacts: [SALES_CHART, REGIONS_CHART],
    attachments: [BRIEF],
  },
};

/**
 * A chat without a remembered model raises the "Model updated" notice over
 * the picker; it has nothing to do with Content, so it is marked as already
 * dismissed for the account (ModelUpdatedBanner's per-account flag).
 */
const dismissModelUpdatedNotice = (page: Page) =>
  page.addInitScript((key) => {
    window.localStorage.setItem(key, "true");
  }, `ai_chat_model_updated_bar_dismissed_${usersByType.owner.id}`);

const artifacts = (page: Page) => page.getByTestId("ai-agent-content-artifacts");
const attachments = (page: Page) =>
  page.getByTestId("ai-agent-content-attachments");
const fileRow = (page: Page, title: string) =>
  page.getByTestId("ai-agent-content-file").filter({ hasText: title });

/** Opens a conversation of the agent from its history, on its messages. */
const openConversation = async (page: Page, threadId: string) => {
  await page.getByRole("button", { name: "Chat history" }).first().click();
  const list = page.getByTestId("chat-list");
  await expect(list).toBeVisible();
  await list.locator(`[data-thread-id="${threadId}"]`).click();
  await expect(page.getByTestId("user-message-content").first()).toBeVisible();
};

/** Opens the Info panel on the agent's page, on its Content tab. */
const openContent = async (page: Page) => {
  const toggle = page.locator("#info-panel-toggle--open");
  const contentTab = page.getByTestId("info_content_tab");
  if (!(await contentTab.isVisible())) await toggle.click();
  await expect(contentTab).toBeVisible();
  await contentTab.click();
};

test.describe("Content of an agent's conversation", () => {
  test.beforeEach(async ({ page, mockRequest }) => {
    const projects = [...AI_PROJECTS];
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "owner", "en-US"),
      aiConfigHandler(TEST_PORT),
      ...aiChatStoreHandlers(TEST_PORT),
    );
    mockRequest.use(
      ...aiSectionsHandlers(TEST_PORT, projects),
      ...aiChatThreadsHandlers(TEST_PORT, { threads: THREADS }),
    );
    // After the sections: their thread file lists have no files.
    mockRequest.use(
      ...aiThreadFilesHandlers(TEST_PORT, projects, FILES, [DELETED.threadId]),
    );
    await dismissModelUpdatedNotice(page);
    await page.setViewportSize(DESKTOP);
  });

  // Spec: ai-agent-info-panel, "Files of the conversation"
  test("a conversation with files lists the generated images under Artifacts and the attached document under Attachments", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await expect(page.getByTestId("ai-project-intro")).toBeVisible();

    await openConversation(page, REPORT.threadId);
    await openContent(page);

    await expect(artifacts(page)).toContainText("Artifacts");
    await expect(artifacts(page).getByTestId("ai-agent-content-file")).toHaveCount(2);
    await expect(artifacts(page)).toContainText(SALES_CHART.title);
    await expect(artifacts(page)).toContainText(REGIONS_CHART.title);

    await expect(attachments(page)).toContainText("Attachments");
    await expect(attachments(page).getByTestId("ai-agent-content-file")).toHaveCount(1);
    await expect(attachments(page)).toContainText(BRIEF.title);
  });

  // Spec: ai-agent-info-panel, "Files of the conversation"
  test("a new chat shows the empty screen", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await openConversation(page, REPORT.threadId);
    await openContent(page);
    await expect(fileRow(page, BRIEF.title)).toBeVisible();

    await page.locator("#chat-toolbar").getByRole("button", { name: "New chat" }).click();

    const empty = page.getByTestId("ai-agent-content-empty");
    await expect(empty).toContainText("No files yet");
    await expect(empty.locator("img")).toBeVisible();
    await expect(empty).toContainText(
      "Files created by the agent and files you attach in this conversation will appear here.",
    );
    await expect(artifacts(page)).toHaveCount(0);
    await expect(attachments(page)).toHaveCount(0);
    await expect(page.getByTestId("ai-agent-content-file")).toHaveCount(0);

    await expectElementScreenshot(empty, [
      "desktop",
      "ai-agent-content",
      "content-empty.png",
    ]);
  });

  // Spec: ai-agent-info-panel, "Empty screen of Content"
  test("a conversation with attachments only shows no Artifacts section", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...aiThreadFilesHandlers(TEST_PORT, [...AI_PROJECTS], {
        [REPORT.threadId]: { artifacts: [], attachments: [BRIEF] },
      }),
    );
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await openConversation(page, REPORT.threadId);
    await openContent(page);

    await expect(attachments(page)).toContainText(BRIEF.title);
    await expect(artifacts(page)).toHaveCount(0);
    await expect(page.getByTestId("ai-agent-content")).not.toContainText("Artifacts");
    await expect(page.getByTestId("ai-agent-content")).not.toContainText("No files yet");
    await expect(page.getByTestId("ai-agent-content-empty")).toHaveCount(0);
  });

  // Spec: ai-agent-info-panel, "Content follows the files the server announces"
  test("a new artifact the server announces is listed without a reload, the attachments left as they are", async ({
    page,
    baseUrl,
    mockRequest,
    wsMock,
  }) => {
    // The other tests run without a socket; this one listens to it.
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
    );
    await wsMock.setupWebSocketMock();
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await openConversation(page, REPORT.threadId);
    await openContent(page);
    await expect(artifacts(page).getByTestId("ai-agent-content-file")).toHaveCount(2);

    // The agent saved one more file, on another device.
    mockRequest.use(
      ...aiThreadFilesHandlers(TEST_PORT, [...AI_PROJECTS], {
        [REPORT.threadId]: {
          artifacts: [SUMMARY, SALES_CHART, REGIONS_CHART],
          attachments: [BRIEF],
        },
      }),
    );
    const attachmentsRead = { count: 0 };
    page.on("request", (request) => {
      if (request.url().includes(`/threads/${REPORT.threadId}/attachments`))
        attachmentsRead.count += 1;
    });

    // An event of another conversation is none of this tab's.
    wsMock.emitModifyThreadFiles({
      cmd: "create",
      id: SUMMARY.id,
      threadId: DELETED.threadId,
      kind: "artifacts",
    });
    wsMock.emitModifyThreadFiles({
      cmd: "create",
      id: SUMMARY.id,
      // The server writes the id as a GUID in its own case.
      threadId: REPORT.threadId.toUpperCase(),
      kind: "artifacts",
    });

    await expect(artifacts(page).getByTestId("ai-agent-content-file")).toHaveCount(3);
    await expect(artifacts(page)).toContainText(SUMMARY.title);
    await expect(attachments(page).getByTestId("ai-agent-content-file")).toHaveCount(1);
    expect(attachmentsRead.count).toBe(0);
  });

  // Spec: ai-agent-info-panel, "Actions of a Content row"
  test("a row offers Download and Save to room with no Open location, and Save to room opens the room picker", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await openConversation(page, REPORT.threadId);
    await openContent(page);

    await fileRow(page, BRIEF.title).getByTestId("ai-agent-content-menu").click();
    await expect(page.getByTestId("ai-agent-content-download_item")).toContainText(
      "Download",
    );
    await expect(
      page.getByTestId("ai-agent-content-save-to-room_item"),
    ).toContainText("Save to room...");
    await expect(page.getByRole("menuitem", { name: "Open location" })).toHaveCount(0);
    // A second click on the same button closes its menu; the closed menu
    // stays in the DOM, hidden.
    await fileRow(page, BRIEF.title).getByTestId("ai-agent-content-menu").click();
    await expect(page.getByTestId("ai-agent-content-save-to-room_item")).toBeHidden();

    await fileRow(page, SALES_CHART.title)
      .getByTestId("ai-agent-content-menu")
      .click();
    await page
      .getByTestId("ai-agent-content-save-to-room_item")
      .filter({ visible: true })
      .click();
    await expect(page.getByTestId("selector_submit_button").first()).toBeVisible();
  });

  // Spec: ai-agent-info-panel, "Download all artifacts"
  test("Download all over two artifacts downloads both together, and Attachments offers no Download all", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    await openConversation(page, REPORT.threadId);
    await openContent(page);

    await expect(
      attachments(page).getByTestId("ai-agent-content-download-all"),
    ).toHaveCount(0);

    const bulk = page.waitForRequest(
      (request) =>
        request.method() === "PUT" &&
        request.url().includes("/files/fileops/bulkdownload"),
    );
    await artifacts(page).getByTestId("ai-agent-content-download-all").click();
    const body = (await bulk).postData() ?? "";
    expect(body).toContain(String(SALES_CHART.id));
    expect(body).toContain(String(REGIONS_CHART.id));
    expect(body).not.toContain(String(BRIEF.id));
  });

  // Spec: ai-agent-info-panel, "Content is the author's own"
  test("a conversation whose files cannot be read says that something went wrong", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${agentUrl(AGENT.id)}`);
    // Deleted meanwhile: both lists answer 404.
    await openConversation(page, DELETED.threadId);
    await openContent(page);

    await expect(page.getByTestId("ai-agent-content-error")).toHaveText(
      "Something went wrong.",
    );
    await expect(page.getByTestId("ai-agent-content")).toHaveCount(0);
  });
});
