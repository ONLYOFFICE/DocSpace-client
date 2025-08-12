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

import path from "path";

import {
  HEADER_WIZARD_SETTINGS,
  HEADER_LICENCE_REQUIRED,
  endpoints,
  HEADER_WIZARD_WITH_AMI_SETTINGS,
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

const URL = "/login/wizard";
const NEXT_REQUEST_URL = "*/**/login/wizard";

test("wizard render", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [HEADER_WIZARD_SETTINGS]);

  await page.goto(URL);

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-render.png",
  ]);
});

test("wizard success", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [HEADER_WIZARD_SETTINGS]);
  await mockRequest.router([endpoints.wizardComplete]);

  await page.goto(URL);

  await page.fill("[name='wizard-email']", "email@mail.ru");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("qwerty123");
  await page.getByTestId("agree_terms_checkbox").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-success.png",
  ]);

  await page.getByTestId("continue_button").click();
  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-success-redirect.png",
  ]);
});

test("wizard error", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [HEADER_WIZARD_SETTINGS]);
  await mockRequest.router([endpoints.wizardComplete]);

  await page.goto(URL);

  await page.fill("[name='wizard-email']", "email@123");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("123");

  await page.getByTestId("continue_button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-error.png",
  ]);
});

test("wizard with license success", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [
    HEADER_WIZARD_SETTINGS,
    HEADER_LICENCE_REQUIRED,
  ]);
  await mockRequest.router([endpoints.wizardComplete, endpoints.license]);

  await page.goto(URL);

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

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-with-license-success.png",
  ]);

  await page.getByTestId("continue_button").click();

  await page.waitForURL("/", { waitUntil: "load" });

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-with-license-success-redirect.png",
  ]);
});

test("wizard with license error", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [
    HEADER_WIZARD_SETTINGS,
    HEADER_LICENCE_REQUIRED,
  ]);

  await page.goto(URL);

  await page.fill("[name='wizard-email']", "email@123");
  await page
    .getByTestId("password-input")
    .getByTestId("text-input")
    .fill("123");

  await page.getByTestId("continue_button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-with-license-error.png",
  ]);
});

test("wizard with ami render", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [
    HEADER_WIZARD_WITH_AMI_SETTINGS,
  ]);

  await page.goto(URL);

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-with-ami-render.png",
  ]);
});

test("wizard with ami error", async ({ page, mockRequest }) => {
  await mockRequest.setHeaders(NEXT_REQUEST_URL, [
    HEADER_WIZARD_WITH_AMI_SETTINGS,
  ]);

  await page.goto(URL);

  await page.getByTestId("continue_button").click();

  await expect(page).toHaveScreenshot([
    "desktop",
    "wizard",
    "wizard-with-ami-error.png",
  ]);
});
