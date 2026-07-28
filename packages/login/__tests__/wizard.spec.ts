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

import path from "path";
import {
  settingsHandler,
  licenseRequiredHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { test } from "./fixtures/base";

const URL = "/login/wizard";

test("wizard render", async ({
  page,
  port,
  serverRequestInterceptor,
  baseUrl,
}) => {
  serverRequestInterceptor.use(settingsHandler(port, TypeSettings.Wizard));

  await page.goto(`${baseUrl}${URL}`);

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-render.png",
  ]);
});

test("wizard success", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(settingsHandler(port, TypeSettings.Wizard));
  await page.goto(`${baseUrl}${URL}`);

  await page.fill("[name='wizard-email']", "email@mail.ru");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("qwerty123");
  await page.getByTestId("agree_terms_checkbox").click();

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-success.png",
  ]);

  await page.getByTestId("wizard_continue_button").click();
  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-success-redirect.png",
  ]);
});

test("wizard error", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(settingsHandler(port, TypeSettings.Wizard));

  await page.goto(`${baseUrl}${URL}`);

  await page.fill("[name='wizard-email']", "email@123");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("123");

  await page.getByTestId("wizard_continue_button").click();

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-error.png",
  ]);
});

test("wizard with license success", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(settingsHandler(port, TypeSettings.Wizard));
  serverRequestInterceptor.use(licenseRequiredHandler(port, true));

  await page.goto(`${baseUrl}${URL}`);

  await page.fill("[name='wizard-email']", "email@mail.ru");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("qwerty123");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByTestId("license_file_input").click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(path.join(__dirname, "files", "example.lic"));

  await page.getByTestId("agree_terms_checkbox").click();

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-with-license-success.png",
  ]);

  await page.getByTestId("wizard_continue_button").click();

  await page.getByTestId("loader").waitFor({ state: "detached" });
  await page.waitForURL(`${baseUrl}/`, { waitUntil: "load" });
  await page.waitForTimeout(1000);

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-with-license-success-redirect.png",
  ]);
});

test("wizard with license error", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(settingsHandler(port, TypeSettings.Wizard));
  serverRequestInterceptor.use(licenseRequiredHandler(port, true));

  await page.goto(`${baseUrl}${URL}`);

  await page.fill("[name='wizard-email']", "email@123");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("123");

  await page.getByTestId("wizard_continue_button").click();

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-with-license-error.png",
  ]);
});

test("wizard with ami render", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.WizardWithAmi),
  );

  await page.goto(`${baseUrl}${URL}`);

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-with-ami-render.png",
  ]);
});

test("wizard with ami error", async ({
  page,
  port,
  baseUrl,
  serverRequestInterceptor,
}) => {
  serverRequestInterceptor.use(
    settingsHandler(port, TypeSettings.WizardWithAmi),
  );

  await page.goto(`${baseUrl}${URL}`);

  await page.getByTestId("wizard_continue_button").click();

  await expectScreenshot(page,[
    "desktop",
    "wizard",
    "wizard-with-ami-error.png",
  ]);
});
