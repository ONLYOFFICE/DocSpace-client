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

import { TariffState } from "../../../enums";
import { quotaSuccess } from "../portal/quota";

export type DocsConnectPreset =
  | "noTenant"
  | "trial"
  | "trialLow"
  | "trialExpired"
  | "paid"
  | "paidDevPack"
  | "scheduled"
  | "scheduledDevPackDisable"
  | "scheduledDevPackDisableWithUsers"
  | "scheduledCancel"
  | "deactivated"
  | "canceled";

export const DOCS_CONNECT_FROZEN_NOW = "2026-07-01T06:00:00.000Z";

export const DOCS_CONNECT_SERVICE_ID = 2;
export const DOCS_CONNECT_DEVPACK_SERVICE_ID = 3;
export const DOCS_CONNECT_STORAGE_SERVICE_ID = 4;

export const DOCS_CONNECT_PRICE_PER_USER = 2;
export const DOCS_CONNECT_DEVPACK_FULL_PRICE = 5;
export const DOCS_CONNECT_PLAN_USERS = 50;
export const DOCS_CONNECT_BALANCE = 500;

export const DOCS_CONNECT_TENANT_ADDRESS = "docs-mock.onlyoffice.io";
export const DOCS_CONNECT_SECRET = "mock-docs-connect-secret";

const TRIAL_START = "2026-06-21T10:00:00.000Z";
const TRIAL_END = "2026-07-21T10:00:00.000Z";
const TRIAL_LOW_START = "2026-06-11T10:00:00.000Z";
const TRIAL_LOW_END = "2026-07-11T10:00:00.000Z";
const TRIAL_EXPIRED_START = "2026-05-20T10:00:00.000Z";
const TRIAL_EXPIRED_END = "2026-06-19T10:00:00.000Z";
export const DOCS_CONNECT_PAID_END = "2026-07-21T10:00:00.000Z";
const PAID_START = "2026-06-21T10:00:00.000Z";
const BUILD_DATE = "2026-05-15T00:00:00.000Z";

const isTrialPreset = (preset: DocsConnectPreset) =>
  preset === "trial" || preset === "trialLow" || preset === "trialExpired";

const tenantDates = (preset: DocsConnectPreset) => {
  switch (preset) {
    case "trial":
      return { modifiedDate: TRIAL_START, endDate: TRIAL_END };
    case "trialLow":
      return { modifiedDate: TRIAL_LOW_START, endDate: TRIAL_LOW_END };
    case "trialExpired":
      return { modifiedDate: TRIAL_EXPIRED_START, endDate: TRIAL_EXPIRED_END };
    default:
      return { modifiedDate: PAID_START, endDate: DOCS_CONNECT_PAID_END };
  }
};

const tenantQuantity = (preset: DocsConnectPreset) => {
  if (isTrialPreset(preset) || preset === "canceled") return 0;
  return DOCS_CONNECT_PLAN_USERS;
};

export const docsConnectTenantSuccess = (preset: DocsConnectPreset) => {
  if (preset === "noTenant") return null;

  return {
    address: DOCS_CONNECT_TENANT_ADDRESS,
    ...tenantDates(preset),
    payment: isTrialPreset(preset)
      ? null
      : { quantity: tenantQuantity(preset), currency: "USD" },
  };
};

export const docsConnectConfigSuccess = () => ({
  tenantName: "docspace-mock",
  security: { secret: DOCS_CONNECT_SECRET, header: "AuthorizationJwt" },
  server: { isAnonymousSupport: true, fileSizeLimit: 104857600 },
  wopi: { enable: false },
  ipFilter: { rules: [] },
});

export const docsConnectTenantInfoSuccess = (preset: DocsConnectPreset) => ({
  license: {
    valid: tenantDates(preset).endDate,
    trial: isTrialPreset(preset),
    buildDate: BUILD_DATE,
  },
  server: { version: "9.0.3", packageType: "Docker", date: BUILD_DATE },
  usersLimit: { edit: 50, view: 150 },
  stats: {
    periodDay: 30,
    editor: {
      active: 12,
      internal: 10,
      external: 2,
      remaining: 38,
      criticalRemaining: false,
    },
    viewer: {
      active: 34,
      internal: 30,
      external: 4,
      remaining: 116,
      criticalRemaining: false,
    },
  },
});

export const docsConnectWalletServicesSuccess = () => [
  {
    id: DOCS_CONNECT_SERVICE_ID,
    serviceName: "docscloud",
    price: { value: DOCS_CONNECT_PRICE_PER_USER },
    features: [
      {
        id: "docscloud",
        title: "Docs Connect",
        priceTitle: "Embed ONLYOFFICE editors into your product",
        image: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" rx="4" fill="#4781D1"/></svg>',
        value: false,
        type: "flag",
      },
    ],
  },
  {
    id: DOCS_CONNECT_DEVPACK_SERVICE_ID,
    serviceName: "docscloud-devpack",
    price: { value: DOCS_CONNECT_DEVPACK_FULL_PRICE },
    // The client picks the Dev Pack service out of the wallet services by its
    // `docsclouddevpack` feature, not by the service name (see
    // `findDocsConnectServices`) - without it the Dev Pack price reads as 0
    // and every "with Dev Pack" total collapses onto the base price.
    features: [
      {
        id: "docsclouddevpack",
        title: "Dev Pack",
        priceTitle: "White label and mobile editors",
        image: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><rect width="24" height="24" rx="4" fill="#4781D1"/></svg>',
        value: false,
        type: "flag",
      },
    ],
  },
  {
    id: DOCS_CONNECT_STORAGE_SERVICE_ID,
    serviceName: "storage",
    price: { value: 10 },
    features: [{ id: "total_size", value: 1073741824 }],
  },
];

export const docsConnectWalletBalanceSuccess = (
  amount: number = DOCS_CONNECT_BALANCE,
) => ({
  subAccounts: [{ currency: "USD", amount }],
});

export const docsConnectDevPackEnabled = (preset: DocsConnectPreset) =>
  preset === "paidDevPack" ||
  preset === "scheduledDevPackDisable" ||
  preset === "scheduledDevPackDisableWithUsers";

type TWalletQuotaMock = {
  id: number;
  quantity: number;
  wallet: boolean;
  nextQuantity?: number | null;
  nextQuota?: number | null;
  dueDate?: string | null;
  state?: number;
};

const walletQuotas = (preset: DocsConnectPreset): TWalletQuotaMock[] => {
  switch (preset) {
    case "paid":
      return [
        {
          id: DOCS_CONNECT_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          wallet: true,
        },
      ];
    case "paidDevPack":
      return [
        {
          id: DOCS_CONNECT_DEVPACK_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          wallet: true,
        },
      ];
    case "scheduled":
      return [
        {
          id: DOCS_CONNECT_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          nextQuantity: 30,
          dueDate: DOCS_CONNECT_PAID_END,
          wallet: true,
        },
      ];
    case "scheduledDevPackDisable":
      return [
        {
          id: DOCS_CONNECT_DEVPACK_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          nextQuantity: DOCS_CONNECT_PLAN_USERS,
          nextQuota: DOCS_CONNECT_SERVICE_ID,
          dueDate: DOCS_CONNECT_PAID_END,
          wallet: true,
        },
      ];
    case "scheduledDevPackDisableWithUsers":
      return [
        {
          id: DOCS_CONNECT_DEVPACK_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          nextQuantity: 40,
          nextQuota: DOCS_CONNECT_SERVICE_ID,
          dueDate: DOCS_CONNECT_PAID_END,
          wallet: true,
        },
      ];
    case "scheduledCancel":
      return [
        {
          id: DOCS_CONNECT_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          nextQuantity: 0,
          dueDate: DOCS_CONNECT_PAID_END,
          wallet: true,
        },
      ];
    case "deactivated":
      return [
        {
          id: DOCS_CONNECT_SERVICE_ID,
          quantity: DOCS_CONNECT_PLAN_USERS,
          wallet: true,
          state: 1,
        },
      ];
    default:
      return [];
  }
};

export const docsConnectTariffSuccess = (preset: DocsConnectPreset) => ({
  response: {
    openSource: false,
    enterprise: false,
    developer: false,
    id: 1,
    state: TariffState.Paid,
    dueDate: "2026-12-05T13:03:34.0000000+04:00",
    delayDueDate: "0001-01-01T00:00:00.0000000Z",
    licenseDate: "0001-01-01T00:00:00.0000000Z",
    customerId: "test@gmail.com",
    quotas: [{ id: 1, quantity: 31, wallet: false }, ...walletQuotas(preset)],
  },
  count: 1,
  status: 0,
  statusCode: 200,
  ok: true,
});

export const docsConnectPaymentQuotaSuccess = (preset: DocsConnectPreset) => {
  const base = quotaSuccess();
  return {
    ...base,
    response: {
      ...base.response,
      features: [
        ...base.response.features,
        {
          id: "docsclouddevpack",
          value: docsConnectDevPackEnabled(preset),
          type: "flag",
        },
      ],
    },
  };
};

export const docsConnectDevPackCalcSuccess = (quantity: number) => ({
  operationId: 1,
  amount: 90,
  currency: "USD",
  quantity,
});
