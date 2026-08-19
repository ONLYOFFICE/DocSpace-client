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

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import {
  colorThemeHandler,
  settingsHandler,
  TypeSettings,
  docsConnectHandlers,
  DOCS_CONNECT_FROZEN_NOW,
} from "@docspace/shared/__mocks__/handlers";
import type { BrowserContext } from "@playwright/test";
import type { DocsConnectPreset } from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

test.use({ timezoneId: "UTC" });

const ADDONS_ROUTE = "/billing/addons";
const SERVICE_ROUTE = "/billing/addons/docs-connect";
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

test.describe("Docs Connect addons card", () => {
  test("opens get started modal when not subscribed", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "noTenant");

    await page.goto(`${baseUrl}${ADDONS_ROUTE}`);

    const card = page.getByTestId("storage_service_docscloud");
    await expect(card).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await expectScreenshot(page, [
      "desktop",
      "docs-connect",
      "addons-card-not-subscribed.png",
    ]);

    await card.click();

    await expect(
      page.getByText("Run ONLYOFFICE editors inside your app"),
    ).toBeVisible();
  });

  test("renders trial card state", async ({ page, baseUrl, mockRequest }) => {
    usePreset(mockRequest, "trial");

    await page.goto(`${baseUrl}${ADDONS_ROUTE}`);

    const card = page.getByTestId("storage_service_docscloud");
    await expect(card).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
    await expect(card.getByTestId("storage_service_docscloud_toggle")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "docs-connect",
      "addons-card-trial.png",
    ]);
  });

  test("navigates to service page from expired trial card", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "trialExpired");

    await page.goto(`${baseUrl}${ADDONS_ROUTE}`);

    const upgradeLink = page.getByTestId("docs_connect_buy_plan_link");
    await expect(upgradeLink).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await upgradeLink.click();

    await page.waitForURL("**/billing/addons/docs-connect");
  });

  test("opens cancel dialog when toggling off paid subscription", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "paid");

    await page.goto(`${baseUrl}${ADDONS_ROUTE}`);

    const toggle = page.getByTestId("storage_service_docscloud_toggle");
    await expect(toggle).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await toggle.click();

    await expect(
      page.getByRole("dialog").getByText("Subscription cancellation"),
    ).toBeVisible();
  });
});

test.describe("Docs Connect service page", () => {
  test("renders paid subscription page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "paid");

    await page.goto(`${baseUrl}${SERVICE_ROUTE}`);

    await expect(page.getByText("$100.00").first()).toBeVisible({
      timeout: FIRST_RENDER_TIMEOUT,
    });

    await expectScreenshot(page, [
      "desktop",
      "docs-connect",
      "service-page-paid.png",
    ]);
  });

  test("opens buy plan panel from canceled service page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "canceled");

    await page.goto(`${baseUrl}${SERVICE_ROUTE}`);

    const buyButton = page.getByRole("button", { name: "Buy", exact: true });
    await expect(buyButton).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });

    await buyButton.click();

    await expect(
      page.getByTestId("docs_connect_buy_plan_submit"),
    ).toBeVisible();
  });

  test("renders promo when tenant is not created", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "noTenant");

    await page.goto(`${baseUrl}${SERVICE_ROUTE}`);

    await expect(page.getByTestId("docs_connect_promo")).toBeVisible({
      timeout: FIRST_RENDER_TIMEOUT,
    });
  });
});
