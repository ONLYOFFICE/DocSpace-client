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
  PATH_TARIFF,
  tariffSuccess,
} from "@docspace/shared/__mocks__/handlers/portal/tariff";
import { quotaSuccess } from "@docspace/shared/__mocks__/handlers/portal/quota";
import { TARIFF_DUE_DATE_EXPIRED } from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";

import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/base";
import {
  PAID_NOW,
  apiUrl,
  balanceHandler,
  jsonResponse,
  payerWarning,
  planButton,
  useSaasBilling,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

// The store takes the quota with wallet: true, additional: false as the main tariff; nextQuantity schedules a change.
const walletTariffHandler = (nextQuantity?: number) =>
  http.get(apiUrl(PATH_TARIFF), () => {
    const body = tariffSuccess(
      false,
      false,
      false,
      false,
      TARIFF_DUE_DATE_EXPIRED,
    );

    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          quotas: [
            {
              id: 1,
              quantity: 31,
              wallet: true,
              additional: false,
              ...(nextQuantity === undefined ? {} : { nextQuantity }),
            },
          ],
        },
      }),
    );
  });

const calculateWalletHandler = (amount: number) =>
  http.put(apiUrl("portal/payment/calculatewallet"), () =>
    jsonResponse({ amount }),
  );

// The estimate request is debounced by a second.
const AFTER_ESTIMATE = { timeout: 15000 };

const walletServicesHandler = () =>
  http.get(apiUrl("portal/payment/walletservices"), () => jsonResponse([]));

test.describe("Tariff plan recalculation", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(
      walletTariffHandler(),
      // 93.5 pins the Math.ceil: the pill must show 94.
      calculateWalletHandler(93.5),
      walletServicesHandler(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("adding a manager shows the prorated due-today price", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(balanceHandler(500));

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toBeVisible();
    await expect(page.getByText("Total due today")).toHaveCount(0);

    await page.getByTestId("quantity_picker_plus_icon").click();

    await expect(page.getByText("Total due today")).toBeVisible();
    await expect(
      page.getByText("$94", { exact: true }),
    ).toBeVisible(AFTER_ESTIMATE);
    await expect(page.getByText("$7,040").first()).toBeVisible();

    await expect(planButton(page)).toBeEnabled();
    await expect(planButton(page)).toContainText(
      "Pay $94 & Upgrade",
      AFTER_ESTIMATE,
    );

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "upgrade-due-today.png",
    ]);
  });

  test("a short balance turns the upgrade into a top-up", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toBeVisible();
    await page.getByTestId("quantity_picker_plus_icon").click();

    await expect(
      page.getByText("$94", { exact: true }),
    ).toBeVisible(AFTER_ESTIMATE);
    await expect(planButton(page)).toBeEnabled();
    await expect(planButton(page)).toContainText(
      "Top up & Upgrade",
      AFTER_ESTIMATE,
    );
  });

  test("removing a manager schedules the downgrade for the period end", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toBeVisible();
    await page.getByTestId("quantity_picker_minus_icon").click();

    await expect(page.getByText("Total due today")).toBeVisible();
    await expect(page.getByText("$0", { exact: true })).toBeVisible();
    await expect(page.getByText("$6,600").first()).toBeVisible();

    const downgradeButton = page.getByTestId("downgrade_plan_button");
    await expect(downgradeButton).toBeEnabled();
    await expect(downgradeButton).toContainText("Schedule change");

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "downgrade-schedule.png",
    ]);
  });

  test("a scheduled admins change locks the calculator", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(walletTariffHandler(20));

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(
      page.getByText(/Change scheduled: Admin adjustment/),
    ).toBeVisible();
    await expect(page.getByText("Cancel change")).toBeVisible();
    await expect(
      page.getByText("$4,400/month (Admins: 20 | $220 per admin)"),
    ).toBeVisible();

    await expect(page.getByTestId("quantity_picker_input")).toHaveCount(0);
    await expect(planButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "scheduled-change.png",
    ]);
  });

  test("the due-today hint opens the order summary with the page's figures", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(balanceHandler(500));

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toBeVisible();
    await page.getByTestId("quantity_picker_plus_icon").click();
    await expect(
      page.getByText("$94", { exact: true }),
    ).toBeVisible(AFTER_ESTIMATE);

    const pageButtonLabel = ((await planButton(page).textContent()) ?? "").trim();

    await page.getByTestId("due_today_info_button").click();

    const dialog = modalWith(page, "Price Details");
    await expect(dialog).toHaveCount(1);

    await expect(dialog).toContainText("Admin adjustment");
    await expect(dialog).toContainText("31 → 32");
    await expect(dialog).toContainText("Additional admins");
    await expect(dialog).toContainText("+1");
    await expect(dialog).toContainText("Price per admin");
    await expect(dialog).toContainText("$220");
    await expect(dialog).toContainText("Remaining period");
    await expect(dialog).toContainText("until January 5, 2026");
    await expect(dialog).toContainText("Total due today");
    await expect(dialog).toContainText("$94");
    await expect(dialog).toContainText(
      "Your next monthly bill will be $7,040 starting from January 5, 2026",
    );
    await expect(dialog.getByTestId("price_details_due_today_help")).toHaveCount(
      1,
    );

    const confirmButton = dialog.getByTestId("price_details_pay_button");
    await expect(confirmButton).toBeEnabled();
    await expect(confirmButton).toContainText(pageButtonLabel);

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "price-details-upgrade.png",
    ]);

    await dialog.getByTestId("price_details_cancel_button").click();
    await expect(dialog).toHaveCount(0);
    await expect(planButton(page)).toContainText(pageButtonLabel);
  });

  test("the downgrade hint opens the confirmation of the scheduled change", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toBeVisible();
    await page.getByTestId("quantity_picker_minus_icon").click();
    await expect(page.getByText("$0", { exact: true })).toBeVisible();

    const pageButtonLabel = (
      (await page.getByTestId("downgrade_plan_button").textContent()) ?? ""
    ).trim();

    await page.getByTestId("due_today_info_button").click();

    const dialog = modalWith(page, "Confirmation");
    await expect(dialog).toHaveCount(1);
    await expect(modalWith(page, "Price Details")).toHaveCount(0);

    await expect(dialog).toContainText("31 → 30");
    await expect(dialog).toContainText("Reduced admins");
    await expect(dialog).toContainText("-1");
    await expect(dialog).toContainText("New monthly price");
    await expect(dialog).toContainText("$6,600");
    await expect(dialog).toContainText("Effective date");
    await expect(dialog).toContainText("January 5, 2026");
    await expect(dialog).toContainText("Total due today");
    await expect(dialog).toContainText("$0");
    await expect(dialog.getByTestId("price_details_due_today_help")).toHaveCount(
      0,
    );
    await expect(dialog).toContainText(
      "Your current 31-admin limit remains until the end of your billing period",
    );

    await expect(dialog.getByTestId("price_details_pay_button")).toContainText(
      pageButtonLabel,
    );

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "price-details-downgrade.png",
    ]);
  });
});

// The page keeps another closed modal mounted, and the modal wrapper has no box of its own.
const modalWith = (page: Page, text: string) =>
  page.getByTestId("modal").filter({ hasText: text });

type TQuotaFeature = {
  id?: string;
  value?: number;
  used?: { value?: number; title?: string };
};

const MANAGER_FEATURE = "manager";
const STORAGE_FEATURE = "total_size";

// manager.value is the plan size, manager.used the assigned admins, total_size.used the stored bytes.
const quotaWithCounts = ({
  admins,
  usedAdmins,
  usedStorage,
}: {
  admins: number;
  usedAdmins: number;
  usedStorage?: number;
}) =>
  http.get(apiUrl("portal/payment/quota"), () => {
    const body = quotaSuccess(false, false, false, true);
    const features = body.response.features as unknown as TQuotaFeature[];

    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          features: features.map((feature) => {
            if (feature.id === MANAGER_FEATURE)
              return {
                ...feature,
                value: admins,
                used: { ...feature.used, value: usedAdmins },
              };

            if (feature.id === STORAGE_FEATURE && usedStorage !== undefined)
              return {
                ...feature,
                used: { ...feature.used, value: usedStorage },
              };

            return feature;
          }),
        },
      }),
    );
  });

test.describe("Tariff plan downgrade refused by quota", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(walletTariffHandler(), walletServicesHandler());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("2 assigned admins block a downgrade to 1", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(quotaWithCounts({ admins: 2, usedAdmins: 2 }));

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toHaveValue("2");
    await page.getByTestId("quantity_picker_minus_icon").click();
    await expect(page.getByTestId("quantity_picker_input")).toHaveValue("1");

    const downgradeButton = page.getByTestId("downgrade_plan_button");
    await expect(downgradeButton).toContainText("Schedule change");
    await downgradeButton.click();

    const dialog = modalWith(page, "Change pricing plan");
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toContainText("You cannot change your plan because");
    await expect(dialog).toContainText(
      "You wish to downgrade the team to 1 admins, and current number of such users in the workspace is 2.",
    );
    await expect(dialog).toContainText(
      "New tariff's limitation is 250 GB of storage, and your current used storage is 13.73 GB.",
    );
    await expect(dialog).toContainText(
      "Please eliminate the mismatch in the conflicting parameter",
    );

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "downgrade-refused-admins.png",
    ]);

    await dialog.locator(".ok-button").click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByTestId("quantity_picker_input")).toHaveValue("1");
  });

  test("used storage blocks a downgrade the admin count allows", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      quotaWithCounts({
        admins: 3,
        usedAdmins: 1,
        usedStorage: 600 * 1024 ** 3,
      }),
    );

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toHaveValue("3");
    await page.getByTestId("quantity_picker_minus_icon").click();
    await expect(page.getByTestId("quantity_picker_input")).toHaveValue("2");

    await page.getByTestId("downgrade_plan_button").click();

    const dialog = modalWith(page, "Change pricing plan");
    await expect(dialog).toHaveCount(1);
    await expect(dialog).toContainText(
      "You wish to downgrade the team to 2 admins, and current number of such users in the workspace is 1.",
    );
    await expect(dialog).toContainText(
      "New tariff's limitation is 500 GB of storage, and your current used storage is 600 GB.",
    );

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "downgrade-refused-storage.png",
    ]);
  });
});

test.describe("Startup plan", () => {
  test("any admin is invited to make the first purchase", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "admin",
      plan: "startup",
      payer: "none",
      card: "unlinked",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByText("You are using free Startup plan")).toBeVisible();
    await expect(page.getByText("Do more with Business plan")).toBeVisible();

    await expect(payerWarning(page)).toHaveCount(0);
    await expect(planButton(page)).toBeEnabled();
    await expect(planButton(page)).toContainText("Top up & Upgrade");
    await expect(page.getByText("Total due today")).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "startup-first-purchase.png",
    ]);
  });

  test("the first purchase is routed through Stripe checkout", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "admin",
      plan: "startup",
      payer: "none",
      card: "unlinked",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);
    await expect(planButton(page)).toBeEnabled();
    await planButton(page).click();

    const dialog = modalWith(page, "Continue to Stripe");
    await expect(dialog).toHaveCount(1);
    await expect(dialog.getByTestId("top_up_amount_input").first()).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "startup-first-topup.png",
    ]);

    await dialog.getByTestId("first_topup_cancel").click();
    await expect(dialog).toHaveCount(0);
  });

  test("a card linked on Startup makes the purchase payer-only", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "admin",
      plan: "startup",
      payer: "foreign",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByText("You are using free Startup plan")).toBeVisible();
    await expect(payerWarning(page)).toBeVisible();
    await expect(planButton(page)).toBeDisabled();
  });
});

test.describe("Migration to wallet billing", () => {
  // currency is the subscription's, walletCurrency the wallet's; when they differ the dialog adds a conversion row.
  const subscriptionBalanceHandler = ({
    currency = "USD",
    walletCurrency = "USD",
    remainingBalance = 8000,
    remainingBalanceInWalletCurrency = 8000,
  } = {}) =>
    http.get(apiUrl("portal/payment/subscription/balance"), () =>
      jsonResponse({
        currency,
        walletCurrency,
        remainingBalance,
        remainingBalanceInWalletCurrency,
        totalCost: 6820,
        daysElapsed: 5,
        periodStart: "2025-12-05T00:00:00.0000000Z",
        periodEnd: "2026-01-05T00:00:00.0000000Z",
        periodUsedUntil: "2025-12-10T00:00:00.0000000Z",
      }),
    );

  const moveToWalletHandler = () =>
    http.post(apiUrl("portal/payment/subscription/movetowallet"), () =>
      jsonResponse(true),
    );

  const openMigrationDialog = async (page: Page, baseUrl: string) => {
    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toHaveValue("31");
    await page.getByTestId("quantity_picker_plus_icon").click();

    await expect(page.getByText("Total due today")).toHaveCount(0);
    await expect(planButton(page)).toContainText("Upgrade now");
    await planButton(page).click();

    const dialog = modalWith(page, "Switch to wallet billing");
    await expect(dialog).toHaveCount(1);

    return dialog;
  };

  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(moveToWalletHandler());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("a refund that covers the new plan leaves nothing due on the card", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(subscriptionBalanceHandler());

    const dialog = await openMigrationDialog(page, baseUrl);

    await expect(dialog).toContainText("Billing via Stripe stops today");
    await expect(dialog).toContainText("Current tariff");
    await expect(dialog).toContainText("$6,820 /mo");
    await expect(dialog).toContainText("until January 5, 2026");
    await expect(dialog).toContainText("Refund to wallet");
    await expect(dialog).toContainText("+ $8,000.00");
    await expect(dialog).not.toContainText("Unused value refund");

    await expect(dialog).toContainText("Admins: 32 × $220");
    await expect(dialog).toContainText("$7,040 /mo");
    await expect(dialog).toContainText("From your wallet");
    await expect(dialog).toContainText("- $7,040.00");
    await expect(dialog).toContainText("Due on your card today");
    await expect(dialog).toContainText("$0.00");

    await expect(dialog).toContainText("Active until January 5, 2026");

    const confirmButton = dialog.getByTestId("migrate_to_wallet_confirm_button");
    await expect(confirmButton).toContainText("Upgrade now");
    await expect(confirmButton).toBeDisabled();

    await dialog.getByTestId("migrate_to_wallet_agree_checkbox").click();
    await expect(confirmButton).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "migrate-covered-by-refund.png",
    ]);

    await dialog.getByTestId("migrate_to_wallet_cancel_button").click();
    await expect(dialog).toHaveCount(0);
  });

  test("a short refund leaves the rest on the card and names the amount", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      subscriptionBalanceHandler({
        currency: "EUR",
        walletCurrency: "USD",
        remainingBalance: 900,
        remainingBalanceInWalletCurrency: 1000,
      }),
    );

    const dialog = await openMigrationDialog(page, baseUrl);

    await expect(dialog).toContainText("Unused value refund");
    await expect(dialog).toContainText("\u20ac900.00");
    await expect(dialog).toContainText("+ $1,000.00");
    await expect(dialog).toContainText("Wallet credits are stored and used in USD");

    await expect(dialog).toContainText("- $1,050.00");
    await expect(dialog).toContainText("Due on your card today");
    await expect(dialog).toContainText("$5,990.00");

    const confirmButton = dialog.getByTestId("migrate_to_wallet_confirm_button");
    await expect(confirmButton).toContainText("Pay $5,990.00");
    await expect(confirmButton).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "tariff-plan",
      "migrate-card-charge.png",
    ]);
  });

  test("confirming sends the new admin count and closes the dialog", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(subscriptionBalanceHandler());

    const payloads: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("subscription/movetowallet")
      )
        payloads.push(request.postData() ?? "");
    });

    const dialog = await openMigrationDialog(page, baseUrl);

    await dialog.getByTestId("migrate_to_wallet_agree_checkbox").click();
    await dialog.getByTestId("migrate_to_wallet_confirm_button").click();

    await expect(dialog).toHaveCount(0);

    expect(payloads).toHaveLength(1);
    // The migration sends the absolute count; the ordinary upgrade sends the difference.
    expect(payloads[0]).toContain('"adminwallet":32');
  });
});
