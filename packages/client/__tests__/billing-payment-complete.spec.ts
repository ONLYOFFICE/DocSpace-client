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

import { delay, http } from "msw";

import { PATH_PAYMENT_CUSTOMER_INFO } from "@docspace/shared/__mocks__/handlers/portal/paymentCustomerInfo";
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import { PaymentMethodStatus } from "@docspace/shared/enums";
import type { Page } from "@playwright/test";

import { expect, test } from "./fixtures/base";
import {
  apiUrl,
  jsonResponse,
  serviceStateHandler,
  SERVICE_STATE_PATH,
  useSaasBilling,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const DEPOSIT_PATH = "portal/payment/deposit";
const UPDATE_WALLET_PATH = "portal/payment/updatewallet";
const FIRST_RENDER = { timeout: 15000 };
// Long enough to shoot the processing card before the step completes.
const SLOW_STEP_MS = 4000;

// Stripe sends the browser back with the purchase described in the query.
const completeUrl = (params: Record<string, string> = {}) =>
  `/billing/payment-complete?${new URLSearchParams({
    currency: "USD",
    amount: "50",
    type: "wallet",
    language: "en",
    ...params,
  })}`;

const failing = () => new Response(null, { status: 500 });

const depositHandler = ({ delayMs = 0, fail = false } = {}) =>
  http.post(apiUrl(DEPOSIT_PATH), async () => {
    if (delayMs) await delay(delayMs);
    return fail ? failing() : jsonResponse(true);
  });

const slowServiceStateHandler = () =>
  http.post(apiUrl(SERVICE_STATE_PATH), async () => {
    await delay(SLOW_STEP_MS);
    return jsonResponse(true);
  });

const failingServiceStateHandler = () =>
  http.post(apiUrl(SERVICE_STATE_PATH), () => failing());

const updateWalletHandler = ({ delayMs = 0, fail = false } = {}) =>
  http.put(apiUrl(UPDATE_WALLET_PATH), async () => {
    if (delayMs) await delay(delayMs);
    return fail ? failing() : jsonResponse(true);
  });

// The page polls with refresh=true; the card is confirmed only on its second read, like a
// Stripe webhook that is still on its way. The boot-time read without refresh is left alone.
const lateCardHandler = () => {
  let reads = 0;

  return {
    handler: http.get(apiUrl(PATH_PAYMENT_CUSTOMER_INFO), ({ request }) => {
      const isPageRead = new URL(request.url).searchParams.has("refresh");
      if (isPageRead) reads += 1;
      return jsonResponse({
        portalId: null,
        paymentMethodStatus:
          isPageRead && reads === 1
            ? PaymentMethodStatus.None
            : PaymentMethodStatus.Set,
        email: "test@gmail.com",
        payer: { displayName: "Test Payer", hasAvatar: false },
      });
    }),
    reads: () => reads,
  };
};

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

const step = (page: Page, state: "done" | "active" | "pending") =>
  page.locator(`li[data-state="${state}"]`);
const successButton = (page: Page) =>
  page.getByTestId("ai_paywall_go_to_wallet_button");
const errorButton = (page: Page) =>
  page.getByTestId("ai_paywall_go_to_billing_button");
const shot = (name: string) => ["desktop", "payment-complete", name];
// The active step spins, so its spinner is hidden to keep the processing shots stable.
const processingShot = async (page: Page, name: string) => {
  await page.addStyleTag({
    content: 'span[data-state="active"] svg { visibility: hidden; }',
  });
  await expectScreenshot(page, shot(name));
};

test.describe("Payment complete page", () => {
  test.beforeEach(async ({ mockRequest }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      depositHandler(),
      serviceStateHandler(),
      updateWalletHandler(),
    );
  });

  test("a wallet top-up runs two steps and lands in the wallet", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositHandler({ delayMs: SLOW_STEP_MS }));
    const deposits = trackRequests(page, "POST", DEPOSIT_PATH);

    await page.goto(`${baseUrl}${completeUrl()}`);

    await expect(page.getByText("Adding credits to your wallet")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(
      page.getByText("Keep this tab open until the payment is complete"),
    ).toBeVisible();
    await expect(step(page, "done")).toHaveText("Payment method saved");
    await expect(step(page, "active")).toContainText("Adding $50.00 to your wallet");
    await expect(step(page, "pending")).toHaveCount(0);
    await expect(page.getByText("Secured by Stripe")).toBeVisible();

    await processingShot(page, "processing-wallet.png");

    await expect(page.getByText("Wallet topped up", { exact: true })).toBeVisible(
      FIRST_RENDER,
    );
    await expect(
      page.getByText("Added to your wallet and ready to use"),
    ).toBeVisible();
    expect(deposits).toHaveLength(1);
    expect(deposits[0]).toContain('"amount":50');
    expect(deposits[0]).toContain('"currency":"USD"');
    await expect(page).toHaveURL(/\/billing\/payment-complete$/);

    await expectScreenshot(page, shot("success-wallet.png"));

    await successButton(page).click();

    await page.waitForURL("**/billing/wallet");
  });

  test("an AI purchase adds an activation step and turns both AI services on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(slowServiceStateHandler());
    const changes = trackRequests(page, "POST", SERVICE_STATE_PATH);

    await page.goto(`${baseUrl}${completeUrl({ service: "ai-tools" })}`);

    await expect(step(page, "active")).toContainText(
      "Activating AI features",
      FIRST_RENDER,
    );
    await expect(step(page, "done")).toHaveCount(2);
    await expect(step(page, "done").nth(1)).toHaveText(
      "Wallet topped up by $50.00",
    );

    await processingShot(page, "processing-ai.png");

    await expect(page.getByText("AI features activated")).toBeVisible({
      timeout: SLOW_STEP_MS * 3,
    });
    expect(changes).toHaveLength(2);
    expect(changes[0]).toContain('"service":-13');
    expect(changes[1]).toContain('"service":-18');

    await expectScreenshot(page, shot("success-ai.png"));

    await successButton(page).click();

    await page.waitForURL("**/billing/addons/ai-services");
  });

  test("an AI purchase can leave AI search alone", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackRequests(page, "POST", SERVICE_STATE_PATH);

    await page.goto(
      `${baseUrl}${completeUrl({ service: "ai-tools", skipAiSearch: "1" })}`,
    );

    await expect(page.getByText("AI features activated")).toBeVisible(
      FIRST_RENDER,
    );
    expect(changes).toHaveLength(1);
    expect(changes[0]).toContain('"service":-13');
  });

  test("an AI search purchase turns AI features on first", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackRequests(page, "POST", SERVICE_STATE_PATH);

    await page.goto(`${baseUrl}${completeUrl({ service: "ai-search" })}`);

    await expect(page.getByText("AI features activated")).toBeVisible(
      FIRST_RENDER,
    );
    expect(changes).toHaveLength(2);
    expect(changes[0]).toContain('"service":-13');
    expect(changes[1]).toContain('"service":-18');

    await successButton(page).click();

    await page.waitForURL("**/billing/addons/ai-search");
  });

  test("a backup purchase activates the backups", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(slowServiceStateHandler());
    const changes = trackRequests(page, "POST", SERVICE_STATE_PATH);

    await page.goto(`${baseUrl}${completeUrl({ service: "backup" })}`);

    await expect(step(page, "active")).toContainText(
      "Activating additional backups",
      FIRST_RENDER,
    );
    await expect(
      page.getByText("Topping up your wallet and activating additional backups."),
    ).toBeVisible();

    await processingShot(page, "processing-backup.png");

    await expect(page.getByText("Additional backups activated")).toBeVisible({
      timeout: SLOW_STEP_MS * 3,
    });
    expect(changes).toHaveLength(1);
    expect(changes[0]).toContain('"service":-12');
    await expect(successButton(page)).toHaveText("Go to add-on");

    await expectScreenshot(page, shot("success-backup.png"));

    await successButton(page).click();

    await page.waitForURL("**/billing/addons/backup");
  });

  test("a storage purchase names the size and the monthly price", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(slowServiceStateHandler());
    const changes = trackRequests(page, "POST", SERVICE_STATE_PATH);

    await page.goto(
      `${baseUrl}${completeUrl({ service: "disk-storage", storage: "100 GB", price: "10" })}`,
    );

    await expect(step(page, "active")).toContainText(
      "Activating 100 GB of additional storage",
      FIRST_RENDER,
    );
    await expect(
      page.getByText("Topping up your wallet and activating storage."),
    ).toBeVisible();

    await processingShot(page, "processing-storage.png");

    await expect(
      page.getByText("Additional disk storage activated"),
    ).toBeVisible({ timeout: SLOW_STEP_MS * 3 });
    await expect(page.getByText("+100 GB", { exact: true })).toBeVisible();
    await expect(page.getByText("$10.00 per month")).toBeVisible();
    expect(changes).toHaveLength(1);
    expect(changes[0]).toContain('"service":-11');

    await expectScreenshot(page, shot("success-storage.png"));

    await successButton(page).click();

    await page.waitForURL("**/billing/addons/disk-storage");
  });

  test("a tariff purchase adds the admins and reports the plan", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(updateWalletHandler({ delayMs: SLOW_STEP_MS }));
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await page.goto(
      `${baseUrl}${completeUrl({
        amount: "150",
        admins: "5",
        storage: "200 GB",
        plan: "Business",
        price: "$150.00",
      })}`,
    );

    await expect(step(page, "active")).toContainText(
      "Activating Business plan",
      FIRST_RENDER,
    );
    await expect(step(page, "active")).toContainText(
      "Admins: 5 | Storage: 200 GB",
    );

    await processingShot(page, "processing-tariff.png");

    await expect(page.getByText("Business plan activated")).toBeVisible({
      timeout: SLOW_STEP_MS * 3,
    });
    await expect(page.getByText("+5 admins")).toBeVisible();
    await expect(
      page.getByText("Storage: 200 GB | $150.00 per month"),
    ).toBeVisible();
    expect(purchases).toHaveLength(1);
    expect(purchases[0]).toContain('"adminwallet":5');
    expect(purchases[0]).toContain('"productQuantityType":1');
    await expect(successButton(page)).toHaveText("Go to tariff plan");

    await expectScreenshot(page, shot("success-tariff.png"));

    await successButton(page).click();

    await page.waitForURL("**/billing/tariff-plan");
  });

  test("a Docs Connect purchase buys the users and leads to the service", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(updateWalletHandler({ delayMs: SLOW_STEP_MS }));
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await page.goto(
      `${baseUrl}${completeUrl({
        amount: "100",
        service: "docs-connect",
        users: "50",
        add: "50",
        price: "100",
      })}`,
    );

    await expect(step(page, "active")).toContainText(
      "Activating Docs Connect",
      FIRST_RENDER,
    );
    await expect(
      page.getByText("Topping up your wallet and activating Docs Connect."),
    ).toBeVisible();

    await processingShot(page, "processing-docs-connect.png");

    await expect(page.getByText("Docs Connect activated")).toBeVisible({
      timeout: SLOW_STEP_MS * 3,
    });
    await expect(page.getByText("50 users", { exact: true })).toBeVisible();
    await expect(page.getByText("$100.00 per month")).toBeVisible();
    expect(purchases).toHaveLength(1);
    expect(purchases[0]).toContain('"docscloud":50');
    await expect(successButton(page)).toHaveText("Go to Docs Connect");

    await expectScreenshot(page, shot("success-docs-connect.png"));

    await successButton(page).click();

    await page.waitForURL("**/developer-tools/docs-connect");
  });

  test("a Docs Connect purchase with the Dev Pack buys the Dev Pack product", async ({
    page,
    baseUrl,
  }) => {
    const purchases = trackRequests(page, "PUT", UPDATE_WALLET_PATH);

    await page.goto(
      `${baseUrl}${completeUrl({
        amount: "250",
        service: "docs-connect",
        users: "50",
        add: "50",
        price: "250",
        devpack: "1",
      })}`,
    );

    await expect(page.getByText("Docs Connect activated")).toBeVisible(
      FIRST_RENDER,
    );
    expect(purchases).toHaveLength(1);
    expect(purchases[0]).toContain('"docsclouddevpack":50');
  });

  test("the charge waits until Stripe has saved the card", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    const card = lateCardHandler();
    mockRequest.use(card.handler);
    const deposits = trackRequests(page, "POST", DEPOSIT_PATH);

    await page.goto(`${baseUrl}${completeUrl()}`);

    await expect(step(page, "active")).toContainText(
      "Adding $50.00 to your wallet",
      FIRST_RENDER,
    );
    await expect.poll(() => card.reads()).toBe(1);
    expect(deposits).toHaveLength(0);

    await expect(page.getByText("Wallet topped up", { exact: true })).toBeVisible(
      FIRST_RENDER,
    );
    expect(card.reads()).toBe(2);
    expect(deposits).toHaveLength(1);
  });

  test("a failed wallet top-up says the card is kept and sends back to the wallet", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositHandler({ fail: true }));

    await page.goto(`${baseUrl}${completeUrl()}`);

    await expect(page.getByText("Payment failed", { exact: true })).toBeVisible(
      FIRST_RENDER,
    );
    await expect(
      page.getByText(
        "Your card was saved successfully. Please try topping up your wallet again.",
      ),
    ).toBeVisible();
    await expect(errorButton(page)).toHaveText("Try again in Wallet");

    await errorButton(page).click();

    await page.waitForURL("**/billing/wallet");
  });

  test("a failed top-up during an add-on purchase skips the activation", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositHandler({ fail: true }));
    const changes = trackRequests(page, "POST", SERVICE_STATE_PATH);

    await page.goto(`${baseUrl}${completeUrl({ service: "backup" })}`);

    await expect(page.getByText("Payment failed", { exact: true })).toBeVisible(
      FIRST_RENDER,
    );
    await expect(
      page.getByText(
        "Your card was saved successfully. Please try topping up your wallet again.",
      ),
    ).toBeVisible();
    await expect(errorButton(page)).toHaveText("Try again in Wallet");
    expect(changes).toHaveLength(0);

    await expectScreenshot(page, shot("error-top-up.png"));

    await errorButton(page).click();

    await page.waitForURL("**/billing/addons/backup");
  });

  test("a failed activation keeps the top-up and sends back to the add-on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(failingServiceStateHandler());

    await page.goto(`${baseUrl}${completeUrl({ service: "backup" })}`);

    await expect(page.getByText("Add-on activation failed")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(
      page.getByText(
        "Your card was saved and your wallet was topped up successfully.",
      ),
    ).toBeVisible();
    await expect(errorButton(page)).toHaveText("Try again in Add-on");

    await expectScreenshot(page, shot("error-activation.png"));

    await errorButton(page).click();

    await page.waitForURL("**/billing/addons/backup");
  });

  test("a failed Docs Connect top-up points back to Docs Connect", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(depositHandler({ fail: true }));

    await page.goto(
      `${baseUrl}${completeUrl({ amount: "100", service: "docs-connect", users: "50", add: "50", price: "100" })}`,
    );

    await expect(page.getByText("Purchase failed", { exact: true })).toBeVisible(
      FIRST_RENDER,
    );
    await expect(
      page.getByText("You can retry from Docs Connect."),
    ).toBeVisible();
    await expect(errorButton(page)).toHaveText("Go to Docs Connect");

    await expectScreenshot(page, shot("error-docs-connect.png"));

    await errorButton(page).click();

    await page.waitForURL("**/developer-tools/docs-connect");
  });

  test("a failed Docs Connect purchase keeps the top-up and offers a retry", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(updateWalletHandler({ fail: true }));

    await page.goto(
      `${baseUrl}${completeUrl({ amount: "100", service: "docs-connect", users: "50", add: "50", price: "100" })}`,
    );

    await expect(page.getByText("Add-on activation failed")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(errorButton(page)).toHaveText("Try again in Add-on");

    await errorButton(page).click();

    await page.waitForURL("**/developer-tools/docs-connect");
  });

  test("without payment details the page falls through to the wallet", async ({
    page,
    baseUrl,
  }) => {
    const deposits = trackRequests(page, "POST", DEPOSIT_PATH);

    await page.goto(`${baseUrl}/billing/payment-complete`);

    await page.waitForURL("**/billing/wallet", FIRST_RENDER);
    expect(deposits).toHaveLength(0);
  });
});
