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
  HEADER_LIST_CAPABILITIES,
  successClient,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test("oauth2 login render", async ({ page }) => {
  await page.goto(`/login?client_id=${successClient.client_id}`);

  await expect(page).toHaveScreenshot([
    "desktop",
    "oauth",
    "oauth2-login-render.png",
  ]);
});

test("oauth2 with list render", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(`/login?client_id=${successClient.client_id}`, [
    HEADER_LIST_CAPABILITIES,
  ]);
  await mockRequest.router([endpoints.oauthSignIn]);

  await page.goto(`/login?client_id=${successClient.client_id}`);

  await page.fill("[name='login']", "email@mail.ru");
  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();
  await page.waitForURL("/login/tenant-list?**", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "oauth",
    "oauth2-list-render.png",
  ]);
});

test("oauth2 back button after list render", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(`/login?client_id=${successClient.client_id}`, [
    HEADER_LIST_CAPABILITIES,
  ]);
  await mockRequest.router([endpoints.oauthSignIn]);

  await page.goto(`/login?client_id=${successClient.client_id}`);

  await page.fill("[name='login']", "email@mail.ru");
  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();
  await page.waitForURL("/login/tenant-list?**", { waitUntil: "load" });

  await page.getByTestId("back_to_login_button").click();
  await page.waitForURL(
    `/login?type=oauth2&client_id=0aac3e2a-f41f-4fde-89d5-7208a13fbbc5`,
    {
      waitUntil: "load",
    },
  );

  await expect(page).toHaveScreenshot([
    "desktop",
    "oauth",
    "oauth2-back-login-render.png",
  ]);
});

// test("oauth2 consent render", async ({ page, mockRequest, context }) => {
//   await context.addCookies([
//     {
//       name: "asc_auth_key",
//       value: "test",
//       url: "http://127.0.0.1:5111",
//     },
//   ]);
//   await page.goto(`/login/consent?client_id=${successClient.client_id}`);

//   await page.waitForURL(`/login/consent?client_id=${successClient.client_id}`, {
//     waitUntil: "load",
//   });

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "oauth",
//     "oauth2-consent-render.png",
//   ]);
// });

// test("oauth2 consent change user", async ({ page, mockRequest, context }) => {
//   await context.addCookies([
//     {
//       name: "asc_auth_key",
//       value: "test",
//       url: "http://127.0.0.1:5111",
//     },
//   ]);
//   await page.goto(`/login/consent?client_id=${successClient.client_id}`);

//   await page.waitForURL(`/login/consent?client_id=${successClient.client_id}`, {
//     waitUntil: "load",
//   });

//   await context.clearCookies({ name: "asc_auth_key" });
//   await mockRequest.router([endpoints.logout]);

//   await page.getByText("Not you?").click();
//   await page.waitForURL(
//     `/login?client_id=${successClient.client_id}&type=oauth2`,
//     {
//       waitUntil: "load",
//     },
//   );

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "oauth",
//     "oauth2-consent-change-user.png",
//   ]);
// });
