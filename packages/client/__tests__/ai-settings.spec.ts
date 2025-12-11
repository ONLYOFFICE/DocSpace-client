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
import { PATH_AI_PROVIDERS } from "@docspace/shared/__mocks__/e2e/handlers/ai";
import { ProviderType } from "@docspace/shared/api/ai/enums";

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
});
