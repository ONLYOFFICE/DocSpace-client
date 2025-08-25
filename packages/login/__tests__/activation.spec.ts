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
  HEADER_QUOTA_FAILED,
  HEADER_TRAFF_LIMIT,
  HEADER_USER_EXISTED,
  endpoints,
} from "@docspace/shared/__mocks__/e2e";

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { expect, test } from "./fixtures/base";

const URL = "/login/confirm/Activation";
const NEXT_REQUEST_URL = "*/**/login/confirm/Activation";

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
const NEXT_REQUEST_URL_WITH_PARAMS = getUrlWithQueryParams(
  NEXT_REQUEST_URL,
  QUERY_PARAMS,
);

test("activation render", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-render.png",
  ]);
});

test("activation success", async ({ page, mockRequest }) => {
  await mockRequest.router([
    endpoints.changePassword,
    endpoints.activationStatus,
    endpoints.login,
    endpoints.updateUser,
  ]);
  await page.goto(URL_WITH_PARAMS);

  await page.fill("[name='password']", "qwerty123");
  await page.getByTestId("password_input_eye_off_icon").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-success.png",
  ]);

  await page.getByTestId("signup_button").click();

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-success-redirect.png",
  ]);
});

test("activation error", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await page.fill("[name='name']", "");
  await page.fill("[name='surname']", "");
  await page.fill("[name='password']", "123");

  await page.getByTestId("signup_button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-error.png",
  ]);
});

test("activation error tariffic limit", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_TRAFF_LIMIT,
  ]);

  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-error-tariffic-limit.png",
  ]);
});

test("activation error user existed", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_USER_EXISTED,
  ]);

  // Expected to go to the room page or default page
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-user-existed.png",
  ]);
});

test("activation error quota failed", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_QUOTA_FAILED,
  ]);

  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "activation",
    "activation-error-quota-failed.png",
  ]);
});
