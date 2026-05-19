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
  capabilitiesHandler,
  loginHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test } from "./fixtures/base";
import { thirdPartyProvidersHandler } from "@docspace/shared/__mocks__/handlers/people/thirdPartyProviders";

test("login render", async ({
  page,
  serverRequestInterceptor,
  port,
  baseUrl,
}) => {
  serverRequestInterceptor.use(
    capabilitiesHandler(port, true),
    thirdPartyProvidersHandler(port, true),
  );
  await page.goto(`${baseUrl}/login`);

  await expectScreenshot(page,["desktop", "login", "login-render.png"]);
});

test("login error authentication failed", async ({
  page,
  port,
  clientRequestInterceptor,
  baseUrl,
}) => {
  clientRequestInterceptor.use(loginHandler(port, 401));

  await page.goto(`${baseUrl}/login`);

  await page.getByTestId("email-input").fill("email@mail.ru");

  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-error-authentication-failed.png",
  ]);
});

test("login error not validated", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}/login`);

  await page.getByTestId("email-input").fill("");

  await page.fill("[name='password']", "");

  await page.getByTestId("login_button").click();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-error-not-validated.png",
  ]);
});

test("login error incorrect email", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}/login`);

  await page.getByTestId("email-input").fill("email");

  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-error-incorrect-email.png",
  ]);
});

test("login error incorrect email domain", async ({ page, baseUrl }) => {
  await page.goto(`${baseUrl}/login`);

  await page.getByTestId("email-input").fill("email@mail.com2");

  await page.fill("[name='password']", "qwerty123");

  await page.getByTestId("login_button").click();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-error-incorrect-email-domain.png",
  ]);
});

test("login with with a registration button", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(settingsHandler(port, TypeSettings.EnabledJoin));

  await page.goto(`${baseUrl}/login`);

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-with-registration-button.png",
  ]);

  await page.locator("#login_register").click();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-with-registration-button-modal.png",
  ]);
});

test("login with with access recovery", async ({
  page,
  serverRequestInterceptor,
  port,
  baseUrl,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.EnableAdmMess),
  );

  await page.goto(`${baseUrl}/login`);

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-with-access-recovery.png",
  ]);

  await page.getByTestId("recover_access_link").click();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-with-access-recovery-modal.png",
  ]);
});

test("login with hcaptcha", async ({
  page,
  port,
  clientRequestInterceptor,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.WithHCaptcha),
  );
  clientRequestInterceptor.use(loginHandler(port, 403));

  await page.goto(`${baseUrl}/login`);

  await page.getByTestId("email-input").fill("email@mail.com");

  await page.fill("[name='password']", "qwerty1234");

  await page.getByTestId("login_button").click();

  await expect(page.getByTestId("captcha-container")).toBeVisible();

  await expectScreenshot(page,[
    "desktop",
    "login",
    "login-with-hcaptcha.png",
  ]);
});
