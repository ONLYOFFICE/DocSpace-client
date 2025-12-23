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

import { expect, test } from "../fixtures/base";
import { endpoints } from "@docspace/shared/__mocks__/e2e";
import { PATH_AI_SERVERS } from "@docspace/shared/__mocks__/e2e/handlers/ai";
import type { TServer } from "@docspace/shared/api/ai/types";
import { ServerType } from "@docspace/shared/api/ai/enums";

test.describe("MCP servers", () => {
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

  test("should navigate to mcp servers page and render mcp servers lists", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiServersList,
      endpoints.aiProvidersList,
    ]);
    await page.goto("/portal-settings/ai-settings/servers");

    await expect(page.getByTestId("custom-mcp-list")).toBeVisible();
    await expect(page.getByTestId("system-mcp-list")).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers.png",
    ]);
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

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-no-providers.png",
    ]);
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
        await expect(contextMenuBtn).toHaveAttribute("aria-disabled", "false");
      }
    }

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-has-providers.png",
    ]);
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

    const mcpHeaderNameInput = addMcpForm.getByTestId("mcp-header-name-input");
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

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-after-add.png",
    ]);
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

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-after-delete.png",
    ]);
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

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-after-update.png",
    ]);
  });

  test("should disable mcp server", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.aiServersList,
      endpoints.aiProvidersList,
      endpoints.updateAiServer,
      endpoints.disableAiServer,
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
    const toggleButton = firstCustomMcpTile.getByTestId("mcp-toggle-button");
    await toggleButton.click();

    const disableDialog = page.getByRole("dialog");
    await expect(disableDialog).toBeVisible();

    const dialogConfirmButton = disableDialog.getByTestId("disable-mcp-button");

    const reqPromise = page.waitForRequest(
      (r) =>
        r.url().endsWith(`${PATH_AI_SERVERS}/${customMcpData.id}/status`) &&
        r.method() === "PUT",
    );

    await dialogConfirmButton.click();

    const req = await reqPromise;
    const payload = req.postDataJSON();

    expect(payload).toEqual({
      enabled: false,
    });

    await expect(toggleButton).toHaveAttribute("aria-checked", "false");

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-after-disable-custom-server.png",
    ]);
  });

  test("should enable mcp server", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.aiServersListDisabled,
      endpoints.aiProvidersList,
      endpoints.updateAiServer,
      endpoints.enableAiServer,
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
    const toggleButton = firstCustomMcpTile.getByTestId("mcp-toggle-button");

    const reqPromise = page.waitForRequest(
      (r) =>
        r.url().endsWith(`${PATH_AI_SERVERS}/${customMcpData.id}/status`) &&
        r.method() === "PUT",
    );

    await toggleButton.click();

    const req = await reqPromise;
    const payload = req.postDataJSON();

    expect(payload).toEqual({
      enabled: true,
    });

    await expect(toggleButton).toHaveAttribute("aria-checked", "true");

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-after-enable-custom-server.png",
    ]);
  });

  test("should render alert icon and headers inputs in error state if mcp needs reset", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiServersListNeedReset,
      endpoints.aiProvidersList,
      endpoints.updateAiServer,
      endpoints.enableAiServer,
    ]);

    await page.goto("/portal-settings/ai-settings/servers");

    const customMcpTiles = page
      .getByTestId("custom-mcp-list")
      .getByTestId("mcp-tile");
    const firstCustomMcpTile = customMcpTiles.first();
    const errorIcon = firstCustomMcpTile.getByTestId("ai-tile-error-icon");
    await expect(errorIcon).toBeVisible();

    const toggle = firstCustomMcpTile.getByTestId("toggle-button-input");
    await expect(toggle).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-tile-need-reset.png",
    ]);

    const contextMenuBtn = firstCustomMcpTile.getByTestId(
      "mcp-context-menu-button",
    );
    await contextMenuBtn.click();

    const settingsItem = page.getByTestId("settings_item");
    await settingsItem.click();

    const updateMcpForm = page.getByTestId("edit-mcp-form");
    await expect(updateMcpForm).toBeVisible();

    const mcpHeaderNameInput = updateMcpForm.getByTestId(
      "mcp-header-name-input",
    );
    await expect(mcpHeaderNameInput).toBeVisible();
    await expect(mcpHeaderNameInput).toHaveAttribute("data-error", "true");

    const mcpHeaderValueInput = updateMcpForm.getByTestId(
      "mcp-header-value-input",
    );
    await expect(mcpHeaderValueInput).toBeVisible();
    await expect(mcpHeaderValueInput).toHaveAttribute("data-error", "true");

    await expect(page).toHaveScreenshot([
      "desktop",
      "mcp-servers-settings",
      "mcp-servers-update-dialog-need-reset.png",
    ]);
  });
});
