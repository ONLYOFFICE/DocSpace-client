// (c) Copyright Ascensio System SIA 2009-2025
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
import { endpoints } from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";
import { SearchArea } from "@docspace/shared/enums";
import { TFile } from "@docspace/shared/api/files/types";

test.describe("AI chat", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.settingsWithQuery,
      endpoints.colorTheme,
      endpoints.build,
      endpoints.capabilities,
      endpoints.tariff,
      endpoints.quota,
      endpoints.aiConfig,
      endpoints.additionalSettings,
      endpoints.getPortal,
      endpoints.companyInfo,
      endpoints.cultures,
      endpoints.root,
      endpoints.invitationSettings,
      endpoints.filesSettings,
      endpoints.webPlugins,
      endpoints.thirdPartyCapabilities,
      endpoints.thirdParty,
      endpoints.docService,
    ]);
  });

  // ================================== Portal admin ==================================

  test.describe("Portal admin", () => {
    test.beforeEach(async ({ mockRequest }) => {
      await mockRequest.router([endpoints.selfEmailActivatedClient]);
    });

    test("should render default empty ai chat", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-container")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-default-empty.png",
      ]);
    });

    test("should render full size empty screen if ai not ready and there are no chats (admin)", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiConfigDisabled,
        endpoints.aiProvidersEmptyList,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
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
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiConfigDisabled,
        endpoints.aiProvidersEmptyList,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-header")).toBeVisible();

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
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
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessages,
        endpoints.aiConfigDisabled,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-with-info-block-ai-not-ready-admin.png",
      ]);
    });

    test("should render ai chat with user and ai messages", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessages,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("user-message")).toBeVisible();
      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-with-user-and-ai-messages.png",
      ]);
    });

    test("should render ai message with base elements", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessagesBaseElements,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-base-elements.png",
      ]);
    });

    test("should render ai message with code block", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessagesCodeBlock,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-code-block.png",
      ]);
    });

    test("should render ai message with table", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessagesTable,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-ai-message-table.png",
      ]);
    });

    test("should scroll to last message after opening chat", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessagesMany,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("ai-message").last()).toBeInViewport();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-scroll-bottom.png",
      ]);
    });

    test("should redirect to result storage url if user can not use chat", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChatCanNotUseChat,
        endpoints.agentFolderResultStorageCanNotUseChat,
        endpoints.agentFolderInfoCanNotUseChat,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-viewer-redirect-result-storage.png",
      ]);
    });

    test("should open chat via chat select", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessages,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

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

    test("should delete chat", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessages,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const selectChat = page.getByTestId("select-chat");
      await expect(selectChat).toBeVisible();
      await selectChat.click();

      const selectChatDropdown = page.getByTestId("select-chat-dropdown");
      await expect(selectChatDropdown).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-before-delete-chat.png",
      ]);

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

      const dialog = await page.getByRole("dialog");
      await expect(dialog).toBeVisible();

      const confirmButton = dialog.getByTestId("delete_dialog_modal_submit");
      await confirmButton.click();

      await selectChat.click();
      await expect(selectChatDropdown).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-after-delete-chat.png",
      ]);
    });

    test("should rename chat", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.updateAiChat,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

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
        "ai-chat-select-chat-dropdown-before-rename-chat.png",
      ]);

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

    test("should save chat to file", async ({ page, mockRequest, wsMock }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.exportChatMessage,
        endpoints.settingsWithSocket,
      ]);

      await wsMock.setupWebSocketMock();

      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await page.unroute(endpoints.agentFolderChat.url);

      await mockRequest.router([
        endpoints.resultStorageFolder,
        endpoints.resultStorageFolderInfo,
      ]);

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

    test("should toggle web search if web search available", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

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
    }) => {
      await page.unroute(endpoints.aiConfig.url);

      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiConfigWebSearchDisabled,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolsButton = page.getByTestId("chat-input-tools-button");
      await toolsButton.click();

      const webSearchItem = page.getByTestId("web-search");
      await expect(webSearchItem).toBeVisible();

      const toggleButton = webSearchItem.getByTestId("toggle-button");
      await toggleButton.hover();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-with-disabled-web-search-tooltip-admin.png",
      ]);

      const goSettingsLink = page.getByTestId("go-to-settings-link");
      await expect(goSettingsLink).toBeVisible();

      await goSettingsLink.click();
      await expect(page).toHaveURL("/portal-settings/ai-settings/search");
    });

    test("should attach and remove files", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.updateAiChat,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const attachButton = page.getByTestId("chat-input-attachment-button");
      await attachButton.click();

      const selector = page.getByTestId("aside");

      await expect(selector).toBeVisible();

      await mockRequest.router([endpoints.favorites]);

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

      const removeFileButton = filesListItem.getByTestId("remove-file-button");
      await removeFileButton.click();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-with-attached-files.png",
      ]);

      await expect(filesListItem).toHaveCount(0);
    });
  });

  // ================================== User ==================================

  test.describe("User", () => {
    test.beforeEach(async ({ mockRequest }) => {
      await mockRequest.router([endpoints.selfRegularUserOnly]);
    });

    test("should render full size empty screen without go to settings button if ai not ready and there are no chats (user)", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChatsEmpty,
        endpoints.agentFolderChat,
        endpoints.aiConfigDisabled,
        endpoints.aiProvidersEmptyList,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-ai-not-ready-no-chats-user.png",
      ]);
    });

    test("should render chat header with empty screen if ai not ready and there are chats (user)", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiConfigDisabled,
        endpoints.aiProvidersEmptyList,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      await expect(page.getByTestId("chat-header")).toBeVisible();

      const emptyView = page.getByTestId("empty-view");
      await expect(emptyView).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-ai-not-ready-with-chats-user.png",
      ]);
    });

    test("should render chat with info block, disabled chat input and new chat button if ai not ready (user)", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiChatMessages,
        endpoints.aiConfigDisabled,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2&chat=test-chat-id");

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

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-with-info-block-ai-not-ready-user.png",
      ]);
    });

    test("should render disabled web search with tooltip if web search unavailable (user)", async ({
      page,
      mockRequest,
    }) => {
      await page.unroute(endpoints.aiConfig.url);

      await mockRequest.router([
        endpoints.aiRoomsChatsConfigAllEnabled,
        endpoints.aiRoomsServersEmpty,
        endpoints.aiRoomsChats,
        endpoints.agentFolderChat,
        endpoints.aiChat,
        endpoints.aiConfigWebSearchDisabled,
      ]);
      await page.goto("/ai-agents/2/chat?folder=2");

      const containerLoader = page.getByTestId("chat-container-loading");

      await expect(containerLoader).toBeVisible();
      await containerLoader.waitFor({ state: "hidden" });

      const toolsButton = page.getByTestId("chat-input-tools-button");
      await toolsButton.click();

      const webSearchItem = page.getByTestId("web-search");
      await expect(webSearchItem).toBeVisible();

      const toggleButton = webSearchItem.getByTestId("toggle-button");
      await toggleButton.hover();

      await expect(page).toHaveScreenshot([
        "desktop",
        "ai-chat",
        "ai-chat-with-disabled-web-search-tooltip-user.png",
      ]);
    });
  });
});
