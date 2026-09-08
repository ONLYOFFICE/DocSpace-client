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

import { http } from "msw";

import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/base";
import {
  GRACE_NOW,
  PAID_NOW,
  apiUrl,
  balanceHandler,
  jsonResponse,
  useSaasBilling,
  walletServicesHandler,
} from "./helpers/billing";

// The overview is taller than the default viewport, so the shots take the whole page in.
test.use({
  locale: "en-US",
  timezoneId: "UTC",
  viewport: { width: 1440, height: 1400 },
});

const OVERVIEW_ROUTE = "/billing/overview";
const FIRST_RENDER = { timeout: 15000 };
const NON_PAYER = { user: "admin", payer: "foreign" } as const;

const ACTIVE_SERVICES = [
  {
    service: "disk-storage",
    serviceUnit: "GB",
    subscription: true,
    title: "Disk storage",
    limit: 200,
    used: 120,
  },
  {
    service: "backup",
    serviceUnit: "backup",
    subscription: false,
    title: "Backups",
    limit: 0,
    used: 3,
  },
  {
    service: "ai-tools",
    serviceUnit: "tokens",
    subscription: false,
    title: "AI services",
    limit: 0,
    used: null,
  },
];

const usageRow = (overrides: Record<string, unknown>) => ({
  currency: "USD",
  operationCount: 1,
  price: 0,
  subscription: false,
  ...overrides,
});

const MONTH_USAGE = [
  usageRow({
    service: "disk-storage",
    serviceUnit: "GB",
    title: "Disk storage",
    totalQuantity: 200,
    totalAmount: 20,
    subscription: true,
    price: 0.1,
  }),
  usageRow({
    service: "backup",
    serviceUnit: "backup",
    title: "Backups",
    totalQuantity: 3,
    totalAmount: 6,
    price: 2,
  }),
  usageRow({
    service: "ai-tools",
    serviceUnit: "tokens",
    title: "AI services",
    totalQuantity: 12345,
    totalAmount: 1.5,
  }),
];

const UPCOMING = [
  {
    id: 1,
    name: "admin",
    title: "Business plan",
    unitOfMeasure: "admins",
    quantity: 31,
    wallet: true,
    dueDate: "2026-01-05T00:00:00.0000000Z",
    amount: 60,
    currency: "USD",
  },
];

const overviewHandlers = ({
  services = [] as unknown[],
  usage = [] as unknown[],
  upcoming = [] as unknown[],
} = {}) => [
  http.get(apiUrl("portal/payment/activeservices"), () => jsonResponse(services)),
  http.get(apiUrl("portal/payment/customer/usage"), () =>
    jsonResponse({ collection: usage }),
  ),
  http.get(apiUrl("portal/tariff/upcoming"), () => jsonResponse(upcoming)),
  http.get(apiUrl("portal/payment/customer/operations"), () =>
    jsonResponse({ collection: [] }),
  ),
  http.get(apiUrl("portal/payment/topupsettings"), () =>
    jsonResponse({ enabled: false, minBalance: 10, upToBalance: 100 }),
  ),
];

const topUpButton = (page: Page) => page.getByTestId("overview_top_up_button");
const autoTopUpButton = (page: Page) =>
  page.getByTestId("overview_auto_top_up_button");
const planButton = (page: Page) => page.getByTestId("overview_edit_plan_button");

const openOverview = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${OVERVIEW_ROUTE}`);

  await expect(page.getByText("Current plan", { exact: true })).toBeVisible(
    FIRST_RENDER,
  );
};

test.describe("Billing overview", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...walletServicesHandler(), ...overviewHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the payer sees the wallet, the plan, the spend and the add-ons at a glance", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...overviewHandlers({
        services: ACTIVE_SERVICES,
        usage: MONTH_USAGE,
        upcoming: UPCOMING,
      }),
    );

    await openOverview(page, baseUrl);

    await expect(
      page.getByText("A snapshot of your wallet, subscription, add-ons, and upcoming charges."),
    ).toBeVisible();
    await expect(page.getByText("Available credits", { exact: true })).toBeVisible();
    await expect(topUpButton(page)).toBeEnabled();
    await expect(autoTopUpButton(page)).toBeEnabled();
    await expect(
      page.getByText("Top up $10 before January 5 to cover your next payment."),
    ).toBeVisible();
    await expect(planButton(page)).toHaveText("Upgrade plan");

    await expect(page.getByText("Spending in December")).toBeVisible();
    await expect(page.getByText("Subscriptions", { exact: true })).toBeVisible();
    await expect(page.getByText("Pay as you go", { exact: true })).toBeVisible();

    await expect(page.getByText("Active add-ons")).toBeVisible();
    for (const title of ["Disk storage", "Backups", "AI services"])
      await expect(page.getByText(title, { exact: true })).toBeVisible();

    await expect(page.getByText("Upcoming payments")).toBeVisible();
    await expect(page.getByText("Business plan", { exact: true })).toBeVisible();

    await expect(page.getByText("Payment method linked")).toBeVisible();
    await expect(page.getByText("Test Payer", { exact: true })).toBeVisible();

    await expectScreenshot(page, ["desktop", "overview", "payer.png"]);
  });

  test("a non-payer gets the same picture without the wallet actions", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);
    mockRequest.use(
      ...overviewHandlers({
        services: ACTIVE_SERVICES.filter((item) => !item.subscription),
        usage: MONTH_USAGE.filter((item) => !item.subscription),
        upcoming: UPCOMING,
      }),
    );

    await openOverview(page, baseUrl);

    await expect(page.getByText("Available credits", { exact: true })).toBeVisible();
    await expect(topUpButton(page)).toHaveCount(0);
    await expect(autoTopUpButton(page)).toHaveCount(0);
    await expect(page.getByText("Test Payer", { exact: true })).toBeVisible();
    await expect(page.getByText("No charges yet")).toBeVisible();
    await expect(
      page.getByText("Tariff plan and add-on subscriptions will appear here"),
    ).toBeVisible();

    await expectScreenshot(page, ["desktop", "overview", "non-payer.png"]);
  });

  test("without activity every card explains what will appear", async ({
    page,
    baseUrl,
  }) => {
    await openOverview(page, baseUrl);

    await expect(
      page.getByText("No spending activity for the selected period"),
    ).toBeVisible();
    await expect(page.getByText("No active add-ons")).toBeVisible();
    await expect(page.getByText("No upcoming payments")).toBeVisible();

    await expectScreenshot(page, ["desktop", "overview", "empty.png"]);
  });

  test("the free plan shows its limits and asks for a payment method", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { payer: "none", plan: "startup" });

    await openOverview(page, baseUrl);

    await expect(page.getByText("No payment method linked")).toBeVisible();
    await expect(
      page.getByText("The person who adds it will automatically be assigned as the Payer"),
    ).toBeVisible();
    await expect(
      page.getByTestId("overview_manage_payment_method_link"),
    ).toHaveText("Manage");
    await expect(page.getByText(/admins \| .* rooms \| /)).toBeVisible();
    await expect(topUpButton(page)).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "overview", "startup.png"]);
  });

  test("in the grace period the overdue plan asks to top up and renew", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { tariff: "grace" });
    mockRequest.use(balanceHandler(5));
    await page.clock.setSystemTime(GRACE_NOW);

    await openOverview(page, baseUrl);

    await expect(page.getByText("Insufficient credits. Top up")).toBeVisible();
    await expect(page.getByText("Overdue payment:")).toBeVisible();
    await expect(planButton(page)).toHaveText("Top up & Renew");
    await expect(autoTopUpButton(page)).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "overview", "grace.png"]);
  });

  test("an unlinked card is reported on the payment method card", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { card: "unlinked" });

    await openOverview(page, baseUrl);

    await expect(page.getByText("Payment method unlinked", { exact: true })).toBeVisible();
    await expect(
      page.getByTestId("overview_manage_payment_method_link"),
    ).toHaveText("Add payment method");
  });

  test("the cards lead to their sections", async ({ page, baseUrl }) => {
    await openOverview(page, baseUrl);
    await page.getByTestId("overview_manage_addons_link").click();
    await page.waitForURL("**/billing/addons");

    await openOverview(page, baseUrl);
    await page.getByTestId("overview_view_usage_link").click();
    await page.waitForURL("**/billing/usage");

    await openOverview(page, baseUrl);
    await page.getByTestId("overview_upcoming_details_link").click();
    await page.waitForURL("**/billing/wallet**");

    await openOverview(page, baseUrl);
    await page.getByTestId("overview_manage_payment_method_link").click();
    await page.waitForURL("**/billing/payment-method");

    await openOverview(page, baseUrl);
    await planButton(page).click();
    await page.waitForURL("**/billing/tariff-plan");
  });

  test("the top-up button opens the top-up dialog", async ({ page, baseUrl }) => {
    await openOverview(page, baseUrl);

    await topUpButton(page).click();

    await expect(page.getByTestId("top_up_amount_input").first()).toBeVisible();
  });
});
