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

import {
  oauthListSignIn,
  oauthSignIPpath,
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
  await page.goto(`/login?client_id=${successClient.client_id}`);
  await mockRequest.router({
    url: `*/**/${oauthSignIPpath}?Email=email@mail.ru&PasswordHash=e7e3ba4944723b6903c092dfa1180b8167530d112fd56ccbdc7d1e2ef8c34c39`,
    response: oauthListSignIn,
  });

  await page.fill("[name='login']", "email@mail.ru");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("qwerty123");

  await page.getByTestId("button").click();
  await page.waitForURL("/login/tenant-list?**", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "oauth",
    "oauth2-list-render.png",
  ]);
});

test("oauth2 back button after list render", async ({ page, mockRequest }) => {
  await page.goto(`/login?client_id=${successClient.client_id}`);
  await mockRequest.router({
    url: `*/**/${oauthSignIPpath}?Email=email@mail.ru&PasswordHash=e7e3ba4944723b6903c092dfa1180b8167530d112fd56ccbdc7d1e2ef8c34c39`,
    response: oauthListSignIn,
  });

  await page.fill("[name='login']", "email@mail.ru");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("qwerty123");

  await page.getByTestId("button").click();
  await page.waitForURL("/login/tenant-list?**", { waitUntil: "load" });

  await page.getByTestId("button").click();
  await page.waitForURL(
    `/login?type=oauth2&client_id=0aac3e2a-f41f-4fde-89d5-7208a13fbbc5&_rsc=ehcoy`,
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

// test("oauth2 consent after portal list", async ({
//   page,
//   mockRequest,
//   context,
// }) => {
//   await context.addCookies([
//     {
//       name: "x-redirect-authorization-uri",
//       value:
//         "http://127.0.0.1:5111/login/consent?clientId=0aac3e2a-f41f-4fde-89d5-7208a13fbbc5",
//       url: "http://127.0.0.1:5111",
//     },
//   ]);
//   await page.goto(`/login?client_id=${successClient.client_id}`);
//   await mockRequest.router({
//     url: `*/**/${oauthSignIPpath}?Email=email@mail.ru&PasswordHash=e7e3ba4944723b6903c092dfa1180b8167530d112fd56ccbdc7d1e2ef8c34c39`,
//     response: oauthListSignIn,
//   });
//   await mockRequest.router({
//     url: `*/**/api/2.0/authentication`,
//     response: {},
//   });

//   await page.fill("[name='login']", "email@mail.ru");
//   await page
//     .getByTestId("password-input")
//     .getByTestId("text-input")
//     .fill("qwerty123");

//   await page.getByTestId("button").click();
//   await page.waitForURL("/login/tenant-list?**", { waitUntil: "load" });

//   page
//     .locator("#styled-page div")
//     .filter({ hasText: "nct1.docspace.site" })
//     .nth(3)
//     .click();

//   await page.waitForURL(
//     "/http://127.0.0.1:5111/login/confirm/Auth?type=Auth&key=463586937695.PX9GUFYAB6FMUCGFKFOKT6CKUXP5QES6XKIQGMJJCU&email=test%40gmail.com&referenceUrl=http://127.0.0.1/login/consent?clientId=0aac3e2a-f41f-4fde-89d5-7208a13fbbc5",
//     { waitUntil: "load" },
//   );

//   await page.waitForURL(
//     "http://127.0.0.1:5111/login/consent?clientId=0aac3e2a-f41f-4fde-89d5-7208a13fbbc5",
//     { waitUntil: "load" },
//   );

//   await expect(page).toHaveScreenshot([
//     "desktop",
//     "oauth",
//     "oauth2-back-login-render.png",
//   ]);
// });
