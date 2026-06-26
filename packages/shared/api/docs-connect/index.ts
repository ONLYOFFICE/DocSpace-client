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
import { combineUrl } from "../../utils/combineUrl";
import type {
  TDocsConnectInfo,
  TDocsConnectTenant,
  TDocsConnectConfig,
  TDocsConnectTenantInfo,
  TDocsConnectPrices,
  TDocsConnectWallet,
  TDocsConnectConfigUpdate,
} from "./types";

const BASE = "/settings/docscloud";

const WALLET_SERVICES_URL = "/portal/payment/walletservices";
const BALANCE_URL = "/portal/payment/customer/balance";
const WALLET_UPDATE_URL = "/portal/payment/updatewallet";
const DOCS_CLOUD_PRODUCT = "docscloud";
const DOCS_CLOUD_DEVPACK_PRODUCT = "docscloud-devpack";
const QUANTITY_TYPE_SET = 0;
const QUANTITY_TYPE_ADD = 1;

export type BuyDocsConnectPlanData = {
  users: number;
  devPackEnabled: boolean;
};

type TWalletService = {
  serviceName?: string;
  price?: { value?: number };
};
type TWalletServicesResponse = TWalletService[] | null;
type TBalanceResponse = {
  subAccounts?: { currency?: string; amount?: number }[];
} | null;

const fetchPlanPrices = async (): Promise<TDocsConnectPrices | null> => {
  try {
    const services = (await request({
      method: "get",
      url: WALLET_SERVICES_URL,
    })) as TWalletServicesResponse;

    const priceOf = (name: string) =>
      services?.find((service) => service.serviceName === name)?.price?.value;

    const base = priceOf(DOCS_CLOUD_PRODUCT);
    if (base == null) return null;

    const devpack = priceOf(DOCS_CLOUD_DEVPACK_PRODUCT);
    return {
      pricePerUser: base,
      devPackPrice: devpack == null ? 0 : Math.max(0, devpack - base),
    };
  } catch {
    return null;
  }
};

const fetchWallet = async (): Promise<TDocsConnectWallet | null> => {
  try {
    const balance = (await request({
      method: "get",
      url: BALANCE_URL,
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

let lastInfo: TDocsConnectInfo | null = null;

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
      lastInfo = null;
      return null;
    }

    const [config, tenantInfo] = (await Promise.all([
      request({ method: "get", url: `${BASE}/tenant/config` }),
      request({ method: "get", url: `${BASE}/tenant/info` }),
    ])) as [TDocsConnectConfig, TDocsConnectTenantInfo];

    const [prices, wallet] = await Promise.all([
      fetchPlanPrices(),
      fetchWallet(),
    ]);

    lastInfo = { tenant, config, tenantInfo, prices, wallet };
    return lastInfo;
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

export const buyDocsConnectPlan = async (
  data: BuyDocsConnectPlanData,
): Promise<TDocsConnectInfo | null> => {
  const { users, devPackEnabled } = data;

  const product = devPackEnabled
    ? DOCS_CLOUD_DEVPACK_PRODUCT
    : DOCS_CLOUD_PRODUCT;

  const isPaid = lastInfo?.tenantInfo.license.trial === false;
  const currentUsers = isPaid ? (lastInfo?.tenant.payment?.quantity ?? 0) : 0;
  const isDecrease = users < currentUsers;

  const ok = (await request({
    method: "put",
    url: WALLET_UPDATE_URL,
    data: {
      quantity: {
        [product]: isDecrease ? users : users - currentUsers,
      },
      productQuantityType: isDecrease
        ? QUANTITY_TYPE_SET
        : QUANTITY_TYPE_ADD,
    },
  })) as boolean;

  if (ok === false) {
    throw new Error("Docs Connect plan purchase failed");
  }

  return getDocsConnectInfo();
};
