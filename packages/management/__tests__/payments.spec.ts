// (c) Copyright Ascensio System SIA 2009-2026
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
