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
import { PATH_AI_CONFIG_VECTORIZATION } from "@docspace/shared/__mocks__/e2e/handlers/ai";

test.describe("Knowledge base", () => {
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

  test("should render knowledge settings page with disabled elements if there are no ai providers", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiProvidersEmptyList,
      endpoints.aiVectorizationSettingsDisabled,
    ]);
    await page.goto("/portal-settings/ai-settings/knowledge");

    const knowledgeForm = page.getByTestId("knowledge-form");
    await expect(knowledgeForm).toBeVisible();

    const knowledgeProviderCombobox = page.getByTestId(
      "knowledge-provider-combobox",
    );
    await expect(knowledgeProviderCombobox.getByRole("button")).toBeDisabled();

    const keyInput = page.getByTestId("knowledge-key-input");
    await expect(keyInput.getByTestId("text-input")).toBeDisabled();

    const saveButton = page.getByTestId("knowledge-save-button");
    await expect(saveButton).toBeDisabled();

    const resetButton = page.getByTestId("knowledge-reset-button");
    await expect(resetButton).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-no-providers.png",
    ]);
  });

  test("should render knowledge settings page with enabled engine combobox if there are ai providers", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiVectorizationSettingsDisabled,
    ]);
    await page.goto("/portal-settings/ai-settings/knowledge");

    const knowledgeForm = page.getByTestId("knowledge-form");
    await expect(knowledgeForm).toBeVisible();

    const providerCombobox = page.getByTestId("knowledge-provider-combobox");
    await expect(providerCombobox.getByRole("button")).toBeEnabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-has-providers.png",
    ]);
  });

  test("should set knowledge settings", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiVectorizationSettingsDisabled,
      endpoints.setVectorizationSettings,
    ]);
    await page.goto("/portal-settings/ai-settings/knowledge");

    const knowledgeForm = page.getByTestId("knowledge-form");
    await expect(knowledgeForm).toBeVisible();

    const keyInput = page
      .getByTestId("knowledge-key-input")
      .getByTestId("text-input");
    await expect(keyInput).toBeDisabled();

    const saveButton = page.getByTestId("knowledge-save-button");
    await expect(saveButton).toBeDisabled();

    const resetButton = page.getByTestId("knowledge-reset-button");
    await expect(resetButton).toBeDisabled();

    const providerCombobox = page.getByTestId("knowledge-provider-combobox");
    await providerCombobox.click();

    const providerDropdown = page.getByTestId("knowledge-provider-dropdown");
    await expect(providerDropdown).toBeVisible();

    const exaOption = page.getByTestId("drop_down_item_1");
    await exaOption.click();

    await expect(keyInput).toBeEnabled();

    await keyInput.fill("123");

    await expect(saveButton).toBeEnabled();

    const reqPromise = page.waitForRequest(
      (r) =>
        r.url().endsWith(PATH_AI_CONFIG_VECTORIZATION) && r.method() === "PUT",
    );

    await saveButton.click();

    const req = await reqPromise;
    const payload = req.postDataJSON();

    expect(payload).toEqual({
      type: 1,
      key: "123",
    });

    const keyHiddenBanner = page.getByTestId("knowledge-key-hidden-banner");
    await expect(keyHiddenBanner).toBeVisible();

    await expect(saveButton).toBeDisabled();

    await expect(providerCombobox.getByRole("button")).toBeDisabled();

    await expect(keyInput).toHaveCount(0);

    await expect(resetButton).toBeEnabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-after-setup.png",
    ]);
  });

  test("should reset knowledge settings", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiVectorizationSettingsEnabled,
      endpoints.setVectorizationSettings,
    ]);
    await page.goto("/portal-settings/ai-settings/knowledge");

    const knowledgeForm = page.getByTestId("knowledge-form");
    await expect(knowledgeForm).toBeVisible();

    const keyHiddenBanner = page.getByTestId("knowledge-key-hidden-banner");
    await expect(keyHiddenBanner).toBeVisible();

    const keyInput = page
      .getByTestId("knowledge-key-input")
      .getByTestId("text-input");
    await expect(keyInput).toHaveCount(0);

    const providerCombobox = page.getByTestId("knowledge-provider-combobox");
    await expect(providerCombobox.getByRole("button")).toBeDisabled();

    const resetButton = page.getByTestId("knowledge-reset-button");
    await expect(resetButton).toBeEnabled();

    await resetButton.click();

    const resetDialog = page.getByRole("dialog");
    await expect(resetDialog).toBeVisible();

    const reqPromise = page.waitForRequest(
      (r) =>
        r.url().endsWith(PATH_AI_CONFIG_VECTORIZATION) && r.method() === "PUT",
    );

    const resetDialogConfirmButton = resetDialog.getByTestId("reset-button");
    await resetDialogConfirmButton.click();

    const req = await reqPromise;
    const payload = req.postDataJSON();

    expect(payload).toEqual({
      type: 0,
      key: "",
    });

    await expect(keyHiddenBanner).toHaveCount(0);

    await expect(keyInput).toBeVisible();

    await expect(providerCombobox.getByRole("button")).toBeEnabled();

    await expect(resetButton).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-after-reset.png",
    ]);
  });

  test("should render combobox with selected OpenAI provider and empty key input if knowledge needs reset", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiVectorizationSettingsNeedReset,
    ]);
    await page.goto("/portal-settings/ai-settings/knowledge");

    const providerCombobox = page.getByTestId("knowledge-provider-combobox");
    await expect(providerCombobox.getByRole("button")).toBeEnabled();
    await expect(providerCombobox.getByRole("button")).toContainText("OpenAI");

    const keyInput = page
      .getByTestId("knowledge-key-input")
      .getByTestId("text-input");
    await expect(keyInput).toBeEnabled();

    const resetButton = page.getByTestId("knowledge-reset-button");
    await expect(resetButton).toBeDisabled();

    const saveButton = page.getByTestId("knowledge-save-button");
    await expect(saveButton).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-need-reset.png",
    ]);
  });
});
