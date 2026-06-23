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
  TDocsConnectStatus,
  TDocsConnectUsage,
  TDocsConnectConfigUpdate,
} from "./types";

/**
 * Dev escape hatch: when `true`, the whole feature runs on the in-memory mock
 * (offline UI work). Default `false` — the client talks to the real DocsCloud
 * endpoints (`api/2.0/settings/docscloud/*`).
 *
 * NOTE: monetization (Buy a plan / wallet) and connectors have NO backend yet, so
 * they are ALWAYS served from the mock defaults below, regardless of this flag.
 * See `EXPECTED_BACKEND.md` for the awaited endpoints / response shapes to confirm.
 */
export const DOCS_CONNECT_FORCE_MOCK = false;

/** Real backend base path (DocsCloudController). */
const BASE = "/settings/docscloud";

const WALLET_SERVICES_URL = "/portal/payment/walletservices";
const BALANCE_URL = "/portal/payment/customer/balance";
const WALLET_UPDATE_URL = "/portal/payment/updatewallet";
const DOCS_CLOUD_PRODUCT = "docscloud";
const DOCS_CLOUD_DEVPACK_PRODUCT = "docsclouddevpack";
const QUANTITY_TYPE_SET = 0;
const QUANTITY_TYPE_ADD = 1;

/** Initial state for the mock (FORCE_MOCK) and the promo seed. */
export const DOCS_CONNECT_MOCK_STATUS: TDocsConnectStatus = "promo";

export type BuyDocsConnectPlanData = {
  users: number;
  devPackEnabled: boolean;
};

// Kept in a const rather than inline: an inline `secretKey` string literal ends
// in the substring the locales test scans for as a translation key, so the mock
// value gets reported as a missing i18n key.
const MOCK_SECRET_KEY = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6";

const buildMockInfo = (status: TDocsConnectStatus): TDocsConnectInfo => {
  const isPaid = status === "paid";

  return {
    status,
    address: "d47cc5ee.docs.teamlab.info",
    tenantName: "My Docs Cloud tenant",
    jwtHeader: "AuthorizationJWT",
    secretKey: MOCK_SECRET_KEY,
    isAnonymousSupport: true,
    build: {
      type: "Docs Cloud",
      version: "9.4.0.88",
      released: "04.05.2026",
    },
    trial: {
      start: "20.05.2026",
      validUntil: "19.06.2026",
      daysLeft: 30,
      totalDays: 30,
      expired: false,
    },
    plan: {
      users: 50,
      pricePerUser: 8,
      devPackEnabled: true,
      devPackPrice: 4,
      monthlyCharge: 600,
      renewsOn: "04.07.2026",
    },
    usage: {
      editors: {
        active: 0,
        internal: 0,
        external: 0,
        remaining: isPaid ? 50 : 1000,
        limit: isPaid ? 50 : 1000,
        criticalRemaining: false,
      },
      viewer: {
        active: 0,
        internal: 0,
        external: 0,
        remaining: isPaid ? 50 : 1000,
        limit: isPaid ? 50 : 1000,
        criticalRemaining: false,
      },
    },
    wallet: {
      availableCredits: 0,
      currency: "USD",
    },
    connectors: [
      { key: "nextcloud", label: "Nextcloud", url: "#" },
      { key: "owncloud", label: "OwnCloud", url: "#" },
      { key: "confluence", label: "Confluence", url: "#" },
      { key: "alfresco", label: "Alfresco", url: "#" },
      { key: "moodle", label: "Moodle", url: "#" },
      { key: "seafile", label: "Seafile", url: "#" },
      { key: "odoo", label: "oDoo", url: "#" },
    ],
  };
};

const MOCK_CONNECTORS = buildMockInfo("trial").connectors;

// Last state returned (mock or real). Lets the mock-only Buy-a-plan flow mutate and
// persist a simulated "paid" state across calls until the backend provides it.
let lastInfo: TDocsConnectInfo = buildMockInfo(DOCS_CONNECT_MOCK_STATUS);

// --- Real backend response shapes (api/2.0/settings/docscloud) ---
// Shapes below are confirmed against sample responses from the backend.

type TTenantResponse = {
  alias?: string;
  name?: string;
  address?: string;
  isActive?: boolean;
  endDate?: string;
  modifiedDate?: string;
  payment?: { quantity?: number; currency?: string };
} | null;

// GET/PUT /tenant/config
type TConfigResponse = {
  tenantName: string;
  security: { secret: string; header: string };
  server: { isAnonymousSupport: boolean };
};

// One editor/viewer bucket inside /tenant/info `stats`.
type TInfoStat = {
  active: number;
  internal: number;
  external: number;
  remaining: number;
  criticalRemaining: boolean;
};

// GET /tenant/info — license + server build + per-bucket usage stats.
// Carries everything the panel needs, so /tenant/usage and /tenant/quota are not
// fetched separately (see EXPECTED_BACKEND.md).
type TInfoResponse = {
  license?: { valid?: string; trial?: boolean; buildDate?: string };
  server?: { version?: string; packageType?: string; date?: string };
  usersLimit?: { edit?: number; view?: number };
  stats?: {
    periodDay?: number;
    editor?: Partial<TInfoStat>;
    viewer?: Partial<TInfoStat>;
  };
};

const emptyUsage = (): TDocsConnectUsage => ({
  active: 0,
  internal: 0,
  external: 0,
  remaining: 0,
  limit: 0,
  criticalRemaining: false,
});

const DAY_MS = 24 * 60 * 60 * 1000;

// Default trial length — the backend exposes no total/start, only the expiry date.
const DEFAULT_TRIAL_DAYS = 30;

// Epoch ms → "dd.mm.yyyy" (the format used across the panel). Empty on bad input.
const formatTs = (ms: number): string => {
  if (Number.isNaN(ms)) return "";
  const date = new Date(ms);
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${date.getFullYear()}`;
};

const formatDate = (iso?: string): string =>
  iso ? formatTs(new Date(iso).getTime()) : "";

// Whole days from now until `iso` (clamped at 0).
const daysUntil = (iso?: string): number => {
  if (!iso) return 0;
  const target = new Date(iso).getTime();
  if (Number.isNaN(target)) return 0;
  return Math.max(0, Math.ceil((target - Date.now()) / DAY_MS));
};

const mapStat = (
  stat: Partial<TInfoStat> | undefined,
  limit: number,
): TDocsConnectUsage => ({
  active: stat?.active ?? 0,
  internal: stat?.internal ?? 0,
  external: stat?.external ?? 0,
  remaining: stat?.remaining ?? 0,
  limit,
  criticalRemaining: stat?.criticalRemaining ?? false,
});

// Promo (no tenant): neutral object. Monetization stays empty (not shown in promo).
const buildEmptyInfo = (status: TDocsConnectStatus): TDocsConnectInfo => ({
  status,
  address: "",
  tenantName: "",
  jwtHeader: "",
  secretKey: "",
  isAnonymousSupport: false,
  build: { type: "", version: "", released: "" },
  trial: { start: "", validUntil: "", daysLeft: 0, totalDays: 30, expired: false },
  plan: {
    users: 0,
    pricePerUser: 0,
    devPackEnabled: false,
    devPackPrice: 0,
    monthlyCharge: 0,
    renewsOn: "",
  },
  usage: { editors: emptyUsage(), viewer: emptyUsage() },
  wallet: { availableCredits: 0, currency: "USD" },
  connectors: [],
});

const mapRealInfo = (
  tenant: TTenantResponse,
  config: TConfigResponse,
  info: TInfoResponse,
): TDocsConnectInfo => {
  const validUntil = info?.license?.valid;
  const validUntilMs = validUntil ? new Date(validUntil).getTime() : Number.NaN;
  const status: TDocsConnectStatus =
    info?.license?.trial === false ? "paid" : "trial";
  const base = buildEmptyInfo(status);

  return {
    ...base,
    connectors: MOCK_CONNECTORS,
    plan: {
      ...base.plan,
      users: tenant?.payment?.quantity ?? base.plan.users,
      renewsOn: formatDate(tenant?.endDate) || base.plan.renewsOn,
    },
    wallet: {
      ...base.wallet,
      currency: tenant?.payment?.currency || base.wallet.currency,
    },
    address: tenant?.address ?? "",
    tenantName: config.tenantName ?? "",
    jwtHeader: config.security?.header ?? "",
    secretKey: config.security?.secret ?? "",
    isAnonymousSupport: config.server?.isAnonymousSupport ?? false,
    build: {
      type: info?.server?.packageType ?? "",
      version: info?.server?.version ?? "",
      released: formatDate(info?.license?.buildDate),
    },
    trial: {
      start: Number.isNaN(validUntilMs)
        ? ""
        : formatTs(validUntilMs - DEFAULT_TRIAL_DAYS * DAY_MS),
      validUntil: formatDate(validUntil),
      daysLeft: daysUntil(validUntil),
      totalDays: DEFAULT_TRIAL_DAYS,
      expired: !Number.isNaN(validUntilMs) && validUntilMs < Date.now(),
    },
    usage: {
      editors: mapStat(info?.stats?.editor, info?.usersLimit?.edit ?? 0),
      viewer: mapStat(info?.stats?.viewer, info?.usersLimit?.view ?? 0),
    },
  };
};

type TWalletService = {
  serviceName?: string;
  price?: { value?: number };
};
type TWalletServicesResponse = TWalletService[] | null;
type TBalanceResponse = {
  subAccounts?: { currency?: string; amount?: number }[];
} | null;

const fetchPlanPrices = async (): Promise<{
  pricePerUser: number;
  devPackPrice: number;
} | null> => {
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

const fetchWallet = async (): Promise<{
  availableCredits: number;
  currency: string;
} | null> => {
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

/**
 * Whole tenant page state. Aggregates the DocsCloud GET endpoints (no tenant ⇒
 * promo). Monetization/connectors are merged from the mock.
 */
export const getDocsConnectInfo = async (): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_FORCE_MOCK) return lastInfo;

  let tenant: TTenantResponse = null;
  try {
    tenant = (await request({
      method: "get",
      url: `${BASE}/tenant`,
    })) as TTenantResponse;
  } catch {
    tenant = null;
  }

  if (!tenant) {
    lastInfo = buildEmptyInfo("promo");
    return lastInfo;
  }

  const [config, info] = (await Promise.all([
    request({ method: "get", url: `${BASE}/tenant/config` }),
    request({ method: "get", url: `${BASE}/tenant/info` }),
  ])) as [TConfigResponse, TInfoResponse];

  let result = mapRealInfo(tenant, config, info);

  const [prices, wallet] = await Promise.all([fetchPlanPrices(), fetchWallet()]);

  if (prices) {
    result = {
      ...result,
      plan: {
        ...result.plan,
        pricePerUser: prices.pricePerUser,
        devPackPrice: prices.devPackPrice,
        monthlyCharge:
          result.plan.users *
          (prices.pricePerUser +
            (result.plan.devPackEnabled ? prices.devPackPrice : 0)),
      },
    };
  }

  if (wallet) {
    result = { ...result, wallet: { ...result.wallet, ...wallet } };
  }

  lastInfo = result;
  return lastInfo;
};

/**
 * POST /trial — start the free trial, then re-read the aggregated state.
 */
export const startDocsConnectTrial = async (): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_FORCE_MOCK) {
    lastInfo = { ...lastInfo, status: "trial" };
    return lastInfo;
  }

  await request({ method: "post", url: `${BASE}/trial` });
  return getDocsConnectInfo();
};

/**
 * PUT /tenant/config — update tenant name / JWT secret+header / anonymous support
 * (Settings tab). Returns the refreshed state.
 */
export const updateDocsConnectConfig = async (
  data: TDocsConnectConfigUpdate,
): Promise<TDocsConnectInfo> => {
  if (DOCS_CONNECT_FORCE_MOCK) {
    lastInfo = {
      ...lastInfo,
      tenantName: data.tenantName,
      secretKey: data.security.secret,
      jwtHeader: data.security.header,
      isAnonymousSupport: data.server.isAnonymousSupport,
    };
    return lastInfo;
  }

  await request({ method: "put", url: `${BASE}/tenant/config`, data });
  return getDocsConnectInfo();
};

export const getDocsConnectReportUrl = (): string =>
  combineUrl(getApiBaseUrl(), `${BASE}/tenant/quota/download`);

export const buyDocsConnectPlan = async (
  data: BuyDocsConnectPlanData,
): Promise<TDocsConnectInfo> => {
  const { users, devPackEnabled } = data;

  if (!DOCS_CONNECT_FORCE_MOCK) {
    const product = devPackEnabled
      ? DOCS_CLOUD_DEVPACK_PRODUCT
      : DOCS_CLOUD_PRODUCT;

    const samePaidProduct =
      lastInfo.status === "paid" &&
      lastInfo.plan.devPackEnabled === devPackEnabled;
    const isIncrease = samePaidProduct && users > lastInfo.plan.users;

    const ok = (await request({
      method: "put",
      url: WALLET_UPDATE_URL,
      data: {
        quantity: {
          [product]: isIncrease ? users - lastInfo.plan.users : users,
        },
        productQuantityType: isIncrease ? QUANTITY_TYPE_ADD : QUANTITY_TYPE_SET,
      },
    })) as boolean;

    if (ok === false) {
      throw new Error("Docs Connect plan purchase failed");
    }
  }

  const { pricePerUser, devPackPrice } = lastInfo.plan;
  const monthlyCharge =
    users * (pricePerUser + (devPackEnabled ? devPackPrice : 0));

  lastInfo = {
    ...lastInfo,
    status: "paid",
    plan: { ...lastInfo.plan, users, devPackEnabled, monthlyCharge },
    usage: {
      editors: { ...lastInfo.usage.editors, remaining: users, limit: users },
      viewer: { ...lastInfo.usage.viewer, remaining: users, limit: users },
    },
  };
  return lastInfo;
};