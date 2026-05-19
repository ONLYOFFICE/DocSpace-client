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
import { 
  aiProvidersHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
  aiVectorizationGetHandler,
  aiVectorizationPutHandler, 
 } from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "../fixtures/base";
import {PATH_AI_CONFIG_VECTORIZATION } from "@docspace/shared/__mocks__/handlers/ai/vectorization";


test.describe("Knowledge base", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true)
    );
  });

  test("should render knowledge settings page with disabled elements if there are no ai providers", async ({
    page,
    mockRequest,
    baseUrl
  }) => {
    mockRequest.use(
      aiProvidersHandler(TEST_PORT, false, true),
      aiVectorizationGetHandler(TEST_PORT, "disabled"),
    );
    await page.goto(`${baseUrl}/portal-settings/ai-settings/knowledge`);

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

    await saveButton.hover();

    await expectScreenshot(page,[
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-no-providers.png",
    ]);
  });

  test("should render knowledge settings page with enabled engine combobox if there are ai providers", async ({
    page,
    mockRequest,
    baseUrl
  }) => {
    mockRequest.use(
      aiProvidersHandler(TEST_PORT),
      aiVectorizationGetHandler(TEST_PORT, "disabled"),
    );
    await page.goto(`${baseUrl}/portal-settings/ai-settings/knowledge`);

    const knowledgeForm = page.getByTestId("knowledge-form");
    await expect(knowledgeForm).toBeVisible();

    const providerCombobox = page.getByTestId("knowledge-provider-combobox");
    await expect(providerCombobox.getByRole("button")).toBeEnabled();

    await expectScreenshot(page,[
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-has-providers.png",
    ]);
  });

  test("should set knowledge settings", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      aiProvidersHandler(TEST_PORT),
      aiVectorizationGetHandler(TEST_PORT, "disabled"),
      aiVectorizationPutHandler(TEST_PORT),
    );
    await page.goto(`${baseUrl}/portal-settings/ai-settings/knowledge`);

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

    await expectScreenshot(page,[
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-after-setup.png",
    ]);
  });

  test("should reset knowledge settings", async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      aiProvidersHandler(TEST_PORT),
      aiVectorizationGetHandler(TEST_PORT, "enabled"),
      aiVectorizationPutHandler(TEST_PORT),
    );
    await page.goto(`${baseUrl}/portal-settings/ai-settings/knowledge`);

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

    const resetDialog = page.getByRole("dialog").filter({ hasText: "Reset settings" });
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

    await expectScreenshot(page,[
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-after-reset.png",
    ]);
  });

  test("should render combobox with selected OpenAI provider and empty key input if knowledge needs reset", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      aiProvidersHandler(TEST_PORT),
      aiVectorizationGetHandler(TEST_PORT, "needReset"),
    );
    await page.goto(`${baseUrl}/portal-settings/ai-settings/knowledge`);

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

    await expectScreenshot(page,[
      "desktop",
      "knowledge-base-settings",
      "knowledge-base-need-reset.png",
    ]);
  });
});
