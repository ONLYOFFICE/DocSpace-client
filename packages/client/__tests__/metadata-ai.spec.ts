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
  EMPTY_ENTRY_METADATA,
  META_SERVICE_LIMIT_ERROR,
  entryMetadataHandler,
  entryMetadataSaveHandlers,
  filesSettingsHandler,
  myDocumentsHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  selfByTypeHandler,
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
  await page.getByTestId("option_ai-tools").hover();
  await page.getByTestId(`option_${mode}-metadata-ai`).click();

  const panel = page.getByTestId("metadata_ai_panel");
  await expect(panel.getByTestId("metadata_ai_callout")).toBeVisible();

  return panel;
};

const openMetadataTab = async (page: Page, baseUrl: string) => {
  await openDocxContextMenu(page, baseUrl);
  await page.getByTestId("option_info").hover();
  await page.getByTestId("option_show-info").click();
  await page.getByTestId("info_metadata_tab").click();

  const metadata = page.getByTestId("info_panel_metadata");
  await expect(metadata).toBeVisible();

  return metadata;
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
    await expect(page.getByTestId("option_ai-tools")).toHaveCount(0);
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
    await expect(panel.getByTestId("metadata_ai_saved_metadata")).toBeVisible();
    await expect(panel.getByTestId("metadata_value_input")).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-ai_fill.png",
    ]);

    await panel.getByTestId("metadata_ai_run_button").click();

    await expect(panel.getByTestId("metadata_ai_review_notes")).toBeVisible();
    await expect(panel.getByTestId("metadata_ai_saved_metadata")).toHaveCount(0);
    await expect(panel.getByTestId("metadata_ai_filled_mark")).toHaveCount(4);
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

  test("undoes the AI changes field by field and with the keyboard", async ({
    page,
    baseUrl,
  }) => {
    const panel = await openAIPanel(page, baseUrl, "fill");
    const marks = panel.getByTestId("metadata_ai_filled_mark");
    const undoButtons = panel.getByTestId("metadata_ai_undo_button");

    await panel.getByTestId("metadata_ai_run_button").click();

    await expect(marks).toHaveCount(4);
    await expect(panel.getByTestId("metadata_ai_previous_value")).toHaveText(
      "Previously: Apollo",
    );

    await undoButtons.first().click();
    await expect(marks).toHaveCount(3);

    await page.keyboard.press("Control+z");
    await expect(marks).toHaveCount(4);

    await page.keyboard.press("Control+Shift+z");
    await expect(marks).toHaveCount(3);

    for (const left of [2, 1, 0]) {
      await undoButtons.first().click();
      await expect(marks).toHaveCount(left);
    }

    await expect(panel.getByTestId("metadata_ai_review_notes")).toContainText(
      "All AI changes are undone.",
    );
    await expect(panel.getByTestId("metadata_ai_save_button")).toBeDisabled();
  });

  test("suggests custom fields", async ({ page, baseUrl }) => {
    const panel = await openAIPanel(page, baseUrl, "suggest");

    await expect(panel.getByTestId("metadata_ai_model")).toHaveText(
      `Model: ${AI_CHAT_ASSIGNED.name}`,
    );
    await expect(panel.getByTestId("metadata_ai_prompt_link")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-ai_suggest.png",
    ]);

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

  test("opens the AI actions from the Metadata tab header", async ({
    page,
    baseUrl,
  }) => {
    const metadata = await openMetadataTab(page, baseUrl);

    await metadata.getByTestId("info_panel_metadata_ai_button").click();
    await expect(page.getByTestId("metadata-ai-fill")).toBeVisible();
    await page.getByTestId("metadata-ai-generate").click();

    await expect(
      page
        .getByTestId("metadata_ai_panel")
        .getByTestId("metadata_ai_run_button"),
    ).toHaveText("Generate metadata");
  });

  test("offers generation in the empty Metadata tab", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(entryMetadataHandler(TEST_PORT, EMPTY_ENTRY_METADATA));

    const metadata = await openMetadataTab(page, baseUrl);

    await metadata.getByTestId("info_panel_metadata_add_link").click();
    await page.getByTestId("metadata-generate").click();

    await expect(
      page
        .getByTestId("metadata_ai_panel")
        .getByTestId("metadata_ai_run_button"),
    ).toHaveText("Generate metadata");
  });

  test.describe("no model selected", () => {
    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(aiChatAssignmentsHandler(TEST_PORT));
    });

    test("leads the admin to the model assignment", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "owner"));

      const panel = await openAIPanel(page, baseUrl, "fill");
      const notice = panel.getByTestId("metadata_ai_no_model_notice");

      await expect(notice).toContainText("No AI model selected");
      await expect(notice).toContainText(
        "Choose a model for metadata in the AI settings.",
      );
      await expect(panel.getByTestId("metadata_ai_run_button")).toBeDisabled();

      await expectScreenshot(page, [
        "desktop",
        "metadata",
        "metadata-ai_no-model.png",
      ]);

      await panel.getByTestId("metadata_ai_choose_model_button").click();

      await expect(page).toHaveURL(
        /\/portal-settings\/ai-settings\/model-assignment$/,
      );
      await expect(page.getByTestId("metadata_ai_panel")).toHaveCount(0);
    });

    test("sends a regular user to the Full admin", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

      const panel = await openAIPanel(page, baseUrl, "fill");
      const notice = panel.getByTestId("metadata_ai_no_model_notice");

      await expect(notice).toContainText(
        "Contact the Full admin to choose a model for metadata.",
      );
      await expect(
        panel.getByTestId("metadata_ai_choose_model_button"),
      ).toHaveCount(0);
    });
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

  test.describe("spending limit reached", () => {
    // The reset time is rendered in the portal's timezone, which the mocked
    // settings leave unset, so the browser's own zone decides it.
    test.use({ timezoneId: "UTC" });

    /** The mocked reset instant the standard way, for an en-US account in UTC. */
    const RESET_AT_SHOWN = "10/23/2026 11:59 PM";

    test.beforeEach(({ mockRequest }) => {
      mockRequest.use(
        // Spending limits exist on SaaS only; a standalone portal has no
        // Limits tab to lead to.
        settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
        selfByTypeHandler(TEST_PORT, "owner", "en-US"),
        aiMetaFillHandler(TEST_PORT, {
          status: 502,
          error: META_SERVICE_LIMIT_ERROR,
        }),
        aiMetaGenerateHandler(TEST_PORT, {
          status: 502,
          error: META_SERVICE_LIMIT_ERROR,
        }),
      );
    });

    const runIntoLimit = async (
      page: Page,
      baseUrl: string,
      mode: "fill" | "suggest",
    ) => {
      const panel = await openAIPanel(page, baseUrl, mode);

      await panel.getByTestId("metadata_ai_run_button").click();

      const notice = panel.getByTestId("metadata_ai_limit_notice");
      await expect(notice).toContainText("AI spending limit reached");
      await expect(notice).toContainText(
        `AI requests are paused until ${RESET_AT_SHOWN}. Raise the limit in the AI settings to continue now.`,
      );
      // The limit can be raised in another tab, so a second run stays possible.
      await expect(panel.getByTestId("metadata_ai_run_button")).toBeEnabled();

      return panel;
    };

    test("suggest shows when it resets", async ({ page, baseUrl }) => {
      await runIntoLimit(page, baseUrl, "suggest");

      await expectScreenshot(page, [
        "desktop",
        "metadata",
        "metadata-ai_suggest-limit.png",
      ]);
    });

    test("fill shows when it resets and leads to the limits", async ({
      page,
      baseUrl,
    }) => {
      const panel = await runIntoLimit(page, baseUrl, "fill");

      await expectScreenshot(page, [
        "desktop",
        "metadata",
        "metadata-ai_fill-limit.png",
      ]);

      await panel.getByTestId("metadata_ai_change_limit_button").click();

      await expect(page).toHaveURL(/\/portal-settings\/ai-settings\/limits$/);
      await expect(page.getByTestId("metadata_ai_panel")).toHaveCount(0);
    });
  });
});
