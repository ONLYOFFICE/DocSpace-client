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

import { BASE_URL, endpoints } from "@docspace/shared/__mocks__/e2e";
import { expect, test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";

const URL = "/login/confirm/Auth";
const PORT = 5111;

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

const QUERY_PARAMS_WITH_REFERENCE_URL = QUERY_PARAMS.concat({
  name: "referenceUrl",
  value: `${BASE_URL}:${PORT}/rooms`,
});

const QUERY_PARAMS_WITH_FILE_HANDLER = QUERY_PARAMS.concat([
  {
    name: "referenceUrl",
    value: `${BASE_URL}:${PORT}/filehandler.ashx?action=download`,
  },
  {
    name: "fileid",
    value: "23",
  },
]);

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);
const URL_WITH_REFERENCE_URL = getUrlWithQueryParams(
  URL,
  QUERY_PARAMS_WITH_REFERENCE_URL,
);
const URL_WITH_FILE_HANDLER = getUrlWithQueryParams(
  URL,
  QUERY_PARAMS_WITH_FILE_HANDLER,
);

test("auth success", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.login]);
  await page.goto(URL_WITH_PARAMS);

  await page.getByTestId("loader").waitFor({ state: "detached" });

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot(["desktop", "auth", "auth-success.png"]);
});

test("auth with reference url success", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.login]);
  await page.goto(URL_WITH_REFERENCE_URL);

  await page.getByTestId("loader").waitFor({ state: "detached" });

  await page.waitForURL(`${BASE_URL}:${PORT}/rooms`, {
    waitUntil: "load",
  });

  await expect(page).toHaveScreenshot([
    "desktop",
    "auth",
    "auth-with-reference-url-success.png",
  ]);
});

test("auth with file handler success", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.login]);
  await page.goto(URL_WITH_FILE_HANDLER, { waitUntil: "domcontentloaded" });

  await page
    .getByText("File downloading in progress")
    .waitFor({ state: "detached" });

  await page.waitForURL(
    `${BASE_URL}:${PORT}/filehandler.ashx?action=download`,
    {
      waitUntil: "load",
    },
  );

  await expect(page).toHaveScreenshot([
    "desktop",
    "auth",
    "auth-with-file-handler-success-redirect.png",
  ]);
});
