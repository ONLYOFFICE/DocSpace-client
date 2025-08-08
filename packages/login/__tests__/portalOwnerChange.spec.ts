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

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { expect, test } from "./fixtures/base";
import { endpoints } from "@docspace/shared/__mocks__/e2e";

const URL = "/login/confirm/PortalOwnerChange";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "PortalOwnerChange",
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
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

test("portal owner change render", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-owner-change",
    "portal-owner-change-render.png",
  ]);
});

test("portal owner change save", async ({ page, mockRequest }) => {
  await mockRequest.router([endpoints.changeOwner]);
  await page.goto(URL_WITH_PARAMS);

  await page.getByRole("button", { name: "Save" }).click();

  await page
    .getByRole("button", { name: "Save" })
    .waitFor({ state: "detached" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-owner-change",
    "portal-owner-change-save.png",
  ]);
});

test("portal owner change cancel", async ({ page }) => {
  await page.goto(URL_WITH_PARAMS);

  await page.getByRole("button", { name: "Cancel" }).click();

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "portal-owner-change",
    "portal-owner-change-cancel.png",
  ]);
});
