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
  HEADER_NO_STANDALONE_SETTINGS,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";
import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";

const URL = "/login/confirm/EmpInvite";
const NEXT_REQUEST_URL = "*/**/login/confirm/EmpInvite";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "EmpInvite",
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
    name: "emplType",
    value: "3",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);
const NEXT_REQUEST_URL_WITH_PARAMS = getUrlWithQueryParams(
  NEXT_REQUEST_URL,
  QUERY_PARAMS,
);

test("emp invite render standalone", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.getUserByEmail]);
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-render-standalone.png",
  ]);
});

test("emp invite render no standalone", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_NO_STANDALONE_SETTINGS,
  ]);

  await mockRequest.router([endpoints.getUserByEmail]);
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-render-no-standalone.png",
  ]);
});

test("emp invite success standalone", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.createUser, endpoints.login]);
  await page.goto(URL_WITH_PARAMS);

  await page.fill("[name='first-name']", "firstName");
  await page.fill("[name='last-name']", "lastName");
  await page
    .getByTestId("input-block")
    .getByTestId("text-input")
    .fill("qwerty123");
  await page.getByTestId("input-block").getByRole("img").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-success-standalone.png",
  ]);

  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-success-redirect-standalone.png",
  ]);
});

test("emp invite success no standalone", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_NO_STANDALONE_SETTINGS,
  ]);

  await mockRequest.router([endpoints.createUser, endpoints.login]);
  await page.goto(URL_WITH_PARAMS);

  await page.fill("[name='first-name']", "firstName");
  await page.fill("[name='last-name']", "lastName");
  await page
    .getByTestId("input-block")
    .getByTestId("text-input")
    .fill("qwerty123");

  await page.getByTestId("checkbox").click();

  await page.getByTestId("input-block").getByRole("img").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-success-no-standalone.png",
  ]);

  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-success-redirect-no-standalone.png",
  ]);
});

test("emp invite error standalone", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await page.getByTestId("input-block").getByTestId("text-input").fill("123");
  await page.getByTestId("input-block").getByRole("img").click();

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-error-standalone.png",
  ]);
});

test("emp invite error no standalone", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_NO_STANDALONE_SETTINGS,
  ]);

  await page.goto(URL_WITH_PARAMS);

  await page.getByTestId("input-block").getByTestId("text-input").fill("123");
  await page.getByTestId("input-block").getByRole("img").click();

  await page.getByRole("button", { name: "Sign up" }).click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "emp-invite",
    "emp-invite-error-no-standalone.png",
  ]);
});
