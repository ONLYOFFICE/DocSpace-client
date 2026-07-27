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
  settingsHandler,
  TypeSettings,
  docsConnectHandlers,
  docsConnectTrialActivationHandlers,
  docsConnectServerErrorHandler,
  DOCS_CONNECT_FROZEN_NOW,
  PATH_DOCS_CONNECT_INFO,
  PATH_DOCS_CONNECT_TRIAL,
  PATH_WALLET_BALANCE,
  PATH_UPDATE_WALLET,
} from "@docspace/shared/__mocks__/handlers";
import type { BrowserContext } from "@playwright/test";
import type { DocsConnectPreset } from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

test.use({ timezoneId: "UTC" });

const DOCS_CONNECT_ROUTE = "/developer-tools/docs-connect";
const FROZEN_NOW_MS = new Date(DOCS_CONNECT_FROZEN_NOW).getTime();
const FIRST_RENDER_TIMEOUT = 15_000;

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

const usePreset = (mockRequest: WorkerFixture, preset: DocsConnectPreset) => {
  mockRequest.use(
    settingsHandler(TEST_PORT, TypeSettings.Authenticated),
    colorThemeHandler(TEST_PORT),
    ...docsConnectHandlers(TEST_PORT, preset),
  );
};

test.beforeEach(async ({ context }) => {
  await freezeTime(context, FROZEN_NOW_MS);
});

test.describe("Docs Connect", () => {
  test.describe("promo", () => {
    test("renders promo page when tenant is not created", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "noTenant");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_promo")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(
        page.getByTestId("docs_connect_create_tenant_button"),
      ).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "promo.png",
      ]);
    });

    test("starts trial and shows tenant panel", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      mockRequest.use(
        settingsHandler(TEST_PORT, TypeSettings.Authenticated),
        colorThemeHandler(TEST_PORT),
        ...docsConnectTrialActivationHandlers(TEST_PORT),
      );

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_promo")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });

      const trialRequest = page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes(PATH_DOCS_CONNECT_TRIAL),
      );

      await page.getByTestId("docs_connect_create_tenant_button").click();
      await trialRequest;

      await expect(page.getByTestId("docs_connect_panel")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(page.getByTestId("docs_connect_trial_banner")).toBeVisible();
    });

    test("renders canceled subscription promo", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "canceled");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_promo")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(page.getByTestId("docs_connect_buy_button")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "canceled.png",
      ]);
    });
  });

  test.describe("trial", () => {
    test("renders active trial state", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trial");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_panel")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(page.getByTestId("docs_connect_trial_badge")).toHaveText(
        "20 Free days left",
      );
      await expect(page.getByTestId("docs_connect_trial_banner")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "trial.png",
      ]);
    });

    test("renders trial ending soon state", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trialLow");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_trial_badge")).toHaveText(
        "10 Free days left",
        { timeout: FIRST_RENDER_TIMEOUT },
      );

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "trial-low.png",
      ]);
    });

    test("renders expired trial state", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trialExpired");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_trial_badge")).toHaveText(
        "Trial expired",
        { timeout: FIRST_RENDER_TIMEOUT },
      );

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "trial-expired.png",
      ]);
    });
  });

  test.describe("paid", () => {
    test("renders paid subscription state", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paid");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_panel")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(
        page.getByTestId("docs_connect_trial_badge"),
      ).toBeHidden();
      await expect(page.getByText("$100.00")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "paid.png",
      ]);
    });

    test("renders paid subscription with Dev Pack", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paidDevPack");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_panel")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(page.getByText("$250.00")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "paid-devpack.png",
      ]);
    });
  });

  test.describe("scheduled change", () => {
    test("renders scheduled user adjustment and cancels it", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "scheduled");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_panel")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });

      const cancelChangeLink = page.getByText("Cancel change");
      await expect(cancelChangeLink).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "scheduled.png",
      ]);

      const updateWalletRequest = page.waitForRequest(
        (request) =>
          request.method() === "PUT" &&
          request.url().includes(PATH_UPDATE_WALLET),
      );

      await cancelChangeLink.click();

      const body = (await updateWalletRequest).postDataJSON() as {
        quantity: Record<string, number | null>;
        productQuantityType: number;
      };

      expect(body.quantity).toEqual({ docscloud: null });
      expect(body.productQuantityType).toBe(0);
    });

    test("renders scheduled cancellation state", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "scheduledCancel");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByTestId("docs_connect_panel")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
      await expect(
        page.getByText("Subscription cancellation").first(),
      ).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "scheduled-cancellation.png",
      ]);
    });
  });

  test.describe("deactivated", () => {
    test("renders deactivated state and removes subscription", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "deactivated");

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      const banner = page.getByTestId("docs_connect_deactivated_banner");
      await expect(banner).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "deactivated.png",
      ]);

      await banner.getByText("Remove", { exact: true }).click();

      const dialog = page.getByRole("dialog");
      await expect(dialog.getByText("Remove subscription")).toBeVisible();

      const updateWalletRequest = page.waitForRequest(
        (request) =>
          request.method() === "PUT" &&
          request.url().includes(PATH_UPDATE_WALLET),
      );

      await dialog.getByRole("button", { name: "Remove", exact: true }).click();

      const body = (await updateWalletRequest).postDataJSON() as {
        quantity: Record<string, number | null>;
        productQuantityType: number;
      };

      expect(body.quantity).toEqual({ docscloud: 0 });
      expect(body.productQuantityType).toBe(0);
    });
  });

  test.describe("server errors", () => {
    test("shows error screen when tenant info request fails", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paid");
      mockRequest.use(
        docsConnectServerErrorHandler(TEST_PORT, PATH_DOCS_CONNECT_INFO),
      );

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByText("Something went wrong.")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
    });

    test("shows error screen when wallet balance request fails", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paid");
      mockRequest.use(
        docsConnectServerErrorHandler(TEST_PORT, PATH_WALLET_BALANCE),
      );

      await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

      await expect(page.getByText("Something went wrong.")).toBeVisible({
        timeout: FIRST_RENDER_TIMEOUT,
      });
    });
  });
});
