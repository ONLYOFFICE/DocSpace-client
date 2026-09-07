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
import { expectScreenshot } from "@docspace/shared/__mocks__/e2e";
import type { Page } from "@playwright/test";

import { expect, test, TEST_PORT } from "./fixtures/base";
import {
  PAID_NOW,
  apiUrl,
  balanceHandler,
  jsonResponse,
  payerWarning,
  serviceFeeHandler,
  serviceStateHandler,
  storageSubscriptionTariff,
  trackServiceStateChanges,
  useSaasBilling,
  walletServicesHandler,
} from "./helpers/billing";

test.use({ locale: "en-US", timezoneId: "UTC" });

const STORAGE_ROUTE = "/billing/addons/disk-storage";
const BACKUP_ROUTE = "/billing/addons/backup";
const AI_ROUTE = "/billing/addons/ai-services";
const AI_SEARCH_ROUTE = "/billing/addons/ai-search";
const DOCS_CONNECT_ROUTE = "/billing/addons/docs-connect";

const NON_PAYER = { user: "admin", payer: "foreign" } as const;
const FIRST_RENDER = { timeout: 15000 };

const BACKUP_USAGE = [
  {
    service: "backup",
    serviceUnit: "backup",
    currency: "USD",
    totalQuantity: 3,
    totalAmount: 6,
    operationCount: 3,
    title: "Backups",
    price: 2,
  },
];

const AI_USAGE = [
  {
    service: "ai-tools",
    serviceUnit: "tokens",
    currency: "USD",
    totalQuantity: 12345,
    totalAmount: 1.5,
    operationCount: 8,
    title: "AI services",
    price: 0,
  },
];

const AI_SEARCH_USAGE = [
  {
    service: "ai-search",
    serviceUnit: "requests",
    currency: "USD",
    totalQuantity: 42,
    totalAmount: 0.84,
    operationCount: 42,
    title: "AI search",
    price: 0,
  },
];

// Every service page loads its history and month usage on mount.
const servicePageHandlers = ({
  usage = [] as unknown[],
  backups = { free: 0, paid: 0 },
} = {}) => [
  http.get(apiUrl("portal/payment/customer/operations"), () =>
    jsonResponse({ collection: [] }),
  ),
  http.get(apiUrl("portal/payment/customer/usage"), () =>
    jsonResponse({ collection: usage }),
  ),
  http.get(apiUrl("backup/getbackupscountbypaid"), () => jsonResponse(backups)),
  http.get(apiUrl("portal/payment/topupsettings"), () =>
    jsonResponse({ enabled: false, minBalance: 10, upToBalance: 100 }),
  ),
  serviceStateHandler(),
  serviceFeeHandler(),
];

const topUpWalletButton = (page: Page) =>
  page.getByTestId("top_up_wallet_button");
const serviceToggle = (page: Page) => page.getByTestId("toggle-button").first();
// The toggle container has no height of its own: click and wait on its label.
const toggleSwitch = (toggle: ReturnType<Page["getByTestId"]>) =>
  toggle.locator("label");
const storageOkButton = (page: Page) =>
  page.getByTestId("storage_plan_upgrade_ok_button");
const unlinkedBanner = (page: Page) =>
  page.getByText("Payment method unlinked.");

const openStorage = async (page: Page, baseUrl: string) => {
  await page.goto(`${baseUrl}${STORAGE_ROUTE}`);

  await expect(
    page.getByText("Adjust the storage to the exact amount you require"),
  ).toBeVisible(FIRST_RENDER);
};

const chooseStoragePlan = async (page: Page, sizeGb: string) => {
  await page.getByRole("button", { name: "Buy storage", exact: true }).click();

  const okButton = storageOkButton(page);
  await expect(okButton).toBeVisible();
  await page
    .getByTestId("modal")
    .filter({ has: okButton })
    .locator("input")
    .fill(sizeGb);
};

test.describe("Disk storage page", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...walletServicesHandler(), ...servicePageHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("without a subscription the payer is offered to buy storage", async ({
    page,
    baseUrl,
  }) => {
    await openStorage(page, baseUrl);

    await expect(page.getByText("No active subscription")).toBeVisible();
    await expect(page.getByRole("button", { name: "Buy storage", exact: true })).toBeEnabled();
    await expect(page.getByText("$0.10 per 1 GB/month")).toBeVisible();
    await expect(page.getByText("Available credits: $50.00")).toBeVisible();
    await expect(topUpWalletButton(page)).toBeVisible();
    await expect(serviceToggle(page)).toHaveAttribute("aria-checked", "false");

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-no-subscription.png",
    ]);
  });

  test("a running subscription shows its size, charge and renewal", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(storageSubscriptionTariff(200));

    await openStorage(page, baseUrl);

    await expect(page.getByText("Current subscription")).toBeVisible();
    await expect(page.getByText("Monthly charge")).toBeVisible();
    await expect(page.getByText("200 GB", { exact: true })).toBeVisible();
    await expect(
      page.getByText(
        "Subscription will be automatically renewed on January 5, 2026",
      ),
    ).toBeVisible();
    await expect(serviceToggle(page)).toHaveAttribute("aria-checked", "true");

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-subscription.png",
    ]);

    await page.getByRole("button", { name: "Edit subscription", exact: true }).click();

    await expect(page.getByText("New total storage (GB)")).toBeVisible();
    await expect(storageOkButton(page)).toHaveText("Update");
  });

  test("the payer can top up and buy storage in one step", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    let bought = false;
    mockRequest.use(
      balanceHandler(5),
      http.post(apiUrl("portal/payment/deposit"), () => jsonResponse(true)),
      http.put(apiUrl("portal/payment/updatewallet"), () => {
        bought = true;
        return jsonResponse(true);
      }),
      storageSubscriptionTariff(() => (bought ? 100 : 0)),
    );

    const requests: string[] = [];
    page.on("request", (request) => {
      const { pathname } = new URL(request.url());
      if (
        pathname.endsWith("/portal/payment/deposit") ||
        pathname.endsWith("/portal/payment/updatewallet")
      )
        requests.push(
          `${request.method()} ${pathname.split("/").pop()} ${request.postData() ?? ""}`,
        );
    });

    await openStorage(page, baseUrl);
    await chooseStoragePlan(page, "100");

    await expect(
      page.getByText("Available credits: $5.00 | Insufficient funds"),
    ).toBeVisible();
    await expect(storageOkButton(page)).toHaveText("Top up & Upgrade", FIRST_RENDER);
    await expect(storageOkButton(page)).toBeEnabled();
    await expect(
      page.getByText(
        "Your wallet will be topped up by $5.00 and the selected storage will be purchased automatically.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-top-up-and-upgrade.png",
    ]);

    await storageOkButton(page).click();

    await expect.poll(() => requests.length).toBe(2);
    expect(requests[0]).toContain("POST deposit");
    expect(requests[0]).toContain('"amount":5');
    expect(requests[1]).toContain("PUT updatewallet");
    expect(requests[1]).toContain('"storage":100');
    await expect(storageOkButton(page)).toBeHidden();
    await expect(page.getByText("Storage added")).toBeVisible();
    await expect(page.getByText("100 GB", { exact: true })).toBeVisible();
  });

  test("a non-payer short of credits is sent to the payer", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);
    mockRequest.use(balanceHandler(5));

    await openStorage(page, baseUrl);

    await expect(topUpWalletButton(page)).toHaveCount(0);

    await chooseStoragePlan(page, "100");

    await expect(page.getByTestId("storage_contact_payer_name")).toHaveText(
      "Test Payer",
      FIRST_RENDER,
    );
    await expect(
      page.getByText(
        "There aren't enough credits for the selected storage amount.",
      ),
    ).toBeVisible();
    await expect(storageOkButton(page)).toHaveText("Upgrade now");
    await expect(storageOkButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-contact-payer.png",
    ]);
  });

  test("a non-payer with enough credits buys storage directly", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);

    await openStorage(page, baseUrl);
    await chooseStoragePlan(page, "100");

    await expect(storageOkButton(page)).toHaveText("Upgrade now");
    await expect(storageOkButton(page)).toBeEnabled(FIRST_RENDER);
    await expect(page.getByTestId("storage_contact_payer_name")).toHaveCount(0);
  });
  test("a deactivated subscription is kept as the previous plan", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(storageSubscriptionTariff(200, { state: 1 }));

    await openStorage(page, baseUrl);

    await expect(
      page.getByText(
        "Your additional storage subscription has been deactivated due to non-payment",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-deactivated-dialog.png",
    ]);

    await page.getByTestId("close_storage_tariff_deactivated_button").click();

    await expect(page.getByText("Previous subscription")).toBeVisible();
    await expect(page.getByText("Inactive", { exact: true })).toBeVisible();
    await expect(page.getByText("Subscription deactivated")).toBeVisible();
    await expect(page.getByText("200 GB", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Top up & Renew", exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Remove subscription", exact: true }),
    ).toBeEnabled();
    await expect(serviceToggle(page)).toHaveAttribute("aria-checked", "false");

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-deactivated.png",
    ]);
  });

  test("a non-payer sees the previous plan without the warning dialog", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);
    mockRequest.use(storageSubscriptionTariff(200, { state: 1 }));

    await openStorage(page, baseUrl);

    await expect(page.getByText("Previous subscription")).toBeVisible();
    await expect(
      page.getByTestId("close_storage_tariff_deactivated_button"),
    ).toHaveCount(0);
  });

  test("a scheduled downgrade locks the subscription until it applies", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(storageSubscriptionTariff(200, { nextQuantity: 100 }));

    await openStorage(page, baseUrl);

    await expect(
      page.getByText("Change scheduled: Storage adjustment"),
    ).toBeVisible();
    await expect(page.getByText("Cancel change", { exact: true })).toBeVisible();
    await expect(page.getByText("$10.00/month (100 GB)")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Edit subscription", exact: true }),
    ).toHaveCount(0);
    await expect(serviceToggle(page).locator("input")).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-downgrade-scheduled.png",
    ]);
  });

  test("a scheduled cancellation says when the storage ends", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(storageSubscriptionTariff(200, { nextQuantity: 0 }));

    await openStorage(page, baseUrl);

    await expect(
      page.getByText("Change scheduled: Subscription cancellation"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Subscription will be automatically canceled on January 5, 2026",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "storage-cancellation-scheduled.png",
    ]);
  });
});

test.describe("Add-on pages with an unlinked card", () => {
  const PAGES = [
    ["disk storage", STORAGE_ROUTE, "storage-unlinked-card.png"],
    ["backup", BACKUP_ROUTE, "backup-unlinked-card.png"],
    ["AI services", AI_ROUTE, "ai-services-unlinked-card.png"],
    ["AI search", AI_SEARCH_ROUTE, "ai-search-unlinked-card.png"],
  ] as const;

  test.beforeEach(async ({ mockRequest, page }) => {
    mockRequest.use(...walletServicesHandler(), ...servicePageHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  for (const [name, route, screenshot] of PAGES) {
    test(`the ${name} page asks the payer to add a payment method`, async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      useSaasBilling(mockRequest, { card: "unlinked" });

      await page.goto(`${baseUrl}${route}`);

      await expect(unlinkedBanner(page)).toBeVisible(FIRST_RENDER);
      await expect(page.getByText("Add payment method")).toBeVisible();

      await expectScreenshot(page, ["desktop", "addon-pages", screenshot]);
    });

    test(`the ${name} page points a non-payer at the payer`, async ({
      page,
      baseUrl,
      mockRequest,
    }) => {
      useSaasBilling(mockRequest, { ...NON_PAYER, card: "unlinked" });

      await page.goto(`${baseUrl}${route}`);

      await expect(unlinkedBanner(page)).toBeVisible(FIRST_RENDER);
      await expect(
        page.locator('a[href="mailto:another@test.com"]'),
      ).toBeVisible();
      await expect(page.getByText("Add payment method")).toHaveCount(0);
    });
  }
});

test.describe("Backup page", () => {
  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      ...walletServicesHandler(),
      ...servicePageHandlers({
        usage: BACKUP_USAGE,
        backups: { free: 1, paid: 3 },
      }),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("counts the free and paid backups of the month", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await expect(
      page.getByText("Additional backups ($2.00 per 1 backup)"),
    ).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("Free monthly")).toBeVisible();
    await expect(page.getByText("1/2", { exact: true })).toBeVisible();
    await expect(page.getByText("Renews on Jan 1, 2026")).toBeVisible();
    await expect(page.getByText("Additional backups disabled")).toBeVisible();
    await expect(page.getByText("$6.00", { exact: true })).toBeVisible();
    await expect(page.getByText("For December 2025")).toBeVisible();
    await expect(page.getByText("4", { exact: true })).toBeVisible();
    await expect(page.getByText("Free backups: 1")).toBeVisible();
    await expect(page.getByText("Billed backups: 3")).toBeVisible();
    await expect(serviceToggle(page)).toHaveAttribute("aria-checked", "false");

    await expectScreenshot(page, ["desktop", "addon-pages", "backup-off.png"]);
  });

  test("enabling additional backups says how many the wallet buys", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await page.getByRole("button", { name: "Enable", exact: true }).click();

    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"service":-12');
    expect(changes[0]).toContain('"enabled":true');
    await expect(serviceToggle(page)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("25", { exact: true })).toBeVisible();
    await expect(
      page.getByText("$2.00 per 1 backup", { exact: true }),
    ).toBeVisible();
  });

  test("with backups on, the balance is turned into a backup count", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["backup"]));

    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await expect(serviceToggle(page)).toHaveAttribute(
      "aria-checked",
      "true",
      FIRST_RENDER,
    );
    await expect(page.getByText("25", { exact: true })).toBeVisible();
    await expect(
      page.getByText("Your wallet has insufficient funds"),
    ).toHaveCount(0);

    await expectScreenshot(page, ["desktop", "addon-pages", "backup-on.png"]);
  });

  test("an empty wallet leaves no backups to make", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["backup"]), balanceHandler(0));

    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await expect(
      page.getByText(
        "Your wallet has insufficient funds. Please top up your wallet.",
      ),
    ).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("Available credits: $0.00")).toBeVisible();
    await expect(page.getByText("0", { exact: true })).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "backup-insufficient.png",
    ]);
  });

  test("without any backups made the counters stay at zero", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...servicePageHandlers());

    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await expect(page.getByText("0/2", { exact: true })).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("No backups used in December 2025")).toBeVisible();
    await expect(page.getByText("$0.00", { exact: true })).toBeVisible();
    await expect(page.getByText("0", { exact: true })).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "backup-no-backups.png",
    ]);
  });

  test("the payer tops up from the page", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await topUpWalletButton(page).click();

    await expect(page.getByTestId("top_up_amount_input").first()).toBeVisible();
  });

  test("a non-payer may enable backups but cannot top up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);

    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await expect(page.getByRole("button", { name: "Enable", exact: true })).toBeEnabled(
      FIRST_RENDER,
    );
    await expect(topUpWalletButton(page)).toHaveCount(0);
  });

  test("the free plan has no free monthly backups", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, { payer: "none", plan: "startup" });

    await page.goto(`${baseUrl}${BACKUP_ROUTE}`);

    await expect(page.getByText("Additional backups disabled")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(page.getByText("Free monthly")).toHaveCount(0);
    await expect(page.getByText("Billed backups", { exact: true })).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "backup-startup.png",
    ]);
  });
});

test.describe("AI services page", () => {
  const aiToggle = (page: Page) => page.getByTestId("service-ai-toggle-button");

  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      ...walletServicesHandler(),
      ...servicePageHandlers({ usage: AI_USAGE }),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("shows the month usage, the fee and the switch", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}${AI_ROUTE}`);

    await expect(
      page.getByText("Enable AI features", { exact: true }),
    ).toBeVisible(FIRST_RENDER);
    await expect(aiToggle(page)).toHaveAttribute("aria-checked", "false");
    await expect(page.getByText("$1.50", { exact: true })).toBeVisible();
    await expect(page.getByText("12,345", { exact: true })).toBeVisible();
    await expect(page.getByText("Tokens processed in December 2025")).toBeVisible();
    await expect(
      page.getByText("OpenRouter pricing + 20% service fee applies to usage"),
    ).toBeVisible();
    await expect(page.getByTestId("ai_supported_models_link")).toBeVisible();
    await expect(topUpWalletButton(page)).toBeVisible();

    await expectScreenshot(page, ["desktop", "addon-pages", "ai-services.png"]);
  });

  test("switching AI on charges the wallet and confirms with a toast", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await page.goto(`${baseUrl}${AI_ROUTE}`);

    await expect(toggleSwitch(aiToggle(page))).toBeVisible(FIRST_RENDER);
    await toggleSwitch(aiToggle(page)).click();

    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"service":-13');
    expect(changes[0]).toContain('"enabled":true');
    await expect(aiToggle(page)).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByText("AI tools service successfully enabled."),
    ).toBeVisible();
  });

  test("running AI on a nearly empty wallet warns about the credits", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]), balanceHandler(0.5));

    await page.goto(`${baseUrl}${AI_ROUTE}`);

    await expect(
      page.getByText(
        "Your credits are running low. Add more credits to avoid interruptions to AI features.",
      ),
    ).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("Available credits: $0.50")).toBeVisible();
    await expect(aiToggle(page)).toHaveAttribute("aria-checked", "true");

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "ai-services-low-balance.png",
    ]);
  });

  test("the warning needs AI to be on", async ({ page, baseUrl, mockRequest }) => {
    mockRequest.use(balanceHandler(0.5));

    await page.goto(`${baseUrl}${AI_ROUTE}`);

    await expect(page.getByText("Available credits: $0.50")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(page.getByText("Your credits are running low.")).toHaveCount(0);
  });

  test("a non-payer may switch AI on but cannot top up", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);

    await page.goto(`${baseUrl}${AI_ROUTE}`);

    await expect(toggleSwitch(aiToggle(page))).toBeVisible(FIRST_RENDER);
    await expect(aiToggle(page).locator("input")).toBeEnabled();
    await expect(topUpWalletButton(page)).toHaveCount(0);
  });
});

test.describe("AI search page", () => {
  const searchToggle = (page: Page) =>
    page.getByTestId("service-ai-search-toggle-button");
  const activateButton = (page: Page) =>
    page.getByTestId("service-confirmation-dialog-continue-button");

  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...walletServicesHandler(), ...servicePageHandlers());
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("shows an empty month and the fee", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}${AI_SEARCH_ROUTE}`);

    await expect(toggleSwitch(searchToggle(page))).toBeVisible(FIRST_RENDER);
    await expect(searchToggle(page)).toHaveAttribute("aria-checked", "false");
    await expect(page.getByTestId("heading")).toHaveText("AI search");
    await expect(page.getByText("No AI search used in December 2025")).toBeVisible();
    await expect(
      page.getByText("Exa pricing + 20% service fee applies to usage"),
    ).toBeVisible();
    await expect(page.getByText("No AI search transactions yet")).toBeVisible();
  });

  test("switching search on first asks to activate AI features", async ({
    page,
    baseUrl,
  }) => {
    const changes = trackServiceStateChanges(page);

    await page.goto(`${baseUrl}${AI_SEARCH_ROUTE}`);

    await expect(toggleSwitch(searchToggle(page))).toBeVisible(FIRST_RENDER);
    await toggleSwitch(searchToggle(page)).click();

    await expect(page.getByText("Activate AI features")).toBeVisible();
    await expect(page.getByText("AI Search requires AI features.")).toBeVisible();
    await expect(activateButton(page)).toHaveText("Activate");
    expect(changes).toHaveLength(0);

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "ai-search-activate.png",
    ]);

    await activateButton(page).click();

    await expect.poll(() => changes.length).toBe(2);
    expect(changes[0]).toContain('"service":-13');
    expect(changes[1]).toContain('"service":-18');
    await expect(searchToggle(page)).toHaveAttribute("aria-checked", "true");
    await expect(
      page.getByText("AI search service successfully enabled."),
    ).toBeVisible();
  });

  test("with AI features on, search switches straight on", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(...walletServicesHandler(["aitools"]));
    const changes = trackServiceStateChanges(page);

    await page.goto(`${baseUrl}${AI_SEARCH_ROUTE}`);

    await expect(toggleSwitch(searchToggle(page))).toBeVisible(FIRST_RENDER);
    await toggleSwitch(searchToggle(page)).click();

    await expect.poll(() => changes.length).toBe(1);
    expect(changes[0]).toContain('"service":-18');
    expect(changes[0]).toContain('"enabled":true');
    await expect(activateButton(page)).toHaveCount(0);
    await expect(searchToggle(page)).toHaveAttribute("aria-checked", "true");
  });

  test("a non-payer has no top-up button", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);

    await page.goto(`${baseUrl}${AI_SEARCH_ROUTE}`);

    await expect(toggleSwitch(searchToggle(page))).toBeVisible(FIRST_RENDER);
    await expect(topUpWalletButton(page)).toHaveCount(0);
  });
  test("with search on, the month shows its requests", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(
      ...walletServicesHandler(["aitools", "aisearch"]),
      ...servicePageHandlers({ usage: AI_SEARCH_USAGE }),
    );

    await page.goto(`${baseUrl}${AI_SEARCH_ROUTE}`);

    await expect(toggleSwitch(searchToggle(page))).toBeVisible(FIRST_RENDER);
    await expect(searchToggle(page)).toHaveAttribute("aria-checked", "true");
    await expect(page.getByText("$0.84", { exact: true })).toBeVisible();
    await expect(page.getByText("42", { exact: true })).toBeVisible();
    await expect(page.getByText("Requests processed in December 2025")).toBeVisible();

    await expectScreenshot(page, ["desktop", "addon-pages", "ai-search-on.png"]);
  });
});

test.describe("Docs Connect page", () => {
  const submitButton = (page: Page) =>
    page.getByTestId("docs_connect_buy_plan_submit");

  const openBuyPlan = async (page: Page, baseUrl: string) => {
    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    const upgradeButton = page.getByRole("button", {
      name: "Upgrade",
      exact: true,
    });
    await expect(upgradeButton).toBeVisible(FIRST_RENDER);
    await upgradeButton.click();

    await expect(submitButton(page)).toBeVisible();
  };

  test.beforeEach(async ({ mockRequest, page }) => {
    mockRequest.use(...servicePageHandlers());
    await page.clock.setSystemTime(new Date(DOCS_CONNECT_FROZEN_NOW));
  });

  test("the payer can top up and buy the plan in one step", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      ...docsConnectHandlers(TEST_PORT, "trialExpired", { balance: 10 }),
    );

    await openBuyPlan(page, baseUrl);

    await expect(
      page.getByText("Available credits: $10.00 | Insufficient funds"),
    ).toBeVisible();
    await expect(submitButton(page)).toHaveText("Top up & Buy");
    await expect(submitButton(page)).toBeEnabled();
    await expect(
      page.getByText(
        "Your wallet will be topped up by $90.00 and the selected subscription will be purchased automatically.",
      ),
    ).toBeVisible();
  });

  test("a non-payer short of credits is sent to the payer", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);
    mockRequest.use(
      ...docsConnectHandlers(TEST_PORT, "trialExpired", { balance: 10 }),
    );

    await openBuyPlan(page, baseUrl);

    await expect(
      page.getByTestId("docs_connect_contact_payer_name"),
    ).toHaveText("Test Payer");
    await expect(
      page.getByText(
        "There aren't enough credits for the selected Docs Connect subscription.",
      ),
    ).toBeVisible();
    await expect(submitButton(page)).toHaveText("Upgrade");
    await expect(submitButton(page)).toBeDisabled();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "docs-connect-contact-payer.png",
    ]);
  });

  test("the payer tops up from the page", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "paid"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("Available credits: $500.00")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(topUpWalletButton(page)).toBeVisible();
  });

  test("a non-payer has no top-up button", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest, NON_PAYER);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "paid"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("Available credits: $500.00")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(topUpWalletButton(page)).toHaveCount(0);
  });
  test("a paid plan shows its charge and can be edited", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "paid"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("Current subscription")).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("Monthly charge")).toBeVisible();
    await expect(page.getByText("$100.00", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Edit subscription", exact: true }),
    ).toBeEnabled();
    await expect(page.getByText("Subscription will be automatically renewed")).toBeVisible();
  });

  test("a deactivated plan is kept as the previous subscription", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "deactivated"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("Previous subscription")).toBeVisible(FIRST_RENDER);
    await expect(page.getByText("Inactive", { exact: true })).toBeVisible();
    await expect(page.getByText("Subscription deactivated")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Top up & Renew", exact: true }),
    ).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Remove subscription", exact: true }),
    ).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "docs-connect-deactivated.png",
    ]);
  });

  test("a canceled plan offers to buy a new one", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "canceled"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("No active subscription")).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByRole("button", { name: "Buy", exact: true }),
    ).toBeEnabled();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "docs-connect-canceled.png",
    ]);
  });

  test("a scheduled user change is announced with the next price", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "scheduled"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("Cancel change", { exact: true })).toBeVisible(
      FIRST_RENDER,
    );
    await expect(page.getByText("$60.00/month (Users: 30)")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Edit subscription", exact: true }),
    ).toHaveCount(0);

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "docs-connect-change-scheduled.png",
    ]);
  });

  test("a scheduled cancellation says when the plan ends", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(...docsConnectHandlers(TEST_PORT, "scheduledCancel"));

    await page.goto(`${baseUrl}${DOCS_CONNECT_ROUTE}`);

    await expect(page.getByText("Subscription cancellation")).toBeVisible(FIRST_RENDER);
    await expect(
      page.getByText("Your current subscription will remain active until the end of your billing period"),
    ).toBeVisible();
    await expect(
      page.getByText("Tariff plan will be automatically canceled on Jul 21, 2026"),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "docs-connect-cancellation-scheduled.png",
    ]);
  });
});

test.describe("Deactivated storage warning on the billing pages", () => {
  const warning = (page: Page) =>
    page.getByText(
      "Your additional storage subscription has been deactivated due to non-payment",
    );

  test.beforeEach(async ({ mockRequest, page }) => {
    useSaasBilling(mockRequest);
    mockRequest.use(
      ...walletServicesHandler(),
      ...servicePageHandlers(),
      http.get(apiUrl("portal/tariff/upcoming"), () => jsonResponse([])),
      storageSubscriptionTariff(200, { state: 1 }),
    );
    await page.clock.setSystemTime(PAID_NOW);
  });

  test("the tariff plan page warns the payer", async ({ page, baseUrl }) => {
    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(warning(page)).toBeVisible(FIRST_RENDER);
    await expect(page.getByTestId("go_to_service_button")).toHaveText(
      "Go to add-on",
    );

    await expectScreenshot(page, [
      "desktop",
      "addon-pages",
      "deactivated-warning-tariff.png",
    ]);
  });

  test("the warning leads to the add-ons and is not repeated once seen", async ({
    page,
    baseUrl,
  }) => {
    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(warning(page)).toBeVisible(FIRST_RENDER);
    await page.getByTestId("go_to_service_button").click();

    await page.waitForURL("**/billing/addons");
    await expect(page.getByTestId("storage_service_total_size")).toBeVisible(
      FIRST_RENDER,
    );
    await expect(warning(page)).toHaveCount(0);

    await page.goto(`${baseUrl}/billing/wallet`);

    await expect(page.getByText("Available credits")).toBeVisible(FIRST_RENDER);
    await expect(warning(page)).toHaveCount(0);
  });

  test("a non-payer is not warned", async ({ page, baseUrl, mockRequest }) => {
    useSaasBilling(mockRequest, NON_PAYER);

    await page.goto(`${baseUrl}/billing/tariff-plan`);

    await expect(payerWarning(page)).toBeVisible(FIRST_RENDER);
    await expect(warning(page)).toHaveCount(0);
  });
});
