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
  EMPTY_ENTRY_METADATA,
  ENTRY_METADATA,
  METADATA_FIELD,
  METADATA_OPTION,
  entryMetadataHandler,
  entryMetadataSaveHandlers,
  entryTemplateHandlers,
  filesSettingsHandler,
  metadataCascadeHandlers,
  metadataTemplatesHandlers,
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
const ROWS = { file: "table-row-3", folder: "table-row-0" };

const withValues = (values: Record<number, unknown>) => ({
  ...ENTRY_METADATA,
  templates: ENTRY_METADATA.templates.map((template) => ({
    ...template,
    fields: template.fields.map((field) => ({
      ...field,
      value: values[field.id],
    })),
  })),
});

const openMetadataTab = async (
  page: Page,
  baseUrl: string,
  kind: keyof typeof ROWS = "file",
) => {
  await page.goto(`${baseUrl}${MY_DOCUMENTS_URL}`);

  const table = page.getByTestId("table-body");
  await expect(table).toBeVisible();

  await table
    .getByTestId(ROWS[kind])
    .getByTestId("context-menu-button")
    .first()
    .click();
  if (kind === "file") await page.getByTestId("option_info").hover();
  await page.getByTestId("option_show-info").click();
  await page.getByTestId("info_metadata_tab").click();

  const metadata = page.getByTestId("info_panel_metadata");
  await expect(metadata).toBeVisible();

  return metadata;
};

test.describe("Metadata info panel", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      entryMetadataHandler(TEST_PORT),
      ...entryTemplateHandlers(TEST_PORT),
      ...metadataTemplatesHandlers(TEST_PORT),
    );
  });

  test("adds a template with values from the empty state", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const filled = {
      ...withValues({
        [METADATA_FIELD.counterparty]: { stringValue: "Northwind Traders" },
        [METADATA_FIELD.amount]: { numberValue: 12500 },
        [METADATA_FIELD.status]: { optionIds: [METADATA_OPTION.signed] },
      }),
      customFields: [],
    };

    mockRequest.use(
      entryMetadataHandler(TEST_PORT, EMPTY_ENTRY_METADATA),
      ...entryMetadataSaveHandlers(TEST_PORT, filled),
    );

    const metadata = await openMetadataTab(page, baseUrl);

    await expect(metadata.getByTestId("info_panel_metadata_empty")).toContainText(
      "No metadata on this file yet",
    );

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_info-panel-empty.png",
    ]);

    await metadata.getByTestId("info_panel_metadata_add_link").click();
    await page.getByTestId("metadata-from-template").click();

    const panel = page.getByTestId("metadata_template_panel");
    await expect(panel.getByTestId("metadata_template_item_1")).toBeVisible();
    await expect(panel.getByTestId("metadata_template_item_2")).toBeVisible();
    await expect(panel.getByTestId("metadata_template_item_3")).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_template-picker.png",
    ]);

    await panel.getByTestId("metadata_template_item_1").click();
    await panel.getByTestId("metadata_template_next_button").click();

    const inputs = panel.getByTestId("metadata_value_input");
    await inputs.nth(0).fill("Northwind Traders");
    await inputs.nth(1).fill("12500");
    await panel.getByTestId("metadata_single_choice_input").click();
    await page.getByTestId(`drop_down_item_${METADATA_OPTION.signed}`).click();

    const templatesAssigned = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/file/10/templates"),
    );
    const valuesSaved = page.waitForRequest(
      (req) => req.method() === "PUT" && req.url().endsWith("/file/10/values"),
    );

    await panel.getByTestId("metadata_template_save_button").click();

    expect((await templatesAssigned).postDataJSON()).toEqual({
      templateIds: [1],
    });
    expect((await valuesSaved).postDataJSON()).toEqual({
      values: [
        {
          fieldId: METADATA_FIELD.counterparty,
          stringValue: "Northwind Traders",
        },
        { fieldId: METADATA_FIELD.amount, numberValue: 12500 },
        {
          fieldId: METADATA_FIELD.status,
          optionIds: [METADATA_OPTION.signed],
        },
      ],
    });

    await expect(panel.getByTestId("metadata_template_save_button")).toBeHidden();

    const card = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Contract" });
    await expect(card.getByText("Northwind Traders")).toBeVisible();
    await expect(card.getByText("12,500")).toBeVisible();
    await expect(card.getByText("Signed")).toBeVisible();
  });

  test("edits template values and rejects a fractional number", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...entryMetadataSaveHandlers(
        TEST_PORT,
        withValues({ [METADATA_FIELD.amount]: { numberValue: 1500 } }),
      ),
    );

    const metadata = await openMetadataTab(page, baseUrl);
    const card = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Contract" });

    await expect(metadata.getByText("Apollo", { exact: true })).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_info-panel.png",
    ]);

    await card.getByTestId("info_panel_metadata_card_menu").click();
    await page.getByTestId("metadata-card_edit_item").click();

    const panel = page.getByTestId("metadata_template_panel");
    const amount = panel.getByTestId("metadata_value_input").nth(1);
    const save = panel.getByTestId("metadata_template_save_button");

    await amount.fill("12.5");
    await expect(panel.getByText("Enter a whole number")).toBeVisible();
    await expect(save).toBeDisabled();

    await amount.fill("1500");
    await expect(save).toBeEnabled();

    const valuesSaved = page.waitForRequest(
      (req) => req.method() === "PUT" && req.url().endsWith("/file/10/values"),
    );

    await save.click();

    expect((await valuesSaved).postDataJSON()).toEqual({
      values: [{ fieldId: METADATA_FIELD.amount, numberValue: 1500 }],
    });
    await expect(panel.getByTestId("metadata_template_save_button")).toBeHidden();
    await expect(card.getByText("1,500")).toBeVisible();
  });

  test("removes a template after confirmation", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const metadata = await openMetadataTab(page, baseUrl);
    const card = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Contract" });

    await card.getByTestId("info_panel_metadata_card_menu").click();
    await page.getByTestId("metadata-card_delete_item").click();

    const dialog = page.getByTestId("confirm_delete_dialog");
    await expect(dialog).toContainText("Delete metadata?");

    mockRequest.use(
      entryMetadataHandler(TEST_PORT, {
        templates: [],
        customFields: ENTRY_METADATA.customFields,
      }),
    );

    const templateRemoved = page.waitForRequest(
      (req) =>
        req.method() === "DELETE" && req.url().endsWith("/file/10/templates/1"),
    );

    await dialog.getByTestId("confirm_delete_button").click();

    await templateRemoved;
    await expect(dialog.getByTestId("confirm_delete_button")).toBeHidden();
    await expect(card).toHaveCount(0);
    await expect(metadata.getByText("Apollo", { exact: true })).toBeVisible();
  });

  test("adds a custom field and rejects a taken name", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...entryMetadataSaveHandlers(TEST_PORT));

    const metadata = await openMetadataTab(page, baseUrl);

    await metadata.getByTestId("info_panel_metadata_add_button").click();
    await page.getByTestId("metadata-custom").click();

    const panel = page.getByTestId("metadata_custom_fields_panel");
    const name = panel.getByTestId("metadata_custom_field_form_name_input");
    const value = panel.getByTestId("metadata_custom_field_form_value_input");
    const submit = panel.getByTestId("metadata_custom_field_submit_button");

    await name.fill("project");
    await value.fill("Gemini");
    await expect(
      panel.getByText("A field with this name already exists"),
    ).toBeVisible();
    await expect(submit).toBeDisabled();

    await name.fill("Region");
    await value.fill("EMEA");
    await submit.click();

    await expect(panel.getByTestId("metadata_custom_field_name_input")).toHaveCount(
      2,
    );

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_custom-fields-panel.png",
    ]);

    mockRequest.use(
      entryMetadataHandler(TEST_PORT, {
        ...ENTRY_METADATA,
        customFields: [
          ...ENTRY_METADATA.customFields,
          { name: "Region", value: "EMEA" },
        ],
      }),
    );

    const fieldsSaved = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/file/10/customFields"),
    );

    await panel.getByTestId("metadata_custom_fields_save_button").click();

    expect((await fieldsSaved).postDataJSON()).toEqual({
      fields: [{ name: "Region", value: "EMEA" }],
    });
    await expect(panel.getByTestId("metadata_custom_fields_save_button")).toBeHidden();
    await expect(metadata.getByText("EMEA", { exact: true })).toBeVisible();
  });

  test("renames a custom field", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(...entryMetadataSaveHandlers(TEST_PORT));

    const metadata = await openMetadataTab(page, baseUrl);
    const card = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Apollo" });

    await card.getByTestId("info_panel_metadata_card_menu").click();
    await page.getByTestId("metadata-card_edit_item").click();

    const panel = page.getByTestId("metadata_custom_fields_panel");
    await panel.getByTestId("metadata_custom_field_name_input").fill("Codename");

    const fieldsSaved = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/file/10/customFields"),
    );

    await panel.getByTestId("metadata_custom_fields_save_button").click();

    expect((await fieldsSaved).postDataJSON()).toEqual({
      fields: [
        { name: "Project", value: null },
        { name: "Codename", value: "Apollo" },
      ],
    });
    await expect(panel.getByTestId("metadata_custom_fields_save_button")).toBeHidden();
  });
});

const folderMetadata = (cascade: boolean) => ({
  templates: ENTRY_METADATA.templates.map((template) => ({
    ...template,
    cascade,
  })),
  customFields: [],
});

const OPERATION = { id: "op-1", templateIds: [1] };

test.describe("Metadata cascade on a folder", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      entryMetadataHandler(TEST_PORT, folderMetadata(false)),
      ...metadataCascadeHandlers(TEST_PORT),
    );
  });

  test("applies a template to all items with the chosen conflict action", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const metadata = await openMetadataTab(page, baseUrl, "folder");
    const cascade = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Contract" })
      .getByTestId("info_panel_metadata_cascade");
    const toggle = cascade.getByTestId("info_panel_metadata_cascade_toggle");
    const dialog = page.getByTestId("metadata_apply_dialog");

    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await expect(dialog.getByTestId("metadata_apply_button")).toBeVisible();
    await dialog.getByTestId("metadata_apply_cancel_button").click();
    await expect(dialog.getByTestId("metadata_apply_button")).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-checked", "false");

    await toggle.click();
    await expect(
      dialog.getByTestId("metadata_apply_conflict_0").locator("input"),
    ).toBeChecked();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_apply-dialog.png",
    ]);

    await dialog.getByTestId("metadata_apply_conflict_1").click();

    mockRequest.use(
      entryMetadataHandler(TEST_PORT, folderMetadata(true)),
      ...metadataCascadeHandlers(TEST_PORT, {
        launched: { ...OPERATION, progress: 0, isCompleted: false },
        progress: { ...OPERATION, progress: 100, isCompleted: true },
      }),
    );

    const launched = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/folder/35/templates/1"),
    );

    await dialog.getByTestId("metadata_apply_button").click();

    expect((await launched).postDataJSON()).toEqual({
      cascade: true,
      conflictResolveType: 1,
    });
    await expect(dialog.getByTestId("metadata_apply_button")).toBeHidden();
    await expect(toggle).toHaveAttribute("aria-checked", "true");
    await expect(
      page
        .getByTestId("toast-content")
        .filter({
          hasText: "Contract metadata has been applied to all items in New folder",
        }),
    ).toBeVisible();
  });

  test("shows the progress of a running cascade", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      entryMetadataHandler(TEST_PORT, folderMetadata(true)),
      ...metadataCascadeHandlers(TEST_PORT, {
        progress: { ...OPERATION, progress: 40, isCompleted: false },
      }),
    );

    const metadata = await openMetadataTab(page, baseUrl, "folder");
    const card = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Contract" });
    const progressbar = card.getByRole("progressbar");

    await expect(card.getByText("Applying metadata...")).toBeVisible();
    await expect(progressbar).toHaveAttribute("aria-valuenow", "40");

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_cascade-progress.png",
    ]);

    mockRequest.use(
      ...metadataCascadeHandlers(TEST_PORT, {
        progress: { ...OPERATION, progress: 100, isCompleted: true },
      }),
    );

    await expect(progressbar).toBeHidden();
  });

  test("turns the cascade off without asking", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(entryMetadataHandler(TEST_PORT, folderMetadata(true)));

    const metadata = await openMetadataTab(page, baseUrl, "folder");
    const toggle = metadata
      .getByTestId("info_panel_metadata_card")
      .filter({ hasText: "Contract" })
      .getByTestId("info_panel_metadata_cascade_toggle");

    await expect(toggle).toHaveAttribute("aria-checked", "true");

    mockRequest.use(entryMetadataHandler(TEST_PORT, folderMetadata(false)));

    const disabled = page.waitForRequest(
      (req) =>
        req.method() === "PUT" && req.url().endsWith("/folder/35/templates/1"),
    );

    await toggle.click();

    expect((await disabled).postDataJSON()).toEqual({ cascade: false });
    await expect(toggle).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("metadata_apply_dialog")).toHaveCount(0);
  });
});
