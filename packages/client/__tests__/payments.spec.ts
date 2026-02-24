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
  paymentAccountHandler,
  paymentCustomerInfoHandler,
  paymentUrlHandler,
  portalPaymentQuotasHandler,
  quotaHandler,
  settingsHandler,
  tariffHandler,
  TARIFF_DUE_DATE_EXPIRED,
  TypeSettings,
  selfByTypeHandler,
} from "@docspace/shared/__mocks__/handlers";
import type { BrowserContext } from "@playwright/test";
import { expect, test, TEST_PORT } from "./fixtures/base";

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

test.describe("Standalone payments", () => {
  test.describe("Enterprise Edition", () => {
    test.describe("trial", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, true, true, true),
        );
      });

      test("renders trial state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "ee-trial.png",
        ]);
      });
    });

    test.describe("trial / expired", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, true, true, true),
        );
      });

      test("renders trial state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "ee-trial-expired.png",
        ]);
      });
    });

    test.describe("time-limited", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, true, false),
        );
      });

      test("renders paid state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "ee-time-limited.png",
        ]);
      });
    });

    test.describe("time-limited / grace period", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, true, true, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, true, false),
        );
      });

      test("renders grace period state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
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
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-04T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);
        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT),
        );
      });

      test("renders lifetime state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "ee-lifetime.png",
        ]);
      });
    });

    test.describe("lifetime / expired", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT),
        );
      });

      test("renders lifetime state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "ee-lifetime-expired.png",
        ]);
      });
    });
  });

  test.describe("Developer Edition", () => {
    test.describe("time-limited", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, true, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, true, false),
        );
      });

      test("renders paid state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "de-time-limited.png",
        ]);
      });
    });

    test.describe("time-limited / grace period", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, true, true, true, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, true, false),
        );
      });

      test("renders grace period state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
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
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-04T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, true, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT),
        );
      });

      test("renders lifetime state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "de-lifetime.png",
        ]);
      });
    });

    test.describe("lifetime / expired", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2026-01-06T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          settingsHandler(TEST_PORT, TypeSettings.Authenticated),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT),
          licenseQuotaHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, true, true, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT),
        );
      });

      test("renders lifetime state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("standalone-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "standalone-payments",
          "de-lifetime-expired.png",
        ]);
      });
    });
  });

  test.describe("Community Edition", () => {
    test.beforeEach(async ({ mockRequest, context }) => {
      const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
      await freezeTime(context, frozenNowMs);

      mockRequest.use(
        settingsHandler(TEST_PORT, TypeSettings.Authenticated),
        colorThemeHandler(TEST_PORT),
        paymentSettingsHandler(TEST_PORT),
        tariffHandler(TEST_PORT, true, false, false, false, TARIFF_DUE_DATE_EXPIRED),
        quotaHandler(TEST_PORT, true, false),
      );
    });

    test("renders state", async ({ page, baseUrl }) => {
      await page.goto(`${baseUrl}/portal-settings/bonus`);

      await expect(page.getByTestId("bonus")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "standalone-payments",
        "community.png",
      ]);
    });
  });
});

test.describe("SaaS payments", () => {
  test.describe("Business / month", () => {
    test.describe("Payer view", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "owner"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "month-payer-view.png",
        ]);
      });
    });

    test.describe("Owner view", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "owner"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT, false, "another@test.com"),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "month-owner-view.png",
        ]);
      });
    });

    test.describe("Owner view / without payer", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "owner"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT, true),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "month-owner-view-without-payer.png",
        ]);
      });
    });

    test.describe("Admin view", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "admin"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "month-admin-view.png",
        ]);
      });
    });

    test.describe("Admin view / without payer", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "admin"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT, true),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "month-admin-view-without-payer.png",
        ]);
      });
    });
  });

  test.describe("Business / year", () => {
    test.describe("Payer view", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "owner"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "year-payer-view.png",
        ]);
      });
    });

    test.describe("Owner view", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "owner"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT, false, "another@test.com"),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "year-owner-view.png",
        ]);
      });
    });

    test.describe("Owner view / without payer", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "owner"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT, true),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "year-owner-view-without-payer.png",
        ]);
      });
    });

    test.describe("Admin view", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "admin"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "year-admin-view.png",
        ]);
      });
    });

    test.describe("Admin view / without payer", () => {
      test.beforeEach(async ({ mockRequest, context }) => {
        const frozenNowMs = new Date("2025-12-10T06:00:00.000Z").getTime();
        await freezeTime(context, frozenNowMs);

        mockRequest.use(
          selfByTypeHandler(TEST_PORT, "admin"),
          settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
          colorThemeHandler(TEST_PORT),
          paymentSettingsHandler(TEST_PORT, false),
          portalPaymentQuotasHandler(TEST_PORT),
          paymentCustomerInfoHandler(TEST_PORT, true),
          paymentAccountHandler(TEST_PORT),
          paymentUrlHandler(TEST_PORT),
          tariffHandler(TEST_PORT, false, false, false, false, TARIFF_DUE_DATE_EXPIRED),
          quotaHandler(TEST_PORT, false, false, false, true, true),
        );
      });

      test("renders payments state", async ({ page, baseUrl }) => {
        await page.goto(`${baseUrl}/portal-settings/payments/portal-payments`);

        await expect(page.getByTestId("payments-loader")).toHaveCount(0);
        await expect(page.getByTestId("saas-page")).toBeVisible();

        await expect(page).toHaveScreenshot([
          "desktop",
          "saas-business-payments",
          "year-admin-view-without-payer.png",
        ]);
      });
    });
  });
});
