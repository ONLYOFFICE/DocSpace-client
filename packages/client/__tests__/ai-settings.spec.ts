/*
 * (c) Copyright Ascensio System SIA 2009-2025
 *
 * This program is a free software product.
 * You can redistribute it and/or modify it under the terms
 * of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
 * Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
 * to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
 * any third-party rights.
 *
 * This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
 * of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
 * the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
 *
 * The  interactive user interfaces in modified source and object code versions of the Program must
 * display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
 *
 * Pursuant to Section 7(b) of the License you must retain the original Product logo when
 * distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
 * trademark law for use of our trademarks.
 *
 * All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
 * content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
 * International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode
 */

import { expect, test } from "./fixtures/base";
import { endpoints } from "@docspace/shared/__mocks__/e2e";
import {
  PATH_AI_PROVIDERS,
  PATH_AI_SERVERS,
} from "@docspace/shared/__mocks__/e2e/handlers/ai";
import { ProviderType, ServerType } from "@docspace/shared/api/ai/enums";
import type { TServer } from "@docspace/shared/api/ai/types";

test.describe("AI settings", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([
      endpoints.aiConfig,
      endpoints.settingsWithQuery,
      endpoints.colorTheme,
      endpoints.build,
      endpoints.capabilities,
      endpoints.selfEmailActivatedClient,
      endpoints.tariff,
      endpoints.quota,
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

  test.describe("AI Provider", () => {
    test("should render empty AI providers page with description and add provider button", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([endpoints.aiProvidersEmptyList]);

      await page.goto("/portal-settings/ai-settings/providers");

      const addProviderBtn = page.getByTestId("add-provider-button");

      await expect(addProviderBtn).toBeVisible();

      const description = page.getByTestId("provider-section-description");

      await expect(description).toBeVisible();

      const tiles = page.getByTestId("ai-provider-tile");
      await expect(tiles).toHaveCount(0);
    });

    test("should create AI provider", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiProvidersEmptyList,
        endpoints.createAiProvider,
        endpoints.aiProvidersAvailable,
      ]);

      await page.goto("/portal-settings/ai-settings/providers");

      const addProviderBtn = page.getByTestId("add-provider-button");
      await expect(addProviderBtn).toBeVisible();

      await addProviderBtn.click();

      const addProviderForm = page.getByTestId("add-provider-form");
      await expect(addProviderForm).toBeVisible();

      const providerSaveButton = page.getByTestId("provider-save-button");
      await expect(providerSaveButton).toBeDisabled();

      const providerTypeCombobox = page.getByTestId("provider-type-combobox");
      await providerTypeCombobox.click();

      const dropdown = page.getByTestId("dropdown");
      const anthropicElement = dropdown.getByText("Anthropic");
      await anthropicElement.click();

      const providerTitleInput = page.getByTestId("provider-title-input");
      await providerTitleInput.fill("test provider");

      const providerUrlInput = page.getByTestId("provider-url-input");
      await expect(providerUrlInput).toBeDisabled();
      await expect(providerUrlInput).toHaveValue(
        "https://api.anthropic.com/v1",
      );

      const providerKeyInput = page
        .getByTestId("provider-key-input")
        .getByTestId("text-input");

      await providerKeyInput.fill("testkey");

      const reqPromise = page.waitForRequest(
        (r) => r.url().endsWith(PATH_AI_PROVIDERS) && r.method() === "POST",
      );
      await providerSaveButton.click();
      const req = await reqPromise;
      const payload = req.postDataJSON();

      expect(payload).toEqual({
        title: "test provider",
        url: "https://api.anthropic.com/v1",
        key: "testkey",
        type: ProviderType.Anthropic,
      });

      const createdProviderTile = page.getByTestId("ai-provider-tile");
      await expect(createdProviderTile).toBeVisible();
    });

    test("should delete AI Provider", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiProvidersList,
        endpoints.deleteAiProvider,
      ]);

      const listRespPromise = page.waitForResponse(
        (r) =>
          r.url().endsWith(PATH_AI_PROVIDERS) && r.request().method() === "GET",
      );

      await page.goto("/portal-settings/ai-settings/providers");

      const listResp = await listRespPromise;
      const body = await listResp.json();
      const firstProviderData = body.response[0];

      const allProviderTiles = page.getByTestId("ai-provider-tile");
      await expect(allProviderTiles).toHaveCount(4);

      const firstProviderTile = allProviderTiles.first();
      await expect(firstProviderTile).toBeVisible();
      await expect(firstProviderTile).toContainText(firstProviderData.title);

      const contextMenuBtn = firstProviderTile.getByTestId(
        "context-menu-button",
      );
      await contextMenuBtn.click();

      const deleteItem = page.getByTestId("delete_item");
      await deleteItem.click();

      const deleteProviderDialog = page.getByRole("dialog");
      await expect(deleteProviderDialog).toBeVisible();
      await expect(deleteProviderDialog).toContainText("Delete provider");

      const deleteProviderButton = deleteProviderDialog.getByTestId(
        "delete-provider-button",
      );

      const deleteReqPromise = page.waitForRequest(
        (r) => r.url().endsWith(PATH_AI_PROVIDERS) && r.method() === "DELETE",
      );

      await deleteProviderButton.click();

      const deleteReq = await deleteReqPromise;
      const payload = deleteReq.postDataJSON();

      expect(payload).toEqual({ ids: [firstProviderData.id] });

      await expect(allProviderTiles).toHaveCount(3);
      await expect(firstProviderTile).not.toContainText(
        firstProviderData.title,
      );
    });

    test("should update AI Provider", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiProvidersList,
        endpoints.aiProvidersAvailable,
        endpoints.updateAiProvider,
      ]);

      const listRespPromise = page.waitForResponse(
        (r) =>
          r.url().endsWith(PATH_AI_PROVIDERS) && r.request().method() === "GET",
      );

      await page.goto("/portal-settings/ai-settings/providers");

      const listResp = await listRespPromise.then((res) => res.json());
      const firstProviderData = listResp.response[0];

      const firstProviderTile = page.getByTestId("ai-provider-tile").first();
      await expect(firstProviderTile).toBeVisible();
      await expect(firstProviderTile).toContainText(firstProviderData.title);

      const contextMenuBtn = firstProviderTile.getByTestId(
        "context-menu-button",
      );
      await contextMenuBtn.click();

      const settingsItem = page.getByTestId("settings_item");
      await settingsItem.click();

      const updateProviderForm = page.getByTestId("update-provider-form");
      await expect(updateProviderForm).toBeVisible();

      const providerSaveButton = page.getByTestId("provider-save-button");
      await expect(providerSaveButton).toBeDisabled();

      const providerTypeCombobox = page.getByTestId("provider-type-combobox");
      await expect(providerTypeCombobox.getByRole("button")).toBeDisabled();

      const providerTitleInput = page.getByTestId("provider-title-input");
      await providerTitleInput.fill("updated provider");

      const providerUrlInput = page.getByTestId("provider-url-input");
      await expect(providerUrlInput).toBeDisabled();
      await expect(providerUrlInput).toHaveValue(firstProviderData.url);

      const providerKeyInput = page.getByTestId("provider-key-input");

      await expect(providerKeyInput).toHaveCount(0);

      const providerResetKeyLink = page.getByTestId("provider-reset-key-link");
      await expect(providerResetKeyLink).toBeVisible();
      await providerResetKeyLink.click();

      await expect(providerResetKeyLink).toHaveCount(0);
      await expect(providerKeyInput).toBeVisible();

      await providerKeyInput.getByTestId("text-input").fill("updatedkey");

      const updateReqPromise = page.waitForRequest(
        (r) =>
          r.url().endsWith(`${PATH_AI_PROVIDERS}/${firstProviderData.id}`) &&
          r.method() === "PUT",
      );
      const updateResPromise = page.waitForResponse(
        (r) =>
          r.url().endsWith(`${PATH_AI_PROVIDERS}/${firstProviderData.id}`) &&
          r.request().method() === "PUT",
      );

      await providerSaveButton.click();
      const updateReqPayload = await updateReqPromise.then((req) =>
        req.postDataJSON(),
      );

      expect(updateReqPayload).toEqual({
        title: "updated provider",
        key: "updatedkey",
      });

      const updateRes = await updateResPromise.then((res) => res.json());

      await expect(firstProviderTile).toBeVisible();
      await expect(firstProviderTile).toContainText(updateRes.response.title);
    });
  });

  test.describe("MCP servers", () => {
    test("should navigate to mcp servers page and render mcp servers lists", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiServersList,
        endpoints.aiProvidersEmptyList,
      ]);
      await page.goto("/portal-settings/ai-settings/servers");

      await expect(page.getByTestId("custom-mcp-list")).toBeVisible();
      await expect(page.getByTestId("system-mcp-list")).toBeVisible();
    });

    test("should render disabled elements on mcp servers page if there are no ai providers", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiServersList,
        endpoints.aiProvidersEmptyList,
      ]);
      await page.goto("/portal-settings/ai-settings/servers");

      const addMcpButton = page.getByTestId("add-mcp-button");
      await expect(addMcpButton).toBeDisabled();

      const mcpTiles = page.getByTestId("mcp-tile");

      for (const mcpTile of await mcpTiles.all()) {
        const toggle = mcpTile.getByTestId("toggle-button-input");
        await expect(toggle).toBeDisabled();

        const contextMenuBtn = mcpTile.getByTestId("mcp-context-menu-button");

        if (await contextMenuBtn.count()) {
          await expect(contextMenuBtn).toHaveAttribute("aria-disabled", "true");
        }
      }
    });

    test("should render enabled elements on mcp servers page if there are ai providers", async ({
      page,
      mockRequest,
    }) => {
      await mockRequest.router([
        endpoints.aiServersList,
        endpoints.aiProvidersList,
      ]);
      await page.goto("/portal-settings/ai-settings/servers");

      const addMcpButton = page.getByTestId("add-mcp-button");
      await expect(addMcpButton).toBeEnabled();

      const mcpTiles = page.getByTestId("mcp-tile");

      for (const mcpTile of await mcpTiles.all()) {
        const toggle = mcpTile.getByTestId("toggle-button-input");
        await expect(toggle).toBeEnabled();

        const contextMenuBtn = mcpTile.getByTestId("mcp-context-menu-button");

        if (await contextMenuBtn.count()) {
          await expect(contextMenuBtn).toHaveAttribute(
            "aria-disabled",
            "false",
          );
        }
      }
    });

    test("should add mcp server", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiServersList,
        endpoints.aiProvidersList,
        endpoints.createAiServer,
      ]);
      await page.goto("/portal-settings/ai-settings/servers");

      const addMcpButton = page.getByTestId("add-mcp-button");
      await addMcpButton.click();

      const customMcpTiles = page
        .getByTestId("custom-mcp-list")
        .getByTestId("mcp-tile");
      await expect(customMcpTiles).toHaveCount(1);

      const addMcpForm = page.getByTestId("add-mcp-form");
      await expect(addMcpForm).toBeVisible();

      const mcpSaveButton = page.getByTestId("mcp-save-button");
      await expect(mcpSaveButton).toBeDisabled();

      const mcpIconInput = addMcpForm.locator("#customFileInput");

      await mcpIconInput.setInputFiles({
        name: "icon.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64"/></svg>`,
        ),
      });

      const mcpTitleInput = addMcpForm.getByTestId("mcp-title-input");
      await mcpTitleInput.fill("new_server");

      const mcpUrlInput = addMcpForm.getByTestId("mcp-url-input");
      await mcpUrlInput.fill("https://newserver.com");

      const mcpDescriptionTextarea = addMcpForm.getByTestId(
        "mcp-description-textarea",
      );
      await mcpDescriptionTextarea.fill("new server description");

      const mcpHeadersBlockToggle = addMcpForm.getByTestId(
        "mcp-headers-block-toggle",
      );
      await mcpHeadersBlockToggle.click();

      const mcpHeaderNameInput = addMcpForm.getByTestId(
        "mcp-header-name-input",
      );
      await mcpHeaderNameInput.fill("headerKey");

      const mcpHeaderValueInput = addMcpForm.getByTestId(
        "mcp-header-value-input",
      );
      await mcpHeaderValueInput.fill("headerValue");

      const reqPromise = page.waitForRequest(
        (r) => r.url().endsWith(PATH_AI_SERVERS) && r.method() === "POST",
      );
      await mcpSaveButton.click();
      const req = await reqPromise;
      const payload = req.postDataJSON();

      expect(payload).toEqual({
        icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ii8+PC9zdmc+",
        endpoint: "https://newserver.com",
        name: "new_server",
        description: "new server description",
        headers: {
          headerKey: "headerValue",
        },
      });

      await expect(customMcpTiles).toHaveCount(2);
    });

    test("should delete mcp server", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiServersList,
        endpoints.aiProvidersList,
        endpoints.deleteAiServer,
      ]);

      const listRespPromise = page.waitForResponse(
        (r) =>
          r.url().includes(PATH_AI_SERVERS) && r.request().method() === "GET",
      );

      await page.goto("/portal-settings/ai-settings/servers");

      const listResp = await listRespPromise;
      const body = await listResp.json();
      const customMcpData = body.response.find(
        (s: TServer) => s.serverType === ServerType.Custom,
      );

      const customMcpTiles = page
        .getByTestId("custom-mcp-list")
        .getByTestId("mcp-tile");
      const firstCustomMcpTile = customMcpTiles.first();

      const contextMenuBtn = firstCustomMcpTile.getByTestId(
        "mcp-context-menu-button",
      );
      await contextMenuBtn.click();

      const deleteItem = page.getByTestId("delete_item");
      await deleteItem.click();

      const deleteMcpDialog = page.getByRole("dialog");
      await expect(deleteMcpDialog).toBeVisible();
      await expect(deleteMcpDialog).toContainText("Delete server");

      const deleteMcpButton = deleteMcpDialog.getByTestId("delete-mcp-button");

      const deleteReqPromise = page.waitForRequest(
        (r) => r.url().endsWith(PATH_AI_SERVERS) && r.method() === "DELETE",
      );

      await deleteMcpButton.click();

      const deleteReq = await deleteReqPromise;
      const payload = deleteReq.postDataJSON();

      expect(payload).toEqual({ servers: [customMcpData.id] });

      await expect(customMcpTiles).toHaveCount(0);
    });

    test("should update mcp server", async ({ page, mockRequest }) => {
      await mockRequest.router([
        endpoints.aiServersList,
        endpoints.aiProvidersList,
        endpoints.updateAiServer,
      ]);

      const listRespPromise = page.waitForResponse(
        (r) =>
          r.url().includes(PATH_AI_SERVERS) && r.request().method() === "GET",
      );

      await page.goto("/portal-settings/ai-settings/servers");

      const listResp = await listRespPromise;
      const body = await listResp.json();

      const customMcpData = body.response.find(
        (s: TServer) => s.serverType === ServerType.Custom,
      );

      const customMcpTiles = page
        .getByTestId("custom-mcp-list")
        .getByTestId("mcp-tile");
      const firstCustomMcpTile = customMcpTiles.first();

      const contextMenuBtn = firstCustomMcpTile.getByTestId(
        "mcp-context-menu-button",
      );
      await contextMenuBtn.click();

      const settingsItem = page.getByTestId("settings_item");
      await settingsItem.click();

      const updateMcpForm = page.getByTestId("edit-mcp-form");
      await expect(updateMcpForm).toBeVisible();

      const mcpSaveButton = page.getByTestId("mcp-save-button");
      await expect(mcpSaveButton).toBeDisabled();

      const mcpIconInput = updateMcpForm.locator("#customFileInput");

      await mcpIconInput.setInputFiles({
        name: "icon.svg",
        mimeType: "image/svg+xml",
        buffer: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect width="64" height="64"/></svg>`,
        ),
      });

      const mcpTitleInput = updateMcpForm.getByTestId("mcp-title-input");
      await mcpTitleInput.fill("updatedTitle");

      const mcpUrlInput = updateMcpForm.getByTestId("mcp-url-input");
      await mcpUrlInput.fill("https://updatedenpoint.com");

      const mcpDescriptionTextarea = updateMcpForm.getByTestId(
        "mcp-description-textarea",
      );
      await mcpDescriptionTextarea.fill("updatedDescription");

      const mcpHeaderNameInput = updateMcpForm.getByTestId(
        "mcp-header-name-input",
      );
      await mcpHeaderNameInput.fill("updatedHeaderKey");

      const mcpHeaderValueInput = updateMcpForm.getByTestId(
        "mcp-header-value-input",
      );
      await mcpHeaderValueInput.fill("updatedHeaderValue");

      const reqPromise = page.waitForRequest(
        (r) =>
          r.url().endsWith(`${PATH_AI_SERVERS}/${customMcpData.id}`) &&
          r.method() === "PUT",
      );

      await mcpSaveButton.click();

      const req = await reqPromise;
      const payload = req.postDataJSON();

      expect(payload).toEqual({
        icon: "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0Ii8+PC9zdmc+",
        endpoint: "https://updatedenpoint.com",
        name: "updatedTitle",
        description: "updatedDescription",
        headers: {
          updatedHeaderKey: "updatedHeaderValue",
        },
        updateIcon: true,
      });
    });
  });
});
