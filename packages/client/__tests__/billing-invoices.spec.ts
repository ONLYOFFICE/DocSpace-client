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
};

const DEPOSITS: Deposit[] = [
  {
    id: 15342,
    date: "2025-12-01T08:00:00.0000000Z",
    amount: 100,
    currency: "USD",
    status: "Completed",
    hasInvoice: true,
  },
  {
    id: 15201,
    date: "2025-11-20T14:30:00.0000000Z",
    amount: 50,
    currency: "USD",
    status: "Completed",
    hasInvoice: true,
  },
  {
    id: 15100,
    date: "2025-11-12T09:05:00.0000000Z",
    amount: 25,
    currency: "USD",
    status: "Completed",
    hasInvoice: true,
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
  http.get(apiUrl(DEPOSITS_PATH), () => jsonResponse(depositsPage(collection)));

const invoiceUrlHandler = (baseUrl: string) =>
  http.get(apiUrl(`${DEPOSITS_PATH}/:id/invoice`), ({ params }) =>
    jsonResponse(`${baseUrl}/invoice-${params.id}.pdf`),
  );

const trackQueries = (page: Page, path: string) => {
  const queries: string[] = [];

  page.on("request", (request) => {
    const url = new URL(request.url());

    if (request.method() === "GET" && url.pathname.endsWith(`/${path}`))
      queries.push(url.search);
  });

  return queries;
};

const openInvoices = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/billing/invoice-history`);

  await expect(
    page.getByText("Invoices", { exact: true }).first(),
  ).toBeVisible();
};

const invoiceLinks = (page: Page) => page.getByTestId("invoice_link");

test.describe("Billing invoices", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("lists the completed top-ups with a link to each invoice", async ({
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

    await expect(invoiceLinks(page)).toHaveCount(3);

    // The page asks for the first page of completed top-ups only.
    await expect.poll(() => queries.length).toBe(1);
    expect(queries[0]).toContain("status=Completed");
    expect(queries[0]).toContain("offset=0");
    expect(queries[0]).toContain("limit=25");

    await expectScreenshot(page, ["desktop", "invoices", "list.png"]);
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
