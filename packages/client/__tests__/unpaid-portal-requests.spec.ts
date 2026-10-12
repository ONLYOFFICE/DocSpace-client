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
  colorThemeHandler,
  paymentAccountHandler,
  paymentCustomerInfoHandler,
  paymentSettingsHandler,
  paymentUrlHandler,
  portalPaymentQuotasHandler,
  quotaHandler,
  selfByTypeHandler,
  settingsHandler,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import {
  PATH_TARIFF,
  TARIFF_DUE_DATE_EXPIRED,
  tariffSuccess,
} from "@docspace/shared/__mocks__/handlers/portal/tariff";
import { API_PREFIX, BASE_URL } from "@docspace/shared/__mocks__/e2e";
import { TariffState } from "@docspace/shared/enums";
import type { Page } from "@playwright/test";

import { expect, test, TEST_PORT } from "./fixtures/base";

test.use({ timezoneId: "UTC" });

const apiUrl = (path: string) =>
  `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

const jsonResponse = (response: unknown) =>
  new Response(
    JSON.stringify({ response, count: 1, status: 0, statusCode: 200 }),
  );

// The shared tariff handler only produces Paid or Delay.
const unpaidTariffHandler = () =>
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
        response: { ...body.response, state: TariffState.NotPaid },
      }),
    );
  });

const balanceHandler = () =>
  http.get(apiUrl("portal/payment/customer/balance"), () =>
    jsonResponse({ subAccounts: [{ currency: "USD", amount: 0 }] }),
  );

// Numeric and uuid path segments are wildcarded so the lists stay stable.
const trackApiCalls = (page: Page) => {
  const calls = new Set<string>();

  page.on("request", (request) => {
    const url = new URL(request.url());
    const marker = `/${API_PREFIX}/`;

    if (!url.pathname.includes(marker)) return;

    const path = url.pathname
      .slice(url.pathname.indexOf(marker) + marker.length)
      .split("/")
      .map((segment) =>
        /^\d+$/.test(segment) || /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(segment)
          ? "*"
          : segment,
      )
      .join("/");

    calls.add(`${request.method()} ${path}`);
  });

  return calls;
};

const settle = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  // networkidle fires after 500ms of silence; give slow followers one more beat.
  await page.waitForTimeout(1000);
};

const expectOnlyAllowed = (calls: Set<string>, allowed: string[]) => {
  const extras = [...calls].filter((call) => !allowed.includes(call)).sort();

  expect(
    extras,
    `API requests fired on an unpaid portal that are not on the allowlist.\n` +
      `Either guard them with isNotPaidPeriod or, if deliberate, add them ` +
      `to this spec:\n${extras.join("\n")}`,
  ).toEqual([]);
};

// Every page.goto is a full reload, so page lists extend the boot set.
const BOOT_ALLOWED = [
  "GET capabilities",
  "GET people/@self",
  "GET portal/payment/account",
  "GET portal/payment/customer/balance",
  "GET portal/payment/customerinfo",
  "GET portal/payment/quota",
  "GET portal/payment/quotas",
  "GET portal/quota",
  "GET portal/tariff",
  "GET settings",
  "GET settings/colortheme",
  "GET settings/cultures",
  "GET settings/payment",
  "GET settings/rebranding/company",
  "GET settings/version/build",
];

// The tariff page fetches a Stripe checkout link.
const TARIFF_PAGE_ALLOWED = [...BOOT_ALLOWED, "PUT portal/payment/url"];

const WALLET_PAGE_ALLOWED = [
  ...BOOT_ALLOWED,
  "GET portal/payment/customer/operations",
  "GET portal/payment/customer/usage",
  "GET portal/payment/topupsettings",
  "GET portal/tariff/upcoming",
];

const BACKUP_PAGE_ALLOWED = [...BOOT_ALLOWED, "GET portal/getbackupprogress"];

// The deletion page shows the owner's profile.
const DELETION_PAGE_ALLOWED = [...BOOT_ALLOWED, "GET people/*"];

test.describe("Unpaid portal - allowed API surface", () => {
  test.beforeEach(async ({ mockRequest }) => {
    mockRequest.use(
      selfByTypeHandler(TEST_PORT, "owner"),
      settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
      colorThemeHandler(TEST_PORT),
      paymentSettingsHandler(TEST_PORT, false),
      portalPaymentQuotasHandler(TEST_PORT),
      paymentCustomerInfoHandler(TEST_PORT),
      paymentAccountHandler(TEST_PORT),
      paymentUrlHandler(TEST_PORT),
      unpaidTariffHandler(),
      quotaHandler(TEST_PORT, false, false, false, true),
      balanceHandler(),
    );
  });

  test("boot redirects an admin to the tariff page and fires only allowed requests", async ({
    page,
    baseUrl,
  }) => {
    const calls = trackApiCalls(page);

    await page.goto(`${baseUrl}/`);
    await page.waitForURL("**/billing/tariff-plan**");
    await settle(page);

    expectOnlyAllowed(calls, TARIFF_PAGE_ALLOWED);
  });

  test("the wallet page stays reachable and fires only allowed requests", async ({
    page,
    baseUrl,
  }) => {
    const calls = trackApiCalls(page);

    await page.goto(`${baseUrl}/billing/wallet`);
    await page.waitForURL("**/billing/wallet**");
    await settle(page);

    expectOnlyAllowed(calls, WALLET_PAGE_ALLOWED);
  });

  test("the data backup page stays reachable and fires only allowed requests", async ({
    page,
    baseUrl,
  }) => {
    const calls = trackApiCalls(page);

    await page.goto(`${baseUrl}/portal-settings/backup/data-backup`);
    await page.waitForURL("**/portal-settings/backup/data-backup**");
    await settle(page);

    expectOnlyAllowed(calls, BACKUP_PAGE_ALLOWED);
  });

  test("the portal deletion page stays reachable for the owner", async ({
    page,
    baseUrl,
  }) => {
    const calls = trackApiCalls(page);

    await page.goto(`${baseUrl}/portal-settings/delete-data/deletion`);
    await page.waitForURL("**/portal-settings/delete-data/deletion**");
    await settle(page);

    expectOnlyAllowed(calls, DELETION_PAGE_ALLOWED);
  });

  test("a member is sent to portal-unavailable with the minimal request set", async ({
    page,
    baseUrl,
    mockRequest,
  }) => {
    mockRequest.use(selfByTypeHandler(TEST_PORT, "regular"));

    const calls = trackApiCalls(page);

    await page.goto(`${baseUrl}/`);
    await page.waitForURL("**/portal-unavailable**");
    await settle(page);

    expectOnlyAllowed(calls, BOOT_ALLOWED);
  });
});
