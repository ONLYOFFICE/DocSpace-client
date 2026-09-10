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

import {
  DOCS_CONNECT_FROZEN_NOW,
  docsConnectHandlers,
} from "@docspace/shared/__mocks__/handlers";
import type { DocsConnectPreset } from "@docspace/shared/__mocks__/handlers";
import { PaymentMethodStatus } from "@docspace/shared/enums";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { Page } from "@playwright/test";

import { expect, test, TEST_PORT } from "./fixtures/base";
import { apiUrl, jsonResponse, useSaasBilling } from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const DOCS_CONNECT_ROUTE = "/billing/addons/docs-connect";
const REQUEST_PATH = "portal/payment/request";
const DEPOSIT_PATH = "portal/payment/deposit";
const UPDATE_WALLET_PATH = "portal/payment/updatewallet";
const FIRST_RENDER = { timeout: 15000 };

const servicePageHandlers = () => [
  http.get(apiUrl("portal/payment/customer/operations"), () =>
    jsonResponse({ collection: [] }),
  ),
  http.get(apiUrl("portal/payment/customer/usage"), () =>
    jsonResponse({ collection: [] }),
  ),
  http.get(apiUrl("portal/payment/topupsettings"), () =>
    jsonResponse({ enabled: false, minBalance: 10, upToBalance: 100 }),
  ),
  http.post(apiUrl(REQUEST_PATH), () => jsonResponse(true)),
  http.post(apiUrl(DEPOSIT_PATH), () => jsonResponse(true)),
];

const trackRequests = (page: Page, method: string, path: string) => {
  const bodies: string[] = [];

  page.on("request", (request) => {
    if (
      request.method() === method &&
      new URL(request.url()).pathname.endsWith(`/${path}`)
    )
      bodies.push(request.postData() ?? "");
  });

  return bodies;
};

const submitButton = (page: Page) =>
  page.getByTestId("docs_connect_buy_plan_submit");
const usersInput = (page: Page) => page.getByTestId("quantity_picker_input");
const devPackToggle = (page: Page) =>
  page.getByTestId("docs_connect_devpack_toggle").locator("label");
const minusButton = (page: Page) => page.getByTestId("quantity_picker_minus_icon");

// Each preset opens the panel through its own call to action on the service page.
const openPanel = async (page: Page, baseUrl: string, action: string) => {
  await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

  const button = page.getByRole("button", { name: action, exact: true });
  await expect(button).toBeVisible(FIRST_RENDER);
  await button.click();

  await expect(submitButton(page)).toBeVisible();
};

const shot = (name: string) => ["desktop", "docs-connect-plan", name];

test.describe("Docs Connect plan panel", () => {
  const usePreset = (
    mockRequest: Parameters<typeof useSaasBilling>[0],
    preset: DocsConnectPreset,
    balance?: number,
    saas: Parameters<typeof useSaasBilling>[1] = {},
  ) => {
    useSaasBilling(mockRequest, saas);
    mockRequest.use(
      ...servicePageHandlers(),
      ...docsConnectHandlers(TEST_PORT, preset, { balance }),
    );
  };

  test.beforeEach(async ({ page }) => {
    await page.clock.setSystemTime(new Date(DOCS_CONNECT_FROZEN_NOW));
  });

  test("more than 999 users turn into a request to the sales team", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "trialExpired");
    const requests = trackRequests(page, "POST", REQUEST_PATH);

    await openPanel(page, baseUrl, "Upgrade");
    await usersInput(page).fill("1000");

    await expect(page.getByText("999+", { exact: true })).toHaveCount(2);
    await expect(
      page.getByText(
        "A Docs Connect subscription for more than 999 users is available upon request.",
      ),
    ).toBeVisible();
    await expect(submitButton(page)).toHaveText("Send request");
    await expect(page.getByText("Total monthly")).toHaveCount(0);

    await expectScreenshot(page, shot("over-limit.png"));

    await submitButton(page).click();

    await expect(page.getByText("Sales department request")).toBeVisible();
    await page.getByTestId("request_name_input").fill("Test Payer");
    await page.getByTestId("request_email_input").fill("payer@example.com");
    await page
      .getByTestId("request_description_textarea")
      .fill("We need Docs Connect for 1200 users.");
    await page.getByRole("button", { name: "Send", exact: true }).click();

    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toContain("payer@example.com");
    await expect(
      page.getByText("Your message was successfully sent."),
    ).toBeVisible();
  });

  test("the Dev Pack raises the minimum to ten users", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "trialExpired");

    await openPanel(page, baseUrl, "Upgrade");
    await usersInput(page).fill("3");
    await expect(page.getByText("$2.00 per user/month")).toBeVisible();

    await devPackToggle(page).click();

    await expect(usersInput(page)).toHaveValue("10");
    await expect(page.getByText("Dev Pack per user")).toBeVisible();
    await expect(page.getByText("$3.00", { exact: true })).toBeVisible();
    await expect(page.getByText("$50.00", { exact: true })).toBeVisible();

    await minusButton(page).click();

    await expect(usersInput(page)).toHaveValue("10");

    await expectScreenshot(page, shot("dev-pack-minimum.png"));
  });

  test("editing without a change keeps the plan as it is", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "paid");

    await openPanel(page, baseUrl, "Edit subscription");

    await expect(usersInput(page)).toHaveValue("50");
    await expect(submitButton(page)).toHaveText("Upgrade");
    await expect(submitButton(page)).toBeDisabled();

    await devPackToggle(page).click();
    await minusButton(page).hover();

    await expect(
      page.getByText("User reduction isn't available when upgrading to Dev Pack."),
    ).toBeVisible();
    await expect(usersInput(page)).toHaveValue("50");
  });

  test("a canceled plan is renewed with its previous size", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "canceled");
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openPanel(page, baseUrl, "Buy");

    await expect(page.getByText("Renew subscription", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("Your previous Docs Connect plan")).toBeVisible();
    await expect(usersInput(page)).toHaveValue("50");
    await expect(submitButton(page)).toHaveText("Renew subscription");

    await expectScreenshot(page, shot("renew.png"));

    await submitButton(page).click();

    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"docscloud":50');
    await expect(page.getByText("Your plan has been purchased")).toBeVisible();
  });

  test("isDelayedPaymentMethod sends a deactivated plan to the wallet top-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "deactivated", 10, { isDelayedPaymentMethod: true });
    const deposits = trackRequests(page, "POST", DEPOSIT_PATH);
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    const button = page.getByRole("button", { name: "Top up wallet", exact: true });
    await expect(button).toBeVisible(FIRST_RENDER);
    await button.click();

    await expect(page.getByTestId("top_up_amount_input").first()).toHaveValue(
      "90",
    );
    expect(deposits).toHaveLength(0);
    expect(purchases).toHaveLength(0);

    await expectScreenshot(page, shot("deactivated-top-up-wallet.png"));
  });

  test("isDelayedPaymentMethod turns a short-balance upgrade into a wallet top-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "paid", 1, { isDelayedPaymentMethod: true });
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openPanel(page, baseUrl, "Edit subscription");
    await usersInput(page).fill("100");

    await expect(submitButton(page)).toHaveText("Top up wallet");
    await expect(
      page.getByText(
        "There aren't enough credits for the selected Docs Connect subscription. Top up your Wallet, then return to complete the purchase.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, shot("top-up-wallet.png"));

    await submitButton(page).click();

    await expect(page.getByTestId("top_up_amount_input").first()).toBeVisible();
    await expect(submitButton(page)).toBeHidden();
    expect(purchases).toHaveLength(0);

    await page.getByTestId("first_topup_cancel").click();

    await expect(submitButton(page)).toBeVisible();
  });

  test("a delayed payment method picked in Stripe checkout closes the panel with a settlement notice", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "paid", 1, { card: "unlinked" });
    mockRequest.use(
      http.get(apiUrl("portal/payment/checkoutsetupurl"), () =>
        jsonResponse("https://example.com/checkout"),
      ),
    );

    await openPanel(page, baseUrl, "Edit subscription");
    await usersInput(page).fill("100");
    await expect(submitButton(page)).toHaveText("Top up & Buy");

    mockRequest.use(
      http.get(apiUrl("portal/payment/customerinfo"), () =>
        jsonResponse({
          portalId: null,
          paymentMethodStatus: PaymentMethodStatus.Set,
          isDelayedPaymentMethod: true,
          email: "test@gmail.com",
          payer: { displayName: "Test Payer", hasAvatar: false },
        }),
      ),
    );

    const checkout = page.waitForEvent("popup");
    await submitButton(page).click();
    await checkout;

    await expect(submitButton(page)).toBeHidden({ timeout: 15_000 });
    await expect(
      page.getByText(
        "Bank transfers may take several business days to process. Credits will be added to your Wallet only after the funds arrive.",
      ),
    ).toBeVisible();
    await expect(page.getByText("Your plan has been purchased")).toHaveCount(0);
  });

  test("a deactivated plan is paid again with a top-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    usePreset(mockRequest, "deactivated", 10);
    const deposits = trackRequests(page, "POST", DEPOSIT_PATH);
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openPanel(page, baseUrl, "Top up & Renew");

    await expect(
      page.getByText("Available credits: $10.00 | Insufficient funds"),
    ).toBeVisible();
    await expect(usersInput(page)).toHaveValue("50");
    await expect(submitButton(page)).toHaveText("Top up & Pay");
    await expect(
      page.getByText(
        "Your wallet will be topped up by $90.00 and the selected subscription will be purchased automatically.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, shot("top-up-and-pay.png"));

    await submitButton(page).click();

    await expect.poll(() => deposits.length).toBe(1);
    expect(deposits[0]).toContain('"amount":90');
    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"docscloud":50');
    await expect(page.getByText("Your plan has been purchased")).toBeVisible();
  });
});
