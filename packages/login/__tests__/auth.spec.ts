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
  confirmHandler,
  loginHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";

const URL = "/login/confirm/Auth";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "Auth",
  },
  {
    name: "key",
    value: "123",
  },
  {
    name: "encemail",
    value: "b5COc6kRm3veeYqA72sOfA&uid=66faa6e4-f133-11ea-b126-00ffeec8b4ef",
  },
];

const getQueryParamsWithReferenceUrl = (baseUrl: string) => {
  return QUERY_PARAMS.concat({
    name: "referenceUrl",
    value: `${baseUrl}/rooms`,
  });
};

const getQueryParamsWithFileHandler = (baseUrl: string) => {
  return QUERY_PARAMS.concat([
    {
      name: "referenceUrl",
      value: `${baseUrl}/filehandler.ashx?action=download`,
    },
    {
      name: "fileid",
      value: "23",
    },
  ]);
};

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

const getUrlWithReferenceUrl = (baseUrl: string) => {
  return getUrlWithQueryParams(URL, getQueryParamsWithReferenceUrl(baseUrl));
};
const getUrlWithFileHandler = (baseUrl: string) => {
  return getUrlWithQueryParams(URL, getQueryParamsWithFileHandler(baseUrl));
};

test("auth success", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("loader").waitFor({ state: "detached" });

  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expectScreenshot(page,["desktop", "auth", "auth-success.png"]);
});

test("auth with reference url success", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));
  await page.goto(`${baseUrl}${getUrlWithReferenceUrl(baseUrl)}`);

  await page.getByTestId("loader").waitFor({ state: "detached" });

  await page.waitForURL(`${baseUrl}/rooms`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "auth",
    "auth-with-reference-url-success.png",
  ]);
});

test("auth with file handler success", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));
  await page.goto(`${baseUrl}${getUrlWithFileHandler(baseUrl)}`, {
    waitUntil: "domcontentloaded",
  });

  await page
    .getByText("File downloading in progress")
    .waitFor({ state: "detached" });

  await page.waitForURL(`${baseUrl}/filehandler.ashx?action=download`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "auth",
    "auth-with-file-handler-success-redirect.png",
  ]);
});

test("auth with tfa success", async ({
  page,
  baseUrl,
  serverRequestInterceptor,
  clientRequestInterceptor,
  port,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, undefined, true));
  clientRequestInterceptor.use(loginHandler(port, null, true));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("loader").waitFor({ state: "detached" });

  await page.waitForURL(
    `${baseUrl}/login/confirm/TfaAuth?type=TfaAuth&uid=d513b1f4`,
    { waitUntil: "load" },
  );

  await expectScreenshot(page,[
    "desktop",
    "auth",
    "auth-with-tfa-success.png",
  ]);
});
