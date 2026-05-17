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
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { test } from "./fixtures/base";

const URL = "/login/confirm/GuestShareLink";
const QUERY_PARAMS = [
  {
    name: "type",
    value: "GuestShareLink",
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
    value: "3",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

test("guest share link render", async ({
  page,
  port,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(
    confirmHandler(port, undefined, true),
    settingsHandler(port, TypeSettings.Authenticated),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "guest-share-link",
    "guest-share-link-render.png",
  ]);
});

test("guest share link approve", async ({
  page,
  port,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.Authenticated),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("approve_button").click();

  await page.waitForURL(`${baseUrl}/accounts/guests/filter?**`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
    "desktop",
    "guest-share-link",
    "guest-share-link-approve.png",
  ]);
});

test("guest share link deny", async ({
  page,
  port,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.Authenticated),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("deny_button").click();

  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expectScreenshot(page,[
    "desktop",
    "guest-share-link",
    "guest-share-link-deny.png",
  ]);
});
