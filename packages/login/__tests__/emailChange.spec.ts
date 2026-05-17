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
  selfChangeAuthDataHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";

const URL = "/login/confirm/EmailChange";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "EmailChange",
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
  {
    name: "redirected",
    value: "true",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

test("email change without auth", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "email-change",
    "email-change-without-auth.png",
  ]);
});

test("email change success", async ({
  page,
  baseUrl,
  port,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.Authenticated),
  );
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.waitForURL(`${baseUrl}/profile/login?email_change=success`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "email-change",
    "email-change-success.png",
  ]);
});

test("email change error", async ({
  page,
  baseUrl,
  port,
  clientRequestInterceptor,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.Authenticated),
  );
  clientRequestInterceptor.use(selfChangeAuthDataHandler(port, 400));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "email-change",
    "email-change-error.png",
  ]);
});
