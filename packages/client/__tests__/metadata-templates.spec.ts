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

import type { Locator, Page } from "@playwright/test";
import {
  METADATA_OPTION,
  METADATA_TEMPLATES,
  metadataTemplatesHandlers,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

const TEMPLATES_URL = "/portal-settings/customization/metadata-templates";

const openTemplates = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${TEMPLATES_URL}`);
  await expect(page.getByTestId("metadata-templates")).toBeVisible();
  await expect(page.getByTestId("metadata_template_row_1")).toBeVisible();
};

const addField = async (
  page: Page,
  panel: Locator,
  name: string,
  type: number,
  options: string[] = [],
) => {
  await panel.getByTestId("metadata_add_field_button").click();
  await panel.getByTestId("metadata_field_name_input").fill(name);
  await panel.getByTestId("metadata_field_type_combobox").click();
  await page.getByTestId(`drop_down_item_${type}`).click();

  for (const [index, option] of options.entries()) {
    if (index > 0) await panel.getByTestId("metadata_add_option_button").click();
    await panel.getByPlaceholder("Option value").nth(index).fill(option);
  }
};

const toast = (page: Page, text: string) =>
  page.getByTestId("toast-content").filter({ hasText: text });

test.describe("Metadata templates settings", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      ...metadataTemplatesHandlers(TEST_PORT),
    );
  });

  test("creates a template with a text and a single select field", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    await openTemplates(page, baseUrl);

    await page.getByTestId("metadata_create_template_button").click();

    const panel = page.getByTestId("metadata_template_panel");
    const save = panel.getByTestId("metadata_template_save_button");

    await panel.getByTestId("metadata_template_name_input").fill("Project brief");
    await expect(save).toBeDisabled();

    await addField(page, panel, "Owner", 0);
    await panel.getByTestId("metadata_field_submit_button").click();

    await addField(page, panel, "Priority", 3, ["High", "Low"]);
    await panel.getByTestId("metadata_field_submit_button").click();

    await expect(panel.getByText("Priority", { exact: true })).toBeVisible();
    await expect(save).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-templates_create.png",
    ]);

    mockRequest.use(
      ...metadataTemplatesHandlers(TEST_PORT, [
        ...METADATA_TEMPLATES,
        { ...METADATA_TEMPLATES[1], id: 100, name: "Project brief" },
      ]),
    );

    const created = page.waitForRequest(
      (req) =>
        req.method() === "POST" &&
        req.url().endsWith("/files/metadata/templates"),
    );

    await save.click();

    expect((await created).postDataJSON()).toEqual({
      name: "Project brief",
      visible: true,
      fields: [
        { name: "Owner", type: 0, options: [], order: 0 },
        {
          name: "Priority",
          type: 3,
          options: [{ value: "High" }, { value: "Low" }],
          order: 1,
        },
      ],
    });
    await expect(toast(page, "Changes saved successfully")).toBeVisible();
    await expect(panel.getByTestId("metadata_template_save_button")).toBeHidden();
    await expect(page.getByTestId("metadata_template_row_100")).toBeVisible();
  });

  test("rejects a taken field name and a repeated option", async ({
    page,
    baseUrl,
  }) => {
    await openTemplates(page, baseUrl);

    await page.getByTestId("metadata_create_template_button").click();

    const panel = page.getByTestId("metadata_template_panel");
    const submit = panel.getByTestId("metadata_field_submit_button");

    await addField(page, panel, "Owner", 0);
    await submit.click();

    await addField(page, panel, "owner", 0);
    await expect(
      panel.getByText("A field with this name already exists"),
    ).toBeVisible();
    await expect(submit).toBeDisabled();

    await panel.getByTestId("metadata_field_name_input").fill("Priority");
    await panel.getByTestId("metadata_field_type_combobox").click();
    await page.getByTestId("drop_down_item_3").click();
    await panel.getByPlaceholder("Option value").nth(0).fill("High");
    await panel.getByTestId("metadata_add_option_button").click();
    await panel.getByPlaceholder("Option value").nth(1).fill("high");

    await expect(
      panel.getByText("An option with this value already exists"),
    ).toBeVisible();
    await expect(submit).toBeDisabled();
  });

  test("renames a template and deletes a field after confirmation", async ({
    page,
    baseUrl,
  }) => {
    await openTemplates(page, baseUrl);

    await page
      .getByTestId("metadata_template_row_1")
      .getByText("Contract", { exact: true })
      .click();

    const panel = page.getByTestId("metadata_template_panel");
    await panel.getByTestId("metadata_template_name_input").fill("Contract v2");

    await panel.getByTestId("context-menu-button").nth(1).click();
    await page.getByTestId("delete_item").filter({ visible: true }).click();
    await expect(panel.getByText("Amount", { exact: true })).toHaveCount(0);

    const renamed = page.waitForRequest(
      (req) =>
        req.method() === "PUT" &&
        req.url().endsWith("/files/metadata/templates/1"),
    );
    const fieldDeleted = page.waitForRequest(
      (req) =>
        req.method() === "DELETE" &&
        req.url().endsWith("/files/metadata/templates/1/fields/12"),
    );
    const fieldMoved = page.waitForRequest(
      (req) =>
        req.method() === "PUT" &&
        req.url().endsWith("/files/metadata/templates/1/fields/13"),
    );

    await panel.getByTestId("metadata_template_save_button").click();

    const dialog = page.getByTestId("confirm_delete_dialog");
    await expect(dialog).toContainText("Delete fields?");
    await dialog.getByTestId("confirm_delete_button").click();

    expect((await renamed).postDataJSON()).toEqual({
      name: "Contract v2",
      visible: true,
    });
    await fieldDeleted;
    expect((await fieldMoved).postDataJSON()).toEqual({
      name: "Status",
      type: 3,
      options: [
        { id: METADATA_OPTION.draft, value: "Draft" },
        { id: METADATA_OPTION.signed, value: "Signed" },
      ],
      order: 1,
    });
    await expect(toast(page, "Changes saved successfully")).toBeVisible();
  });

  test("shows a hidden template again", async ({ page, baseUrl }) => {
    await openTemplates(page, baseUrl);

    await expect(page.getByTestId("metadata_template_row_3")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata-templates_list.png",
    ]);

    const updated = page.waitForRequest(
      (req) =>
        req.method() === "PUT" &&
        req.url().endsWith("/files/metadata/templates/3"),
    );

    await page.getByTestId("metadata_template_visible_3").click();

    expect((await updated).postDataJSON()).toEqual({ visible: true });
  });

  test("deletes a template after confirmation", async ({ page, baseUrl }) => {
    await openTemplates(page, baseUrl);

    await page
      .getByTestId("metadata_template_row_2")
      .getByTestId("context-menu-button")
      .click();
    await page.getByTestId("metadata-template_delete").click();

    const dialog = page.getByTestId("confirm_delete_dialog");
    await expect(dialog).toContainText("Delete template?");

    const deleted = page.waitForRequest(
      (req) =>
        req.method() === "DELETE" &&
        req.url().endsWith("/files/metadata/templates/2"),
    );

    await dialog.getByTestId("confirm_delete_button").click();

    await deleted;
    await expect(page.getByTestId("metadata_template_row_2")).toHaveCount(0);
    await expect(toast(page, "Template deleted")).toBeVisible();
  });
});
