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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
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
 * The user type menu of a contacts row on a phone, where it opens as a bottom
 * sheet rendered by its own component (`MobileSubMenu`) rather than the
 * desktop `SubMenu`. Two defects were reported there:
 *
 *  - the sheet showed the bare type labels: the mobile item markup never
 *    rendered `description`, so the same menu that explains every type on
 *    desktop explained nothing on a phone;
 *  - opening the row menu shifted the row's content (and the button that was
 *    just tapped) to the leading edge. The row marks itself active and bleeds
 *    its highlight into the section padding with a negative margin, but the
 *    margin was only applied at the start while the padding was applied at
 *    both ends, so the trailing padding ate into the content box.
 *
 * The assertions are geometric or textual, so they hold on a local run too;
 * the frames are the other half - "the row jumped" and "the labels have no
 * subtitle" are things you see - and those compare truthfully in Docker only
 * (see `.claude/rules/e2e-tests.md`).
 */

const CONTACTS_URL = "/accounts/people/filter";

/** At or below 600px the app is in its mobile layout (`ui-kit/utils/device`). */
const MOBILE = { width: 428, height: 830 };

/**
 * A guest row is the one whose menu offers "Change type" (`UsersStore.
 * getUserContextOptions`), and the mocked list has exactly one - the fourth.
 */
const GUEST_ROW = "contacts_users_row_3";
const GUEST_NAME = "Emily Davis";

const row = (page: Page) => page.getByTestId(GUEST_ROW);

const rowContextButton = (page: Page) =>
  row(page).getByTestId("context-menu-button");

const openContacts = async (page: Page, baseUrl: string) => {
  await page.setViewportSize(MOBILE);
  await page.goto(`${baseUrl}${CONTACTS_URL}`);

  await expect(row(page)).toBeVisible();
  // fail here, rather than on a missing menu entry, if the mock list changes
  await expect(row(page)).toContainText(GUEST_NAME);
  await expect(rowContextButton(page)).toBeVisible();
};

/**
 * The menu closes itself on any click outside of it, and Playwright's
 * synthesised click reaches the document listener the menu had just installed,
 * so a real `click()` opens and closes it within the same event. Dispatching
 * the event on the element is what a tap does to the React handler.
 */
const tap = async (page: Page, selector: string) => {
  await page.locator(selector).dispatchEvent("click");
};

const openRowMenu = async (page: Page) => {
  await rowContextButton(page).dispatchEvent("click");
  await expect(page.locator("#option_change-type")).toBeVisible();
};

const openChangeType = async (page: Page) => {
  await openRowMenu(page);
  await tap(page, "#option_change-type");

  // the sheet swaps its own contents for the submenu, keeping the header
  await expect(page.locator("#menu_change-collaborator")).toBeVisible();
};

test.describe("Contacts row user type menu on a phone", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      rootHandler(TEST_PORT),
      settingsHandler(TEST_PORT, TypeSettings.Authenticated),
      filesSettingsHandler(TEST_PORT),
      peopleHandler(TEST_PORT),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
    );
  });

  test("keeps the row in place when its menu opens", async ({
    page,
    baseUrl,
  }) => {
    await openContacts(page, baseUrl);

    const before = await rowContextButton(page).boundingBox();
    expect(before).not.toBeNull();

    await openRowMenu(page);

    const after = await rowContextButton(page).boundingBox();
    expect(after).not.toBeNull();

    // The row highlights itself while its menu is open; that must not move the
    // content it highlights.
    expect(Math.round(after!.x)).toBe(Math.round(before!.x));

    const rowBox = await row(page).boundingBox();
    expect(rowBox).not.toBeNull();
    // ...and the highlight has to reach the trailing edge of the screen.
    expect(Math.round(rowBox!.x + rowBox!.width)).toBe(MOBILE.width);
  });

  test("explains every user type in the sheet", async ({ page, baseUrl }) => {
    await openContacts(page, baseUrl);
    await openChangeType(page);

    const items = [
      "#menu_change-user_administrator",
      "#menu_change-user_manager",
      "#menu_change-collaborator",
    ];

    for (const selector of items) {
      const item = page.locator(selector);
      await expect(item).toBeVisible();

      const description = item.locator("[class*='itemDescription']");
      await expect(description).toBeVisible();
      // a description, not an empty node inherited from the label row
      await expect(description).not.toHaveText("");
    }

    // Every type fits: the sheet is what scrolls, and it does not have to.
    const scrollTop = await page.evaluate(() => {
      const body = document.querySelector(".p-contextmenu .scroll-body");
      return body ? body.scrollHeight - body.clientHeight : -1;
    });
    expect(scrollTop).toBe(0);
  });

  test("row with its menu open", async ({ page, baseUrl }) => {
    await openContacts(page, baseUrl);
    await openRowMenu(page);

    await expectScreenshot(page, [
      "contacts-mobile",
      "row-with-menu-open.png",
    ]);
  });

  test("user type sheet", async ({ page, baseUrl }) => {
    await openContacts(page, baseUrl);
    await openChangeType(page);

    await expectScreenshot(page, ["contacts-mobile", "change-type-sheet.png"]);
  });
});
