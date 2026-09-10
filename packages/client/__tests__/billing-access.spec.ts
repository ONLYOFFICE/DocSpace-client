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

import { usersByType } from "@docspace/shared/__mocks__/handlers";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/base";
import {
  GRACE_NOW,
  PAID_NOW,
  autoTopUpButton,
  payerWarning,
  planButton,
  topUpButton,
  useSaasBilling,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

test.describe("Billing route guard", () => {
  test("a member is sent to 401 from the tariff page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "regular" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);
    await page.waitForURL("**/error/401**");
  });

  test("a room admin is sent to 401 from the wallet", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "roomAdmin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);
    await page.waitForURL("**/error/401**");
  });

  test("a member is sent to 401 from the Stripe callback", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "regular" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-complete`);
    await page.waitForURL("**/error/401**");
  });

  test("an admin opens the tariff page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("payments-loader")).toHaveCount(0);
    await expect(page.getByTestId("saas-page")).toBeVisible();
  });

  test("the Stripe callback without payment params sends an admin to the wallet", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-complete`);
    await page.waitForURL("**/billing/wallet**");
  });
});

test.describe("Payer-only pages for a non-payer", () => {
  test("an admin gets the warning and a disabled top-up on the wallet", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);

    await expect(payerWarning(page)).toBeVisible();
    await expect(topUpButton(page)).toBeDisabled();
    await expect(autoTopUpButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "wallet-nonpayer-admin.png",
    ]);
  });

  test("an admin gets the warning and a disabled plan button on the tariff page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(payerWarning(page)).toBeVisible();
    await expect(planButton(page)).toBeDisabled();
    // A disabled picker renders text instead of the input.
    await expect(page.getByTestId("quantity_picker_input")).toHaveCount(0);
  });

  test("a non-payer owner is as limited as any admin on the wallet", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "foreign" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);

    await expect(payerWarning(page)).toBeVisible();
    await expect(topUpButton(page)).toBeDisabled();
  });

  test("the payment method page carries no payer warning", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);

    await expect(page.getByTestId("payer_email_link")).toBeVisible();
    await expect(payerWarning(page)).toHaveCount(0);
    await expect(page.getByTestId("go_to_stripe_button")).toHaveCount(0);
  });

  test("the warning's Learn more leads to the payment method page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);

    await expect(payerWarning(page)).toBeVisible();
    // The wallet description has a "Learn more" link of its own.
    await payerWarning(page).getByText("Learn more").click();

    await page.waitForURL("**/billing/payment-method**");
  });
});

test.describe("Payer view", () => {
  test("the payer tops up the wallet without a warning", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);

    await expect(topUpButton(page)).toBeEnabled();
    await expect(autoTopUpButton(page)).toBeEnabled();
    await expect(payerWarning(page)).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "wallet-payer.png",
    ]);
  });

  test("the payer changes the plan on the tariff page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByTestId("quantity_picker_input")).toBeVisible();
    await expect(planButton(page)).toBeDisabled();

    await page.getByTestId("quantity_picker_plus_icon").click();

    await expect(planButton(page)).toBeEnabled();
    await expect(payerWarning(page)).toHaveCount(0);
  });
});

test.describe("Payment method page payer identity", () => {
  test("a known payer is shown by name with a mailto link", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin", payer: "self-owner" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);

    await expect(page.getByText("Test Payer")).toBeVisible();

    const emailLink = page.getByTestId("payer_email_link");
    await expect(emailLink).toHaveAttribute("href", "mailto:test@gmail.com");

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "payment-method-known-payer.png",
    ]);
  });

  test("a departed payer offers the owner the Stripe portal", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "left" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);

    await expect(
      page.getByText("we recommend assigning a new Payer"),
    ).toBeVisible();
    await expect(
      page.getByTestId("stripe_customer_portal_link"),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "payment-method-departed-owner.png",
    ]);
  });

  test("a departed payer leaves an admin without the Stripe portal", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin", payer: "left" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);

    await expect(
      page.getByText("contacting the workspace owner to assign a new Payer"),
    ).toBeVisible();
    await expect(page.getByTestId("stripe_customer_portal_link")).toHaveCount(
      0,
    );

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "payment-method-departed-admin.png",
    ]);
  });
});

// Unpaid is a tariff state, not a date, but the wallet renders today-dependent text.
test.describe("Unpaid portal billing", () => {
  test("the sidebar collapses to Wallet and Tariff plan", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "owner", tariff: "unpaid" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(
      page.locator('[data-item-id="billing-wallet"]').first(),
    ).toBeVisible();
    await expect(
      page.locator('[data-item-id="billing-tariff-plan"]').first(),
    ).toBeVisible();

    for (const hidden of [
      "billing-overview",
      "billing-addons",
      "billing-payment-method",
      "billing-usage",
    ]) {
      await expect(page.locator(`[data-item-id="${hidden}"]`)).toHaveCount(0);
    }

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "unpaid-tariff-plan.png",
    ]);
  });

  test("the wallet stays reachable but read-only even for the payer", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      tariff: "unpaid",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);
    await page.waitForURL("**/billing/wallet**");

    await expect(topUpButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "unpaid-wallet.png",
    ]);
  });

  test("hidden billing pages are forced back to the tariff page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin", tariff: "unpaid" });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);
    await page.waitForURL("**/billing/tariff-plan**");
  });
});

test.describe("Grace period billing", () => {
  test("the payer keeps the pay button enabled", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      tariff: "grace",
    });
    await page.clock.setSystemTime(GRACE_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(planButton(page)).toBeEnabled();
    await expect(payerWarning(page)).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "grace-tariff-payer.png",
    ]);
  });

  test("a non-payer admin stays warned and disabled", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin", tariff: "grace" });
    await page.clock.setSystemTime(GRACE_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(payerWarning(page)).toBeVisible();
    await expect(planButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "grace-tariff-nonpayer.png",
    ]);
  });
});

test.describe("Unlinked card", () => {
  test("the payer is offered to add a new card from the tariff page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      card: "unlinked",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByText("Payment method unlinked.")).toBeVisible();
    await expect(
      page.getByText("Add payment method", { exact: true }),
    ).toBeVisible();

    await page.getByTestId("quantity_picker_plus_icon").click();
    await expect(planButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "unlinked-card-payer.png",
    ]);
  });

  test("a non-payer is pointed at the payer's email", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "admin",
      payer: "foreign",
      card: "unlinked",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(page.getByText("Payment method unlinked.")).toBeVisible();
    await expect(
      page.getByText("please contact the payer"),
    ).toBeVisible();
    await expect(
      page.locator('a[href="mailto:another@test.com"]'),
    ).toBeVisible();
    await expect(
      page.getByText("Add payment method", { exact: true }),
    ).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "unlinked-card-nonpayer.png",
    ]);
  });

  test("an expired card raises the same banner for the payer", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      card: "expired",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/wallet`);

    await expect(page.getByText("Payment method unlinked.")).toBeVisible();
  });

  test("the payment method page lets the payer link a card", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      card: "unlinked",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);

    await expect(page.getByText("Click the button below to add one")).toBeVisible();
    await expect(page.getByTestId("go_to_stripe_button")).toContainText(
      "Add payment method",
    );

    await expectScreenshot(page, [
      "desktop",
      "billing-access",
      "unlinked-card-payment-method.png",
    ]);
  });

  test("the payment method page offers a non-payer no way to relink", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "admin",
      payer: "foreign",
      card: "unlinked",
    });
    await page.clock.setSystemTime(PAID_NOW);

    await page.goto(`${baseUrl}/billing/payment-method`);

    await expect(page.getByText("Click the button below to add one")).toHaveCount(
      0,
    );
    await expect(page.getByTestId("go_to_stripe_button")).toHaveCount(0);
    await expect(
      page.getByText("To link a new payment method, please reach out to the payer"),
    ).toBeVisible();
  });
});

test.describe("Billing entry in the profile menu", () => {
  // Spent up front so the dashboard welcome does not sit over the page.
  const welcomeKey = (userId: string) => `dashboard_welcome_seen_${userId}`;

  const openProfileMenu = async (page: Page, baseUrl: string) => {
    await page.goto(`${baseUrl}/dashboard`);

    const profileButton = page.getByTestId("profile_user_icon_button");
    await expect(profileButton).toBeVisible();
    await profileButton.click();

    // The menu binds its outside-click listener when the open transition ends.
    await expect(page.locator(".p-contextmenu-enter-done")).toBeVisible();
  };

  test("an admin gets the Billing entry", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "admin" });
    await page.addInitScript((key: string) => {
      window.localStorage.setItem(key, "true");
    }, welcomeKey(usersByType.admin.id));

    await openProfileMenu(page, baseUrl);

    const billingItem = page.getByTestId("user-menu-payments");
    await expect(billingItem).toBeVisible();
    await expect(billingItem).toContainText("Billing");
  });

  test("a member gets no Billing entry", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { user: "regular" });
    await page.addInitScript((key: string) => {
      window.localStorage.setItem(key, "true");
    }, welcomeKey(usersByType.regular.id));

    await openProfileMenu(page, baseUrl);

    await expect(page.getByTestId("user-menu-profile")).toBeVisible();
    await expect(page.getByTestId("user-menu-payments")).toHaveCount(0);
  });
});
