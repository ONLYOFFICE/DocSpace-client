/*
 * Copyright (C) Ascensio System SIA, 2009-2026
 *
 * This program is a free software product. You can redistribute it and/or
 * modify it under the terms of the GNU Affero General Public License (AGPL)
 * version 3 as published by the Free Software Foundation, together with the
 * additional terms provided in the LICENSE file.
 *
 * This program is distributed WITHOUT ANY WARRANTY; without even the implied
 * warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. For
 * details, see the GNU AGPL at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * You can contact Ascensio System SIA by email at info@onlyoffice.com
 * or by postal mail at 20A-6 Ernesta Birznieka-Upisha Street, Riga,
 * LV-1050, Latvia, European Union.
 *
 * The interactive user interfaces in modified versions of the Program
 * are required to display Appropriate Legal Notices in accordance with
 * Section 5 of the GNU AGPL version 3.
 *
 * No trademark rights are granted under this License.
 *
 * All non-code elements of the Product, including illustrations,
 * icon sets, and technical writing content, are licensed under the
 * Creative Commons Attribution-ShareAlike 4.0 International License:
 * https://creativecommons.org/licenses/by-sa/4.0/legalcode
 *
 * This license applies only to such non-code elements and does not
 * modify or replace the licensing terms applicable to the Program's
 * source code, which remains licensed under the GNU Affero General
 * Public License v3.
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
  confirmHandler,
  ErrorConfirm,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import { getUrlWithQueryParams } from "./helpers/getUrlWithQueryParams";
import { test } from "./fixtures/base";
import { userExistsHandler } from "@docspace/shared/__mocks__/handlers/people/self";
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

  await expectScreenshot(page,[
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

  await expectScreenshot(page,[
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
  clientRequestInterceptor.use(userExistsHandler(port, false));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page
    .locator("p")
    .filter({ hasText: "Sign up" })
    .waitFor({ state: "attached" });

  await expectScreenshot(page,[
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
  clientRequestInterceptor.use(userExistsHandler(port, false));
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

  await expectScreenshot(page,[
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
  clientRequestInterceptor.use(userExistsHandler(port, true));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail.com");
  await page.getByTestId("email_continue_button").click();

  await expectScreenshot(page,[
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

  await expectScreenshot(page,[
    "desktop",
    "link-invite",
    "link-invite-login-success.png",
  ]);

  await page.getByTestId("login_button").click();
  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expectScreenshot(page,[
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
    userExistsHandler(port, true),
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

  await expectScreenshot(page,[
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
  clientRequestInterceptor.use(userExistsHandler(port, false));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.fill("[name='first-name']", "firstName");
  await page.fill("[name='last-name']", "lastName");
  await page.fill("[name='password']", "qwerty123");
  await page.getByTestId("password_input_eye_off_icon").click();

  await expectScreenshot(page,[
    "desktop",
    "link-invite",
    "link-invite-registration-success-standalone.png",
  ]);

  await page.getByRole("button", { name: "Sign up" }).click();
  await page.waitForURL(`${baseUrl}/`, {
    waitUntil: "load",
  });

  await expectScreenshot(page,[
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
  clientRequestInterceptor.use(userExistsHandler(port, false));
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

  await expectScreenshot(page,[
    "desktop",
    "link-invite",
    "link-invite-registration-success-no-standalone.png",
  ]);

  await page.getByTestId("signup_button").click();
  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });

  await expectScreenshot(page,[
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
  clientRequestInterceptor.use(userExistsHandler(port, false));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();
  await page.fill("[name='password']", "123");

  await page.getByTestId("password_input_eye_off_icon").click();

  await page.getByTestId("signup_button").click();

  await expectScreenshot(page,
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
  clientRequestInterceptor.use(userExistsHandler(port, false));
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.NoStandalone),
  );

  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await page.getByTestId("email-input-invite").fill("mail@mail.com");
  await page.getByTestId("email_continue_button").click();

  await page.fill("[name='password']", "123");

  await page.getByTestId("password_input_eye_off_icon").click();

  await page.getByTestId("signup_button").click();

  await expectScreenshot(page,
    [
      "desktop",
      "link-invite",
      "link-invite-registration-error-no-standalone.png",
    ],
    { fullPage: true },
  );
});

test("link invite quota failed", async ({
  page,
  port,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.QuotaFailed));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "link-invite",
    "link-invite-quota-failed.png",
  ]);
});

test("link invite expired", async ({
  page,
  port,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(confirmHandler(port, ErrorConfirm.Expired));
  await page.goto(`${baseUrl}${URL_WITH_PARAMS}`);

  await expectScreenshot(page,[
    "desktop",
    "link-invite",
    "link-invite-expired.png",
  ]);
});
