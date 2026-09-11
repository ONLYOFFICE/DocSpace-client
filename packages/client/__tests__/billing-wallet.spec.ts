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

import {
  settingAuthWithSocket,
  PATH as SETTINGS_PATH,
} from "@docspace/shared/__mocks__/handlers/settings/settings";
import { expect, test } from "./fixtures/base";
import {
  PAID_NOW,
  apiUrl,
  autoTopUpButton,
  balanceHandler,
  jsonResponse,
  topUpButton,
  useSaasBilling,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const TOP_UP_SETTINGS_PATH = "portal/payment/topupsettings";
const OPERATIONS_PATH = "portal/payment/customer/operations";
const UPCOMING_PATH = "portal/tariff/upcoming";
const USAGE_PATH = "portal/payment/customer/usage";
const BALANCE_PATH = "portal/payment/customer/balance";
const OPERATIONS_REPORT_PATH = "portal/payment/customer/operationsreport";

const autoTopUpSettings = ({
  enabled = false,
  minBalance = 10,
  upToBalance = 100,
} = {}) =>
  http.get(apiUrl(TOP_UP_SETTINGS_PATH), () =>
    jsonResponse({ enabled, minBalance, upToBalance }),
  );

const TRANSACTIONS = [
  {
    date: "2025-12-09T10:15:00.0000000Z",
    description: "AI services",
    details: "Requests",
    sourceId: "10",
    sourceTitle: "Assistant",
    sourceType: "Agent",
    serviceUnit: "requests",
    quantity: 120,
    participantDisplayName: "Admin User",
    debit: 1.2,
    credit: 0,
    currency: "USD",
  },
  {
    date: "2025-12-01T08:00:00.0000000Z",
    description: "Wallet top-up",
    details: "Card",
    serviceUnit: "",
    quantity: 0,
    participantDisplayName: "Administrator",
    debit: 0,
    credit: 100,
    currency: "USD",
  },
];

// The selector drops the signed-in user and reads a flat { response: [...] }.
const CONTACT = {
  id: "contact-user-id",
  displayName: "Test Contact",
  email: "contact@example.com",
  isOwner: false,
  isAdmin: true,
  isVisitor: false,
  isCollaborator: false,
  isRoomAdmin: false,
  hasAvatar: false,
  avatarSmall: "",
  status: 1,
  activationStatus: 1,
};

const contactsHandler = () =>
  http.get(apiUrl("people/filter"), () => jsonResponse([CONTACT]));

const operationsHandler = (collection: unknown[] = TRANSACTIONS) =>
  http.get(apiUrl(OPERATIONS_PATH), () => jsonResponse({ collection }));

const upcomingHandler = (rows: unknown[] = []) =>
  http.get(apiUrl(UPCOMING_PATH), () => jsonResponse(rows));

const usageHandler = (collection: unknown[] = []) =>
  http.get(apiUrl(USAGE_PATH), () => jsonResponse({ collection }));

const reportHandlers = (fileUrl: string) => [
  http.post(apiUrl(OPERATIONS_REPORT_PATH), () => jsonResponse(true)),
  http.get(apiUrl(OPERATIONS_REPORT_PATH), () =>
    jsonResponse({ isCompleted: true, resultFileUrl: fileUrl }),
  ),
];

const trackPosts = (page: Page, path: string) => {
  const bodies: string[] = [];

  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname.endsWith(`/${path}`)
    )
      bodies.push(request.postData() ?? "");
  });

  return bodies;
};

const socketSettingsHandler = () =>
  http.get(apiUrl(SETTINGS_PATH), () =>
    new Response(
      JSON.stringify({
        ...settingAuthWithSocket,
        response: { ...settingAuthWithSocket.response, standalone: false },
      }),
    ),
  );

const providerError = () =>
  new Response(
    JSON.stringify({ error: { message: "Payment provider is unavailable" } }),
    { status: 500, headers: { "Content-Type": "application/json" } },
  );

const openWallet = async (page: Page, baseUrl: string, query = "") => {
  await page.goto(`${baseUrl}/billing/wallet${query}`);

  await expect(page.getByText("Available credits")).toBeVisible();
};

test.describe("Billing wallet", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest, { user: "owner", payer: "self-owner" });
    mockRequest.use(
      autoTopUpSettings(),
      operationsHandler([]),
      upcomingHandler(),
      usageHandler(),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("a wallet that was never topped up offers no auto top-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      // A plain number instead of sub-accounts means no top-up yet.
      http.get(apiUrl("portal/payment/customer/balance"), () =>
        jsonResponse(0),
      ),
    );

    await openWallet(page, baseUrl);

    await expect(page.getByText("$0.00").first()).toBeVisible();
    await expect(topUpButton(page)).toBeEnabled();
    await expect(autoTopUpButton(page)).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "wallet", "never-topped-up.png"]);
  });

  test("isDelayedPaymentMethod announces the transfer and hides auto top-up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      isDelayedPaymentMethod: true,
    });

    await openWallet(page, baseUrl);

    await expect(
      page.getByText(
        "SEPA transfer sent. Funds can take several business days to arrive. Your Wallet balance will update automatically after the funds arrive. You can still top up again, including by card.",
      ),
    ).toBeVisible();
    await expect(topUpButton(page)).toBeEnabled();
    // the wallet cannot be refilled automatically before the transfer settles
    await expect(autoTopUpButton(page)).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "wallet",
      "delayed-payment-method.png",
    ]);
  });

  test("a configured auto top-up states its thresholds", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      autoTopUpSettings({ enabled: true, minBalance: 10, upToBalance: 100 }),
    );

    await openWallet(page, baseUrl);

    await expect(
      page.getByText(
        "When credits drop below $10, your wallet will automatically refill to $100.",
      ),
    ).toBeVisible();
    // The progress text is always mounted, only toggled visible.
    await expect(page.getByText("Top up in progress")).toBeHidden();

    await expectScreenshot(page, ["desktop", "wallet", "auto-top-up-set.png"]);
  });

  test("a balance under the threshold shows the top-up as running", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      balanceHandler(5),
      autoTopUpSettings({ enabled: true, minBalance: 10, upToBalance: 100 }),
    );

    await openWallet(page, baseUrl);

    await expect(page.getByText("Top up in progress")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet",
      "auto-top-up-running.png",
    ]);
  });

  test("the transaction history lists what the wallet was charged for", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(operationsHandler());

    await openWallet(page, baseUrl);

    await expect(page.getByText("Wallet top-up")).toBeVisible();
    await expect(page.getByText("+$100.00")).toBeVisible();
    await expect(page.getByText("AI services").first()).toBeVisible();
    // Whole amounts keep two decimals, fractional ones only their significant part.
    await expect(page.getByText("-$1.2")).toBeVisible();
    await expect(page.getByText("requests: 120")).toBeVisible();

    await expectScreenshot(page, ["desktop", "wallet", "transactions.png"]);
  });

  test("an untouched wallet says the history is still empty", async ({
    page,
    baseUrl,
  }) => {
    await openWallet(page, baseUrl);

    await expect(page.getByText("No transactions yet")).toBeVisible();
    await expect(
      page.getByText(
        "Once you start using the wallet, the payment history will be displayed here.",
      ),
    ).toBeVisible();
  });

  test("the type filter narrows the history to credits", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(operationsHandler());

    const requests: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).pathname.endsWith(`/${OPERATIONS_PATH}`))
        requests.push(request.url());
    });

    await openWallet(page, baseUrl);
    await expect(page.getByText("Wallet top-up")).toBeVisible();

    await page.getByTestId("transaction_type_combobox").click();
    await page.getByTestId("credit_transactions_option").click();

    await expect.poll(() => requests.at(-1)).toContain("Credit=true");
    expect(requests.at(-1)).toContain("Debit=false");
  });

  test("the type menu offers all transactions, credits and debits", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(operationsHandler());

    await openWallet(page, baseUrl);
    await expect(page.getByText("Wallet top-up")).toBeVisible();

    await page.getByTestId("transaction_type_combobox").click();

    const menu = page.getByTestId("transaction_type_dropdown");
    await expect(menu).toBeVisible();
    await expect(
      menu.locator('[data-testid$="_transactions_option"]'),
    ).toHaveText(["All transactions", "Credit", "Debit"]);

    await expectScreenshot(page, ["desktop", "wallet", "type-menu.png"]);

    // The combobox closes via its backdrop; the page keeps another one mounted, so the live one is last.
    await page.getByTestId("backdrop").last().click();
    await expect(menu).toBeHidden();
    await expect(page.getByTestId("transaction_type_combobox")).toContainText(
      "All transactions",
    );
  });

  test("either date picker opens a calendar", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(operationsHandler());

    await openWallet(page, baseUrl);
    await expect(page.getByText("Wallet top-up")).toBeVisible();

    await expect(page.getByTestId("transaction_start_date_picker")).toContainText(
      "12 Nov 2025",
    );
    await expect(page.getByTestId("transaction_end_date_picker")).toContainText(
      "10 Dec 2025",
    );

    await page.getByTestId("transaction_start_date_picker").click();
    await expect(page.getByTestId("calendar")).toBeVisible();

    await expectScreenshot(page, ["desktop", "wallet", "date-calendar.png"]);

    // The calendar has no backdrop; the picker toggles it.
    await page.getByTestId("transaction_start_date_picker").click();
    await expect(page.getByTestId("calendar")).toHaveCount(0);

    await page.getByTestId("transaction_end_date_picker").click();
    await expect(page.getByTestId("calendar")).toBeVisible();
  });

  test("a contact narrows the history to what they spent", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(operationsHandler(), contactsHandler());

    const requests: string[] = [];
    page.on("request", (request) => {
      if (new URL(request.url()).pathname.endsWith(`/${OPERATIONS_PATH}`))
        requests.push(request.url());
    });

    await openWallet(page, baseUrl);
    await expect(page.getByText("Wallet top-up")).toBeVisible();

    await page.getByText("Select contact").click();

    const selector = page.getByTestId("people-selector");
    await expect(selector).toBeVisible();

    await expectScreenshot(page, ["desktop", "wallet", "contact-selector.png"]);

    await selector.getByTestId("selector-item-0").click();
    await selector.getByTestId("selector_submit_button").click();

    const contactTag = page
      .getByTestId("selected-item")
      .filter({ hasText: "Test Contact" });
    await expect(contactTag).toBeVisible();
    await expect(page.getByText("Select contact")).toHaveCount(0);
    await expect(page.getByTestId("clear_filter_button")).toBeVisible();
    await expect
      .poll(() => requests.at(-1))
      .toContain("ParticipantName=contact-user-id");

    await expectScreenshot(page, ["desktop", "wallet", "contact-selected.png"]);

    await contactTag.locator(".selected-tag-removed").click();
    await expect(contactTag).toHaveCount(0);
    await expect(page.getByText("Select contact")).toBeVisible();
    await expect
      .poll(() => requests.at(-1))
      .not.toContain("ParticipantName=contact-user-id");
  });

  test("the upcoming payments tab explains what will be charged", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      upcomingHandler([
        {
          id: 1,
          name: "admin",
          title: "Business plan",
          unitOfMeasure: "admins",
          quantity: 31,
          wallet: true,
          dueDate: "2026-01-05T00:00:00.0000000Z",
          amount: 6820,
          currency: "USD",
        },
      ]),
    );

    await openWallet(page, baseUrl);

    await page.getByTestId("upcoming-payments_tab").click();

    await expect(
      page.getByText("Review your active subscriptions and upcoming renewals."),
    ).toBeVisible();
    await expect(page.getByText("Business plan")).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet",
      "upcoming-payments.png",
    ]);
  });

  test("a portal with nothing scheduled says so", async ({
    page,
    baseUrl,
  }) => {
    await openWallet(page, baseUrl);

    await page.getByTestId("upcoming-payments_tab").click();

    await expect(page.getByText("No upcoming payments")).toBeVisible();
    await expect(
      page.getByText("You don’t have any active subscriptions"),
    ).toBeVisible();
  });

  test("the tab can be opened straight from the address", async ({
    page,
    baseUrl,
  }) => {
    await openWallet(page, baseUrl, "?tab=upcoming-payments");

    await expect(page.getByText("No upcoming payments")).toBeVisible();
  });

  test("the top-up dialog opens with the amount to pay", async ({
    page,
    baseUrl,
  }) => {
    await openWallet(page, baseUrl);

    await topUpButton(page).click();

    await expect(page.getByTestId("top_up_amount_input").first()).toBeVisible();

    await expectScreenshot(page, ["desktop", "wallet", "top-up-dialog.png"]);
  });

  test("isDelayedPaymentMethod warns in the top-up dialog that the funds settle later", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      isDelayedPaymentMethod: true,
    });

    await openWallet(page, baseUrl);

    await topUpButton(page).click();

    await expect(page.getByTestId("top_up_amount_input").first()).toBeVisible();
    await expect(
      page.getByText(
        "Bank transfers may take several business days to process. Credits will be added to your Wallet only after the funds arrive.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet",
      "top-up-dialog-delayed.png",
    ]);
  });

  test("isDelayedPaymentMethod ends an instant top-up with the settlement notice", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, {
      user: "owner",
      payer: "self-owner",
      isDelayedPaymentMethod: true,
    });
    mockRequest.use(
      http.post(apiUrl("portal/payment/deposit"), () => jsonResponse(true)),
    );

    await openWallet(page, baseUrl);
    await topUpButton(page).click();

    const amount = page.getByTestId("top_up_amount_input").first();
    await amount.fill("25");
    await page.getByTestId("first_topup_continue_to_stripe").click();

    await expect(page.getByTestId("toast-content")).toContainText(
      "Bank transfers may take several business days to process. Credits will be added to your Wallet only after the funds arrive.",
    );
    await expect(amount).toHaveCount(0);
    await expect(page.getByText("Wallet has been successfully topped up")).toHaveCount(0);
  });

  test("the auto top-up dialog asks for the two thresholds", async ({
    page,
    baseUrl,
  }) => {
    await openWallet(page, baseUrl);

    await autoTopUpButton(page).click();

    const dialog = page
      .getByTestId("modal")
      .filter({ hasText: "Top up credits" });
    await expect(dialog).toHaveCount(1);

    await expect(dialog).toContainText("Automatic top-ups");
    await expect(dialog).toContainText(
      "Automatically add credits when available credits drop below a specified amount",
    );
    const save = dialog.getByTestId("wallet_refilled_save_button");
    await expect(save).toBeDisabled();

    await dialog.getByTestId("auto_payments_toggle_button").click();

    await expect(dialog).toContainText("When balance goes below");
    await expect(dialog).toContainText("Bring credit back up to");
    await expect(
      dialog.getByTestId("top_up_min_balance_input").first(),
    ).toBeVisible();
    await expect(
      dialog.getByTestId("top_up_max_balance_input").first(),
    ).toBeVisible();

    await expectScreenshot(page, ["desktop", "wallet", "auto-top-up-dialog.png"]);

    await dialog.getByTestId("wallet_refilled_cancel_button").click();
    await expect(dialog).toHaveCount(0);
  });

  test("an existing auto top-up opens the dialog on its own values", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      autoTopUpSettings({ enabled: true, minBalance: 10, upToBalance: 100 }),
    );

    await openWallet(page, baseUrl);

    await autoTopUpButton(page).click();

    const dialog = page
      .getByTestId("modal")
      .filter({ hasText: "Top up credits" });
    await expect(dialog).toHaveCount(1);

    await expect(dialog).toContainText(
      "When the balance drops to $10, the wallet will be automatically topped up to $100.",
    );
    await expect(dialog.getByTestId("edit_auto_payment_button")).toBeVisible();
    await expect(
      dialog.getByTestId("top_up_min_balance_input"),
    ).toHaveCount(0);

    await dialog.getByTestId("edit_auto_payment_button").click();

    await expect(
      dialog.getByTestId("top_up_min_balance_input").first(),
    ).toHaveValue("10");
    await expect(
      dialog.getByTestId("top_up_max_balance_input").first(),
    ).toHaveValue("100");

    await expectScreenshot(page, [
      "desktop",
      "wallet",
      "auto-top-up-dialog-edit.png",
    ]);
  });

  test("a failed top-up reports the provider error and keeps the dialog open", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      http.post(apiUrl("portal/payment/deposit"), () => providerError()),
    );

    await openWallet(page, baseUrl);
    await topUpButton(page).click();

    const amount = page.getByTestId("top_up_amount_input").first();
    await amount.fill("25");
    await page.getByTestId("first_topup_continue_to_stripe").click();

    await expect(page.getByTestId("toast-content")).toContainText(
      "Payment provider is unavailable",
    );
    await expect(amount).toBeVisible();
    await expect(page.getByText("Wallet has been successfully topped up")).toHaveCount(0);
  });

  test("a failed auto top-up save leaves the previous settings", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      http.post(apiUrl(TOP_UP_SETTINGS_PATH), () => providerError()),
    );

    await openWallet(page, baseUrl);
    await autoTopUpButton(page).click();

    const dialog = page
      .getByTestId("modal")
      .filter({ hasText: "Top up credits" });
    await dialog.getByTestId("auto_payments_toggle_button").click();
    await dialog.getByTestId("top_up_min_balance_input").first().fill("10");
    await dialog.getByTestId("top_up_max_balance_input").first().fill("100");
    await dialog.getByTestId("wallet_refilled_save_button").click();

    await expect(page.getByTestId("toast-content")).toContainText(
      "Payment provider is unavailable",
    );
    await expect(dialog).toHaveCount(0);
    await expect(
      page.getByText("When credits drop below $10, your wallet will automatically refill to $100."),
    ).toHaveCount(0);
  });

  test("the history report follows the type filter and opens when ready", async ({
    page,
    baseUrl,
    mockRequest,
    context,
  }) => {
    mockRequest.use(
      operationsHandler(),
      ...reportHandlers(`${baseUrl}/wallet-report.xlsx`),
    );
    const orders = trackPosts(page, OPERATIONS_REPORT_PATH);

    await openWallet(page, baseUrl);
    await expect(page.getByText("Wallet top-up")).toBeVisible();

    const report = context.waitForEvent("page");
    await page.getByTestId("download_report_button").click();

    await expect.poll(() => orders.length).toBe(1);
    expect(orders[0]).toContain('"startDate":"2025-11-12T00:00:00"');
    expect(orders[0]).toContain('"endDate":"2025-12-10T23:59:59"');
    expect(orders[0]).toContain('"credit":true');
    expect(orders[0]).toContain('"debit":true');
    expect((await report).url()).toContain("/wallet-report.xlsx");

    await page.getByTestId("transaction_type_combobox").click();
    await page.getByTestId("credit_transactions_option").click();
    await page.getByTestId("download_report_button").click();

    await expect.poll(() => orders.length).toBe(2);
    expect(orders[1]).toContain('"credit":true');
    expect(orders[1]).toContain('"debit":false');
  });

  test("a top-up reported over the socket refreshes the balance and the history", async ({
    page,
    baseUrl,
    mockRequest,
    wsMock,
  }) => {
    let balance = 50;
    let historyReads = 0;
    mockRequest.use(
      socketSettingsHandler(),
      http.get(apiUrl(BALANCE_PATH), () =>
        jsonResponse({ subAccounts: [{ currency: "USD", amount: balance }] }),
      ),
      http.get(apiUrl(OPERATIONS_PATH), () => {
        historyReads += 1;
        return jsonResponse({ collection: TRANSACTIONS });
      }),
    );
    await wsMock.setupWebSocketMock();

    await openWallet(page, baseUrl);

    // The amount is rendered as separate tokens, so the container is matched as a whole.
    await expect(page.getByText("$50.00", { exact: true })).toBeVisible();
    await expect(page.getByText("Wallet top-up")).toBeVisible();
    const readsBefore = historyReads;

    balance = 150;
    wsMock.emitSocketEvent("s:top-up-wallet", { auto: true });

    await expect(page.getByText("$150.00", { exact: true })).toBeVisible();
    await expect.poll(() => historyReads).toBeGreaterThan(readsBefore);

    wsMock.closeConnection();
  });

  test("the month-to-date spend links to the usage page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      usageHandler([
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
      ]),
    );

    await openWallet(page, baseUrl);

    await expect(page.getByText("Current month-to-date spend")).toBeVisible();
    await expect(page.getByText("For December 2025")).toBeVisible();
    await expect(page.getByText("$12.50")).toBeVisible();

    await page.getByTestId("wallet_view_usage_link").click();

    await page.waitForURL("**/billing/usage**");
  });
});
