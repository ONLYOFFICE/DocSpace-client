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
  AI_CHAT_ASSIGNED,
  aiChatAssignmentsHandler,
  aiChatProfilesListHandler,
  aiConfigHandler,
  aiMetaFillHandler,
  aiMetaGenerateHandler,
  entryMetadataHandler,
  entryMetadataSaveHandlers,
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

const MY_DOCUMENTS_URL = "/rooms/personal/filter?folder=12764";
const DOCX_ROW = "table-row-3";

const openDocxContextMenu = async (page: Page, baseUrl: string) => {
  const aiConfigLoaded = page.waitForResponse((res) =>
    new URL(res.url()).pathname.endsWith("/ai/config"),
  );

  await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);

  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();
  await aiConfigLoaded;

  await table
    .getByTestId(DOCX_ROW)
    .getByTestId("context-menu-button")
    .first()
    .click();
};

const openAIPanel = async (
  page: Page,
  baseUrl: string,
  mode: "fill" | "suggest",
) => {
  await openDocxContextMenu(page, baseUrl);
  await page.getByTestId(`option_${mode}-metadata-ai`).click();

  const panel = page.getByTestId("metadata_ai_panel");
  await expect(panel.getByTestId("metadata_ai_callout")).toBeVisible();

  return panel;
};

test.describe("Metadata AI", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      entryMetadataHandler(TEST_PORT),
      ...entryMetadataSaveHandlers(TEST_PORT),
      aiChatProfilesListHandler(TEST_PORT),
      aiChatAssignmentsHandler(TEST_PORT, {
        assignments: { Default: AI_CHAT_ASSIGNED.id },
      }),
      aiMetaFillHandler(TEST_PORT),
      aiMetaGenerateHandler(TEST_PORT),
    );
  });

  test("hides the AI actions while no AI model is ready", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiConfigHandler(TEST_PORT, true));

    await openDocxContextMenu(page, baseUrl);

    await expect(page.getByTestId("option_share")).toBeVisible();
    await expect(page.getByTestId("option_fill-metadata-ai")).toHaveCount(0);
    await expect(page.getByTestId("option_suggest-metadata-ai")).toHaveCount(0);
  });

  test("fills the template fields and custom fields", async ({
    page,
    baseUrl,
  }) => {
    const panel = await openAIPanel(page, baseUrl, "fill");

    await expect(panel.getByTestId("metadata_ai_model")).toHaveText(
      `Model: ${AI_CHAT_ASSIGNED.name}`,
    );
    await expect(panel.getByTestId("metadata_ai_save_button")).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-ai_fill.png",
    ]);

    await panel.getByTestId("metadata_ai_run_button").click();

    await expect(panel.getByTestId("metadata_ai_review_notes")).toBeVisible();
    await expect(panel.getByTestId("metadata_ai_save_button")).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-ai_fill-review.png",
    ]);

    const valuesSaved = page.waitForRequest(
      (req) => req.method() === "PUT" && req.url().endsWith("/file/10/values"),
    );
    const customFieldsSaved = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/file/10/customFields"),
    );

    await panel.getByTestId("metadata_ai_save_button").click();

    expect((await valuesSaved).postDataJSON().values).toHaveLength(3);
    expect((await customFieldsSaved).postDataJSON()).toEqual({
      fields: [{ name: "Project", value: "Apollo Phase 2" }],
    });
    await expect(panel.getByTestId("metadata_ai_save_button")).toBeHidden();
  });

  test("suggests custom fields", async ({ page, baseUrl }) => {
    const panel = await openAIPanel(page, baseUrl, "suggest");

    await panel.getByTestId("metadata_ai_run_button").click();

    await expect(panel.getByTestId("metadata_ai_review_notes")).toBeVisible();
    await expect(panel.getByTestId("metadata_ai_custom_fields")).toBeVisible();
    await expect(panel.getByTestId("metadata_ai_save_button")).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-ai_suggest-review.png",
    ]);
  });

  test("explains that no model is selected", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiChatAssignmentsHandler(TEST_PORT));

    const panel = await openAIPanel(page, baseUrl, "fill");

    await expect(
      panel.getByText(
        "No AI model is selected for metadata. Ask the administrator to choose one in the AI settings.",
      ),
    ).toBeVisible();
    await expect(panel.getByTestId("metadata_ai_run_button")).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-ai_no-model.png",
    ]);
  });

  test("reports an unexpected server error", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(aiMetaFillHandler(TEST_PORT, { status: 500 }));

    const panel = await openAIPanel(page, baseUrl, "fill");

    await panel.getByTestId("metadata_ai_run_button").click();

    await expect(panel.getByText("Something went wrong.")).toBeVisible();
    await expect(panel.getByTestId("metadata_ai_review_notes")).toHaveCount(0);
  });
});
