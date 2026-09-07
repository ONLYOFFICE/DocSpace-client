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
  freeQuotaHandler,
  paymentAccountHandler,
  paymentSettingsHandler,
  paymentUrlHandler,
  portalPaymentQuotasHandler,
  quotaHandler,
  selfByTypeHandler,
  settingsHandler,
  tariffHandler,
  TARIFF_DUE_DATE_EXPIRED,
  TypeSettings,
} from "@docspace/shared/__mocks__/handlers";
import {
  PATH_TARIFF,
  tariffSuccess,
} from "@docspace/shared/__mocks__/handlers/portal/tariff";
import { PATH_PAYMENT_CUSTOMER_INFO } from "@docspace/shared/__mocks__/handlers/portal/paymentCustomerInfo";
import {
  API_PREFIX,
  BASE_URL,
  type WorkerFixture,
} from "@docspace/shared/__mocks__/e2e";
import { PaymentMethodStatus, TariffState } from "@docspace/shared/enums";
import type { Page } from "@playwright/test";

import { TEST_PORT } from "../fixtures/base";

// The mocked subscription ends on 2026-01-05; the grace window runs to 2026-01-07.
export const PAID_NOW = new Date("2025-12-10T06:00:00.000Z");
export const GRACE_NOW = new Date("2026-01-06T06:00:00.000Z");

export const apiUrl = (path: string) =>
  `${BASE_URL}:${TEST_PORT}/${API_PREFIX}/${path}`;

export const jsonResponse = (response: unknown) =>
  new Response(
    JSON.stringify({ response, count: 1, status: 0, statusCode: 200 }),
  );

// The shared tariff handler only produces Paid or Delay.
export const unpaidTariffHandler = () =>
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

// An object balance marks the wallet as topped up before (wasFirstTopUp).
export const balanceHandler = (amount = 50) =>
  http.get(apiUrl("portal/payment/customer/balance"), () =>
    jsonResponse({ subAccounts: [{ currency: "USD", amount }] }),
  );

export type UserKind = "owner" | "admin" | "roomAdmin" | "regular";

export type PayerKind = "self-owner" | "foreign" | "left" | "none";

export type TariffKind = "paid" | "grace" | "unpaid";

export type PlanKind = "business" | "startup";

export type CardKind = "active" | "unlinked" | "expired";

const PAYER_EMAIL: Record<PayerKind, string | null> = {
  "self-owner": "test@gmail.com",
  foreign: "another@test.com",
  left: "test-nonpayer@gtest.com",
  none: null,
};

const WALLET_CURRENCY = { currencySymbol: "$", isoCurrencySymbol: "USD" };

const CARD_STATUS: Record<CardKind, PaymentMethodStatus> = {
  active: PaymentMethodStatus.Set,
  unlinked: PaymentMethodStatus.None,
  expired: PaymentMethodStatus.Expired,
};

const customerInfoHandler = (payer: PayerKind, card: CardKind) =>
  http.get(apiUrl(PATH_PAYMENT_CUSTOMER_INFO), () =>
    jsonResponse({
      portalId: null,
      paymentMethodStatus: CARD_STATUS[card],
      email: PAYER_EMAIL[payer],
      payer:
        payer === "left" || payer === "none"
          ? null
          : { displayName: "Test Payer", hasAvatar: false },
    }),
  );

const tariffHandlerFor = (state: TariffKind) => {
  if (state === "unpaid") return unpaidTariffHandler();

  return tariffHandler(
    TEST_PORT,
    false,
    state === "grace",
    false,
    false,
    TARIFF_DUE_DATE_EXPIRED,
  );
};

export const useSaasBilling = (
  mockRequest: WorkerFixture,
  {
    user = "owner",
    payer = "self-owner",
    tariff = "paid",
    plan = "business",
    card = "active",
  }: {
    user?: UserKind;
    payer?: PayerKind;
    tariff?: TariffKind;
    plan?: PlanKind;
    card?: CardKind;
  } = {},
) => {
  mockRequest.use(
    // en-US: "$50.00" rather than "US$50.00".
    selfByTypeHandler(TEST_PORT, user, "en-US"),
    settingsHandler(TEST_PORT, TypeSettings.AuthenticatedNoStandalone),
    colorThemeHandler(TEST_PORT),
    paymentSettingsHandler(TEST_PORT, false),
    // Since billing moved to the wallet the plan is priced in the wallet currency.
    portalPaymentQuotasHandler(TEST_PORT, WALLET_CURRENCY),
    customerInfoHandler(payer, card),
    paymentAccountHandler(TEST_PORT),
    paymentUrlHandler(TEST_PORT),
    tariffHandlerFor(tariff),
    plan === "startup"
      ? freeQuotaHandler(TEST_PORT)
      : quotaHandler(TEST_PORT, false, false, false, true),
    balanceHandler(),
  );
};

export const PAYER_WARNING = "Only the Payer can manage this section";

export const topUpButton = (page: Page) =>
  page.getByTestId("top_up_balance_button");
export const autoTopUpButton = (page: Page) =>
  page.getByTestId("auto_top_up_button");
export const planButton = (page: Page) =>
  page.getByTestId("upgrade_plan_button").first();
export const payerWarning = (page: Page) => page.getByText(PAYER_WARNING);

export const WALLET_SERVICES_PATH = "portal/payment/walletservices";
export const WALLET_SERVICE_PATH = "portal/payment/walletservice";
export const SERVICE_STATE_PATH = "portal/payment/servicestate";

const ICON =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"></svg>';

export const WALLET_SERVICES = [
  {
    id: -13,
    serviceName: "ai-tools",
    price: { value: 0, currencySymbol: "$", isoCurrencySymbol: "USD" },
    features: [
      {
        id: "aitools",
        title: "AI services",
        priceTitle: "Pay as you go",
        image: ICON,
        value: false,
        type: "flag",
      },
    ],
  },
  {
    id: -18,
    serviceName: "ai-search",
    price: { value: 0, currencySymbol: "$", isoCurrencySymbol: "USD" },
    features: [
      {
        id: "aisearch",
        title: "AI search",
        priceTitle: "Web search for AI agents",
        image: ICON,
        value: false,
        type: "flag",
      },
    ],
  },
  {
    id: -12,
    serviceName: "backup",
    price: { value: 2, currencySymbol: "$", isoCurrencySymbol: "USD" },
    features: [
      {
        id: "backup",
        title: "Backups",
        priceTitle: "Extra backups beyond the plan",
        image: ICON,
        value: false,
        type: "flag",
      },
    ],
  },
  {
    id: -11,
    serviceName: "disk-storage",
    price: { value: 0.1, currencySymbol: "$", isoCurrencySymbol: "USD" },
    features: [
      {
        id: "total_size",
        title: "Disk storage",
        priceTitle: "Extra storage",
        image: ICON,
        value: 1073741824,
        type: "size",
      },
    ],
  },
];

// Ids follow the wallet service enum: storage -11, backup -12, AI tools -13.
export const STORAGE_SERVICE_ID = -11;

const STORAGE_DUE_DATE = "2026-01-05T10:00:00.0000000Z";

// The single-service endpoint is asked by the service enum, not the feature id.
const SERVICE_ID_BY_ENUM: Record<string, number> = {
  storage: -11,
  backup: -12,
  aitools: -13,
  aisearch: -18,
};

// on: flag feature ids already switched on.
export const walletServicesHandler = (on: string[] = []) => {
  const services = WALLET_SERVICES.map((service) => ({
    ...service,
    features: service.features.map((feature) =>
      feature.type === "flag" && on.includes(feature.id)
        ? { ...feature, value: true }
        : feature,
    ),
  }));

  return [
    http.get(apiUrl(WALLET_SERVICES_PATH), () => jsonResponse(services)),
    http.get(apiUrl(WALLET_SERVICE_PATH), ({ request }) => {
      const id =
        SERVICE_ID_BY_ENUM[new URL(request.url).searchParams.get("service") ?? ""];

      return jsonResponse(services.find((service) => service.id === id) ?? null);
    }),
  ];
};

// A storage subscription is a wallet quota under the storage service id; quantity is GB.
// state 1 marks an overdue (deactivated) plan, nextQuantity a scheduled change;
// the options are read per request, so a test may mutate them as the flow goes.
export const storageSubscriptionTariff = (
  sizeGb: number | (() => number),
  quota: { state?: number; nextQuantity?: number; grace?: boolean } = {},
) =>
  http.get(apiUrl(PATH_TARIFF), () => {
    const { grace = false, ...extra } = quota;
    const body = tariffSuccess(
      false,
      grace,
      false,
      false,
      TARIFF_DUE_DATE_EXPIRED,
    );
    const quantity = typeof sizeGb === "function" ? sizeGb() : sizeGb;

    return new Response(
      JSON.stringify({
        ...body,
        response: {
          ...body.response,
          quotas: quantity
            ? [
                ...body.response.quotas,
                {
                  id: STORAGE_SERVICE_ID,
                  quantity,
                  wallet: true,
                  dueDate: STORAGE_DUE_DATE,
                  ...extra,
                },
              ]
            : body.response.quotas,
        },
      }),
    );
  });

export const serviceStateHandler = () =>
  http.post(apiUrl(SERVICE_STATE_PATH), () => jsonResponse(true));

// The AI cards and pages read the service fee from the accounting prices.
export const serviceFeeHandler = () =>
  http.get(apiUrl("portal/payment/accounting/prices/:service"), () =>
    jsonResponse([{ extraCharge: 20 }]),
  );

export const trackServiceStateChanges = (page: Page) => {
  const bodies: string[] = [];

  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname.endsWith(`/${SERVICE_STATE_PATH}`)
    )
      bodies.push(request.postData() ?? "");
  });

  return bodies;
};
