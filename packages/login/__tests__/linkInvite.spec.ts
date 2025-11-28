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
import { selfGetByEmailHandler } from "@docspace/shared/__mocks__/handlers/people/self";
import { loginHandler } from "@docspace/shared/__mocks__/handlers/authentication/login";

const URL = "/login/confirm/LinkInvite";

const QUERY_PARAMS = [
  {
    name: "type",
    value: "LinkInvite",
  },
  {
    name: "key",
    value: "123",
  },
  {
    name: "uid",
    value: "123",
  },
  {
    name: "emplType",
    value: "3",
  },
];

const URL_WITH_PARAMS = getUrlWithQueryParams(URL, QUERY_PARAMS);

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({
    "x-forwarded-host-test": "localhost",
  });
});

test("link invite email render", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-email-render.png",
  ]);
});

test("link invite login render", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.waitForURL(`${baseUrl}/login?loginData**`, {
    waitUntil: "load",
  });

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-login-render.png",
  ]);
});

test("link invite registration render standalone", async ({
  page,
  baseUrl,
  port,
  clientRequestInterceptor,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port, 404));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page
    .locator("p")
    .filter({ hasText: "Sign up" })
    .waitFor({ state: "attached" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-registration-render-standalone.png",
  ]);
});

test("link invite registration render no standalone", async ({
  page,
  port,
  clientRequestInterceptor,
  serverRequestInterceptor,
  baseUrl,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port, 404));
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.NoStandalone),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page
    .locator("p")
    .filter({ hasText: "Sign up" })
    .waitFor({ state: "attached" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-registration-render-no-standalone.png",
  ]);
});

test("link invite email error", async ({
  page,
  baseUrl,
  port,
  clientRequestInterceptor,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail.com");
  await page.getByTestId("email_continue_button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-email-error.png",
  ]);
});

test("link invite login success", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.waitForURL(`${baseUrl}/login?loginData**`, {
    waitUntil: "load",
  });

  await page.fill("[name='password']", "qwerty123");
  await page.getByTestId("password_input_eye_off_icon").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-login-success.png",
  ]);

  await page.getByTestId("login_button").click();
  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-login-success-redirect.png",
  ]);
});

test("link invite login error", async ({
  page,
  baseUrl,
  port,
  clientRequestInterceptor,
}) => {
  clientRequestInterceptor.use(
    selfGetByEmailHandler(port),
    loginHandler(port, 404),
  );
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.waitForURL(`${baseUrl}/login?loginData**`, {
    waitUntil: "load",
  });

  await page.fill("[name='password']", "123");

  await page.getByTestId("login_button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-login-error.png",
  ]);
});

test("link invite registration success standalone", async ({
  page,
  baseUrl,
  port,
  clientRequestInterceptor,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port, 404));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.fill("[name='first-name']", "firstName");
  await page.fill("[name='last-name']", "lastName");
  await page.fill("[name='password']", "qwerty123");
  await page.getByTestId("password_input_eye_off_icon").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-registration-success-standalone.png",
  ]);

  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL(`${baseUrl}/`, {
    waitUntil: "load",
  });

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-registration-success-redirect-standalone.png",
  ]);
});

test("link invite registration success no standalone", async ({
  page,
  port,
  clientRequestInterceptor,
  serverRequestInterceptor,
  baseUrl,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port, 404));
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.NoStandalone),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.fill("[name='first-name']", "firstName");
  await page.fill("[name='last-name']", "lastName");
  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("news_checkbox").click();

  await page.getByTestId("password_input_eye_off_icon").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-registration-success-no-standalone.png",
  ]);

  await page.getByTestId("signup_button").click();
  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "link-invite",
    "link-invite-registration-success-redirect-no-standalone.png",
  ]);
});

test("link invite registration error standalone", async ({
  page,
  baseUrl,
  port,
  clientRequestInterceptor,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port, 404));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();
  await page.fill("[name='password']", "123");

  await page.getByTestId("password_input_eye_off_icon").click();

  await page.getByTestId("signup_button").click();

  await expect(page).toHaveScreenshot(
    ["desktop", "link-invite", "link-invite-registration-error-standalone.png"],
    { fullPage: true },
  );
});

test("link invite registration error no standalone", async ({
  page,
  port,
  clientRequestInterceptor,
  serverRequestInterceptor,
  baseUrl,
}) => {
  clientRequestInterceptor.use(selfGetByEmailHandler(port, 404));
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.NoStandalone),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.fill("[name='password']", "123");

  await page.getByTestId("password_input_eye_off_icon").click();

  await page.getByTestId("signup_button").click();

  await expect(page).toHaveScreenshot(
    [
      "desktop",
      "link-invite",
      "link-invite-registration-error-no-standalone.png",
    ],
    { fullPage: true },
  );
});
