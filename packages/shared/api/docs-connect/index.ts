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

import { request, getApiBaseUrl } from "../client";
import { saveDeposite } from "../portal";
import { combineUrl } from "../../utils/combineUrl";
import type {
  TDocsConnectInfo,
  TDocsConnectTenant,
  TDocsConnectConfig,
  TDocsConnectTenantInfo,
  TDocsConnectPrices,
  TDocsConnectScheduledChange,
  TDocsConnectWallet,
  TDocsConnectConfigUpdate,
} from "./types";

const BASE = "/settings/docscloud";

const DOCS_CLOUD_PRODUCT = "docscloud";
const DOCS_CLOUD_DEVPACK_SERVICE = "docscloud-devpack";
const DOCS_CLOUD_DEVPACK_PRODUCT = "docsclouddevpack";
const QUANTITY_TYPE_SET = 0;
const QUANTITY_TYPE_ADD = 1;

export type BuyDocsConnectPlanData = {
  users: number;
  devPackEnabled: boolean;
  topUp?: number;
  currentUsers: number;
  currentDevPackEnabled: boolean;
  currency: string;
};

type TWalletService = {
  id?: number;
  serviceName?: string;
  price?: { value?: number };
};
type TWalletServicesResponse = TWalletService[] | null;
type TBalanceResponse = {
  subAccounts?: { currency?: string; amount?: number }[];
} | null;

const fetchWalletServices = async (): Promise<TWalletServicesResponse> => {
  try {
    return (await request({
      method: "get",
      url: "/portal/payment/walletservices",
    })) as TWalletServicesResponse;
  } catch {
    return null;
  }
};

const extractPrices = (
  services: TWalletServicesResponse,
): TDocsConnectPrices | null => {
  const priceOf = (name: string) =>
    services?.find((service) => service.serviceName === name)?.price?.value;

  const base = priceOf(DOCS_CLOUD_PRODUCT);
  if (base == null) return null;

  const devpack = priceOf(DOCS_CLOUD_DEVPACK_SERVICE);
  return {
    pricePerUser: base,
    devPackPrice: devpack == null ? 0 : Math.max(0, devpack - base),
  };
};

export const getDocsConnectPrices =
  async (): Promise<TDocsConnectPrices | null> =>
    extractPrices(await fetchWalletServices());

type TTariffQuota = {
  id?: number;
  quantity?: number;
  nextQuantity?: number | null;
  dueDate?: string | null;
  wallet?: boolean;
};
type TTariffResponse = { quotas?: TTariffQuota[] } | null;

const fetchScheduledChange = async (
  services: TWalletServicesResponse,
): Promise<TDocsConnectScheduledChange | null> => {
  try {
    const ids = (services ?? [])
      .filter(
        (service) =>
          service.serviceName === DOCS_CLOUD_PRODUCT ||
          service.serviceName === DOCS_CLOUD_DEVPACK_SERVICE,
      )
      .map((service) => service.id)
      .filter((id): id is number => id != null);

    if (!ids.length) return null;

    const tariff = (await request({
      method: "get",
      url: "/portal/tariff",
    })) as TTariffResponse;

    const quota = tariff?.quotas?.find(
      (q) =>
        q.wallet === true &&
        q.id != null &&
        ids.includes(q.id) &&
        (q.nextQuantity ?? -1) >= 0,
    );

    if (!quota) return null;

    return {
      nextUsers: quota.nextQuantity ?? 0,
      dueDate: quota.dueDate ?? "",
    };
  } catch {
    return null;
  }
};

const fetchWallet = async (): Promise<TDocsConnectWallet | null> => {
  try {
    const balance = (await request({
      method: "get",
      url: "/portal/payment/customer/balance",
    })) as TBalanceResponse;

    const sub = balance?.subAccounts?.[0];
    if (!sub) return null;

    return {
      availableCredits: sub.amount ?? 0,
      currency: sub.currency ?? "USD",
    };
  } catch {
    return null;
  }
};

type TPaymentQuotaResponse = {
  features?: { id?: string; value?: unknown }[];
} | null;

const fetchDevPackEnabled = async (): Promise<boolean> => {
  try {
    const quota = (await request({
      method: "get",
      url: "/portal/payment/quota",
    })) as TPaymentQuotaResponse;

    return (quota?.features ?? []).some(
      (feature) =>
        feature.id === DOCS_CLOUD_DEVPACK_PRODUCT && feature.value === true,
    );
  } catch {
    return false;
  }
};

export const getDocsConnectInfo =
  async (): Promise<TDocsConnectInfo | null> => {
    let tenant: TDocsConnectTenant | null = null;
    try {
      tenant = (await request({
        method: "get",
        url: `${BASE}/tenant`,
      })) as TDocsConnectTenant | null;
    } catch {
      tenant = null;
    }

    if (!tenant) {
      return null;
    }

    const [config, tenantInfo] = (await Promise.all([
      request({ method: "get", url: `${BASE}/tenant/config` }),
      request({ method: "get", url: `${BASE}/tenant/info` }),
    ])) as [TDocsConnectConfig, TDocsConnectTenantInfo];

    const services = await fetchWalletServices();

    const [wallet, devPackEnabled, scheduledChange] = await Promise.all([
      fetchWallet(),
      fetchDevPackEnabled(),
      fetchScheduledChange(services),
    ]);

    return {
      tenant,
      config,
      tenantInfo,
      prices: extractPrices(services),
      wallet,
      devPackEnabled,
      scheduledChange,
    };
  };

export const startDocsConnectTrial =
  async (): Promise<TDocsConnectInfo | null> => {
    await request({ method: "post", url: `${BASE}/trial` });
    return getDocsConnectInfo();
  };

export const updateDocsConnectConfig = async (
  data: TDocsConnectConfigUpdate,
): Promise<TDocsConnectInfo | null> => {
  await request({ method: "put", url: `${BASE}/tenant/config`, data });
  return getDocsConnectInfo();
};

export const getDocsConnectReportUrl = (): string =>
  combineUrl(getApiBaseUrl(), `${BASE}/tenant/quota/download`);

export const cancelDocsConnectPlan = async (
  devPackEnabled: boolean,
): Promise<TDocsConnectInfo | null> => {
  const product = devPackEnabled
    ? DOCS_CLOUD_DEVPACK_PRODUCT
    : DOCS_CLOUD_PRODUCT;

  const ok = (await request({
    method: "put",
    url: "/portal/payment/updatewallet",
    data: {
      quantity: { [product]: 0 },
      productQuantityType: QUANTITY_TYPE_SET,
    },
  })) as boolean;

  if (ok === false) {
    throw new Error("Docs Connect plan cancellation failed");
  }

  return getDocsConnectInfo();
};

export const cancelDocsConnectScheduledChange = async (
  devPackEnabled: boolean,
): Promise<TDocsConnectInfo | null> => {
  const product = devPackEnabled
    ? DOCS_CLOUD_DEVPACK_PRODUCT
    : DOCS_CLOUD_PRODUCT;

  const ok = (await request({
    method: "put",
    url: "/portal/payment/updatewallet",
    data: {
      quantity: { [product]: null },
      productQuantityType: QUANTITY_TYPE_SET,
    },
  })) as boolean;

  if (ok === false) {
    throw new Error("Docs Connect scheduled change cancellation failed");
  }

  return getDocsConnectInfo();
};

export const buyDocsConnectPlan = async (
  data: BuyDocsConnectPlanData,
): Promise<TDocsConnectInfo | null> => {
  const {
    users,
    devPackEnabled,
    topUp,
    currentUsers: prevUsers,
    currentDevPackEnabled,
    currency,
  } = data;

  if (topUp && topUp > 0) {
    await saveDeposite(topUp, currency);
  }

  const product = devPackEnabled
    ? DOCS_CLOUD_DEVPACK_PRODUCT
    : DOCS_CLOUD_PRODUCT;

  const sameProduct = currentDevPackEnabled === devPackEnabled;

  const currentUsers = sameProduct ? prevUsers : 0;
  const isDecrease = users < currentUsers;

  const ok = (await request({
    method: "put",
    url: "/portal/payment/updatewallet",
    data: {
      quantity: {
        [product]: isDecrease ? users : users - currentUsers,
      },
      productQuantityType: isDecrease ? QUANTITY_TYPE_SET : QUANTITY_TYPE_ADD,
    },
  })) as boolean;

  if (ok === false) {
    throw new Error("Docs Connect plan purchase failed");
  }

  return getDocsConnectInfo();
};
