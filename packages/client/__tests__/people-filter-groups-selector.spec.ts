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
});
