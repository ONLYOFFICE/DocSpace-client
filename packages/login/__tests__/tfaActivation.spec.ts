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

const URL = "/login/confirm/TfaActivation";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "TfaActivation",
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

test("tfa activation render", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "tfa-activation",
    "tfa-activation-render.png",
  ]);
});

test("tfa activation success", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("app_code_input").fill("123456");

  await expectScreenshot(page,[
    "desktop",
    "tfa-activation",
    "tfa-activation-success.png",
  ]);

  await page.getByTestId("app_connect_button").click();

  await page.waitForURL(`${baseUrl}/profile`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "tfa-activation",
    "tfa-activation-success-redirect.png",
  ]);
});

test("tfa activation success with link data", async ({
  page,

  baseUrl,
}) => {
  await page.goto(`${baseUrl}${URL_WITH_LINK_DATA_PARAMS}`);

  await page.getByTestId("app_code_input").fill("123456");

  await page.getByTestId("app_connect_button").click();

  await page.waitForURL(`${baseUrl}/profile`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "tfa-activation",
    "tfa-activation-with-link-data-success.png",
  ]);
});

test("tfa activation error not validated", async ({
  page,
  port,
  serverRequestInterceptor,
  clientRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(selfHandler(port, 404));
  clientRequestInterceptor.use(tfaAppValidateHandler(port, 400));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("app_code_input").fill("123456");

  await page.getByTestId("app_connect_button").click();

  await expectScreenshot(page,[
    "desktop",
    "tfa-activation",
    "tfa-activation-error-not-validated.png",
  ]);
});
