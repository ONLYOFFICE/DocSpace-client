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
  settingsHandler,
  TypeSettings,
  selfActivationStatusHandler,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";

// packages/client/src/pages/Dashboard/sub-components/ProfileCard.tsx
const PROFILE_CARD = '[data-tour-id="dashboard-profile"]';

test.describe("Dashboard profile card from the keyboard", () => {
  test.beforeEach(({ mockRequest }) => {
    mockRequest.use(
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      selfActivationStatusHandler(TEST_PORT, null, false, true),
      selfByTypeHandler(TEST_PORT, "admin"),
    );
  });

  // "Set password" is an action link with no href: the keyboard reaches it
  // only as a button.
  test("Tab reaches Set password and Enter opens the dialog", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/dashboard`);

    const setPassword = page
      .locator(PROFILE_CARD)
      .getByRole("button", { name: "Set password" });
    await expect(setPassword).toBeVisible();

    let reached = false;
    for (let i = 0; i < 40 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await setPassword.evaluate(
        (el) => el === document.activeElement,
      );
    }
    expect(reached).toBe(true);

    // The dialog sends the instructions on Enter, listening on the window:
    // the press that opened it must not reach it and send them at once.
    const sent: string[] = [];
    page.on("request", (request) => {
      if (/\/people\/password/.test(request.url())) sent.push(request.url());
    });

    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();
    expect(sent).toEqual([]);
  });
});
