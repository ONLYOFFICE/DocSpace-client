import { login } from "@docspace/shared/api/user";
import { changePassword } from "@docspace/shared/api/people";
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

import { expect, test } from "./fixtures/base";
import { endpoints } from "./mocking/endpoints";
import {
  HEADER_LINK_EXPIRED,
  HEADER_LINK_INVALID,
  HEADER_USER_EXCLUDED,
} from "@docspace/shared/__mocks__/e2e/utils";

test("password change render", async ({ page }) => {
  await page.goto(
    "/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
  );

  await expect(page).toHaveScreenshot([
    "desktop",
    "password-change",
    "password-change-render.png",
  ]);
});

test("password change success", async ({ page, mockRequest }) => {
  await mockRequest.router(endpoints.changePassword);
  await mockRequest.router(endpoints.login);
  await page.goto(
    "/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
  );

  await page.getByTestId("text-input").fill("qwerty123");

  await expect(page).toHaveScreenshot([
    "desktop",
    "password-change",
    "password-change-success.png",
  ]);

  await page.getByTestId("button").click();

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "password-change",
    "password-change-success-redirect.png",
  ]);
});

test("password change error", async ({ page }) => {
  await page.goto(
    "/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
  );

  await page.getByTestId("text-input").fill("123");
  await page.getByTestId("button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "password-change",
    "password-change-error.png",
  ]);
});

test("password change error invalid", async ({ page }) => {
  await page.route(
    "*/**/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
    async (route) => {
      await route.continue({
        headers: {
          [HEADER_LINK_INVALID]: "true",
        },
      });
    },
  );
  await page.goto(
    "/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
  );
});

test("password change error expired", async ({ page }) => {
  await page.route(
    "*/**/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
    async (route) => {
      await route.continue({
        headers: {
          [HEADER_LINK_EXPIRED]: "true",
        },
      });
    },
  );
  await page.goto(
    "/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
  );
});

test("password change error user excluded", async ({ page }) => {
  await page.route(
    "*/**/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
    async (route) => {
      await route.continue({
        headers: {
          [HEADER_USER_EXCLUDED]: "true",
        },
      });
    },
  );

  await page.goto(
    "/login/confirm/PasswordChange?type=PasswordChange&key=123&email=mail@mail.com&uid=123",
  );

  await page.waitForURL("/", { waitUntil: "load" });
});
