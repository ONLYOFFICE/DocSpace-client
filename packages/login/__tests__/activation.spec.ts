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

const URL = "/login/confirm/Activation";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "Activation",
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
    name: "firstname",
    value: "firstname",
  },
  {
    name: "lastname",
    value: "lastname",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

test("activation render", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-render.png",
  ]);
});

test("activation success", async ({
  page,
  baseUrl,
  port,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.fill("[name='password']", "qwerty123");
  await page.getByTestId("password_input_eye_off_icon").click();

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-success.png",
  ]);

  await page.getByTestId("signup_button").click();

  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-success-redirect.png",
  ]);
});

test("activation error", async ({
  page,
  baseUrl,
  port,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.fill("[name='name']", "");
  await page.fill("[name='surname']", "");
  await page.fill("[name='password']", "123");

  await page.getByTestId("signup_button").click();

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-error.png",
  ]);
});

test("activation error tariffic limit", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.TariffLimit));

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-error-tariffic-limit.png",
  ]);
});

test("activation error user existed", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.UserExisted));

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-user-existed.png",
  ]);
});

test("activation error quota failed", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.QuotaFailed));

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "activation",
    "activation-error-quota-failed.png",
  ]);
});
