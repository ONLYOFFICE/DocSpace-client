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
  docsConnectPayerHandler,
  DOCS_CONNECT_FROZEN_NOW,
  PATH_DOCS_CONNECT_CALC_DEVPACK,
  PATH_DOCS_CONNECT_SWITCH_DEVPACK,
  PATH_UPDATE_WALLET,
} from "@docspace/shared/__mocks__/handlers";
import type { BrowserContext, Page } from "@playwright/test";
import type {
  DocsConnectPreset,
  DocsConnectHandlersOptions,
} from "@docspace/shared/__mocks__/handlers";
import { expect, test, TEST_PORT } from "./fixtures/base";
import type { WorkerFixture } from "@docspace/shared/__mocks__/e2e";

test.use({ timezoneId: "UTC" });

const DOCS_CONNECT_ROUTE = "/portal-settings/developer-tools/docs-connect";
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

const usePreset = (
  mockRequest: WorkerFixture,
  preset: DocsConnectPreset,
  options?: DocsConnectHandlersOptions,
) => {
  mockRequest.use(
    settingsHandler(TEST_PORT, TypeSettings.Authenticated),
    colorThemeHandler(TEST_PORT),
    ...docsConnectHandlers(TEST_PORT, preset, options),
  );
};

const openFromTrial = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);
  await expect(
    page.getByTestId("docs_connect_trial_upgrade_button"),
  ).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
  await page.getByTestId("docs_connect_trial_upgrade_button").click();
  await expect(page.getByTestId("docs_connect_buy_plan_submit")).toBeVisible();
};

const openFromPaid = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);
  await expect(
    page.getByTestId("docs_connect_edit_subscription_link"),
  ).toBeVisible({ timeout: FIRST_RENDER_TIMEOUT });
  await page.getByTestId("docs_connect_edit_subscription_link").click();
  await expect(page.getByTestId("docs_connect_buy_plan_submit")).toBeVisible();
};

const setUsers = async (page: Page, value: string) => {
  const input = page.getByTestId("quantity_picker_input");
  await input.fill(value);
};

const waitForUpdateWallet = (page: Page) =>
  page.waitForRequest(
    (request) =>
      request.method() === "PUT" && request.url().includes(PATH_UPDATE_WALLET),
  );

test.beforeEach(async ({ context }) => {
  await freezeTime(context, FROZEN_NOW_MS);
});

test.describe("Docs Connect buy plan panel", () => {
  test.describe("new purchase", () => {
    test("renders defaults and order summary", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trial");

      await openFromTrial(page, baseUrl);

      await expect(page.getByTestId("quantity_picker_input")).toHaveValue(
        "50",
      );
      await expect(page.getByText("Total monthly")).toBeVisible();
      await expect(page.getByText("$100.00")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "buy-plan-new.png",
      ]);
    });

    test("recalculates total when Dev Pack is enabled", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trial");

      await openFromTrial(page, baseUrl);

      await page.getByTestId("docs_connect_devpack_toggle").click();

      await expect(page.getByText("$250.00").first()).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "buy-plan-devpack.png",
      ]);
    });

    test("buys plan with sufficient credits", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trial");

      await openFromTrial(page, baseUrl);

      const updateWalletRequest = waitForUpdateWallet(page);

      await page.getByTestId("docs_connect_buy_plan_submit").click();

      const body = (await updateWalletRequest).postDataJSON() as {
        quantity: Record<string, number | null>;
        productQuantityType: number;
      };

      expect(body.quantity).toEqual({ docscloud: 50 });
      expect(body.productQuantityType).toBe(1);

      await expect(
        page.getByText("Your plan has been purchased"),
      ).toBeVisible();
      await expect(
        page.getByTestId("docs_connect_buy_plan_submit"),
      ).toBeHidden();
    });

    test("shows insufficient funds state", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "trial", { balance: 10 });

      await openFromTrial(page, baseUrl);

      await expect(
        page.getByTestId("docs_connect_buy_plan_submit"),
      ).toHaveText("Top up & Buy");

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "buy-plan-insufficient.png",
      ]);
    });
  });

  test.describe("edit subscription", () => {
    test("upgrades users with prorated charge", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paid");

      await openFromPaid(page, baseUrl);

      await setUsers(page, "60");

      await expect(page.getByText("Total due today")).toBeVisible();
      await expect(page.getByText("$13.33")).toBeVisible();
      await expect(
        page.getByTestId("docs_connect_buy_plan_submit"),
      ).toHaveText("Upgrade");

      const updateWalletRequest = waitForUpdateWallet(page);

      await page.getByTestId("docs_connect_buy_plan_submit").click();

      const body = (await updateWalletRequest).postDataJSON() as {
        quantity: Record<string, number | null>;
        productQuantityType: number;
      };

      expect(body.quantity).toEqual({ docscloud: 10 });
      expect(body.productQuantityType).toBe(1);

      await expect(
        page.getByText("Your plan has been purchased"),
      ).toBeVisible();
    });

    test("schedules user reduction", async ({ page, baseUrl, mockRequest }) => {
      usePreset(mockRequest, "paid");

      await openFromPaid(page, baseUrl);

      await setUsers(page, "40");

      await expect(
        page.getByTestId("docs_connect_buy_plan_submit"),
      ).toHaveText("Schedule change");

      const updateWalletRequest = waitForUpdateWallet(page);

      await page.getByTestId("docs_connect_buy_plan_submit").click();

      const body = (await updateWalletRequest).postDataJSON() as {
        quantity: Record<string, number | null>;
        productQuantityType: number;
      };

      expect(body.quantity).toEqual({ docscloud: 40 });
      expect(body.productQuantityType).toBe(0);

      await expect(
        page.getByText("The change has been scheduled"),
      ).toBeVisible();
    });

    test("schedules Dev Pack disable", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paidDevPack");

      await openFromPaid(page, baseUrl);

      await page.getByTestId("docs_connect_devpack_toggle").click();

      await expect(
        page.getByTestId("docs_connect_buy_plan_submit"),
      ).toHaveText("Schedule change");

      const updateWalletRequest = waitForUpdateWallet(page);

      await page.getByTestId("docs_connect_buy_plan_submit").click();

      const body = (await updateWalletRequest).postDataJSON() as {
        quantity: Record<string, number | null>;
        productQuantityType: number;
      };

      expect(body.quantity).toEqual({ docsclouddevpack: 0 });
      expect(body.productQuantityType).toBe(0);

      await expect(
        page.getByText("The change has been scheduled"),
      ).toBeVisible();
    });

    test("upgrades to Dev Pack with server-side calculation", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paid");

      await openFromPaid(page, baseUrl);

      const calcRequest = page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes(PATH_DOCS_CONNECT_CALC_DEVPACK),
      );

      await page.getByTestId("docs_connect_devpack_toggle").click();
      await calcRequest;

      await expect(page.getByText("$90.00")).toBeVisible();
      await expect(page.getByText("$160.00")).toBeVisible();

      await expect(page).toHaveScreenshot([
        "desktop",
        "docs-connect",
        "buy-plan-devpack-upgrade.png",
      ]);

      const switchRequest = page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes(PATH_DOCS_CONNECT_SWITCH_DEVPACK),
      );

      await page.getByTestId("docs_connect_buy_plan_submit").click();

      const body = (await switchRequest).postDataJSON() as {
        quantity: number;
      };

      expect(body.quantity).toBe(50);

      await expect(
        page.getByText("Your plan has been purchased"),
      ).toBeVisible();
    });

    test("opens top-up dialog for Dev Pack upgrade without card", async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      usePreset(mockRequest, "paid", { balance: 10 });
      mockRequest.use(docsConnectPayerHandler(TEST_PORT, false));

      await openFromPaid(page, baseUrl);

      const calcRequest = page.waitForRequest(
        (request) =>
          request.method() === "POST" &&
          request.url().includes(PATH_DOCS_CONNECT_CALC_DEVPACK),
      );

      await page.getByTestId("docs_connect_devpack_toggle").click();
      await calcRequest;

      await expect(
        page.getByTestId("docs_connect_buy_plan_submit"),
      ).toHaveText("Top up & Buy");

      await page.getByTestId("docs_connect_buy_plan_submit").click();

      await expect(page.getByText("Top up credits")).toBeVisible();
    });
  });
});
