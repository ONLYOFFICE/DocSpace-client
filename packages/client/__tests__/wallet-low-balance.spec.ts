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
  favoritesHandler,
  rootHandler,
  filesSettingsHandler,
  selfHandlerWithCulture,
} from "@docspace/shared/__mocks__/handlers";
import {
  settingAuthWithSocket,
  PATH as SETTINGS_PATH,
} from "@docspace/shared/__mocks__/handlers/settings/settings";
import {
  expectScreenshot,
  API_PREFIX,
  BASE_URL,
} from "@docspace/shared/__mocks__/e2e";
import { expect, test, TEST_PORT } from "./fixtures/base";

test.use({ locale: "en-US", timezoneId: "UTC" });

const SELF_EMAIL = "test@gmail.com";
const PAGE_URL = "/files/favorite/filter?folder=1";

const apiUrl = (path: string) =>
  `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

const jsonResponse = (response: unknown) =>
  new Response(
    JSON.stringify({ response, count: 1, status: 0, statusCode: 200 }),
  );

/**
 * Wallet billing is SaaS-only, so the portal must not be standalone — that is
 * also what makes auth fetch the payer info. `walletLowBalance` carries the
 * low balance state when the socket event was missed.
 */
const walletSettingsHandler = ({ lowBalance = true } = {}) =>
  http.get(apiUrl(SETTINGS_PATH), () =>
    new Response(
      JSON.stringify({
        ...settingAuthWithSocket,
        response: {
          ...settingAuthWithSocket.response,
          standalone: false,
          walletLowBalance: lowBalance,
        },
      }),
    ),
  );

const balanceHandler = (amount = 0.6) =>
  http.get(apiUrl("portal/payment/customer/balance"), () =>
    jsonResponse({ subAccounts: [{ currency: "USD", amount }] }),
  );

const customerInfoHandler = ({ isPayer = true } = {}) =>
  http.get(apiUrl("portal/payment/customerinfo"), () =>
    jsonResponse({
      portalId: null,
      paymentMethodStatus: 1,
      email: isPayer ? SELF_EMAIL : "konstantin123@gmail.com",
      payer: isPayer ? null : { displayName: "Konstantin Payer", hasAvatar: false },
    }),
  );

const banner = (page: import("@playwright/test").Page) =>
  page.locator("#main-bar");

test.describe("Wallet low balance banner", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      filesSettingsHandler(TEST_PORT),
      rootHandler(TEST_PORT),
      favoritesHandler(TEST_PORT),
      balanceHandler(),
      // en-US keeps the currency formatted as "$0.60", not "US$0.60"
      selfHandlerWithCulture(TEST_PORT, "en-US"),
    );
  });

  test("payer sees the banner with a top-up link", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(walletSettingsHandler(), customerInfoHandler());

    await page.goto(`${baseUrl}${PAGE_URL}`);

    const header = page.getByTestId("snackbar-header");
    await expect(header).toBeVisible();
    await expect(header).toHaveText("Your credits are running low: $0.60");

    await expect(
      banner(page).getByText(
        "Top up your wallet to avoid interruptions to paid services.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-low-balance",
      "banner-payer.png",
    ]);
  });

  test("top-up link opens the simplified top-up dialog", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(walletSettingsHandler(), customerInfoHandler());

    await page.goto(`${baseUrl}${PAGE_URL}`);

    await expect(page.getByTestId("snackbar-header")).toBeVisible();

    await banner(page).getByText("Top up", { exact: true }).click();

    // The modal markup carries the input twice (desktop and aside variants).
    await expect(page.getByTestId("top_up_amount_input").first()).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-low-balance",
      "top-up-dialog.png",
    ]);
  });

  test("non-payer is asked to contact the payer", async ({
    page,
    mockRequest,
    baseUrl,
  }) => {
    mockRequest.use(
      walletSettingsHandler(),
      customerInfoHandler({ isPayer: false }),
    );

    await page.goto(`${baseUrl}${PAGE_URL}`);

    const header = page.getByTestId("snackbar-header");
    await expect(header).toBeVisible();
    await expect(header).toHaveText("Your credits are running low: $0.60");

    await expect(
      banner(page).getByText(
        "Contact the Payer (Konstantin Payer) to top up the wallet and avoid interruptions to paid services.",
      ),
    ).toBeVisible();

    await expectScreenshot(page, [
      "desktop",
      "wallet-low-balance",
      "banner-non-payer.png",
    ]);
  });

  test("socket event raises the banner and a top-up hides it", async ({
    page,
    mockRequest,
    wsMock,
    baseUrl,
  }) => {
    mockRequest.use(
      walletSettingsHandler({ lowBalance: false }),
      customerInfoHandler(),
    );
    await wsMock.setupWebSocketMock();

    await page.goto(`${baseUrl}${PAGE_URL}`);

    // Only the low balance banner matters: the shared mocks may render other
    // quota bars of their own.
    const header = page.getByText("Your credits are running low: $0.60");

    await expect(page.getByTestId("table-body")).toBeVisible();
    await expect(header).toBeHidden();

    wsMock.emitSocketEvent("s:wallet-low-balance", { amount: 0.6 });

    await expect(header).toBeVisible();

    wsMock.emitSocketEvent("s:top-up-wallet", { auto: true });

    await expect(header).toBeHidden();

    wsMock.closeConnection();
  });
});
