// (c) Copyright Ascensio System SIA 2009-2026
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";
import { TFile } from "@docspace/shared/api/files/types";
import {
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
  aiRoomsChatsConfigHandler,
  aiRoomsServersHandler,
  aiRoomsChatsHandler,
  agentFolderChatHandler,
  aiConfigHandler,
  aiProvidersHandler,
  rootHandler,
  filesSettingsHandler,
  aiChatHandler,
  aiChatMessagesHandler,
  agentFolderInfoHandler,
  agentFolderResultStorageHandler,
  aiChatPutHandler,
  aiChatMessagesExportHandler,
  favoritesHandler,
  aiRoomsChatsStreamHandler,
} from "@docspace/shared/__mocks__/handlers";
import { SearchArea } from "@docspace/shared/enums";

test.describe("AI chat", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT),
    );
  });

  // ================================== Portal admin ==================================

  test.describe("Portal admin", () => {
    test.beforeEach(async ({ mockRequest }) => {
      mockRequest.use(selfActivationStatusHandler(TEST_PORT, null, true, true));
    });

    test("should render default empty ai chat", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-container")).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-default-empty.png",
      ]);
    });

    test("should render full size empty screen if ai not ready and there are no chats (admin)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),

        aiConfigHandler(TEST_PORT, true),
        aiProvidersHandler(TEST_PORT, false, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-not-ready-no-chats-admin.png",
      ]);

      const goToSettingsBtn = emptyView.getByRole("button");
      await goToSettingsBtn.click();

      await expect(page).toHaveURL("/portal-settings/ai-settings/providers");
    });

    test("should render chat header with empty screen if ai not ready and there are chats (admin)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),

        aiConfigHandler(TEST_PORT, true),
        aiProvidersHandler(TEST_PORT, false, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-header")).toBeVisible();

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-not-ready-with-chats-admin.png",
      ]);

      const goToSettingsBtn = emptyView.getByRole("button");
      await goToSettingsBtn.click();

      await expect(page).toHaveURL("/portal-settings/ai-settings/providers");
    });

    test("should render chat with info block, disabled chat input and new chat button if ai not ready (admin)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-info-block")).toBeVisible();

      await expect(page.getByTestId("create-chat")).toHaveAttribute(
        "aria-disabled",
        "true",
      );

      await expect(page.getByTestId("chat-input-textarea")).toBeDisabled();
      await expect(page.getByTestId("chat-input-send-button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(page.getByTestId("chat-input-tools-button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(
        page.getByTestId("chat-input-attachment-button"),
      ).toHaveAttribute("aria-disabled", "true");

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-with-info-block-ai-not-ready-admin.png",
      ]);
    });

    test("should render ai chat with user and ai messages", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("user-message")).toBeVisible();
      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-with-user-and-ai-messages.png",
      ]);
    });

    test("should render ai message with base elements", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "baseElements"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-base-elements.png",
      ]);
    });

    test("should render ai message with code block", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "codeBlock"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-code-block.png",
      ]);
    });

    test("should render ai message with table", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "table"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-table.png",
      ]);
    });

    test("should render ai message with web search tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "webSearch"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-web-search.png",
      ]);
    });

    test("should render ai message with failed web search tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "webSearchError"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-web-search-error.png",
      ]);
    });

    test("should render ai message with web crawling tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "webCrawling"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-web-crawling.png",
      ]);
    });

    test("should render ai message with failed web crawling tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "webCrawlingError"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-web-crawling-error.png",
      ]);
    });

    test("should render ai message with knowledge search tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "knowledgeSearch"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-knowledge-search.png",
      ]);
    });

    test("should render ai message with failed knowledge search tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "knowledgeSearchError"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-knowledge-search-error.png",
      ]);
    });

    test("should render ai message with mcp tool", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "mcpTool"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolCallHeader = page.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-mcp-tool.png",
      ]);
    });

    test("should scroll to last message after opening chat", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT, "many"),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message").last()).toBeInViewport();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-scroll-bottom.png",
      ]);
    });

    test("should redirect to result storage url if user can not use chat", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT, "canNotUseChat"),
        agentFolderResultStorageHandler(TEST_PORT, "canNotUseChat"),
        agentFolderInfoHandler(TEST_PORT, "canNotUseChat"),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page).toHaveURL(
        (url) =>
          url.pathname === "/ai-agents/2/filter" &&
          url.searchParams.get("folder") === "2" &&
          url.searchParams.get("searchArea") ===
            SearchArea.ResultStorage.toString(),
      );

      const warningToast = page.getByTestId("toast-content");
      await expect(warningToast).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-viewer-redirect-result-storage.png",
      ]);
    });

    test("should open chat via chat select", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const selectChat = page.getByTestId("select-chat");
      await expect(selectChat).toBeVisible();
      await selectChat.click();

      const selectChatDropdown = page.getByTestId("select-chat-dropdown");
      await expect(selectChatDropdown).toBeVisible();

      await expect(selectChatDropdown).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-select-chat-dropdown-default.png",
      ]);

      const firstChat = selectChatDropdown
        .getByTestId("drop-down-item")
        .first();
      await expect(firstChat).toBeVisible();
      await firstChat.hover();
      await expect(selectChatDropdown).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-select-chat-dropdown-with-hovered-item.png",
      ]);

      await firstChat.click();

      await expect(page.getByTestId("ai-message").last()).toBeInViewport();

      await selectChat.click();
      await expect(selectChatDropdown).toBeVisible();

      await expect(selectChatDropdown).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-select-chat-dropdown-with-selected-item.png",
      ]);
    });

    test("should delete chat", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const selectChat = page.getByTestId("select-chat");
      await expect(selectChat).toBeVisible();
      await selectChat.click();

      const selectChatDropdown = page.getByTestId("select-chat-dropdown");
      await expect(selectChatDropdown).toBeVisible();

      const firstChat = selectChatDropdown
        .getByTestId("drop-down-item")
        .first();
      await expect(firstChat).toBeVisible();
      await firstChat.hover();

      const contextMenuButton = selectChatDropdown.getByTestId(
        "chat-list-item-context-menu-button",
      );
      await contextMenuButton.click();

      const contextMenu = page
        .getByTestId("chat-list-item-context-menu")
        .locator("> div");
      await expect(contextMenu).toBeVisible();

      const removeItem = contextMenu.getByTestId("remove");
      await expect(removeItem).toBeVisible();

      await removeItem.click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const confirmButton = dialog.getByTestId("delete_dialog_modal_submit");
      await confirmButton.click();

      await selectChat.click();
      await expect(selectChatDropdown).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-after-delete-chat.png",
      ]);
    });

    test("should rename chat", async ({ page, mockRequest, baseUrl }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiChatPutHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const selectChat = page.getByTestId("select-chat");
      await expect(selectChat).toBeVisible();
      await selectChat.click();

      const selectChatDropdown = page.getByTestId("select-chat-dropdown");
      await expect(selectChatDropdown).toBeVisible();

      const firstChat = selectChatDropdown
        .getByTestId("drop-down-item")
        .first();
      await expect(firstChat).toBeVisible();
      await firstChat.hover();

      const contextMenuButton = selectChatDropdown.getByTestId(
        "chat-list-item-context-menu-button",
      );
      await contextMenuButton.click();

      const contextMenu = page
        .getByTestId("chat-list-item-context-menu")
        .locator("> div");
      await expect(contextMenu).toBeVisible();

      const renameItem = contextMenu.getByTestId("rename");
      await expect(renameItem).toBeVisible();

      await renameItem.click();

      const dialog = await page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const input = dialog.getByRole("textbox");
      await input.fill("Updated chat name");

      const confirmButton = dialog.getByTestId("confirm-button");
      await confirmButton.click();

      await selectChat.click();
      await expect(selectChatDropdown).toBeVisible();

      await expect(selectChatDropdown).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-select-chat-dropdown-after-rename-chat.png",
      ]);
    });

    test("should save chat to file", async ({
      page,
      mockRequest,
      wsMock,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesExportHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
      );

      await wsMock.setupWebSocketMock();

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      mockRequest.use(
        agentFolderResultStorageHandler(TEST_PORT),
        agentFolderInfoHandler(TEST_PORT),
      );

      const selectChat = page.getByTestId("select-chat");
      await expect(selectChat).toBeVisible();
      await selectChat.click();

      const selectChatDropdown = page.getByTestId("select-chat-dropdown");
      await expect(selectChatDropdown).toBeVisible();

      const firstChat = selectChatDropdown
        .getByTestId("drop-down-item")
        .first();
      await expect(firstChat).toBeVisible();
      await firstChat.hover();

      const contextMenuButton = selectChatDropdown.getByTestId(
        "chat-list-item-context-menu-button",
      );
      await contextMenuButton.click();

      const contextMenu = page
        .getByTestId("chat-list-item-context-menu")
        .locator("> div");
      await expect(contextMenu).toBeVisible();

      const saveToFileItem = contextMenu.getByTestId("save_to_file");
      await expect(saveToFileItem).toBeVisible();

      await saveToFileItem.click();

      await page.getByTestId("selector_submit_button").click();

      // Wait for the modal to close and socket subscription to be set up
      await page.waitForTimeout(500);

      wsMock.emitExportChat({
        resultFile: {
          fileEntryType: 2,
          folderId: 0,
          id: 979633,
          title: "Lorem ipsum",
          version: 1,
          versionGroup: 1,
        } as TFile,
      });

      await expect(page.getByTestId("toast-content")).toContainText(
        "Lorem ipsum",
      );

      wsMock.closeConnection();
    });

    test("should save message to file", async ({
      page,
      mockRequest,
      wsMock,
    }) => {
      mockRequest.use(
        settingsHandler(TEST_PORT, TypeSettings.AuthenticatedWithSocket),
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesExportHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );

      await wsMock.setupWebSocketMock();

      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      mockRequest.use(
        agentFolderResultStorageHandler(TEST_PORT),
        agentFolderInfoHandler(TEST_PORT),
      );

      await expect(page.getByTestId("ai-message")).toBeVisible();
      await page.getByTitle("Save to file").click();

      await page.getByTestId("selector_submit_button").click();

      // Wait for the modal to close and socket subscription to be set up
      await page.waitForTimeout(500);

      wsMock.emitExportChat({
        resultFile: {
          fileEntryType: 2,
          folderId: 0,
          id: 979633,
          title: "Test message",
          version: 1,
          versionGroup: 1,
        } as TFile,
      });

      await expect(page.getByTestId("toast-content")).toContainText(
        "Test message",
      );

      wsMock.closeConnection();
    });

    test("should toggle web search if web search available", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolsButton = page.getByTestId("chat-input-tools-button");
      await toolsButton.click();

      const webSearchItem = page.getByTestId("web-search");
      await expect(webSearchItem).toBeVisible();
      const toggleButton = webSearchItem.getByTestId("toggle-button");
      await expect(toggleButton).toHaveAttribute("aria-checked", "true");
      await webSearchItem.click();
      await expect(toggleButton).toHaveAttribute("aria-checked", "false");
      await webSearchItem.click();
      await expect(toggleButton).toHaveAttribute("aria-checked", "true");
    });

    test("should render disabled web search and go to settings via tooltip if web search unavailable (admin)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT, false, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolsButton = page.getByTestId("chat-input-tools-button");
      await toolsButton.click();

      const webSearchItem = page.getByTestId("web-search");
      await expect(webSearchItem).toBeVisible();

      const toggleButton = webSearchItem.getByTestId("toggle-button");
      await toggleButton.hover();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-with-disabled-web-search-tooltip-admin.png",
      ]);

      const goSettingsLink = page.getByTestId("go-to-settings-link");
      await expect(goSettingsLink).toBeVisible();

      await goSettingsLink.click();
      await expect(page).toHaveURL("/portal-settings/ai-settings/search");
    });

    test("should attach and remove files", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const attachButton = page.getByTestId("chat-input-attachment-button");
      await attachButton.click();

      const selector = page.getByTestId("aside");

      await expect(selector).toBeVisible();

      mockRequest.use(favoritesHandler(TEST_PORT));

      const favoritesOption = selector.getByTestId(/selector-item/).filter({
        hasText: "Favorites",
      });
      await favoritesOption.click();

      const firstDocument = selector.getByTestId(/selector-item/).first();
      await firstDocument.click();

      const addButton = selector.getByTestId("selector_submit_button");
      await addButton.click();

      const filesListItem = page.getByTestId("files-list-item");
      await expect(filesListItem).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-with-attached-files.png",
      ]);

      const removeFileButton = filesListItem.getByTestId("remove-file-button");
      await removeFileButton.click();

      await expect(filesListItem).toHaveCount(0);
    });

    test("should send message with text and file and receive response", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiRoomsChatsStreamHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const sendButton = page.getByTestId("chat-input-send-button");
      await expect(sendButton).toHaveAttribute("aria-disabled", "true");

      const attachButton = page.getByTestId("chat-input-attachment-button");
      await attachButton.click();

      const selector = page.getByTestId("aside");

      await expect(selector).toBeVisible();

      //await mockRequest.router([endpoints.favorites]);
      mockRequest.use(favoritesHandler(TEST_PORT));

      const favoritesOption = selector.getByTestId(/selector-item/).filter({
        hasText: "Favorites",
      });
      await favoritesOption.click();

      const firstDocument = selector.getByTestId(/selector-item/).first();
      await firstDocument.click();

      const addButton = selector.getByTestId("selector_submit_button");
      await addButton.click();

      const chatTextArea = page.getByTestId("chat-input-textarea");
      await chatTextArea.fill("Lorem ipsum dolor sit amet");

      await expect(sendButton).toHaveAttribute("aria-disabled", "false");
      await sendButton.click();

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-send-message-with-file.png",
      ]);
    });

    test("should render tool call confirm dialog", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiRoomsChatsStreamHandler(TEST_PORT, "mcpNeedApprove"),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const sendButton = page.getByTestId("chat-input-send-button");

      const chatTextArea = page.getByTestId("chat-input-textarea");
      await chatTextArea.fill("Lorem ipsum dolor sit amet");

      await expect(sendButton).toHaveAttribute("aria-disabled", "false");
      await sendButton.click();

      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const toolCallHeader = dialog.getByTestId("tool-call-header");
      await expect(toolCallHeader).toBeVisible();

      await toolCallHeader.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-tool-call-confirm-dialog.png",
      ]);
    });

    test("should save chat input state when switch between agent tabs", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        agentFolderResultStorageHandler(TEST_PORT, "empty"),
        agentFolderInfoHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const sendButton = page.getByTestId("chat-input-send-button");
      await expect(sendButton).toHaveAttribute("aria-disabled", "true");

      const attachButton = page.getByTestId("chat-input-attachment-button");
      await attachButton.click();

      const selector = page.getByTestId("aside");

      await expect(selector).toBeVisible();

      mockRequest.use(favoritesHandler(TEST_PORT));
      const favoritesOption = selector.getByTestId(/selector-item/).filter({
        hasText: "Favorites",
      });
      await favoritesOption.click();

      const firstDocument = selector.getByTestId(/selector-item/).first();
      await firstDocument.click();

      const addButton = selector.getByTestId("selector_submit_button");
      await addButton.click();

      const chatTextArea = page.getByTestId("chat-input-textarea");
      await chatTextArea.fill("Lorem ipsum dolor sit amet");

      mockRequest.use(agentFolderResultStorageHandler(TEST_PORT, "empty"));

      const resultStorageTab = page.getByTestId("result_tab");
      await resultStorageTab.click();

      await expect(page.getByTestId("empty-view")).toBeVisible();

      mockRequest.use(agentFolderChatHandler(TEST_PORT));
      const chatTab = page.getByTestId("chat_tab");
      await chatTab.click();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-switch-tab-save-state.png",
      ]);
    });

    test("should save chat input state when reload page", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const sendButton = page.getByTestId("chat-input-send-button");
      await expect(sendButton).toHaveAttribute("aria-disabled", "true");

      const attachButton = page.getByTestId("chat-input-attachment-button");
      await attachButton.click();

      const selector = page.getByTestId("aside");

      await expect(selector).toBeVisible();

      //await mockRequest.router([endpoints.favorites]);
      mockRequest.use(favoritesHandler(TEST_PORT));

      const favoritesOption = selector.getByTestId(/selector-item/).filter({
        hasText: "Favorites",
      });
      await favoritesOption.click();

      const firstDocument = selector.getByTestId(/selector-item/).first();
      await firstDocument.click();

      const addButton = selector.getByTestId("selector_submit_button");
      await addButton.click();

      const chatTextArea = page.getByTestId("chat-input-textarea");
      await chatTextArea.fill("Lorem ipsum dolor sit amet");

      //await page.unroute(endpoints.favorites.url);
      mockRequest.use(agentFolderChatHandler(TEST_PORT));

      await page.reload();

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-reload-page-save-state.png",
      ]);
    });
  });

  // ================================== User ==================================

  test.describe("User", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));
    });

    test("should render full size empty screen without go to settings button if ai not ready and there are no chats (user)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT, "empty"),
        agentFolderChatHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT, true),
        aiProvidersHandler(TEST_PORT, false, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-not-ready-no-chats-user.png",
      ]);
    });

    test("should render chat header with empty screen if ai not ready and there are chats (user)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT, true),
        aiProvidersHandler(TEST_PORT, false, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-header")).toBeVisible();

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-ai-not-ready-with-chats-user.png",
      ]);
    });

    test("should render chat with info block, disabled chat input and new chat button if ai not ready (user)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatMessagesHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT, true),
      );
      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2&chat=test-chat-id`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-info-block")).toBeVisible();

      await expect(page.getByTestId("create-chat")).toHaveAttribute(
        "aria-disabled",
        "true",
      );

      await expect(page.getByTestId("chat-input-textarea")).toBeDisabled();
      await expect(page.getByTestId("chat-input-send-button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(page.getByTestId("chat-input-tools-button")).toHaveAttribute(
        "aria-disabled",
        "true",
      );
      await expect(
        page.getByTestId("chat-input-attachment-button"),
      ).toHaveAttribute("aria-disabled", "true");

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-with-info-block-ai-not-ready-user.png",
      ]);
    });

    test("should render disabled web search with tooltip if web search unavailable (user)", async ({
      page,
      mockRequest,
      baseUrl,
    }) => {
      mockRequest.use(
        aiRoomsChatsConfigHandler(TEST_PORT),
        aiRoomsServersHandler(TEST_PORT),
        aiRoomsChatsHandler(TEST_PORT),
        agentFolderChatHandler(TEST_PORT),
        aiChatHandler(TEST_PORT),
        aiConfigHandler(TEST_PORT, false, true),
      );

      await page.goto(`${baseUrl}/ai-agents/2/chat?folder=2`);

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolsButton = page.getByTestId("chat-input-tools-button");
      await toolsButton.click();

      const webSearchItem = page.getByTestId("web-search");
      await expect(webSearchItem).toBeVisible();

      const toggleButton = webSearchItem.getByTestId("toggle-button");
      await toggleButton.hover();

      await expectScreenshot(page,[
        "desktop",
        "ai-chat",
        "ai-chat-with-disabled-web-search-tooltip-user.png",
      ]);
    });
  });
});
