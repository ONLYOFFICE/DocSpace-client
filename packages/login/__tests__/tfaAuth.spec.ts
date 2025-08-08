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
  endpoints,
  HEADER_SELF_ERROR_404,
} from "@docspace/shared/__mocks__/e2e";
import { expect, test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";

const URL = "/login/confirm/TfaAuth";
const NEXT_REQUEST_URL = "*/**/login/confirm/TfaAuth";

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
const NEXT_REQUEST_URL_WITH_PARAMS = getUrlWithQueryParams(
  NEXT_REQUEST_URL,
  QUERY_PARAMS,
);

test("tfa auth render", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "tfa-auth",
    "tfa-auth-render.png",
  ]);
});

test("tfa auth success", async ({ page, mockRequest }) => {
  await mockRequest.router([
    endpoints.tfaAppValidate,
    endpoints.loginWithTfaCode,
  ]);
  await page.goto(URL_WITH_PARAMS);

  await page.getByTestId("text-input").fill("123456");

  await expect(page).toHaveScreenshot([
    "desktop",
    "tfa-auth",
    "tfa-auth-success.png",
  ]);

  await page.getByTestId("button").click();

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "tfa-auth",
    "tfa-auth-success-redirect.png",
  ]);
});

test("tfa auth error not validated", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_SELF_ERROR_404,
  ]);
  await mockRequest.router([endpoints.tfaAppValidateError]);
  await page.goto(URL_WITH_PARAMS);

  await page.getByTestId("text-input").fill("123456");

  await page.getByTestId("button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "tfa-auth",
    "tfa-auth-error-not-validated.png",
  ]);
});

test("tfa auth redirects to room after successful submission", async ({
  page,
  mockRequest,
}) => {
  await mockRequest.router([
    endpoints.tfaAppValidate,
    endpoints.loginWithTfaCode,
    endpoints.checkConfirmLink,
  ]);

  await page.goto(URL_WITH_LINK_DATA_PARAMS);

  await page.evaluate(() => {
    sessionStorage.setItem("referenceUrl", "/rooms/shared/1");
  });

  await page.getByTestId("text-input").fill("123456");
  await page.getByTestId("button").click();

  await page.waitForURL("/rooms/shared/1");

  await expect(page).toHaveScreenshot([
    "desktop",
    "tfa-auth",
    "tfa-auth-room-redirect.png",
  ]);
});
