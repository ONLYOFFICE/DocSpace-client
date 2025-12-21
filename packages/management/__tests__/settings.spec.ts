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
  HEADER_UNCOMPLETED_TENANT,
  HEADER_ENCRYPTION_SETTINGS_ENCRYPTED
} from "@docspace/shared/__mocks__/e2e";

import { expect, test } from "./fixtures/base";

test.describe("Settings", () => {
  test.beforeEach(async ({ mockRequest }) => {
    await mockRequest.router([endpoints.colorTheme]);
    await mockRequest.setHeaders("**/management/settings/**", [
      HEADER_UNCOMPLETED_TENANT,
    ]);
  });

  test("should branding settings render", async ({ page }) => {
    await page.goto("/management/settings");

    await expect(
      page.getByTestId("whitelabel-settings-wrapper"),
    ).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "settings",
      "settings-branding-render.png",
    ]);
  });

  test("should data backup settings render", async ({ page }) => {
    await page.goto("/management/settings/data-backup");

    await expect(
      page.getByTestId("manual-backup-wrapper"),
    ).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "settings",
      "settings-data-backup-render.png",
    ]);
  });

  test("should auto backup settings render", async ({ page }) => {
    await page.goto("/management/settings/auto-backup");

    await expect(
      page.getByTestId("auto-backup"),
    ).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "settings",
      "settings-auto-backup-render.png",
    ]);
  });

  test("should restore settings render", async ({ page }) => {
    await page.goto("/management/settings/restore");

    await expect(
      page.getByTestId("restore-backup"),
    ).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "settings",
      "settings-restore-render.png",
    ]);
  });

  test("should encrypt settings render", async ({ page }) => {
    await page.goto("/management/settings/encrypt-data");

    await expect(
      page.getByTestId("encrypt-data-page"),
    ).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "settings",
      "settings-encrypt-render.png",
    ]);
  });

  test("should encrypt settings with encrypted state render", async ({ page, mockRequest }) => {
    await mockRequest.setHeaders("**/management/settings/**", [
      HEADER_ENCRYPTION_SETTINGS_ENCRYPTED,
    ]);

    await page.goto("/management/settings/encrypt-data");

    await expect(
      page.getByTestId("encrypt-data-page"),
    ).toBeVisible();

    await expect(page).toHaveScreenshot([
      "desktop",
      "settings",
      "settings-encrypt-encrypted-render.png",
    ]);
  });
});
