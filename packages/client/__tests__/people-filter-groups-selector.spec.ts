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
import { http } from "msw";

import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e";
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
 * Group -> "Other" in the People filter opens ui-kit's GroupsSelector through
 * `@docspace/shared/utils/renderFilterSelector`. The selector reads its API
 * client from ui-kit's ApiContext, which App.js provides.
 *
 * pnpm installs ui-kit once per peer set, and client and shared resolve
 * different ones (client declares ai-chat's optional peers, shared does not).
 * Unless the bundler dedupes the package (`config/resolve.ts`), the selector
 * imported through shared comes from a second copy with a second ApiContext,
 * and opening it crashes the page with "useApi must be used within an
 * ApiProvider". The same holds for FilesSelectorInput (backup settings) and
 * any other shared component that renders a ui-kit selector.
 */

const CONTACTS_URL = "/accounts/people/filter";

const GROUPS = [
  { id: "group-1", name: "Marketing", isLDAP: false },
  { id: "group-2", name: "Engineering", isLDAP: false },
];

const groupsHandler = () =>
  http.get(`${BASE_URL}:${TEST_PORT}/${API_PREFIX}/group`, () =>
    Response.json({
      response: GROUPS,
      count: GROUPS.length,
      total: GROUPS.length,
      status: 0,
      statusCode: 200,
    }),
  );

const openContacts = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${CONTACTS_URL}`);
  await expect(page.getByTestId("contacts_users_row_0")).toBeVisible();
};

const openGroupsSelector = async (page: Page, baseUrl: string) => {
  await openContacts(page, baseUrl);
  await page.getByTestId("filter_icon_button").click();
  await page
    .getByTestId("filter_block_item_filter-group")
    .getByTestId("filter_tag_other")
    .click();
  const selector = page.getByTestId("groups_selector");
  await expect(selector).toBeVisible();
  return selector;
};

test.describe("People filter: groups selector", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      groupsHandler(),
    );
  });

  test("opens from Group -> Other and lists the groups", async ({
    page,
    baseUrl,
  }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));

    await openContacts(page, baseUrl);

    await page.getByTestId("filter_icon_button").click();
    // Inviter has an "Other" tag of its own; this one opens the groups selector
    await page
      .getByTestId("filter_block_item_filter-group")
      .getByTestId("filter_tag_other")
      .click();

    const selector = page.getByTestId("groups_selector");

    await expect(selector).toBeVisible();
    for (const { name } of GROUPS) {
      await expect(selector.getByText(name, { exact: true })).toBeVisible();
    }

    expect(pageErrors.filter((m) => m.includes("ApiProvider"))).toEqual([]);
  });

  // The groups selector picks one group: the list takes the focus, the arrows
  // walk the groups, Enter picks the one the keyboard is on, and Enter on the
  // picked one submits it to the filter.
  test("a group is picked from the keyboard", async ({ page, baseUrl }) => {
    const selector = await openGroupsSelector(page, baseUrl);
    const list = selector.getByRole("listbox");

    await expect(list).toBeFocused();
    await expect(list).toHaveAttribute("aria-label", "Groups");

    const active = () =>
      list.evaluate((el) => {
        const id = el.getAttribute("aria-activedescendant");
        const option = id ? document.getElementById(id) : null;
        return {
          text: option?.textContent?.trim() ?? "",
          selected: option?.getAttribute("aria-selected") ?? "",
        };
      });

    // A row's text starts with its avatar's initial.
    await expect.poll(async () => (await active()).text).toContain(GROUPS[0].name);
    await page.keyboard.press("ArrowDown");
    expect((await active()).text).toContain(GROUPS[1].name);
    await page.keyboard.press("Home");
    expect((await active()).text).toContain(GROUPS[0].name);

    await page.keyboard.press("ArrowDown");
    await page.keyboard.press("Enter");
    const picked = await active();
    expect(picked.text).toContain(GROUPS[1].name);
    expect(picked.selected).toBe("true");
    await expect(selector).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(selector).toBeHidden();
    await expect(
      page
        .getByTestId("filter_block_item_filter-group")
        .getByText(GROUPS[1].name, { exact: true }),
    ).toBeVisible();
  });

  test("Escape on the groups selector goes back to the filter", async ({
    page,
    baseUrl,
  }) => {
    const selector = await openGroupsSelector(page, baseUrl);
    await expect(selector.getByRole("listbox")).toBeFocused();

    await page.keyboard.press("Escape");
    await expect(selector).toBeHidden();
    await expect(page.getByTestId("filter_cancel_button")).toBeVisible();
  });

  // A pick swaps "Other" for the picked group: the focus goes to that tag,
  // whose cross clears the group and hands the focus back to "Other".
  test("after a pick the focus is on the picked group, and its cross clears it", async ({
    page,
    baseUrl,
  }) => {
    const selector = await openGroupsSelector(page, baseUrl);
    await expect(selector.getByRole("listbox")).toBeFocused();

    await page.keyboard.press("Enter");
    await page.keyboard.press("Enter");
    await expect(selector).toBeHidden();

    const groupBlock = page.getByTestId("filter_block_item_filter-group");
    const picked = groupBlock.getByRole("button", { name: GROUPS[0].name });
    await expect(picked).toBeFocused();

    await page.keyboard.press("Tab");
    const remove = groupBlock.getByRole("button", { name: "Remove" });
    await expect(remove).toBeFocused();
    await page.keyboard.press("Enter");

    await expect(picked).toHaveCount(0);
    await expect(groupBlock.getByTestId("filter_tag_other")).toBeFocused();
  });

  // The filter's tags are keyboard buttons: Tab reaches "Other", and Enter
  // opens the selector from it.
  test("the groups selector opens from the keyboard", async ({
    page,
    baseUrl,
  }) => {
    await openContacts(page, baseUrl);
    await page.getByTestId("filter_icon_button").click();

    const other = page
      .getByTestId("filter_block_item_filter-group")
      .getByTestId("filter_tag_other");
    await expect(other).toBeVisible();
    for (
      let i = 0;
      i < 20 && !(await other.evaluate((el) => el === document.activeElement));
      i += 1
    )
      await page.keyboard.press("Tab");
    await expect(other).toBeFocused();
    await expect(other).toHaveAttribute("role", "button");

    await page.keyboard.press("Enter");
    const selector = page.getByTestId("groups_selector");
    await expect(selector).toBeVisible();
    await expect(selector.getByRole("listbox")).toBeFocused();
  });
});
