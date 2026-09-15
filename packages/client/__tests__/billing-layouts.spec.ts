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
  PAID_NOW,
  apiUrl,
  jsonResponse,
  serviceFeeHandler,
  serviceStateHandler,
  storageSubscriptionTariff,
  useSaasBilling,
  walletServicesHandler,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const FIRST_RENDER = { timeout: 15000 };

// Under 600px the shell switches to the phone layout, under 1024px to the tablet one.
const VIEWPORTS = [
  { key: "mobile", size: { width: 390, height: 844 } },
  { key: "tablet", size: { width: 900, height: 1024 } },
] as const;

type BillingPage = {
  key: string;
  route: string;
  ready: (page: Page) => ReturnType<Page["getByText"]>;
};

const PAGES: BillingPage[] = [
  {
    key: "overview",
    route: "/billing/overview",
    ready: (page) => page.getByText("Current plan", { exact: true }),
  },
  {
    key: "wallet",
    route: "/billing/wallet",
    ready: (page) => page.getByText("Available credits", { exact: true }),
  },
  {
    key: "tariff-plan",
    route: "/billing/tariff-plan",
    ready: (page) => page.getByText("Benefits", { exact: true }),
  },
  {
    key: "addons",
    route: "/billing/addons",
    ready: (page) => page.getByText("$2.00 per 1 backup", { exact: true }),
  },
  {
    key: "disk-storage",
    route: "/billing/addons/disk-storage",
    ready: (page) => page.getByText("Storage added"),
  },
  {
    key: "usage",
    route: "/billing/usage",
    ready: (page) => page.getByText("Spending breakdown"),
  },
  {
    key: "payment-method",
    route: "/billing/payment-method",
    ready: (page) => page.getByText("Test Payer", { exact: true }),
  },
];

const TRANSACTIONS = [
  {
    date: "2025-12-09T10:15:00.0000000Z",
    description: "AI services",
    details: "Requests",
    sourceId: "10",
    sourceTitle: "Assistant",
    sourceType: "Agent",
    serviceUnit: "requests",
    quantity: 120,
    participantDisplayName: "Admin User",
    debit: 1.2,
    credit: 0,
    currency: "USD",
  },
  {
    date: "2025-12-01T08:00:00.0000000Z",
    description: "Wallet top-up",
    details: "Card",
    serviceUnit: "",
    quantity: 0,
    participantDisplayName: "Administrator",
    debit: 0,
    credit: 100,
    currency: "USD",
  },
];

const USAGE = [
  {
    service: "disk-storage",
    serviceUnit: "GB",
    currency: "USD",
    totalQuantity: 200,
    totalAmount: 20,
    operationCount: 1,
    title: "Disk storage",
    price: 0.1,
    subscription: true,
  },
  {
    service: "ai-tools",
    serviceUnit: "tokens",
    currency: "USD",
    totalQuantity: 12345,
    totalAmount: 1.5,
    operationCount: 8,
    title: "AI services",
    price: 0,
    subscription: false,
  },
];

const MONTHLY_USAGE = [
  { year: 2025, month: 12, currency: "USD", totalAmount: 21.5, operationCount: 9 },
  { year: 2025, month: 11, currency: "USD", totalAmount: 20, operationCount: 1 },
];

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
    service: "ai-tools",
    serviceUnit: "tokens",
    subscription: false,
    title: "AI services",
    limit: 0,
    used: null,
  },
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
    amount: 6820,
    currency: "USD",
  },
];

// One data set that every billing page can render something meaningful from.
const billingHandlers = () => [
  ...walletServicesHandler(["aitools"]),
  serviceFeeHandler(),
  serviceStateHandler(),
  storageSubscriptionTariff(200),
  http.get(apiUrl("portal/payment/customer/operations"), () =>
    jsonResponse({ collection: TRANSACTIONS }),
  ),
  http.get(apiUrl("portal/payment/customer/usage"), () =>
    jsonResponse({ collection: USAGE }),
  ),
  http.get(apiUrl("portal/payment/customer/usage/monthly"), () =>
    jsonResponse(MONTHLY_USAGE),
  ),
  http.get(apiUrl("portal/tariff/upcoming"), () => jsonResponse(UPCOMING)),
  http.get(apiUrl("portal/payment/activeservices"), () =>
    jsonResponse(ACTIVE_SERVICES),
  ),
  http.get(apiUrl("portal/payment/topupsettings"), () =>
    jsonResponse({ enabled: false, minBalance: 10, upToBalance: 100 }),
  ),
];

const openPage = async (page: Page, baseUrl: string, billingPage: BillingPage) => {
  await page.goto(`${baseUrl}${billingPage.route}`);
  await expect(billingPage.ready(page)).toBeVisible(FIRST_RENDER);
};

for (const viewport of VIEWPORTS) {
  test.describe(`Billing on a ${viewport.key}`, () => {
    test.use({ viewport: viewport.size });

    test.beforeEach(async ({ mockRequest, page }) => {
      useSaasBilling(mockRequest);
      mockRequest.use(...billingHandlers());
      await page.clock.setSystemTime(PAID_NOW);
    });

    for (const billingPage of PAGES) {
      test(`the ${billingPage.key} page fits the ${viewport.key} layout`, async ({
        page,
        baseUrl,
      }) => {
        await openPage(page, baseUrl, billingPage);

        await expectScreenshot(page, [
          viewport.key,
          "billing",
          `${billingPage.key}.png`,
        ]);
      });
    }
  });
}

test.describe("Billing in the dark theme", () => {
  // The stand-in users keep the System theme, so the OS scheme decides.
  test.use({ colorScheme: "dark" });

  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...billingHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  for (const billingPage of PAGES.filter((item) =>
    ["overview", "wallet", "tariff-plan", "addons", "disk-storage"].includes(item.key),
  )) {
    test(`the ${billingPage.key} page follows the dark theme`, async ({
      page,
      baseUrl,
    }) => {
      await openPage(page, baseUrl, billingPage);

      await expectScreenshot(page, ["dark", "billing", `${billingPage.key}.png`]);
    });
  }
});
