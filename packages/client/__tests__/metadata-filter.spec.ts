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

import type { Page, Request } from "@playwright/test";
import {
  METADATA_FIELD,
  METADATA_OPTION,
  filesSettingsHandler,
  metadataTemplatesHandlers,
  myDocumentsHandler,
  myDocumentsMetadataFilterHandler,
  myHandler,
  rootHandler,
  selfActivationStatusHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

const COUNTERPARTY_CONTAINS = {
  fieldId: METADATA_FIELD.counterparty,
  op: "contains",
  value: "Northwind",
};

const STATUS_SIGNED = {
  fieldId: METADATA_FIELD.status,
  op: "in",
  optionIds: [METADATA_OPTION.signed],
};

const filteredUrl = (conditions: unknown[]) => {
  const params = new URLSearchParams({
    folder: "12764",
    metadataTemplateId: "1",
    metadataFilters: JSON.stringify(conditions),
  });

  return `/rooms/personal/filter?${params}`;
};

const waitForFiles = (
  page: Page,
  matches: (params: URLSearchParams) => boolean,
) =>
  page.waitForRequest((req) => {
    const url = new URL(req.url());

    return (
      req.method() === "GET" &&
      url.pathname.endsWith("/api/2.0/files/12764") &&
      matches(url.searchParams)
    );
  });

const conditionsOf = (req: Request) =>
  JSON.parse(new URL(req.url()).searchParams.get("metadataFilters") ?? "null");

const chip = (page: Page, key: string) =>
  page.getByTestId(`filter_selected_item_metadata-${key}`);

test.describe("Metadata filter", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      filesSettingsHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      myHandler(TEST_PORT, true),
      myDocumentsHandler(TEST_PORT, true),
      ...metadataTemplatesHandlers(TEST_PORT),
    );
  });

  test("filters the list by a text and a choice field", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await page.getByTestId("filter_icon_button").click();
    await page.getByTestId("metadata_filter_add_condition").click();

    const panel = page.getByTestId("metadata_filter_panel");
    await panel.getByTestId("metadata_filter_template").click();
    await page.getByTestId("drop_down_item_1").click();

    const rows = panel.getByTestId("metadata_filter_condition");
    await rows.nth(0).getByTestId("metadata_value_input").fill("Northwind");
    await rows.nth(2).getByTestId("metadata_single_choice_input").click();
    await page.getByTestId(`drop_down_item_${METADATA_OPTION.signed}`).click();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_filter-conditions.png",
    ]);

    await panel.getByTestId("metadata_filter_apply").click();
    await expect(page.getByTestId("metadata_filter_section")).toContainText(
      "Metadata · 2 conditions",
    );

    const filtered = waitForFiles(page, (params) =>
      params.has("metadataTemplateId"),
    );

    await page.getByTestId("filter_apply_button").click();

    const request = await filtered;
    expect(new URL(request.url()).searchParams.get("metadataTemplateId")).toBe(
      "1",
    );
    expect(conditionsOf(request)).toEqual([
      COUNTERPARTY_CONTAINS,
      STATUS_SIGNED,
    ]);

    await expect(chip(page, `${METADATA_FIELD.counterparty}`)).toContainText(
      "Counterparty: contains · Northwind",
    );
    await expect(chip(page, `${METADATA_FIELD.status}`)).toContainText(
      "Status: is · Signed",
    );
    await expect(page.getByTestId("filter_icon_indicator")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_filter-chips.png",
    ]);
  });

  test("compares a number field and rejects a fractional value", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/rooms/personal/filter?folder=12764`);
    await expect(page.getByTestId("table-body")).toBeVisible();

    await page.getByTestId("filter_icon_button").click();
    await page.getByTestId("metadata_filter_add_condition").click();

    const panel = page.getByTestId("metadata_filter_panel");
    await panel.getByTestId("metadata_filter_template").click();
    await page.getByTestId("drop_down_item_1").click();

    const amount = panel.getByTestId("metadata_filter_condition").nth(1);
    const apply = panel.getByTestId("metadata_filter_apply");

    await amount.getByTestId("metadata_filter_operator").click();
    await page.getByTestId("drop_down_item_greaterthan").click();

    await amount.getByTestId("metadata_value_input").fill("12.5");
    await expect(panel.getByText("Enter a whole number")).toBeVisible();
    await expect(apply).toBeDisabled();

    await amount.getByTestId("metadata_value_input").fill("1000");
    await apply.click();

    const filtered = waitForFiles(page, (params) =>
      params.has("metadataTemplateId"),
    );

    await page.getByTestId("filter_apply_button").click();

    expect(conditionsOf(await filtered)).toEqual([
      { fieldId: METADATA_FIELD.amount, op: "gt", value: "1000" },
    ]);
    await expect(chip(page, `${METADATA_FIELD.amount}`)).toContainText(
      "Amount: greater than · 1000",
    );
  });

  test("removes a condition with its chip", async ({ page, baseUrl }) => {
    await page.goto(
      `${baseUrl}${filteredUrl([COUNTERPARTY_CONTAINS, STATUS_SIGNED])}`,
    );

    const counterparty = chip(page, `${METADATA_FIELD.counterparty}`);
    await expect(counterparty).toBeVisible();
    await expect(chip(page, `${METADATA_FIELD.status}`)).toBeVisible();

    const filtered = waitForFiles(
      page,
      (params) => !params.get("metadataFilters")?.includes("contains"),
    );

    await counterparty.click();

    expect(conditionsOf(await filtered)).toEqual([STATUS_SIGNED]);
    await expect(counterparty).toHaveCount(0);
  });

  test("drops an option deleted from the template out of a shared link", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(
      `${baseUrl}${filteredUrl([
        {
          fieldId: METADATA_FIELD.status,
          op: "in",
          optionIds: ["a0000000-0000-0000-0000-000000000009"],
        },
      ])}`,
    );

    await expect(chip(page, "template")).toContainText("Template: Contract");
    await expect(page).toHaveURL(/metadataTemplateId=1/);
    expect(new URL(page.url()).searchParams.has("metadataFilters")).toBe(false);
  });

  test("shows the empty state and clears the filter", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(myDocumentsMetadataFilterHandler(TEST_PORT));

    await page.goto(`${baseUrl}${filteredUrl([COUNTERPARTY_CONTAINS])}`);

    const empty = page.getByTestId("empty-view");
    await expect(empty).toContainText("No findings");

    await expectScreenshot(page, [
      "desktop",
      "metadata",
      "metadata_filter-empty.png",
    ]);

    const cleared = waitForFiles(
      page,
      (params) => !params.has("metadataTemplateId"),
    );

    await page.locator("#empty-view-filter").click();

    await cleared;
    await expect(page.getByTestId("table-body")).toBeVisible();
    await expect(chip(page, `${METADATA_FIELD.counterparty}`)).toHaveCount(0);
  });

  test("keeps the metadata filter while searching", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${filteredUrl([STATUS_SIGNED])}`);
    await expect(chip(page, `${METADATA_FIELD.status}`)).toBeVisible();

    const searched = waitForFiles(
      page,
      (params) => params.get("filterValue") === "brief",
    );

    await page.locator('[data-testid="filter_search_input"] input').fill("brief");

    const params = new URL((await searched).url()).searchParams;
    expect(params.get("metadataTemplateId")).toBe("1");
    expect(JSON.parse(params.get("metadataFilters") ?? "null")).toEqual([
      STATUS_SIGNED,
    ]);
    await expect(chip(page, `${METADATA_FIELD.status}`)).toBeVisible();
  });
});
