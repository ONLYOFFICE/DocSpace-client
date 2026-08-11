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

import { request } from "../client";
import type {
  TDocsConnectInfo,
  TDocsConnectTenant,
  TDocsConnectConfig,
  TDocsConnectTenantInfo,
  TDocsConnectPrices,
  TDocsConnectTariffState,
  TDocsConnectPreviousPlan,
  TDocsConnectWallet,
  TDocsConnectConfigUpdate,
  TDocsConnectDevPackCalculation,
  TDocsConnectReportStatus,
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
  currentUsers: number;
  currentDevPackEnabled: boolean;
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

const fetchWalletServices = async (): Promise<TWalletServicesResponse> =>
  (await request({
    method: "get",
    url: "/portal/payment/walletservices",
  })) as TWalletServicesResponse;

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

type TTariffQuota = {
  id?: number;
  quantity?: number;
  nextQuantity?: number | null;
  nextQuota?: number | null;
  dueDate?: string | null;
  wallet?: boolean;
  state?: number;
};
type TTariffResponse = { quotas?: TTariffQuota[] } | null;

const QUOTA_STATE_OVERDUE = 1;

const EMPTY_TARIFF_STATE: TDocsConnectTariffState = {
  scheduledChange: null,
  deactivated: false,
  previousPlan: null,
};

const quotaDueTime = (quota?: TTariffQuota): number => {
  const ms = quota?.dueDate ? new Date(quota.dueDate).getTime() : Number.NaN;
  return Number.isNaN(ms) ? 0 : ms;
};

const resolvePreviousPlan = (
  baseQuota?: TTariffQuota,
  devpackQuota?: TTariffQuota,
): TDocsConnectPreviousPlan | null => {
  const paid = [devpackQuota, baseQuota].filter(
    (quota): quota is TTariffQuota => (quota?.quantity ?? 0) > 0,
  );

  if (paid.length === 0) return null;

  const latest = paid.reduce((acc, quota) =>
    quotaDueTime(quota) > quotaDueTime(acc) ? quota : acc,
  );

  return {
    users: latest.quantity ?? 0,
    devPackEnabled: latest === devpackQuota,
  };
};

const resolveNextDevPack = ({
  nextQuota,
  baseId,
  devpackId,
  fallback,
}: {
  nextQuota?: number | null;
  baseId?: number;
  devpackId?: number;
  fallback: boolean;
}): boolean => {
  if (nextQuota == null) return fallback;
  if (devpackId != null && nextQuota === devpackId) return true;
  if (baseId != null && nextQuota === baseId) return false;
  return fallback;
};

const fetchTariffState = async (
  services: TWalletServicesResponse,
  refresh?: boolean,
): Promise<TDocsConnectTariffState> => {
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
  const previousPlan = resolvePreviousPlan(baseQuota, devpackQuota);

  if (
    baseQuota?.state === QUOTA_STATE_OVERDUE ||
    devpackQuota?.state === QUOTA_STATE_OVERDUE
  ) {
    return { scheduledChange: null, deactivated: true, previousPlan };
  }

  const scheduleQuota = [devpackQuota, baseQuota].find(
    (q) => q && (q.nextQuantity ?? -1) >= 0,
  );

  if (scheduleQuota) {
    const scheduledOnDevPack = scheduleQuota === devpackQuota;

    return {
      scheduledChange: {
        nextUsers: scheduleQuota.nextQuantity ?? 0,
        dueDate: scheduleQuota.dueDate ?? "",
        nextDevPackEnabled: resolveNextDevPack({
          nextQuota: scheduleQuota.nextQuota,
          baseId,
          devpackId,
          fallback: scheduledOnDevPack,
        }),
        scheduledOnDevPack,
      },
      deactivated: false,
      previousPlan,
    };
  }

  return { ...EMPTY_TARIFF_STATE, previousPlan };
};

const fetchWallet = async (
  refresh?: boolean,
): Promise<TDocsConnectWallet | null> => {
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
};

type TPaymentQuotaResponse = {
  features?: { id?: string; value?: unknown }[];
} | null;

const fetchDevPackEnabled = async (refresh?: boolean): Promise<boolean> => {
  const quota = (await request({
    method: "get",
    url: "/portal/payment/quota",
    params: refresh ? { refresh: true } : {},
  })) as TPaymentQuotaResponse;

  return (quota?.features ?? []).some(
    (feature) =>
      feature.id === DOCS_CLOUD_DEVPACK_PRODUCT && feature.value === true,
  );
};

export const getDocsConnectInfo = async (
  refresh?: boolean,
): Promise<TDocsConnectInfo | null> => {
  const refreshParams = refresh ? { refresh: true } : {};

  let tenant: TDocsConnectTenant | null = null;
  try {
    tenant = (await request({
      method: "get",
      url: `${BASE}/tenant`,
      params: refreshParams,
    })) as TDocsConnectTenant | null;
  } catch {
    tenant = null;
  }

  if (!tenant) {
    return null;
  }

  const [config, tenantInfo] = (await Promise.all([
    request({ method: "get", url: `${BASE}/tenant/config` }),
    request({
      method: "get",
      url: `${BASE}/tenant/info`,
      params: refreshParams,
    }),
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
    previousPlan:
      (tenant.payment?.quantity ?? 0) > 0 ? null : tariffState.previousPlan,
  };
};

export type TDocsConnectConnection = {
  address: string;
  secret: string;
  header: string;
};

export const getDocsConnectConnection =
  async (): Promise<TDocsConnectConnection | null> => {
    let tenant: TDocsConnectTenant | null = null;
    try {
      tenant = (await request({
        method: "get",
        url: `${BASE}/tenant`,
      })) as TDocsConnectTenant | null;
    } catch {
      tenant = null;
    }

    if (!tenant?.address) {
      return null;
    }

    let config: TDocsConnectConfig | null = null;
    try {
      config = (await request({
        method: "get",
        url: `${BASE}/tenant/config`,
      })) as TDocsConnectConfig | null;
    } catch {
      config = null;
    }

    const secret = config?.security.secret;
    const header = config?.security.header;
    if (!secret || !header) {
      return null;
    }

    return { address: tenant.address, secret, header };
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

export const startDocsConnectReport =
  async (): Promise<TDocsConnectReportStatus | null> => {
    return (await request({
      method: "post",
      url: `${BASE}/tenant/quota/report`,
    })) as TDocsConnectReportStatus | null;
  };

export const getDocsConnectReportStatus =
  async (): Promise<TDocsConnectReportStatus | null> => {
    return (await request({
      method: "get",
      url: `${BASE}/tenant/quota/report`,
    })) as TDocsConnectReportStatus | null;
  };

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
  scheduledOnDevPack: boolean,
): Promise<TDocsConnectInfo | null> => {
  const product = scheduledOnDevPack
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
    currentUsers: prevUsers,
    currentDevPackEnabled,
  } = data;

  const disablingDevPack = currentDevPackEnabled && !devPackEnabled;

  const product = devPackEnabled
    ? DOCS_CLOUD_DEVPACK_PRODUCT
    : DOCS_CLOUD_PRODUCT;

  const sameProduct = currentDevPackEnabled === devPackEnabled;

  const currentUsers = sameProduct ? prevUsers : 0;
  const isDecrease = users < currentUsers;

  const quantity = disablingDevPack
    ? { [DOCS_CLOUD_PRODUCT]: users }
    : { [product]: isDecrease ? users : users - currentUsers };

  const productQuantityType =
    disablingDevPack || isDecrease ? QUANTITY_TYPE_SET : QUANTITY_TYPE_ADD;

  const ok = (await request({
    method: "put",
    url: "/portal/payment/updatewallet",
    data: {
      quantity,
      productQuantityType,
    },
  })) as boolean;

  if (ok === false) {
    throw new Error("Docs Connect plan purchase failed");
  }

  return getDocsConnectInfo(true);
};

export const calculateDocsConnectDevPack = async (
  quantity: number,
): Promise<TDocsConnectDevPackCalculation | null> =>
  (await request({
    method: "post",
    url: `${BASE}/calculatedevpack`,
    data: { quantity },
  })) as TDocsConnectDevPackCalculation | null;

export const switchDocsConnectToDevPack = async ({
  quantity,
}: {
  quantity: number;
}): Promise<TDocsConnectInfo | null> => {
  const ok = (await request({
    method: "post",
    url: `${BASE}/switchtodevpack`,
    data: { quantity },
  })) as boolean;

  if (ok === false) {
    throw new Error("Docs Connect switch to Dev Pack failed");
  }

  return getDocsConnectInfo(true);
};
