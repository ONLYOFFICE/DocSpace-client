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
import { PATH_AI_CONFIG_WEB_SEARCH } from "@docspace/shared/__mocks__/e2e/handlers/ai";

test.describe("Web Search", () => {
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

  test("should render web search with disabled elements if there are no ai providers", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiProvidersEmptyList,
      endpoints.aiWebSearchDisabled,
    ]);
    await page.goto("/portal-settings/ai-settings/search");

    const engineCombobox = page.getByTestId("web-search-engine-combobox");
    await expect(engineCombobox.getByRole("button")).toBeDisabled();

    const keyInput = page.getByTestId("web-search-key-input");
    await expect(keyInput.getByTestId("text-input")).toBeDisabled();

    const saveButton = page.getByTestId("web-search-save-button");
    await expect(saveButton).toBeDisabled();

    const resetButton = page.getByTestId("web-search-reset-button");
    await expect(resetButton).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "web-search-settings",
      "web-search-no-providers.png",
    ]);
  });

  test("should render web search with enabled engine combobox if there are ai providers", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiWebSearchDisabled,
    ]);
    await page.goto("/portal-settings/ai-settings/search");

    const engineCombobox = page.getByTestId("web-search-engine-combobox");
    await expect(engineCombobox.getByRole("button")).toBeEnabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "web-search-settings",
      "web-search-has-providers.png",
    ]);
  });

  test("should set web search settings", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiWebSearchDisabled,
      endpoints.setWebSearchSettings,
    ]);
    await page.goto("/portal-settings/ai-settings/search");

    const keyInput = page
      .getByTestId("web-search-key-input")
      .getByTestId("text-input");
    await expect(keyInput).toBeDisabled();

    const saveButton = page.getByTestId("web-search-save-button");
    await expect(saveButton).toBeDisabled();

    const resetButton = page.getByTestId("web-search-reset-button");
    await expect(resetButton).toBeDisabled();

    const engineCombobox = page.getByTestId("web-search-engine-combobox");
    await engineCombobox.click();

    const engineDropdown = page.getByTestId("web-search-engine-dropdown");
    await expect(engineDropdown).toBeVisible();

    const exaOption = page.getByTestId("drop_down_item_1");
    await exaOption.click();

    await expect(keyInput).toBeEnabled();

    await keyInput.fill("123");

    await expect(saveButton).toBeEnabled();

    const reqPromise = page.waitForRequest(
      (r) =>
        r.url().endsWith(PATH_AI_CONFIG_WEB_SEARCH) && r.method() === "PUT",
    );

    await saveButton.click();

    const req = await reqPromise;
    const payload = req.postDataJSON();

    expect(payload).toEqual({
      enabled: true,
      type: 1,
      key: "123",
    });

    const keyHiddenBanner = page.getByTestId("web-search-key-hidden-banner");
    await expect(keyHiddenBanner).toBeVisible();

    await expect(saveButton).toBeDisabled();

    await expect(engineCombobox.getByRole("button")).toBeDisabled();

    await expect(keyInput).toHaveCount(0);

    await expect(resetButton).toBeEnabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "web-search-settings",
      "web-search-after-setup.png",
    ]);
  });

  test("should reset web search settings", async ({ page, mockRequest }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiWebSearchEnabled,
      endpoints.setWebSearchSettings,
    ]);
    await page.goto("/portal-settings/ai-settings/search");

    const keyHiddenBanner = page.getByTestId("web-search-key-hidden-banner");
    await expect(keyHiddenBanner).toBeVisible();

    const keyInput = page
      .getByTestId("web-search-key-input")
      .getByTestId("text-input");
    await expect(keyInput).toHaveCount(0);

    const engineCombobox = page.getByTestId("web-search-engine-combobox");
    await expect(engineCombobox.getByRole("button")).toBeDisabled();

    const resetButton = page.getByTestId("web-search-reset-button");
    await expect(resetButton).toBeEnabled();

    await resetButton.click();

    const resetDialog = page.getByRole("dialog");
    await expect(resetDialog).toBeVisible();

    const reqPromise = page.waitForRequest(
      (r) =>
        r.url().endsWith(PATH_AI_CONFIG_WEB_SEARCH) && r.method() === "PUT",
    );

    const resetDialogConfirmButton = resetDialog.getByTestId("reset-button");
    await resetDialogConfirmButton.click();

    const req = await reqPromise;
    const payload = req.postDataJSON();

    expect(payload).toEqual({
      enabled: false,
      type: 0,
      key: "",
    });

    await expect(keyHiddenBanner).toHaveCount(0);

    await expect(keyInput).toBeVisible();

    await expect(engineCombobox.getByRole("button")).toBeEnabled();

    await expect(resetButton).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "web-search-settings",
      "web-search-after-reset.png",
    ]);
  });

  test("should render combobox with selected exa and empty key input if web search needs reset", async ({
    page,
    mockRequest,
  }) => {
    await mockRequest.router([
      endpoints.aiProvidersList,
      endpoints.aiWebSearchNeedReset,
    ]);
    await page.goto("/portal-settings/ai-settings/search");

    const engineCombobox = page.getByTestId("web-search-engine-combobox");
    await expect(engineCombobox.getByRole("button")).toBeEnabled();
    await expect(engineCombobox.getByRole("button")).toContainText("Exa");

    const keyInput = page
      .getByTestId("web-search-key-input")
      .getByTestId("text-input");
    await expect(keyInput).toBeEnabled();

    const resetButton = page.getByTestId("web-search-reset-button");
    await expect(resetButton).toBeDisabled();

    const saveButton = page.getByTestId("web-search-save-button");
    await expect(saveButton).toBeDisabled();

    await expect(page).toHaveScreenshot([
      "desktop",
      "web-search-settings",
      "web-search-need-reset.png",
    ]);
  });
});
