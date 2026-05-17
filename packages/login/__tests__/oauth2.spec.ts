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

import { capabilitiesHandler } from "@docspace/shared/__mocks__/handlers";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { test } from "./fixtures/base";
import { successClient } from "@docspace/shared/__mocks__/handlers/oauth/client";

test("oauth2 login render", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}/login?client_id=${successClient.client_id}`);

  await expectScreenshot(page,[
    "desktop",
    "oauth",
    "oauth2-login-render.png",
  ]);
});

test("oauth2 with list render", async ({
  page,
  serverRequestInterceptor,
  port,
  baseUrl,
}) => {
  serverRequestInterceptor.use(capabilitiesHandler(port, true));

  await page.goto(`${baseUrl}/login?client_id=${successClient.client_id}`);

  await page.fill("[name='login']", "email@mail.ru");
  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();
  await page.waitForURL(`${baseUrl}/login/tenant-list?**`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "oauth",
    "oauth2-list-render.png",
  ]);
});

test("oauth2 back button after list render", async ({
  page,
  serverRequestInterceptor,
  port,
  baseUrl,
}) => {
  serverRequestInterceptor.use(capabilitiesHandler(port, true));

  await page.goto(`${baseUrl}/login?client_id=${successClient.client_id}`);

  await page.fill("[name='login']", "email@mail.ru");
  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();
  await page.waitForURL(`${baseUrl}/login/tenant-list?**`, {
    waitUntil: "load",
  });

  await page.getByTestId("back_to_login_button").click();
  await page.waitForURL(
    `${baseUrl}/login?type=oauth2&client_id=0aac3e2a-f41f-4fde-89d5-7208a13fbbc5`,
    {
      waitUntil: "load",
    },
  );

  await expectScreenshot(page,[
    "desktop",
    "oauth",
    "oauth2-back-login-render.png",
  ]);
});

// test("oauth2 consent render", async ({ page, mockRequest, context }) => {
//   await context.addCookies([
//     {
//       name: "asc_auth_key",
//       value: "test",
//       url: "http://127.0.0.1:5111",
//     },
//   ]);
//   await page.goto(`/login/consent?client_id=${successClient.client_id}`);

//   await page.waitForURL(`/login/consent?client_id=${successClient.client_id}`, {
//     waitUntil: "load",
//   });

//   await expectScreenshot(page,[
//     "desktop",
//     "oauth",
//     "oauth2-consent-render.png",
//   ]);
// });

// test("oauth2 consent change user", async ({ page, mockRequest, context }) => {
//   await context.addCookies([
//     {
//       name: "asc_auth_key",
//       value: "test",
//       url: "http://127.0.0.1:5111",
//     },
//   ]);
//   await page.goto(`/login/consent?client_id=${successClient.client_id}`);

//   await page.waitForURL(`/login/consent?client_id=${successClient.client_id}`, {
//     waitUntil: "load",
//   });

//   await context.clearCookies({ name: "asc_auth_key" });
//   await clientRequestInterceptor.use([endpoints.logout]);

//   await page.getByText("Not you?").click();
//   await page.waitForURL(
//     `/login?client_id=${successClient.client_id}&type=oauth2`,
//     {
//       waitUntil: "load",
//     },
//   );

//   await expectScreenshot(page,[
//     "desktop",
//     "oauth",
//     "oauth2-consent-change-user.png",
//   ]);
// });
