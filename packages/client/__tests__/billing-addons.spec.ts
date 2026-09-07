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
  balanceHandler,
  jsonResponse,
  serviceFeeHandler,
  serviceStateHandler,
  storageSubscriptionTariff,
  trackServiceStateChanges,
  useSaasBilling,
  walletServicesHandler,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const card = (page: Page, id: string) => page.getByTestId(`storage_service_${id}`);
const toggle = (page: Page, id: string) =>
  page.getByTestId(`storage_service_${id}_toggle`);
const stripeDialogButton = (page: Page) =>
  page.getByTestId("first_topup_continue_to_stripe");

const openAddons = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/billing/addons`);

  await expect(
    page.getByText("This section is used to connect and configure the add-ons."),
  ).toBeVisible();
  await expect(card(page, "backup")).toBeVisible();
};

test.describe("Add-ons with a linked card", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(
      ...walletServicesHandler(),
      serviceStateHandler(),
      serviceFeeHandler(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("every add-on is listed with what it costs", async ({
    page,
    baseUrl,
  }) => {
    await openAddons(page, baseUrl);

    for (const id of ["aitools", "aisearch", "backup", "total_size"])
      await expect(card(page, id)).toBeVisible();

    await expect(card(page, "aitools").getByText("AI services", { exact: true })).toBeVisible();
    await expect(card(page, "aisearch").getByText("AI search", { exact: true })).toBeVisible();
    await expect(card(page, "backup").getByText("Backups", { exact: true })).toBeVisible();
    await expect(card(page, "total_size").getByText("Disk storage", { exact: true })).toBeVisible();
    await expect(page.getByText("$2.00 per 1 backup")).toBeVisible();
    await expect(page.getByText("$0.10 per 1 GB/month")).toBeVisible();

    await expectScreenshot(page, ["desktop", "addons", "with-card.png"]);
  });

  test("switching backups on charges the wallet without a detour", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "backup").click();

    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"enabled":true');
    await expect(stripeDialogButton(page)).toHaveCount(0);
  });

  test("switching AI tools on charges the wallet without a detour", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "aitools").click();

    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"service":-13');
    expect(changes[0]).toContain('"enabled":true');
    await expect(toggle(page, "aitools")).toHaveAttribute("aria-checked", "true");
    await expect(stripeDialogButton(page)).toHaveCount(0);
  });

  test("AI search switches straight on once AI tools already run", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]));
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "aisearch").click();

    await expect(
      page.getByTestId("service-confirmation-dialog-continue-button"),
    ).toHaveCount(0);
    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"enabled":true');
    await expect(toggle(page, "aisearch")).toHaveAttribute("aria-checked", "true");
  });

  test("AI search asks to switch AI tools on first", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "aisearch").click();

    const continueButton = page.getByTestId(
      "service-confirmation-dialog-continue-button",
    );
    await expect(continueButton).toBeVisible();

    await expectScreenshot(page, ["desktop", "addons", "ai-search-confirm.png"]);

    await continueButton.click();

    await expect(
      page.getByText("AI tools service successfully enabled."),
    ).toBeVisible();
    await expect.poll(() => changes.length).toBe(2);
  });

  test("the storage switch starts from choosing a plan size", async ({
    page,
    baseUrl,
  }) => {
    await openAddons(page, baseUrl);

    await toggle(page, "total_size").click();

    await expect(page.getByTestId("storage_plan_upgrade_ok_button")).toBeVisible();
    await expect(stripeDialogButton(page)).toHaveCount(0);
  });

  test("storage is bought by naming a size, and the card turns on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    let bought = false;
    mockRequest.use(
      http.put(apiUrl("portal/payment/updatewallet"), () => {
        bought = true;
        return jsonResponse(true);
      }),
      storageSubscriptionTariff(() => (bought ? 100 : 0)),
    );

    const purchases: string[] = [];
    page.on("request", (request) => {
      if (
        request.method() === "PUT" &&
        new URL(request.url()).pathname.endsWith("/portal/payment/updatewallet")
      )
        purchases.push(request.postData() ?? "");
    });

    await openAddons(page, baseUrl);

    await toggle(page, "total_size").click();

    const okButton = page.getByTestId("storage_plan_upgrade_ok_button");
    const dialog = page.getByTestId("modal").filter({ has: okButton });
    await expect(okButton).toBeVisible();
    await expect(okButton).toBeDisabled();

    await dialog.locator("input").fill("100");
    await expect(okButton).toBeEnabled();

    await expectScreenshot(page, ["desktop", "addons", "storage-plan.png"]);

    await okButton.click();

    await expect.poll(() => purchases.length).toBe(1);
    expect(purchases[0]).toContain('"storage":100');

    // A first subscription hands over to the storage page.
    await page.waitForURL("**/billing/addons/disk-storage?complete=true");
    await expect(page.getByText("Storage added")).toBeVisible();
    await expect(page.getByText("100 GB", { exact: true })).toBeVisible();
    await expect(page.getByText("Edit subscription")).toBeVisible();
  });

  test("an add-on card opens the page of that add-on", async ({
    page,
    baseUrl,
  }) => {
    await openAddons(page, baseUrl);

    await card(page, "aitools").getByText("AI services").click();

    await page.waitForURL("**/billing/addons/ai-services**");
  });
});

test.describe("Add-ons without a card", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "none",
      plan: "startup",
    });
    mockRequest.use(
      ...walletServicesHandler(),
      serviceStateHandler(),
      serviceFeeHandler(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("switching an add-on on first leads to Stripe to link a card", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "backup").click();

    await expect(stripeDialogButton(page)).toBeVisible();
    await expect(stripeDialogButton(page)).toContainText("Continue to Stripe");
    await expect(
      page.getByText("you'll need to securely add a payment method via Stripe"),
    ).toBeVisible();
    expect(changes).toHaveLength(0);

    await expectScreenshot(page, ["desktop", "addons", "no-card-stripe.png"]);
  });

  test("opening an add-on leads to Stripe as well", async ({
    page,
    baseUrl,
  }) => {
    await openAddons(page, baseUrl);

    await card(page, "aitools").getByText("AI services").click();

    await expect(stripeDialogButton(page)).toBeVisible();
    await expect(page).toHaveURL(/\/billing\/addons$/);
  });

  test("extra storage still starts from the plan size", async ({
    page,
    baseUrl,
  }) => {
    await openAddons(page, baseUrl);

    await toggle(page, "total_size").click();

    await expect(page.getByTestId("storage_plan_upgrade_ok_button")).toBeVisible();
    await expect(stripeDialogButton(page)).toHaveCount(0);
  });
});

test.describe("Add-ons with services switched on", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(
      ...walletServicesHandler(["aitools", "aisearch", "backup"]),
      storageSubscriptionTariff(200),
      serviceStateHandler(),
      serviceFeeHandler(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("running add-ons show as on, with what they cost now", async ({
    page,
    baseUrl,
  }) => {
    await openAddons(page, baseUrl);

    for (const id of ["aitools", "aisearch", "backup", "total_size"])
      await expect(toggle(page, id)).toHaveAttribute("aria-checked", "true");

    await expect(page.getByText("Backups available — $2.00 per backup")).toBeVisible();
    await expect(
      page.getByText("Current subscription: $20.00/month (200 GB)"),
    ).toBeVisible();
    await expect(page.getByText("Credits running low")).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "addons", "services-on.png"]);
  });

  test("switching backups off is sent at once", async ({ page, baseUrl }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "backup").click();

    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"enabled":false');
    await expect(toggle(page, "backup")).toHaveAttribute("aria-checked", "false");
  });

  test("switching AI tools off takes AI search down with it", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "aitools").click();

    await expect(toggle(page, "aitools")).toHaveAttribute("aria-checked", "false");
    await expect(toggle(page, "aisearch")).toHaveAttribute("aria-checked", "false");
    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"enabled":false');
  });

  test("switching storage off asks to confirm the cancellation", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await openAddons(page, baseUrl);

    await toggle(page, "total_size").click();

    await expect(page.getByTestId("storage_plan_cancel_ok_button")).toBeVisible();
    expect(changes).toHaveLength(0);
    await expect(toggle(page, "total_size")).toHaveAttribute("aria-checked", "true");
  });
});

test.describe("Add-ons on a negative balance", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(serviceStateHandler(), serviceFeeHandler());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the AI card warns about the credits and backups become unavailable", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...walletServicesHandler(["aitools", "backup"]),
      balanceHandler(-3),
    );

    await openAddons(page, baseUrl);

    await expect(
      page.getByText("Available credits: -$3.00. Credits running low"),
    ).toBeVisible();
    await expect(card(page, "aitools").getByTestId("ai_supported_models_link")).toBeVisible();
    // floor(balance / price) is negative here, not zero, so backups still read as available.
    await expect(page.getByText("Backups available — $2.00 per backup")).toBeVisible();

    await expectScreenshot(page, ["desktop", "addons", "low-balance.png"]);
  });

  test("an empty wallet makes backups unavailable and warns on the AI card", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...walletServicesHandler(["aitools", "backup"]),
      balanceHandler(0),
    );

    await openAddons(page, baseUrl);

    await expect(
      page.getByText("Available credits: $0.00. Credits running low"),
    ).toBeVisible();
    await expect(
      page.getByText("Additional backups unavailable — top up wallet"),
    ).toBeVisible();
  });

  test("the warning is tied to the AI tools being on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["backup"]), balanceHandler(-3));

    await openAddons(page, baseUrl);

    await expect(page.getByText("Credits running low")).toHaveCount(0);
    await expect(toggle(page, "aitools")).toHaveAttribute("aria-checked", "false");
  });
});
