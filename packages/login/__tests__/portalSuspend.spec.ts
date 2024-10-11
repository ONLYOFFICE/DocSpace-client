// (c) Copyright Ascensio System SIA 2009-2024
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

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { expect, test } from "./fixtures/base";
import {
  endpoints,
  HEADER_PORTAL_DEACTIVATE_SETTINGS,
} from "@docspace/shared/__mocks__/e2e";

const URL = "/login/confirm/PortalSuspend";
const NEXT_REQUEST_URL = "*/**/login/confirm/PortalSuspend";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "PortalSuspend",
  },
  {
    name: "key",
    value: "123",
  },
  {
    name: "email",
    value: "mail@mail.com",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);
const NEXT_REQUEST_URL_WITH_PARAMS = getUrlWithQueryParams(
  NEXT_REQUEST_URL,
  QUERY_PARAMS,
);

test("portal suspend render", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-suspend",
    "portal-suspend-render.png",
  ]);
});

test("portal suspend deactivate", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.suspendPortal]);
  await page.goto(URL_WITH_PARAMS);

  await page.getByRole("button", { name: "Deactivate" }).click();

  await page
    .getByRole("button", { name: "Deactivate" })
    .waitFor({ state: "detached" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-suspend",
    "portal-suspend-deactivate.png",
  ]);

  await page.getByTestId("link").click();

  await page.waitForURL("https://www.onlyoffice.com/", { waitUntil: "commit" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-suspend",
    "portal-suspend-deactivate-redirect.png",
  ]);
});

test("portal suspend cancel", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await page.getByRole("button", { name: "Cancel" }).click();

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-suspend",
    "portal-suspend-cancel.png",
  ]);
});

test("render after deactivate portal", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL_WITH_PARAMS, [
    HEADER_PORTAL_DEACTIVATE_SETTINGS,
  ]);
  await page.goto(URL_WITH_PARAMS);

  await page.waitForURL("/unavailable", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-suspend",
    "render-after-deactivate-portal.png",
  ]);
});
