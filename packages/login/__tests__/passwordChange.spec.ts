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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { test } from "./fixtures/base";
import {
  confirmHandler,
  ErrorConfirm,
} from "@docspace/shared/__mocks__/handlers";

const URL = "/login/confirm/PasswordChange";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "PasswordChange",
  },
  {
    name: "key",
    value: "123",
  },
  {
    name: "encemail",
    value: "b5COc6kRm3veeYqA72sOfA&uid=66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  },
  {
    name: "uid",
    value: "123",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

test("password change render", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-render.png",
  ]);
});

test("password change success", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.fill("[name='password']", "qwerty123");

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-success.png",
  ]);

  await page.getByTestId("create_password_button").click();

  await page.waitForURL(`${baseUrl}/login?passwordChanged=true`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-success-redirect.png",
  ]);
});

test("password change error", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.fill("[name='password']", "123");
  await page.getByTestId("create_password_button").click();

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-error.png",
  ]);
});

test("password change error invalid", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.Invalid));

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-error-invalid.png",
  ]);
});

test("password change error expired", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.Expired));

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-error-expired.png",
  ]);
});

test("password change error user excluded", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.UserExcluded));

  // Expected to go to default page
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "password-change",
    "password-change-error-user-excluded.png",
  ]);
});
