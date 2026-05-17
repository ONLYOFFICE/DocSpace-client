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
  licenseQuotaHandler,
  paymentSettingsHandler,
  quotaHandler,
  settingsHandler,
  tariffHandler,
  TARIFF_DUE_DATE_EXPIRED,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { BrowserContext } from "@playwright/test";
import { expect, test } from "./fixtures/base";

test.use({ timezoneId: "UTC" });

const freezeTime = async (context: BrowserContext, frozenNowMs: number) => {
  await context.addInitScript((now: number) => {
    const OriginalDate = Date;

    window.timezone = "UTC";

    Date.now = () => now;

    (globalThis as unknown as Record<string, unknown>).Date = class extends (
      OriginalDate
    ) {
      constructor(...args: unknown[]) {
        if (!args.length) {
          super(now);
          return;
        }

        const value = args[0];

        if (value instanceof OriginalDate) {
          super(value);
          return;
        }

        if (typeof value === "string" || typeof value === "number") {
          super(value);
          return;
        }

        super(now);
      }

      static now() {
        return now;
      }
    };
  }, frozenNowMs);
};

test.describe("Enterprise Edition", () => {
  test.describe("trial", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port, true, true, true),
      );
    });

    test("renders trial state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, ["desktop", "payments", "ee-trial.png"]);
    });
  });

  test.describe("trial / expired", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port, true, true, true),
      );
    });

    test("renders trial expired state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "ee-trial-expired.png",
      ]);
    });
  });

  test.describe("time-limited", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port, true, false),
      );
    });

    test("renders time-limited state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "ee-time-limited.png",
      ]);
    });
  });

  test.describe("time-limited / grace period", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, true, true, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port, true, false),
      );
    });

    test("renders grace period state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "ee-time-limited-grace-period.png",
      ], {
        mask: [
          page.getByTestId("grace-period-start-date"),
          page.getByTestId("grace-period-date-range"),
          page.getByTestId("grace-period-days-remaining"),
        ],
      });
    });
  });

  test.describe("lifetime", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-04T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port),
      );
    });

    test("renders lifetime state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, ["desktop", "payments", "ee-lifetime.png"]);
    });
  });

  test.describe("lifetime / expired", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port),
      );
    });

    test("renders lifetime expired state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "ee-lifetime-expired.png",
      ]);
    });
  });
});

test.describe("Developer Edition", () => {
  test.describe("time-limited", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, true, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port, true, false),
      );
    });

    test("renders paid state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "de-time-limited.png",
      ]);
    });
  });

  test.describe("time-limited / grace period", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, true, true, true, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port, true, false),
      );
    });

    test("renders grace period state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "de-time-limited-grace-period.png",
      ], {
        mask: [
          page.getByTestId("grace-period-start-date"),
          page.getByTestId("grace-period-date-range"),
          page.getByTestId("grace-period-days-remaining"),
        ],
      });
    });
  });

  test.describe("lifetime", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-04T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, true, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port),
      );
    });

    test("renders lifetime state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, ["desktop", "payments", "de-lifetime.png"]);
    });
  });

  test.describe("lifetime / expired", () => {
    test.beforeEach(async ({ serverRequestInterceptor, port, page }) => {
      const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
      await freezeTime(page.context(), frozenNowMs);

      serverRequestInterceptor.use(
        settingsHandler(port, TypeSettings.Authenticated),
        colorThemeHandler(port),
        paymentSettingsHandler(port),
        licenseQuotaHandler(port),
        tariffHandler(port, false, false, true, true, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(port),
      );
    });

    test("renders lifetime state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/management/payments`);

      await expect(page.getByTestId("standalone-page")).toBeVisible();

      await expectScreenshot(page, [
        "desktop",
        "payments",
        "de-lifetime-expired.png",
      ]);
    });
  });
});
