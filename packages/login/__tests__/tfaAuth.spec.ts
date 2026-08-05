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
  tfaAppValidateHandler,
  selfHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";

const URL = "/login/confirm/TfaAuth";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "TfaAuth",
  },
  {
    name: "encemail",
    value: "b5COc6kRm3veeYqA72sOfA&uid=66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  },
];

const QUERY_PARAMS_WITH_LINK_DATA = QUERY_PARAMS.concat([
  {
    name: "linkData",
    value: "yJ0eXBlIjoiTGlua0ludml",
  },
  {
    name: "publicAuth",
    value: "null",
  },
]);

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);
const URL_WITH_LINK_DATA_PARAMS = getUrlWithQueryParams(
  URL,
  QUERY_PARAMS_WITH_LINK_DATA,
);

test("tfa auth render", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "tfa-auth",
    "tfa-auth-render.png",
  ]);
});

test("tfa auth success", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("app_code_input").fill("123456");

  await expectScreenshot(page,[
    "desktop",
    "tfa-auth",
    "tfa-auth-success.png",
  ]);

  await page.getByTestId("app_code_continue_button").click();

  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expectScreenshot(page,[
    "desktop",
    "tfa-auth",
    "tfa-auth-success-redirect.png",
  ]);
});

test("tfa auth error not validated", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
  clientRequestInterceptor,
}) => {
  serverRequestInterceptor.use(selfHandler(port, 404));
  clientRequestInterceptor.use(tfaAppValidateHandler(port, 400));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("app_code_input").fill("123456");

  await page.getByTestId("app_code_continue_button").click();

  await expectScreenshot(page,[
    "desktop",
    "tfa-auth",
    "tfa-auth-error-not-validated.png",
  ]);
});

test("tfa auth redirects to room after successful submission", async ({
  page,
  baseUrl,
}) => {
  await page.goto(`${baseUrl}${URL_WITH_LINK_DATA_PARAMS}`);

  await page.evaluate(() => {
    sessionStorage.setItem("referenceUrl", "/rooms/shared/1");
  });

  await page.getByTestId("app_code_input").fill("123456");
  await page.getByTestId("app_code_continue_button").click();

  await page.waitForURL(`${baseUrl}/rooms/shared/1`);

  await expectScreenshot(page,[
    "desktop",
    "tfa-auth",
    "tfa-auth-room-redirect.png",
  ]);
});
