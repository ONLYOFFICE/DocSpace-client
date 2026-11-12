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

import { checkIsAuthenticatedHandler } from "@docspace/shared/__mocks__/handlers";
import { expect, test } from "./fixtures/base";
import type { Page } from "@playwright/test";

// Logging out sends every open tab to the login page, while logging in again
// happens in one of them only. The others must notice the live session when
// the user comes back to them, rather than wait for a manual reload.

const isSessionCheck = (method: string, url: string) =>
  method === "GET" && new URL(url).pathname.endsWith("/api/2.0/authentication");

// The user switching back to the tab.
const comeBackToTab = (page: Page) =>
  page.evaluate(() => {
    document.dispatchEvent(new Event("visibilitychange"));
  });

test("a login tab opens the portal once the session is alive again", async ({
  page,
  baseUrl,
}) => {
  await page.goto(`${baseUrl}/login?authError=true`);
  await expect(page.getByTestId("login_button")).toBeVisible();

  // A 401 lands tabs here with authError=true, which keeps the login proxy
  // from trusting the cookie - so a reload would not leave the form; the tab
  // has to open the portal root itself.
  await comeBackToTab(page);

  await page.waitForURL(`${baseUrl}/`);
});

test("a login tab stays on the form while the session is still dead", async ({
  page,
  port,
  baseUrl,
  clientRequestInterceptor,
}) => {
  clientRequestInterceptor.use(checkIsAuthenticatedHandler(port, false));

  await page.goto(`${baseUrl}/login`);
  await expect(page.getByTestId("login_button")).toBeVisible();

  const checked = page.waitForResponse((response) =>
    isSessionCheck(response.request().method(), response.url()),
  );
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await checked;

  expect(page.url()).toBe(`${baseUrl}/login`);
  await expect(page.getByTestId("login_button")).toBeVisible();
});

test("a public-room login popup does not leave the form on its own", async ({
  page,
  baseUrl,
}) => {
  const checks: string[] = [];
  page.on("request", (request) => {
    if (isSessionCheck(request.method(), request.url()))
      checks.push(request.url());
  });

  await page.goto(`${baseUrl}/login?publicAuth=true`);
  await expect(page.getByTestId("login_button")).toBeVisible();

  await comeBackToTab(page);
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await page.waitForTimeout(500);

  expect(checks).toEqual([]);
  expect(page.url()).toBe(`${baseUrl}/login?publicAuth=true`);
});
