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
  colorThemeHandler,
  encryptionSettingsHandler,
  getPortalHandler,
  quotaHandler,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { expect, test } from "./fixtures/base";

test.describe("Settings", () => {
  test.beforeEach(async ({ serverRequestInterceptor, port }) => {
    serverRequestInterceptor.use(colorThemeHandler(port));
  });

  test("should branding settings render", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(getPortalHandler(port, false, true));

    await page.goto(`${baseUrl}/management/settings`);

    await expect(page.getByTestId("whitelabel-settings-wrapper")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-branding-render.png",
    ]);
  });

  test("should data backup settings render", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
  }) => {
    serverRequestInterceptor.use(getPortalHandler(port, false, true));

    await page.goto(`${baseUrl}/management/settings/data-backup`);

    await expect(page.getByTestId("manual-backup-wrapper")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-data-backup-render.png",
    ]);
  });

  test("should auto backup settings render", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
  }) => {
    serverRequestInterceptor.use(getPortalHandler(port, false, true));

    await page.goto(`${baseUrl}/management/settings/auto-backup`);

    await expect(page.getByTestId("auto-backup")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-auto-backup-render.png",
    ]);
  });

  test("should restore settings render", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
  }) => {
    serverRequestInterceptor.use(getPortalHandler(port, false, true));
    await page.goto(`${baseUrl}/management/settings/restore`);

    await expect(page.getByTestId("restore-backup")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-restore-render.png",
    ]);
  });

  test("should encrypt settings render", async ({
    page,
    baseUrl,
    port,
    serverRequestInterceptor,
  }) => {
    serverRequestInterceptor.use(getPortalHandler(port, false, true));
    await page.goto(`${baseUrl}/management/settings/encrypt-data`);

    await expect(page.getByTestId("encrypt-data-page")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-encrypt-render.png",
    ]);
  });

  test("should encrypt settings with encrypted state render", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    // Override encryption settings handler to return encrypted state
    serverRequestInterceptor.use(
      getPortalHandler(port, false, true),
      encryptionSettingsHandler(port, true),
    );

    await page.goto(`${baseUrl}/management/settings/encrypt-data`);

    await expect(page.getByTestId("encrypt-data-page")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-encrypt-encrypted-render.png",
    ]);
  });

  test("should unavailable branding settings render", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/management/settings`);

    await expect(page.getByTestId("whitelabel-settings-wrapper")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-branding-unavailable-render.png",
    ]);
  });

  test("should unavailable data backup settings render", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/management/settings/data-backup`);

    await expect(page.getByTestId("manual-backup-wrapper")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-data-backup-unavailable-render.png",
    ]);
  });

  test("should unavailable auto backup settings render", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/management/settings/auto-backup`);

    await expect(page.getByTestId("auto-backup")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-auto-backup-unavailable-render.png",
    ]);
  });

  test("should unavailable restore settings render", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/management/settings/restore`);

    await expect(page.getByTestId("restore-backup")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-restore-unavailable-render.png",
    ]);
  });

  test("should unavailable encrypt settings render", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/management/settings/encrypt-data`);

    await expect(page.getByTestId("encrypt-data-page")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-encrypt-unavailable-render.png",
    ]);
  });

  test("should not available branding settings render", async ({
    page,
    baseUrl,
    serverRequestInterceptor,
    port,
  }) => {
    serverRequestInterceptor.use(
      getPortalHandler(port, false, true),
      quotaHandler(port, false),
    );

    await page.goto(`${baseUrl}/management/settings`);

    await expect(page.getByTestId("whitelabel-settings-wrapper")).toBeVisible();

    await expectScreenshot(page,[
      "desktop",
      "settings",
      "settings-branding-without-customization-render.png",
    ]);
  });
});
