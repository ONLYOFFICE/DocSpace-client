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
  TDocsConnectTariffState,
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
  state?: number;
};
type TTariffResponse = { quotas?: TTariffQuota[] } | null;

const QUOTA_STATE_OVERDUE = 1;

const EMPTY_TARIFF_STATE: TDocsConnectTariffState = {
  scheduledChange: null,
  deactivated: false,
};

const fetchTariffState = async (
  services: TWalletServicesResponse,
  refresh?: boolean,
): Promise<TDocsConnectTariffState> => {
  try {
    const serviceId = (name: string) =>
      (services ?? []).find((service) => service.serviceName === name)?.id;

    const baseId = serviceId(DOCS_CLOUD_PRODUCT);
    const devpackId = serviceId(DOCS_CLOUD_DEVPACK_SERVICE);

    if (baseId == null && devpackId == null) return EMPTY_TARIFF_STATE;

    const tariff = (await request({
      method: "get",
      url: "/portal/tariff",
      params: refresh ? { refresh: true } : {},
    })) as TTariffResponse;

    const quotaOf = (id?: number) =>
      id == null
        ? undefined
        : tariff?.quotas?.find((q) => q.wallet === true && q.id === id);

    const baseQuota = quotaOf(baseId);
    const devpackQuota = quotaOf(devpackId);

    if (
      baseQuota?.state === QUOTA_STATE_OVERDUE ||
      devpackQuota?.state === QUOTA_STATE_OVERDUE
    ) {
      return { scheduledChange: null, deactivated: true };
    }

    if (devpackQuota?.nextQuantity === 0) {
      const baseNext = baseQuota?.nextQuantity ?? null;
      const switchUsers =
        baseNext != null && baseNext > 0
          ? baseNext
          : (baseQuota?.quantity ?? 0);

      if (switchUsers > 0) {
        return {
          scheduledChange: {
            nextUsers: switchUsers,
            dueDate: devpackQuota.dueDate ?? "",
            devPackDisabled: true,
          },
          deactivated: false,
        };
      }
    }

    const quotaWithChange = [devpackQuota, baseQuota].find(
      (q) => q && (q.nextQuantity ?? -1) >= 0,
    );

    if (quotaWithChange) {
      return {
        scheduledChange: {
          nextUsers: quotaWithChange.nextQuantity ?? 0,
          dueDate: quotaWithChange.dueDate ?? "",
          devPackDisabled: false,
        },
        deactivated: false,
      };
    }

    return EMPTY_TARIFF_STATE;
  } catch {
    return EMPTY_TARIFF_STATE;
  }
};

const fetchWallet = async (
  refresh?: boolean,
): Promise<TDocsConnectWallet | null> => {
  try {
    const balance = (await request({
      method: "get",
      url: "/portal/payment/customer/balance",
      params: refresh ? { refresh: true } : {},
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

const fetchDevPackEnabled = async (refresh?: boolean): Promise<boolean> => {
  try {
    const quota = (await request({
      method: "get",
      url: "/portal/payment/quota",
      params: refresh ? { refresh: true } : {},
    })) as TPaymentQuotaResponse;

    return (quota?.features ?? []).some(
      (feature) =>
        feature.id === DOCS_CLOUD_DEVPACK_PRODUCT && feature.value === true,
    );
  } catch {
    return false;
  }
};

export const getDocsConnectInfo = async (
  refresh?: boolean,
): Promise<TDocsConnectInfo | null> => {
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

  const [wallet, devPackEnabled, tariffState] = await Promise.all([
    fetchWallet(refresh),
    fetchDevPackEnabled(refresh),
    fetchTariffState(services, refresh),
  ]);

  return {
    tenant,
    config,
    tenantInfo,
    prices: extractPrices(services),
    wallet,
    devPackEnabled,
    scheduledChange: tariffState.scheduledChange,
    deactivated: tariffState.deactivated,
  };
};

export const startDocsConnectTrial =
  async (): Promise<TDocsConnectInfo | null> => {
    await request({ method: "post", url: `${BASE}/trial` });
    return getDocsConnectInfo(true);
  };

export const updateDocsConnectConfig = async (
  data: TDocsConnectConfigUpdate,
): Promise<TDocsConnectConfig | null> => {
  return (await request({
    method: "put",
    url: `${BASE}/tenant/config`,
    data,
  })) as TDocsConnectConfig | null;
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

  return getDocsConnectInfo(true);
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

  return getDocsConnectInfo(true);
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

  return getDocsConnectInfo(true);
};
