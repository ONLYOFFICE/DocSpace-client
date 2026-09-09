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
  jsonResponse,
  serviceStateHandler,
  storageSubscriptionTariff,
  useSaasBilling,
  walletServicesHandler,
  balanceHandler,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const STORAGE_ROUTE = "/billing/addons/disk-storage";
const CALCULATE_PATH = "portal/payment/calculatewallet";
const UPDATE_WALLET_PATH = "portal/payment/updatewallet";
const REQUEST_PATH = "portal/payment/request";
// The size input is debounced and the upgrade price comes from the server.
const AFTER_ESTIMATE = { timeout: 15000 };

type StorageState = {
  size: number;
  quota: { state?: number; nextQuantity?: number; grace?: boolean };
};

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
  serviceStateHandler(),
];

// The wallet mock applies a purchase to the tariff the page reads back.
const purchaseHandlers = (state: StorageState, partialFee = 0) => [
  storageSubscriptionTariff(() => state.size, state.quota),
  http.put(apiUrl(CALCULATE_PATH), () => jsonResponse({ amount: partialFee })),
  http.put(apiUrl(UPDATE_WALLET_PATH), async ({ request }) => {
    const body = (await request.json()) as {
      quantity: { storage: number | null } | null;
      productQuantityType: number;
    };
    const storage = body.quantity?.storage ?? 0;

    if (body.productQuantityType === 1) {
      state.size += storage;
      state.quota.state = undefined;
    } else {
      state.quota.nextQuantity = storage;
    }

    return jsonResponse(true);
  }),
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

const okButton = (page: Page) =>
  page.getByTestId("storage_plan_upgrade_ok_button");
const dialog = (page: Page) =>
  page.getByTestId("modal").filter({ has: okButton(page) });
const serviceToggle = (page: Page) =>
  page.getByTestId("toggle-button").first().locator("label");

const openStorage = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${STORAGE_ROUTE}`);

  await expect(
    page.getByText("Adjust the storage to the exact amount you require"),
  ).toBeVisible(AFTER_ESTIMATE);
};

const openEditDialog = async (page: Page) => {
  await page.getByRole("button", { name: "Edit subscription", exact: true }).click();
  await expect(okButton(page)).toBeVisible();
};

const fillSize = async (page: Page, sizeGb: string) => {
  await dialog(page).locator("input").fill(sizeGb);
};

const shot = (name: string) => ["desktop", "storage-plan", name];

test.describe("Storage plan dialog", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...walletServicesHandler(), ...servicePageHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("an upgrade is priced for the rest of the period and applied", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const state: StorageState = { size: 200, quota: {} };
    mockRequest.use(...purchaseHandlers(state, 8.67));
    const estimates = trackRequests(page, "PUT", CALCULATE_PATH);
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openStorage(page, baseUrl);
    await openEditDialog(page);
    await fillSize(page, "300");

    await expect(dialog(page).getByText("Total due today")).toBeVisible(
      AFTER_ESTIMATE,
    );
    await expect(dialog(page).getByText("$8.67", { exact: true })).toBeVisible(
      AFTER_ESTIMATE,
    );
    await expect(dialog(page).getByText("+100 GB", { exact: true })).toBeVisible();
    await expect(
      dialog(page).getByText("26 days (until January 5, 2026)"),
    ).toBeVisible();
    await expect(dialog(page).getByText("300 GB in total")).toBeVisible();
    await expect(
      dialog(page).getByText("Remaining balance after purchase: $41.33"),
    ).toBeVisible();
    await expect(
      dialog(page).getByText(
        "Your next monthly bill will be $30.00 starting from January 5, 2026",
      ),
    ).toBeVisible();
    await expect(okButton(page)).toHaveText("Update");
    await expect(okButton(page)).toBeEnabled(AFTER_ESTIMATE);
    expect(estimates.at(-1)).toContain('"storage":100');
    expect(estimates.at(-1)).toContain('"productQuantityType":1');

    await expectScreenshot(page, shot("upgrade.png"));

    await okButton(page).click();

    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"storage":100');
    expect(purchases[0]).toContain('"productQuantityType":1');
    await expect(okButton(page)).toBeHidden();
    await expect(page.getByText("300 GB", { exact: true })).toBeVisible();
  });

  test("isDelayedPaymentMethod turns a short-balance upgrade into a wallet top-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { isDelayedPaymentMethod: true });
    const state: StorageState = { size: 200, quota: {} };
    mockRequest.use(...purchaseHandlers(state, 64), balanceHandler(50));
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openStorage(page, baseUrl);
    await openEditDialog(page);
    await fillSize(page, "300");

    await expect(dialog(page).getByText("Total due today")).toBeVisible(
      AFTER_ESTIMATE,
    );
    await expect(okButton(page)).toHaveText("Top up wallet", AFTER_ESTIMATE);
    await expect(
      dialog(page).getByText(
        "Your Wallet will be topped up by $14.00. Return after the funds arrive to purchase additional storage.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, shot("top-up-wallet.png"));

    await okButton(page).click();

    await expect(page.getByTestId("top_up_amount_input").first()).toHaveValue(
      "14",
    );
    await expect(okButton(page)).toBeHidden();
    expect(purchases).toHaveLength(0);

    await page.getByTestId("first_topup_cancel").click();

    await expect(okButton(page)).toBeVisible();
  });

  test("a downgrade is scheduled for the next period with a warning", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const state: StorageState = { size: 200, quota: {} };
    mockRequest.use(...purchaseHandlers(state));
    const estimates = trackRequests(page, "PUT", CALCULATE_PATH);
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openStorage(page, baseUrl);
    await openEditDialog(page);
    await fillSize(page, "100");

    await expect(dialog(page).getByText("Reduced storage")).toBeVisible(
      AFTER_ESTIMATE,
    );
    await expect(dialog(page).getByText("-100 GB", { exact: true })).toBeVisible();
    await expect(dialog(page).getByText("New monthly price")).toBeVisible();
    await expect(dialog(page).getByText("$10.00", { exact: true })).toBeVisible();
    await expect(dialog(page).getByText("Effective date")).toBeVisible();
    await expect(
      dialog(page).getByText(
        "You will keep your full 200 GB access until the end of your paid billing period.",
      ),
    ).toBeVisible();
    await expect(okButton(page)).toHaveText("Update");
    await expect(okButton(page)).toBeEnabled(AFTER_ESTIMATE);
    expect(estimates).toHaveLength(0);

    await expectScreenshot(page, shot("downgrade.png"));

    await okButton(page).click();

    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"storage":100');
    expect(purchases[0]).toContain('"productQuantityType":0');
    await expect(page.getByText("Change scheduled: Storage adjustment")).toBeVisible(
      AFTER_ESTIMATE,
    );
    await expect(page.getByText("$10.00/month (100 GB)")).toBeVisible();
  });

  test("less than 100 GB is refused", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(...purchaseHandlers({ size: 200, quota: {} }));

    await openStorage(page, baseUrl);
    await openEditDialog(page);
    await fillSize(page, "50");

    await expect(dialog(page).getByText("min 100 GB")).toBeVisible(AFTER_ESTIMATE);
    await expect(okButton(page)).toBeDisabled();

    await expectScreenshot(page, shot("min-error.png"));
  });

  test("more than 9999 GB turns into a request to the sales team", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...purchaseHandlers({ size: 200, quota: {} }),
      http.post(apiUrl(REQUEST_PATH), () => jsonResponse(true)),
    );
    const requests = trackRequests(page, "POST", REQUEST_PATH);

    await openStorage(page, baseUrl);
    await openEditDialog(page);
    await fillSize(page, "10000");

    await expect(dialog(page).getByText("9999+ GB in total")).toBeVisible(
      AFTER_ESTIMATE,
    );
    await expect(okButton(page)).toHaveText("Send request");
    await expect(okButton(page)).toBeEnabled(AFTER_ESTIMATE);

    await okButton(page).click();

    await expect(page.getByText("Sales department request")).toBeVisible();
    await expect(
      page.getByText("The sales team will contact you after creating the request."),
    ).toBeVisible();
    await page.getByTestId("request_name_input").fill("Test Payer");
    await page.getByTestId("request_email_input").fill("payer@example.com");
    await page
      .getByTestId("request_description_textarea")
      .fill("We need 12 TB of additional storage.");

    await expectScreenshot(page, shot("sales-request.png"));

    await page.getByRole("button", { name: "Send", exact: true }).click();

    await expect.poll(() => requests.length).toBe(1);
    expect(requests[0]).toContain("payer@example.com");
    await expect(
      page.getByText("Your message was successfully sent."),
    ).toBeVisible();
  });

  test("the cancellation is confirmed and scheduled for the period end", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const state: StorageState = { size: 200, quota: {} };
    mockRequest.use(...purchaseHandlers(state));
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openStorage(page, baseUrl);
    await serviceToggle(page).click();

    await expect(page.getByText("Subscription cancellation")).toBeVisible();
    await expect(
      page.getByText(
        "Are you sure you want to cancel your additional storage subscription?",
      ),
    ).toBeVisible();
    await expect(page.getByText("Your current plan:")).toBeVisible();
    await expect(page.getByText("200 GB ($20.00/month)")).toBeVisible();

    await expectScreenshot(page, shot("cancel.png"));

    await page.getByTestId("storage_plan_cancel_ok_button").click();

    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"storage":0');
    expect(purchases[0]).toContain('"productQuantityType":0');
    await expect(
      page.getByText("Change scheduled: Subscription cancellation"),
    ).toBeVisible(AFTER_ESTIMATE);
    await expect(
      page.getByText(
        "Subscription will be automatically canceled on January 5, 2026",
      ),
    ).toBeVisible();
  });

  test("in the grace period the subscription cannot be changed", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { tariff: "grace" });
    mockRequest.use(...purchaseHandlers({ size: 200, quota: { grace: true } }));
    await page.clock.setSystemTime(GRACE_NOW);

    await openStorage(page, baseUrl);
    await page.getByRole("button", { name: "Edit subscription", exact: true }).click();

    await expect(page.getByText("Warning", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Service management is unavailable during the grace period"),
    ).toBeVisible();
    await expect(page.getByTestId("grace_period_info")).toContainText(
      "Grace period is effective",
    );
    await expect(okButton(page)).toHaveCount(0);

    await expectScreenshot(page, shot("grace-modal.png"));

    await page.getByTestId("grace_period_ok_button").click();

    await page.waitForURL("**/billing/tariff-plan");
  });

  test("a deactivated plan can be removed from the page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...purchaseHandlers({ size: 200, quota: { state: 1 } }));

    await openStorage(page, baseUrl);
    await page.getByTestId("close_storage_tariff_deactivated_button").click();
    await expect(page.getByText("Previous subscription")).toBeVisible();

    await page
      .getByRole("button", { name: "Remove subscription", exact: true })
      .click();

    await expect(
      page.getByText("Your previous subscription details will be removed."),
    ).toBeVisible();

    await expectScreenshot(page, shot("remove.png"));

    await page.getByTestId("remove_storage_subscription_button").click();

    await expect(page.getByText("No active subscription")).toBeVisible();
    await expect(page.getByText("Previous subscription")).toHaveCount(0);
  });

  test("a deactivated plan is renewed with its previous size", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const state: StorageState = { size: 200, quota: { state: 1 } };
    mockRequest.use(...purchaseHandlers(state));
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await openStorage(page, baseUrl);
    await page.getByTestId("close_storage_tariff_deactivated_button").click();
    await page
      .getByRole("button", { name: "Renew subscription", exact: true })
      .click();

    await expect(okButton(page)).toBeVisible();
    await expect(dialog(page).locator("input")).toHaveValue("200");
    await expect(okButton(page)).toHaveText("Upgrade now");
    await expect(okButton(page)).toBeEnabled(AFTER_ESTIMATE);

    await expectScreenshot(page, shot("renew.png"));

    await okButton(page).click();

    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"storage":200');
    expect(purchases[0]).toContain('"productQuantityType":1');
    await expect(okButton(page)).toBeHidden(AFTER_ESTIMATE);
    await expect(page.getByText("Current subscription")).toBeVisible();
    await expect(page.getByText("Previous subscription")).toHaveCount(0);
  });
});
