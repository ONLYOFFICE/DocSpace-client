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
  useSaasBilling,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const DEPOSITS_PATH = "portal/payment/customer/deposits";

type Deposit = {
  id: number;
  date: string;
  amount: number;
  currency: string;
  status: "Pending" | "Completed" | "Rejected" | "Canceled";
  hasInvoice: boolean;
  initiator: "Manual" | "Automatic";
};

const DEPOSITS: Deposit[] = [
  {
    id: 15342,
    date: "2025-12-01T08:00:00.0000000Z",
    amount: 100,
    currency: "USD",
    status: "Completed",
    hasInvoice: true,
    initiator: "Manual",
  },
  {
    id: 15201,
    date: "2025-11-20T14:30:00.0000000Z",
    amount: 50,
    currency: "USD",
    status: "Completed",
    hasInvoice: true,
    initiator: "Automatic",
  },
  {
    id: 15100,
    date: "2025-11-12T09:05:00.0000000Z",
    amount: 25,
    currency: "USD",
    status: "Completed",
    hasInvoice: true,
    initiator: "Manual",
  },
];

const depositsPage = (collection: Deposit[]) => ({
  collection,
  offset: 0,
  limit: 25,
  totalQuantity: collection.length,
  totalPage: 1,
  currentPage: 1,
});

const depositsHandler = (collection: Deposit[] = DEPOSITS) =>
  http.get(apiUrl(DEPOSITS_PATH), ({ request }) => {
    const initiator = new URL(request.url).searchParams.get("initiator");
    const rows = initiator
      ? collection.filter((deposit) => deposit.initiator === initiator)
      : collection;

    return jsonResponse(depositsPage(rows));
  });

const invoiceUrlHandler = (baseUrl: string) =>
  http.get(apiUrl(`${DEPOSITS_PATH}/:id/invoice`), ({ params }) =>
    jsonResponse(`${baseUrl}/invoice-${params.id}.pdf`),
  );

const trackQueries = (page: Page, path: string) => {
  const queries: URLSearchParams[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());

    if (request.method() === "GET" && url.pathname.endsWith(`/${path}`))
      queries.push(url.searchParams);
  });

  return queries;
};

const openInvoices = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/billing/invoices`);

  await expect(
    page.getByText("Invoices", { exact: true }).first(),
  ).toBeVisible();
};

const invoiceLinks = (page: Page) => page.getByTestId("invoice_link");

const initiatorCombobox = (page: Page) =>
  page.getByTestId("invoice_initiator_combobox");

const clearFilter = (page: Page) =>
  page.getByTestId("invoice_clear_filter_button");

test.describe("Billing invoices", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("lists the completed top-ups of the last four weeks with their type and invoice", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositsHandler());
    const queries = trackQueries(page, DEPOSITS_PATH);

    await openInvoices(page, baseUrl);

    await expect(
      page.getByText("View invoices for your completed wallet top-ups."),
    ).toBeVisible();
    await expect(page.getByTestId("invoice_date")).toHaveCount(3);
    await expect(page.getByText("$100.00")).toBeVisible();
    await expect(page.getByText("$50.00")).toBeVisible();
    await expect(page.getByText("$25.00")).toBeVisible();
    await expect(page.getByText("Manual", { exact: true })).toHaveCount(2);
    await expect(page.getByText("Automatic", { exact: true })).toHaveCount(1);
    await expect(invoiceLinks(page)).toHaveCount(3);

    // The default filter: every completed top-up of the last four weeks.
    await expect(initiatorCombobox(page)).toContainText("All top-ups");
    await expect(clearFilter(page)).toHaveCount(0);
    await expect.poll(() => queries.length).toBe(1);
    expect(queries[0].get("status")).toBe("Completed");
    expect(queries[0].get("startDate")).toBe("2025-11-12T00:00:00");
    expect(queries[0].get("endDate")).toBe("2025-12-10T23:59:59");
    expect(queries[0].get("initiator")).toBeNull();
    expect(queries[0].get("offset")).toBe("0");
    expect(queries[0].get("limit")).toBe("25");

    await expectScreenshot(page, ["desktop", "invoices", "list.png"]);
  });

  test("the type filter narrows the list and Clear filter widens it again", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositsHandler());
    const queries = trackQueries(page, DEPOSITS_PATH);

    await openInvoices(page, baseUrl);
    await expect(invoiceLinks(page)).toHaveCount(3);

    await initiatorCombobox(page).click();
    await page.getByTestId("automatic_top_ups_option").click();

    await expect.poll(() => queries.length).toBe(2);
    expect(queries[1].get("initiator")).toBe("Automatic");
    await expect(page.getByTestId("invoice_date")).toHaveCount(1);
    await expect(page.getByText("$50.00")).toBeVisible();
    await expect(initiatorCombobox(page)).toContainText("Automatic top-ups");

    await expectScreenshot(page, ["desktop", "invoices", "filtered.png"]);

    await clearFilter(page).click();

    await expect.poll(() => queries.length).toBe(3);
    expect(queries[2].get("initiator")).toBeNull();
    await expect(page.getByTestId("invoice_date")).toHaveCount(3);
    await expect(clearFilter(page)).toHaveCount(0);
  });

  test("a filter nothing matches says so and keeps the filter row", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    // Only manual top-ups exist, so the automatic filter finds nothing.
    mockRequest.use(
      depositsHandler(
        DEPOSITS.filter((deposit) => deposit.initiator === "Manual"),
      ),
    );

    await openInvoices(page, baseUrl);
    await expect(invoiceLinks(page)).toHaveCount(2);

    await initiatorCombobox(page).click();
    await page.getByTestId("automatic_top_ups_option").click();

    await expect(page.getByText("No findings found")).toBeVisible();
    await expect(
      page.getByText(
        "No invoices match this filter. Try another or remove the filter to view all invoices.",
      ),
    ).toBeVisible();
    await expect(initiatorCombobox(page)).toBeVisible();
    await expect(clearFilter(page)).toBeVisible();

    await expectScreenshot(page, ["desktop", "invoices", "filtered-empty.png"]);
  });

  test("View invoice opens the provider's page in a new tab", async ({
    page,
    baseUrl,
    mockRequest,
    context,
  }) => {
    mockRequest.use(depositsHandler(), invoiceUrlHandler(baseUrl));

    await openInvoices(page, baseUrl);
    await expect(invoiceLinks(page)).toHaveCount(3);

    const invoice = context.waitForEvent("page");
    await invoiceLinks(page).first().click();

    await expect(await invoice).toHaveURL(/\/invoice-15342\.pdf$/);
  });

  test("a wallet that was never topped up shows the empty state", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositsHandler([]));

    await openInvoices(page, baseUrl);

    await expect(page.getByText("No invoices yet")).toBeVisible();
    await expect(
      page.getByText("Invoices for your wallet top-ups will appear here."),
    ).toBeVisible();
    await expect(invoiceLinks(page)).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "invoices", "empty.png"]);
  });

  test("a portal that is not a billing customer yet gets the empty state too", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(http.get(apiUrl(DEPOSITS_PATH), () => jsonResponse(null)));

    await openInvoices(page, baseUrl);

    await expect(page.getByText("No invoices yet")).toBeVisible();
  });
});

test.describe("Billing invoices on a phone", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(depositsHandler());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the filter folds into an icon and applies from the panel", async ({
    page,
    baseUrl,
  }) => {
    const queries = trackQueries(page, DEPOSITS_PATH);

    await openInvoices(page, baseUrl);
    await expect(invoiceLinks(page)).toHaveCount(3);
    await expect(page.getByText("Manual top-up", { exact: true })).toHaveCount(
      2,
    );

    await expect(initiatorCombobox(page)).toHaveCount(0);
    await page.getByTestId("invoice_filter_icon").click();

    await expect(page.getByText("Top-up period")).toBeVisible();
    await expect(page.getByTestId("apply_filter_button")).toBeDisabled();

    await initiatorCombobox(page).click();
    await page.getByTestId("automatic_top_ups_option").click();
    await expect(page.getByTestId("apply_filter_button")).toBeEnabled();

    await expectScreenshot(page, ["mobile", "invoices", "filter-panel.png"]);

    expect(queries).toHaveLength(1);
    await page.getByTestId("apply_filter_button").click();

    await expect.poll(() => queries.length).toBe(2);
    expect(queries[1].get("initiator")).toBe("Automatic");
    await expect(
      page.getByText("Automatic top-up", { exact: true }),
    ).toHaveCount(1);
    await expect(page.getByText("Manual top-up", { exact: true })).toHaveCount(
      0,
    );
  });
});
