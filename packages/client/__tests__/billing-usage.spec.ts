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
import type { Page, Request } from "@playwright/test";

import { expect, test } from "./fixtures/base";
import { PAID_NOW, apiUrl, jsonResponse, useSaasBilling } from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const USAGE_PATH = "portal/payment/customer/usage";
const MONTHLY_PATH = "portal/payment/customer/usage/monthly";
const REPORT_PATH = "portal/payment/customer/usage/report";
const MONTHLY_REPORT_PATH = "portal/payment/customer/usage/monthly/report";
const OPERATIONS_REPORT_PATH = "portal/payment/customer/operationsreport";

const SERVICE_USAGE = [
  {
    service: "admin",
    serviceUnit: "admins",
    currency: "USD",
    totalQuantity: 31,
    totalAmount: 6820,
    operationCount: 1,
    title: "Business plan",
    price: 220,
    subscription: true,
  },
  {
    service: "storage",
    serviceUnit: "GB",
    currency: "USD",
    totalQuantity: 500,
    totalAmount: 40,
    operationCount: 1,
    title: "Disk storage",
    price: 0.08,
    subscription: true,
  },
  {
    service: "ai-tools",
    serviceUnit: "requests",
    currency: "USD",
    totalQuantity: 1250,
    totalAmount: 12.5,
    operationCount: 1250,
    title: "AI services",
    price: 0.01,
    subscription: false,
  },
];

const MONTHLY_USAGE = [
  { year: 2025, month: 12, currency: "USD", totalAmount: 6872.5, operationCount: 1252 },
  { year: 2025, month: 11, currency: "USD", totalAmount: 6820, operationCount: 1 },
];

const usageHandler = (collection: unknown[] = SERVICE_USAGE) =>
  http.get(apiUrl(USAGE_PATH), () => jsonResponse({ collection }));

const monthlyHandler = (rows: unknown[] = MONTHLY_USAGE) =>
  http.get(apiUrl(MONTHLY_PATH), () => jsonResponse(rows));

// No resultFileUrl: the page opens it at once and would navigate away.
const reportHandlers = () =>
  [REPORT_PATH, MONTHLY_REPORT_PATH, OPERATIONS_REPORT_PATH].flatMap(
    (path) => [
      http.post(apiUrl(path), () => jsonResponse(true)),
      http.get(apiUrl(path), () => jsonResponse({ isCompleted: true })),
    ],
  );

// The usage path is a prefix of the monthly one, so match the whole pathname.
const trackRequests = (page: Page, path: string, method = "GET") => {
  const urls: string[] = [];

  page.on("request", (request: Request) => {
    if (
      request.method() === method &&
      new URL(request.url()).pathname.endsWith(`/${path}`)
    )
      urls.push(request.url());
  });

  return urls;
};

const openUsage = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/billing/usage`);

  await expect(page.getByText("Total spend")).toBeVisible();
  await expect(page.getByText("Spending breakdown")).toBeVisible();
};

test.describe("Billing usage", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    mockRequest.use(usageHandler(), monthlyHandler(), ...reportHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the spend of the current month is broken down by service", async ({
    page,
    baseUrl,
  }) => {
    await openUsage(page, baseUrl);

    await expect(page.getByText("$6,872.50")).toBeVisible();
    await expect(page.getByText("For December 2025")).toBeVisible();

    await expect(page.getByText("Business plan")).toBeVisible();
    await expect(page.getByText("$6,820.00")).toBeVisible();
    await expect(page.getByText("Disk storage")).toBeVisible();
    await expect(page.getByText("$40.00")).toBeVisible();
    await expect(page.getByText("AI services")).toBeVisible();
    await expect(page.getByText("$12.50")).toBeVisible();
    await expect(page.getByText("requests: 1,250")).toBeVisible();

    await expect(page.getByTestId("usage_download_report")).toBeVisible();

    await expectScreenshot(page, ["desktop", "usage", "by-services.png"]);
  });

  test("a period without spend says so and offers no report", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(usageHandler([]), monthlyHandler([]));

    await openUsage(page, baseUrl);

    await expect(
      page.getByText("No spending activity for the selected period"),
    ).toBeVisible();
    await expect(page.getByTestId("usage_download_report")).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "usage", "empty.png"]);
  });

  test("the period menu offers every period, the current one first", async ({
    page,
    baseUrl,
  }) => {
    await openUsage(page, baseUrl);

    await page.getByTestId("usage_period_combobox").click();

    const menu = page.getByTestId("usage_period_dropdown");
    await expect(menu).toBeVisible();

    const options = menu.locator('[data-testid^="usage_period_"]');
    await expect(options).toHaveText([
      "This month (December)",
      "Last month (November)",
      "Last 3 months",
      "Last 6 months",
      "Last 12 months",
      "This year (2025)",
      "Last year (2024)",
    ]);

    await expectScreenshot(page, ["desktop", "usage", "period-menu.png"]);

    // The combobox closes via its backdrop; the page keeps another one mounted, so the live one is last.
    await page.getByTestId("backdrop").last().click();
    await expect(menu).toBeHidden();
    await expect(page.getByText("For December 2025")).toBeVisible();
  });

  test("picking another period reloads the spend for its range", async ({
    page,
    baseUrl,
  }) => {
    const requests = trackRequests(page, USAGE_PATH);

    await openUsage(page, baseUrl);
    await expect(page.getByText("For December 2025")).toBeVisible();

    await page.getByTestId("usage_period_combobox").click();
    await page.getByTestId("usage_period_lastMonth").click();

    await expect(page.getByText("For November 2025")).toBeVisible();
    await expect
      .poll(() => requests.at(-1))
      .toContain("StartDate=2025-11-01T00:00:00");
    expect(requests.at(-1)).toContain("EndDate=2025-11-30T23:59:59");
  });

  test("the by-month view lists every month of the period, newest first", async ({
    page,
    baseUrl,
  }) => {
    await openUsage(page, baseUrl);

    await page.getByTestId("usage_period_combobox").click();
    await page.getByTestId("usage_period_last3Months").click();
    await page.getByTestId("month_subtab").click();

    const rows = page.getByTestId("usage_row_download");
    await expect(rows).toHaveCount(2);
    await expect(page.getByText("December 2025")).toBeVisible();
    await expect(page.getByText("November 2025")).toBeVisible();
    await expect(page.getByText("October 2025")).toBeVisible();

    await expectScreenshot(page, ["desktop", "usage", "by-month.png"]);
  });

  test("the report is ordered for the shown period and view", async ({
    page,
    baseUrl,
  }) => {
    const posted: string[] = [];
    page.on("request", (request) => {
      if (request.method() === "POST" && request.url().includes("/report"))
        posted.push(`${new URL(request.url()).pathname} ${request.postData()}`);
    });

    await openUsage(page, baseUrl);

    await page.getByTestId("usage_download_report").click();
    await expect.poll(() => posted.length).toBe(1);

    expect(posted[0]).toContain(`${USAGE_PATH}/report`);
    expect(posted[0]).toContain('"startDate":"2025-12-01T00:00:00"');
    expect(posted[0]).toContain('"endDate":"2025-12-10T23:59:59"');
    expect(posted[0]).toContain('"credit":true');
    expect(posted[0]).toContain('"debit":true');

    await page.getByTestId("month_subtab").click();
    await page.getByTestId("usage_download_report").click();

    await expect.poll(() => posted.length).toBe(2);
    expect(posted[1]).toContain(`${MONTHLY_PATH}/report`);
  });

  test("a single service is reported through the operations report", async ({
    page,
    baseUrl,
  }) => {
    const posted: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes(OPERATIONS_REPORT_PATH)
      )
        posted.push(request.postData() ?? "");
    });

    await openUsage(page, baseUrl);

    await page.getByTestId("usage_row_download").first().click();

    await expect.poll(() => posted.length).toBe(1);
    expect(posted[0]).toContain('"serviceName":"admin"');
  });

  test("a service row opens the page that service is billed from", async ({
    page,
    baseUrl,
  }) => {
    await openUsage(page, baseUrl);

    await page
      .getByTestId("usage_row_expand")
      .filter({ hasText: "Disk storage" })
      .click();

    await page.waitForURL("**/billing/addons/disk-storage**");
  });

  test("the tariff row opens the tariff plan page", async ({
    page,
    baseUrl,
  }) => {
    await openUsage(page, baseUrl);

    await page
      .getByTestId("usage_row_expand")
      .filter({ hasText: "Business plan" })
      .click();

    await page.waitForURL("**/billing/tariff-plan**");
  });
});
