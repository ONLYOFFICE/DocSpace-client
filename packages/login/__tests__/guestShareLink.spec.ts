// (c) Copyright Ascensio System SIA 2009-2025
//
// This program is a free software product.
// You can redistribute it and/or modify it under the terms
// of the GNU Affero General Public License (AGPL) version 3 as published by the Free Software
// Foundation. In accordance with Section 7(a) of the GNU AGPL its Section 15 shall be amended
// to the effect that Ascensio System SIA expressly excludes the warranty of non-infringement of
// any third-party rights.
//
// This program is distributed WITHOUT ANY WARRANTY, without even the implied warranty
// of MERCHANTABILITY or FITNESS FOR A PARTICULAR  PURPOSE. For details, see
// the GNU AGPL at: http://www.gnu.org/licenses/agpl-3.0.html
//
// You can contact Ascensio System SIA at Lubanas st. 125a-25, Riga, Latvia, EU, LV-1021.
//
// The  interactive user interfaces in modified source and object code versions of the Program must
// display Appropriate Legal Notices, as required under Section 5 of the GNU AGPL version 3.
//
// Pursuant to Section 7(b) of the License you must retain the original Product logo when
// distributing the program. Pursuant to Section 7(e) we decline to grant you any rights under
// trademark law for use of our trademarks.
//
// All the Product's GUI elements, including illustrations and icon sets, as well as technical writing
// content are licensed under the terms of the Creative Commons Attribution-ShareAlike 4.0
// International. See the License terms at http://creativecommons.org/licenses/by-sa/4.0/legalcode

import {
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { expect, test } from "./fixtures/base";

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
    settingsHandler(port, TypeSettings.Authenticated),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expect(page).toHaveScreenshot([
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

  await expect(page).toHaveScreenshot([
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

  await expect(page).toHaveScreenshot([
    "desktop",
    "guest-share-link",
    "guest-share-link-deny.png",
  ]);
});
