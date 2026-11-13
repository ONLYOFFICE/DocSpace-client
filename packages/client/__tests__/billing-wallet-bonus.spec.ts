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
  topUpButton,
  useSaasBilling,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const GOODWILL_PATH = "portal/payment/customer/goodwill";
const PROMO_CODE_PATH = "portal/payment/promoCode";
const USAGE_PATH = "portal/payment/customer/usage";
const OPERATIONS_PATH = "portal/payment/customer/operations";

type Lot = {
  amount: number;
  remaining: number;
  expiresAt: string | null;
};

const lot = ({ amount, remaining, expiresAt }: Lot, index = 0) => ({
  operationId: 900100 + index,
  amount,
  remaining,
  currency: "USD",
  date: "2025-12-01T09:00:00.0000000Z",
  expiresAt,
});

const goodwillHandler = (lots: Lot[] = []) =>
  http.get(apiUrl(GOODWILL_PATH), () =>
    jsonResponse({
      accountCurrency: "USD",
      subAccounts: [
        {
          currency: "USD",
          amount: lots.reduce((sum, item) => sum + item.remaining, 0),
        },
      ],
      lots: lots.map((item, index) => lot(item, index)),
    }),
  );

const PROMO_LOT: Lot = {
  amount: 100,
  remaining: 62.8,
  expiresAt: "2026-01-05T12:00:00Z",
};

const EXPIRING_LOT: Lot = { ...PROMO_LOT, expiresAt: "2025-12-14T12:00:00Z" };

const AI_USAGE = {
  service: "ai-tools",
  serviceUnit: "Tokens",
  currency: "USD",
  totalQuantity: 154000,
  totalAmount: 19.8482637869,
  operationCount: 12,
  title: "AI tools",
  price: 0,
  subscription: false,
};

const usageHandler = (collection: unknown[] = []) =>
  http.get(apiUrl(USAGE_PATH), () => jsonResponse({ collection }));

const operationsHandler = (collection: unknown[] = []) =>
  http.get(apiUrl(OPERATIONS_PATH), () => jsonResponse({ collection }));

const AI_CHARGE = {
  date: "2025-12-09T10:15:00.0000000Z",
  service: "ai-tools",
  description: "AI tools",
  details: "Claude Sonnet 5.5",
  serviceUnit: "Tokens",
  quantity: 25487,
  participantDisplayName: "Admin User",
  debit: 19.8482637869,
  credit: 0,
  currency: "USD",
  type: "AiServicePayment",
  sources: [
    { subAccount: 0, isBonus: false, amount: 14.8482637869 },
    { subAccount: 53, isBonus: true, amount: 5 },
  ],
};

const BONUS_CREDIT = {
  date: "2025-12-01T09:00:00.0000000Z",
  service: "bonus",
  description: "Bonus credit",
  details: "",
  serviceUnit: "",
  quantity: 0,
  participantDisplayName: null,
  debit: 0,
  credit: 100,
  currency: "USD",
  type: "GoodwillCredit",
  sources: [{ subAccount: 53, isBonus: true, amount: 100 }],
};

const apiError = (status: number, message: string) =>
  new Response(
    JSON.stringify({ error: { message }, status: 1, statusCode: status }),
    { status, headers: { "Content-Type": "application/json" } },
  );

const openWallet = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}/billing/wallet`);

  await expect(page.getByText("Available credits")).toBeVisible();
};

const openPromoCodeField = async (page: Page) => {
  await topUpButton(page).click();
  await page.getByTestId("wallet_promo_code_toggle").click();

  await expect(page.getByTestId("wallet_promo_code_input")).toBeFocused();
};

const promoIcon = (page: Page, name: "Apply" | "Cancel") =>
  page.getByTestId("wallet_promo_code_block").locator(`[aria-label="${name}"]`);

test.describe("Billing wallet: promo credits", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(
      http.get(apiUrl("portal/payment/topupsettings"), () =>
        jsonResponse({ enabled: false, minBalance: 10, upToBalance: 100 }),
      ),
      http.get(apiUrl("portal/tariff/upcoming"), () => jsonResponse([])),
      operationsHandler(),
      usageHandler(),
      goodwillHandler(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("promo credits are added to the available credits", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(balanceHandler(50), goodwillHandler([PROMO_LOT]));

    await openWallet(page, baseUrl);

    const promo = page.getByTestId("wallet_promo_credits");
    await expect(page.getByText("$112.80")).toBeVisible();
    await expect(promo).toContainText("Purchased");
    await expect(promo).toContainText("$50.00");
    await expect(promo).toContainText("$62.80");
    await expect(promo).toContainText("of $100.00");
    await expect(promo).toContainText(/Expires .+ \(in 26 days\)/);
    await expect(page.getByTestId("wallet_promo_expiry_banner")).toHaveCount(0);
    await expect(
      page.getByText(
        "Promo credits are spent first and cannot be refunded. Auto top-up counts purchased credits only.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "promo-credits.png",
    ]);
  });

  test("a promo credit that expires within a week is flagged", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(balanceHandler(50), goodwillHandler([EXPIRING_LOT]));

    await openWallet(page, baseUrl);

    await expect(page.getByTestId("wallet_promo_expiry_banner")).toContainText(
      "$62.80 of promo credits expire on",
    );
    await expect(page.getByTestId("wallet_promo_credits")).toContainText(
      "(in 4 days)",
    );

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "promo-expiring-soon.png",
    ]);
  });

  test("a promo credit with no expiry date shows no expiry line", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      balanceHandler(50),
      goodwillHandler([{ ...PROMO_LOT, expiresAt: null }]),
    );

    await openWallet(page, baseUrl);

    await expect(page.getByTestId("wallet_promo_credits")).toContainText(
      "$62.80",
    );
    await expect(page.getByTestId("wallet_promo_credits")).not.toContainText(
      "Expires",
    );
    await expect(page.getByTestId("wallet_promo_expiry_banner")).toHaveCount(0);
  });

  test("the month-to-date spend splits purchased and promo credits", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      balanceHandler(50),
      goodwillHandler([PROMO_LOT]),
      usageHandler([
        {
          ...AI_USAGE,
          sources: [
            { subAccount: 0, isBonus: false, amount: 14.8482637869 },
            { subAccount: 53, isBonus: true, amount: 5 },
          ],
        },
      ]),
    );

    await openWallet(page, baseUrl);

    await expect(page.getByText("From purchased credits")).toBeVisible();
    await expect(page.getByText("$14.84")).toBeVisible();
    await expect(page.getByText("From promo credits")).toBeVisible();
    await expect(page.getByText("$5.00").first()).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "month-to-date-split.png",
    ]);
  });

  test("without promo credits the wallet looks as before", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(balanceHandler(50), usageHandler([AI_USAGE]));

    await openWallet(page, baseUrl);

    await expect(page.getByText("$50.00").first()).toBeVisible();
    await expect(page.getByTestId("wallet_promo_credits")).toHaveCount(0);
    await expect(page.getByText("From promo credits")).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "wallet-bonus", "no-promo.png"]);
  });

  test("the Top up dialog redeems a promo code", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    let lots: Lot[] = [];
    const posts: string[] = [];

    mockRequest.use(
      balanceHandler(50),
      http.get(apiUrl(GOODWILL_PATH), () =>
        jsonResponse({
          accountCurrency: "USD",
          lots: lots.map((item, index) => lot(item, index)),
        }),
      ),
      http.post(apiUrl(PROMO_CODE_PATH), async ({ request }) => {
        posts.push(await request.text());
        lots = [
          { amount: 10, remaining: 10, expiresAt: "2026-03-10T12:00:00Z" },
        ];
        return jsonResponse({
          status: "Completed",
          amount: 10,
          currency: "USD",
          expiresAt: "2026-03-10T12:00:00Z",
        });
      }),
    );

    await openWallet(page, baseUrl);
    await expect(page.getByTestId("wallet_promo_credits")).toHaveCount(0);

    await openPromoCodeField(page);
    await expect(promoIcon(page, "Cancel")).toBeVisible();

    await page.getByTestId("wallet_promo_code_input").fill("welcome-10");
    await expect(promoIcon(page, "Apply")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "promo-code-typed.png",
    ]);

    await page.getByTestId("wallet_promo_code_input").press("Enter");

    await expect(page.getByText("Promo code applied")).toBeVisible();
    await expect(
      page.getByText("in promo credits have been added to your wallet."),
    ).toBeVisible();
    await expect(page.getByTestId("wallet_promo_code_toggle")).toBeVisible();
    expect(JSON.parse(posts[0])).toEqual({ promoCode: "welcome-10" });

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "promo-code-applied.png",
    ]);
  });

  test("a refused promo code says why under the field", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      http.post(apiUrl(PROMO_CODE_PATH), () =>
        apiError(400, "promo_already_used"),
      ),
    );

    await openWallet(page, baseUrl);
    await openPromoCodeField(page);

    await page.getByTestId("wallet_promo_code_input").fill("WELCOME10");
    await promoIcon(page, "Apply").click();

    await expect(
      page.getByText("This code has already been used."),
    ).toBeVisible();
    await expect(page.getByTestId("wallet_promo_code_form")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "promo-code-refused.png",
    ]);
  });

  test("too many attempts ask to try again later", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      http.post(apiUrl(PROMO_CODE_PATH), () =>
        apiError(429, "Request limit exceeded"),
      ),
    );

    await openWallet(page, baseUrl);
    await openPromoCodeField(page);

    await page.getByTestId("wallet_promo_code_input").fill("WELCOME10");
    await page.getByTestId("wallet_promo_code_input").press("Enter");

    await expect(
      page.getByText("Too many attempts. Try again later."),
    ).toBeVisible();
  });

  test("the cross closes the empty promo code field", async ({
    page,
    baseUrl,
  }) => {
    await openWallet(page, baseUrl);
    await openPromoCodeField(page);

    await promoIcon(page, "Cancel").click();

    await expect(page.getByTestId("wallet_promo_code_toggle")).toBeVisible();
    await expect(page.getByTestId("wallet_promo_code_input")).toHaveCount(0);
  });

  test("an operation paid partly with promo credits shows the split", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(operationsHandler([AI_CHARGE, BONUS_CREDIT]));

    await openWallet(page, baseUrl);

    const anchors = page.getByTestId("transaction_bonus_split");
    await expect(anchors).toHaveCount(1);
    await anchors.first().locator("svg").click();

    const tooltip = page.getByTestId("bonus_split_content");
    await expect(tooltip).toContainText("Paid partly with promo credits");
    await expect(tooltip).toContainText("$5");

    await expectScreenshot(page, [
      "desktop",
      "wallet-bonus",
      "transaction-split.png",
    ]);
  });
});
