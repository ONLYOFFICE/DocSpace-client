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
  rootHandler,
  settingsHandler,
  TypeSettings,
  filesSettingsHandler,
  peopleHandler,
  selfActivationStatusHandler,
} from "@docspace/shared/__mocks__/handlers";

import { expect, test, TEST_PORT } from "./fixtures/base";

/**
 * The Contacts users list drawn on the ui-kit DataTable: each tab its own
 * columns, the settings menu keeping the old record of visible columns, a
 * click on a title sorting through the people filter, and widths kept per tab.
 */

const PEOPLE_URL = "/accounts/people/filter";
const GUESTS_URL = "/accounts/guests/filter";
const GROUPS_URL = "/accounts/groups/filter";

const PEOPLE_COLUMNS_KEY = "peopleTableColumns_ver-";
const PEOPLE_WIDTHS_KEY = "peopleColumnsWidths_ver-1";
const GUESTS_WIDTHS_KEY = "guestsColumnsWidths_ver-1";

const header = (page: Page) => page.getByTestId("table-header");

const columnIds = (page: Page) =>
  header(page)
    .getByRole("columnheader")
    .evaluateAll((cells) =>
      cells.map((cell) => cell.getAttribute("data-column-id")),
    );

const storedRecord = (page: Page, prefix: string) =>
  page.evaluate(
    (keyPrefix) =>
      Object.entries(localStorage).find(([key]) =>
        key.startsWith(keyPrefix),
      )?.[1] ?? null,
    prefix,
  );

/** Every record of visible columns or widths, by key without the user. */
const tableRecords = (page: Page) =>
  page.evaluate(() =>
    Object.fromEntries(
      Object.entries(localStorage)
        .filter(([key]) => /Columns/.test(key))
        .map(([key, value]) => [key.split("=")[0], value]),
    ),
  );

/**
 * The largest distance between a cell's edges and its column title's. The
 * type and group cells start 8px early on purpose, as in the old table, so
 * the text of their lists lines up with the title and the list's hover
 * background reaches before it; their end is measured, not their start.
 */
const misalignment = (page: Page) =>
  page.evaluate(() => {
    const EARLY = ["Type", "Department"];
    const titles = Array.from(
      document.querySelectorAll(
        '[data-testid="table-header"] [role="columnheader"]',
      ),
      (cell) => cell.getBoundingClientRect(),
    );
    let worst = 0;
    for (const row of document.querySelectorAll(
      '[data-testid="table-body"] [role="row"]',
    )) {
      const cells = Array.from(row.querySelectorAll(':scope > [role="cell"]'));
      if (cells.length !== titles.length) return Infinity;
      cells.forEach((cell, i) => {
        const box = cell.getBoundingClientRect();
        const early = EARLY.includes(cell.getAttribute("data-column-id") ?? "");
        worst = Math.max(
          worst,
          Math.abs(box.left + (early ? 8 : 0) - titles[i].left),
          Math.abs(box.right - titles[i].right),
        );
      });
    }
    return worst;
  });

const dragEdge = async (page: Page, columnId: string, dx: number) => {
  const box = await page
    .getByTestId(`data-table-resize-${columnId}`)
    .boundingBox();
  expect(box).not.toBeNull();
  if (!box) return;

  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + dx, y, { steps: 8 });
  await page.mouse.up();
};

const navigate = (page: Page, to: string) =>
  page.evaluate(
    (path) =>
      (
        window as unknown as { DocSpace: { navigate: (to: string) => void } }
      ).DocSpace.navigate(path),
    to,
  );

test.describe("Contacts users on the DataTable", () => {
  test.beforeEach(async ({ page, mockRequest, baseUrl }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );

    await page.goto(`${baseUrl}${PEOPLE_URL}`);
    await expect(page.getByTestId("contacts_users_row_4")).toBeVisible();
  });

  test("lists people under the old columns, in line with the header", async ({
    page,
  }) => {
    const ids = await columnIds(page);
    expect(ids.slice(0, 4)).toEqual(["Name", "Type", "Department", "Mail"]);
    expect(ids.at(-1)).toBe("Settings");
    expect(await misalignment(page)).toBeLessThanOrEqual(0.5);

    await expect(page.getByTestId("contacts_email_cell_0")).toHaveText(
      "john.smith@example.com",
    );
    await expect(
      page
        .getByTestId("contacts_users_row_1")
        .getByTestId("context-menu-button"),
    ).toBeVisible();
  });

  test("lists guests under their own columns", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${GUESTS_URL}`);
    await expect(page.getByTestId("contacts_guests_row_0")).toBeVisible();

    expect(await columnIds(page)).toEqual([
      "Name",
      "Mail",
      "Inviter",
      "InvitedDate",
      "Settings",
    ]);
  });

  test("hides a column from the settings and keeps the old record of the rest", async ({
    page,
  }) => {
    await header(page).getByTestId("data-table-settings-button").click();
    await page.getByTestId("data-table-settings-Mail").uncheck();

    await expect.poll(() => columnIds(page)).not.toContain("Mail");
    const record = await storedRecord(page, PEOPLE_COLUMNS_KEY);
    expect(record?.split(",")).toEqual(
      expect.arrayContaining(["Name", "Type", "Department"]),
    );
    expect(record).not.toContain("Mail");
    expect(await misalignment(page)).toBeLessThanOrEqual(0.5);
  });

  test("sorts through the people filter from a column title", async ({
    page,
  }) => {
    const request = page.waitForRequest((r) =>
      /people\/filter.*sortby=email/i.test(r.url()),
    );
    await header(page).getByTestId("data-table-sort-Mail").click();
    await request;

    await expect(page).toHaveURL(/sortby=email/i);
    await expect(
      header(page).getByTestId("data-table-header-Mail"),
    ).toHaveAttribute("aria-sort", /ascending|descending/);
  });

  test("keeps the widths of each tab apart", async ({ page, baseUrl }) => {
    await dragEdge(page, "Name", 80);
    expect(await storedRecord(page, PEOPLE_WIDTHS_KEY)).not.toBeNull();

    await page.goto(`${baseUrl}${GUESTS_URL}`);
    await expect(page.getByTestId("contacts_guests_row_0")).toBeVisible();
    expect(await storedRecord(page, GUESTS_WIDTHS_KEY)).toBeNull();
  });

  test("going to the groups and back changes no record", async ({ page }) => {
    const before = await tableRecords(page);

    for (const wait of [1500, 50]) {
      await navigate(page, GROUPS_URL);
      await page.waitForTimeout(wait);
      await navigate(page, PEOPLE_URL);
      await page.waitForTimeout(wait);
    }
    await expect(page.getByTestId("contacts_users_row_4")).toBeVisible();

    expect(await tableRecords(page)).toEqual(before);
    expect((await columnIds(page)).slice(0, 4)).toEqual([
      "Name",
      "Type",
      "Department",
      "Mail",
    ]);
  });
});
