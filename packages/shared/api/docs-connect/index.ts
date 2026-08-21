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

import { findDocsConnectServices } from "@docspace/ui-kit/billing/utils/docs-connect";
import { request } from "../client";
import type {
  TDocsConnectInfo,
  TDocsConnectTenant,
  TDocsConnectConfig,
  TDocsConnectTenantInfo,
  TDocsConnectPrices,
  TDocsConnectTariffState,
  TDocsConnectPreviousPlan,
  TDocsConnectServiceIds,
  TDocsConnectStatistics,
  TDocsConnectWallet,
  TDocsConnectConfigUpdate,
  TDocsConnectDevPackCalculation,
} from "./types";
import type { TDocumentBuilderTask } from "../files/types";

const BASE = "/settings/docscloud";

const DOCS_CLOUD_PRODUCT = "docscloud";
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
  features?: { id?: string }[];
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
  const { base: baseService, devPack: devPackService } =
    findDocsConnectServices(services);

  const base = baseService?.price?.value;
  if (base == null) return null;

  const devpack = devPackService?.price?.value;
  return {
    pricePerUser: base,
    devPackPrice: devpack == null ? 0 : Math.max(0, devpack - base),
  };
};

const extractServiceIds = (
  services: TWalletServicesResponse,
): TDocsConnectServiceIds => {
  const { base: baseService, devPack: devPackService } =
    findDocsConnectServices(services);

  return {
    baseId: baseService?.id,
    devpackId: devPackService?.id,
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

const getDocsConnectTariffState = async (
  serviceIds?: TDocsConnectServiceIds,
  refresh?: boolean,
  signal?: AbortSignal,
): Promise<TDocsConnectTariffState> => {
  const { baseId, devpackId } = serviceIds ?? {};

  if (baseId == null && devpackId == null) return EMPTY_TARIFF_STATE;

  const tariff = (await request({
    method: "get",
    url: "/portal/tariff",
    params: refresh ? { refresh: true } : {},
    signal,
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

const getDocsConnectDevPackEnabled = async (
  refresh?: boolean,
  signal?: AbortSignal,
): Promise<boolean> => {
  const quota = (await request({
    method: "get",
    url: "/portal/payment/quota",
    params: refresh ? { refresh: true } : {},
    signal,
  })) as TPaymentQuotaResponse;

  return (quota?.features ?? []).some(
    (feature) =>
      feature.id === DOCS_CLOUD_DEVPACK_PRODUCT && feature.value === true,
  );
};

const getDocsConnectTenant = async (
  refresh?: boolean,
  signal?: AbortSignal,
): Promise<TDocsConnectTenant | null> =>
  (await request({
    method: "get",
    url: `${BASE}/tenant`,
    params: refresh ? { refresh: true } : {},
    signal,
  })) as TDocsConnectTenant | null;

const getDocsConnectTenantConfig = async (
  signal?: AbortSignal,
): Promise<TDocsConnectConfig | null> =>
  (await request({
    method: "get",
    url: `${BASE}/tenant/config`,
    signal,
  })) as TDocsConnectConfig | null;

const getDocsConnectTenantInfo = async (
  refresh?: boolean,
  signal?: AbortSignal,
): Promise<TDocsConnectTenantInfo | null> =>
  (await request({
    method: "get",
    url: `${BASE}/tenant/info`,
    params: refresh ? { refresh: true } : {},
    signal,
  })) as TDocsConnectTenantInfo | null;

export type TDocsConnectStatisticsOptions = {
  refresh?: boolean;
  signal?: AbortSignal;
  tenant?: TDocsConnectTenant | null;
};

export const getDocsConnectStatistics = async (
  serviceIds?: TDocsConnectServiceIds,
  { refresh, signal, tenant }: TDocsConnectStatisticsOptions = {},
): Promise<TDocsConnectStatistics> => {
  const [currentTenant, tenantInfo, devPackEnabled, tariffState] =
    await Promise.all([
      tenant ?? getDocsConnectTenant(refresh, signal),
      getDocsConnectTenantInfo(refresh, signal),
      getDocsConnectDevPackEnabled(refresh, signal),
      getDocsConnectTariffState(serviceIds, refresh, signal),
    ]);

  return {
    tenant: currentTenant,
    tenantInfo,
    devPackEnabled,
    scheduledChange: tariffState.scheduledChange,
    deactivated: tariffState.deactivated,
    previousPlan:
      (currentTenant?.payment?.quantity ?? 0) > 0
        ? null
        : tariffState.previousPlan,
  };
};

export const getDocsConnectInfo = async (
  refresh?: boolean,
): Promise<TDocsConnectInfo | null> => {
  let tenant: TDocsConnectTenant | null = null;
  try {
    tenant = await getDocsConnectTenant(refresh);
  } catch {
    tenant = null;
  }

  if (!tenant) {
    return null;
  }

  const [config, services] = (await Promise.all([
    getDocsConnectTenantConfig(),
    fetchWalletServices(),
  ])) as [TDocsConnectConfig, TWalletServicesResponse];

  const serviceIds = extractServiceIds(services);

  const [wallet, statistics] = await Promise.all([
    fetchWallet(refresh),
    getDocsConnectStatistics(serviceIds, { refresh, tenant }),
  ]);

  return {
    ...statistics,
    tenant,
    config,
    tenantInfo: statistics.tenantInfo as TDocsConnectTenantInfo,
    prices: extractPrices(services),
    wallet,
    serviceIds,
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
      tenant = await getDocsConnectTenant();
    } catch {
      tenant = null;
    }

    if (!tenant?.address) {
      return null;
    }

    let config: TDocsConnectConfig | null = null;
    try {
      config = await getDocsConnectTenantConfig();
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
  async (): Promise<TDocumentBuilderTask | null> => {
    return (await request({
      method: "post",
      url: `${BASE}/tenant/quota/report`,
    })) as TDocumentBuilderTask | null;
  };

export const getDocsConnectReportStatus =
  async (): Promise<TDocumentBuilderTask | null> => {
    return (await request({
      method: "get",
      url: `${BASE}/tenant/quota/report`,
    })) as TDocumentBuilderTask | null;
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
